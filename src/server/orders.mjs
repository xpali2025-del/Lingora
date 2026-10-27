import { randomInt } from 'node:crypto';
import { verifyUsdtTransfer } from './bsc.mjs';
import { codeFingerprint, decryptCode, encryptCode } from './codes-crypto.mjs';
import { priceFor, uniqueUsdtAmount, usdtToWei } from './prices.mjs';

const ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export class OrderError extends Error {
  constructor(code, status = 400, detail = {}) {
    super(code);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export function newOrderId() {
  let id = 'LG-';
  for (let index = 0; index < 10; index += 1)
    id += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return id;
}

export function normalizeOrderId(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

async function logEvent(db, orderId, type, detail = {}) {
  await db.query(
    'INSERT INTO lingora_events (order_id, type, detail) VALUES ($1, $2, $3)',
    [orderId, type, JSON.stringify(detail)],
  );
}

function isUniqueViolation(error, constraint) {
  return (
    error?.code === '23505' &&
    (!constraint ||
      String(error.constraint ?? error.message).includes(constraint))
  );
}

/** Customer-facing view; the code is decrypted only for its own fulfilled order. */
export function orderView(row, config, code = null) {
  return {
    id: row.id,
    status: row.status,
    plan: row.plan,
    track: row.track,
    amount: String(row.amount),
    currency: row.currency,
    usdtAmount: String(row.usdt_amount),
    paymentMethod: row.payment_method,
    createdAt: new Date(row.created_at).toISOString(),
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
    fulfilledAt: row.fulfilled_at
      ? new Date(row.fulfilled_at).toISOString()
      : null,
    code,
    payment: {
      bep20Address: config.bep20Address,
      network: 'BNB Smart Chain (BEP20)',
      token: 'USDT',
    },
  };
}

export async function createOrder(db, config, input) {
  const price = priceFor(input.plan, input.track);
  if (!price) throw new OrderError('plan_unavailable');
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = newOrderId();
    const usdtAmount = uniqueUsdtAmount(price.usdt, randomInt(1, 1000));
    try {
      const { rows } = await db.query(
        `INSERT INTO lingora_orders
          (id, track, plan, customer_name, email, whatsapp, amount, currency, usdt_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          id,
          input.track,
          input.plan,
          input.name,
          input.email,
          input.whatsapp,
          price.amount,
          price.currency,
          usdtAmount,
        ],
      );
      await logEvent(db, id, 'order_created', { plan: input.plan });
      return orderView(rows[0], config);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new OrderError('order_busy', 503);
}

async function findOwnedOrder(db, orderId, email, lock = false) {
  const { rows } = await db.query(
    `SELECT * FROM lingora_orders WHERE id = $1 AND lower(email) = lower($2)${lock ? ' FOR UPDATE' : ''}`,
    [normalizeOrderId(orderId), email],
  );
  // The same error for a wrong number or a wrong email avoids revealing which orders exist.
  if (!rows[0]) throw new OrderError('order_not_found', 404);
  return rows[0];
}

async function assignedCode(db, config, orderId) {
  const { rows } = await db.query(
    "SELECT ciphertext FROM lingora_codes WHERE order_id = $1 AND status = 'assigned'",
    [orderId],
  );
  return rows[0] ? decryptCode(rows[0].ciphertext, config.codesKey) : null;
}

export async function lookupOrder(db, config, { orderId, email }) {
  const row = await findOwnedOrder(db, orderId, email);
  const code =
    row.status === 'fulfilled' ? await assignedCode(db, config, row.id) : null;
  return orderView(row, config, code);
}

/**
 * Marks an order paid and allocates one code in the same transaction (constitution C2).
 * Without stock the order stays `paid` so the owner can refill and retry; it is never left silent.
 */
export async function markPaid(db, orderId, payment) {
  return db.transaction(async (tx) => {
    const { rows } = await tx.query(
      'SELECT * FROM lingora_orders WHERE id = $1 FOR UPDATE',
      [orderId],
    );
    const order = rows[0];
    if (!order) throw new OrderError('order_not_found', 404);
    if (order.status === 'cancelled')
      throw new OrderError('order_cancelled', 409);
    if (order.status !== 'fulfilled') {
      await tx.query(
        `UPDATE lingora_orders
            SET status = 'paid', paid_at = COALESCE(paid_at, now()),
                payment_method = COALESCE($2, payment_method),
                payment_reference = COALESCE($3, payment_reference),
                tx_hash = COALESCE($4, tx_hash)
          WHERE id = $1`,
        [
          orderId,
          payment.method ?? null,
          payment.reference ?? null,
          payment.txHash ?? null,
        ],
      );
      if (order.status !== 'paid')
        await logEvent(tx, orderId, 'payment_confirmed', {
          method: payment.method ?? null,
          by: payment.by,
        });
      const allocated = await tx.query(
        `UPDATE lingora_codes SET status = 'assigned', order_id = $1, assigned_at = now()
          WHERE id = (
            SELECT id FROM lingora_codes WHERE status = 'available'
            ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED
          )
          RETURNING id`,
        [orderId],
      );
      if (allocated.rows[0]) {
        await tx.query(
          "UPDATE lingora_orders SET status = 'fulfilled', fulfilled_at = now() WHERE id = $1",
          [orderId],
        );
        await logEvent(tx, orderId, 'code_assigned', {
          codeId: allocated.rows[0].id,
        });
      } else {
        await logEvent(tx, orderId, 'out_of_stock_after_payment');
      }
    }
    const fresh = await tx.query('SELECT * FROM lingora_orders WHERE id = $1', [
      orderId,
    ]);
    return fresh.rows[0];
  });
}

export async function verifyCryptoPayment(
  db,
  config,
  { orderId, email, txHash },
  fetchImpl,
) {
  if (!config.bep20Address) throw new OrderError('crypto_unavailable', 503);
  const order = await findOwnedOrder(db, orderId, email);
  if (order.status === 'fulfilled' || order.status === 'paid')
    return lookupOrder(db, config, { orderId, email });
  if (order.status === 'cancelled')
    throw new OrderError('order_cancelled', 409);
  const normalizedHash = txHash.toLowerCase();
  const used = await db.query(
    'SELECT id FROM lingora_orders WHERE tx_hash = $1 AND id <> $2',
    [normalizedHash, order.id],
  );
  if (used.rows[0]) throw new OrderError('tx_already_used', 409);

  const result = await verifyUsdtTransfer({
    rpcUrl: config.bscRpcUrl,
    txHash: normalizedHash,
    toAddress: config.bep20Address,
    amountWei: usdtToWei(order.usdt_amount),
    notBefore: new Date(order.created_at),
    minConfirmations: config.minConfirmations,
    fetchImpl,
  });
  if (!result.ok) {
    await logEvent(db, order.id, 'crypto_check_failed', {
      reason: result.reason,
    });
    throw new OrderError(`payment_${result.reason}`, 422, {
      confirmations: result.confirmations ?? null,
      required: config.minConfirmations,
    });
  }
  try {
    await markPaid(db, order.id, {
      method: 'usdt_bep20',
      txHash: normalizedHash,
      by: 'chain',
    });
  } catch (error) {
    if (isUniqueViolation(error, 'tx_hash'))
      throw new OrderError('tx_already_used', 409);
    throw error;
  }
  return lookupOrder(db, config, { orderId, email });
}

/** Records a manual transfer (bank or wallet) for owner review; nothing is auto-confirmed. */
export async function reportManualPayment(
  db,
  config,
  { orderId, email, method, reference },
) {
  const order = await findOwnedOrder(db, orderId, email);
  if (
    order.status === 'awaiting_payment' ||
    order.status === 'payment_review'
  ) {
    await db.query(
      `UPDATE lingora_orders SET status = 'payment_review', payment_method = $2, payment_reference = $3
        WHERE id = $1`,
      [order.id, method, reference],
    );
    await logEvent(db, order.id, 'manual_payment_reported', { method });
  }
  return lookupOrder(db, config, { orderId, email });
}

export async function createPaymentRequest(db, input) {
  let orderId = null;
  if (input.orderId) {
    const { rows } = await db.query(
      'SELECT id FROM lingora_orders WHERE id = $1 AND lower(email) = lower($2)',
      [normalizeOrderId(input.orderId), input.email],
    );
    orderId = rows[0]?.id ?? null;
  }
  const { rows } = await db.query(
    `INSERT INTO lingora_payment_requests
      (track, customer_name, email, whatsapp, preferred_method, note, order_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
    [
      input.track,
      input.name,
      input.email,
      input.whatsapp,
      input.preferredMethod,
      input.note ?? '',
      orderId,
    ],
  );
  await logEvent(db, orderId, 'payment_method_requested', {
    requestId: rows[0].id,
  });
  return {
    id: Number(rows[0].id),
    createdAt: new Date(rows[0].created_at).toISOString(),
  };
}

export async function stockCount(db) {
  const { rows } = await db.query(
    "SELECT count(*)::int AS available FROM lingora_codes WHERE status = 'available'",
  );
  return rows[0].available;
}

/** Imports codes encrypted at rest, then fulfils any paid orders that were waiting for stock. */
export async function importCodes(db, config, codes) {
  let added = 0;
  for (const code of codes) {
    const { rowCount } = await db.query(
      `INSERT INTO lingora_codes (ciphertext, fingerprint) VALUES ($1, $2)
       ON CONFLICT (fingerprint) DO NOTHING`,
      [
        encryptCode(code, config.codesKey),
        codeFingerprint(code, config.codesKey),
      ],
    );
    added += rowCount;
  }
  await logEvent(db, null, 'codes_imported', {
    added,
    submitted: codes.length,
  });
  const waiting = await db.query(
    "SELECT id FROM lingora_orders WHERE status = 'paid' ORDER BY paid_at, created_at",
  );
  let fulfilled = 0;
  for (const { id } of waiting.rows) {
    const order = await markPaid(db, id, { by: 'restock' });
    if (order.status === 'fulfilled') fulfilled += 1;
    else break;
  }
  return {
    added,
    duplicates: codes.length - added,
    fulfilled,
    available: await stockCount(db),
  };
}

export async function adminListOrders(db, status) {
  const { rows } = await db.query(
    `SELECT id, status, plan, track, customer_name, email, whatsapp, amount, currency,
            usdt_amount, payment_method, payment_reference, tx_hash, created_at, paid_at, fulfilled_at
       FROM lingora_orders
      WHERE ($1::text IS NULL OR status = $1)
      ORDER BY created_at DESC LIMIT 200`,
    [status ?? null],
  );
  return rows.map((row) => ({
    ...row,
    amount: String(row.amount),
    usdt_amount: String(row.usdt_amount),
  }));
}

export async function adminCancelOrder(db, orderId) {
  const { rows } = await db.query(
    `UPDATE lingora_orders SET status = 'cancelled'
      WHERE id = $1 AND status IN ('awaiting_payment', 'payment_review') RETURNING id`,
    [normalizeOrderId(orderId)],
  );
  if (!rows[0]) throw new OrderError('order_not_cancellable', 409);
  await logEvent(db, rows[0].id, 'order_cancelled', { by: 'admin' });
  return { id: rows[0].id };
}

export async function adminListPaymentRequests(db) {
  const { rows } = await db.query(
    'SELECT * FROM lingora_payment_requests ORDER BY created_at DESC LIMIT 200',
  );
  return rows.map((row) => ({ ...row, id: Number(row.id) }));
}

export async function adminUpdatePaymentRequest(db, { id, status }) {
  const { rows } = await db.query(
    'UPDATE lingora_payment_requests SET status = $2 WHERE id = $1 RETURNING id, status',
    [id, status],
  );
  if (!rows[0]) throw new OrderError('request_not_found', 404);
  return { id: Number(rows[0].id), status: rows[0].status };
}
