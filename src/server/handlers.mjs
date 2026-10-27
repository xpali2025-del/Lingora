import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { TX_HASH } from './bsc.mjs';
import {
  OrderError,
  adminCancelOrder,
  adminListOrders,
  adminListPaymentRequests,
  adminUpdatePaymentRequest,
  createOrder,
  createPaymentRequest,
  importCodes,
  lookupOrder,
  markPaid,
  reportManualPayment,
  stockCount,
  verifyCryptoPayment,
  normalizeOrderId,
} from './orders.mjs';

const MAX_BODY = 64 * 1024;
const email = z
  .email()
  .max(254)
  .transform((value) => value.trim().toLowerCase());
const whatsapp = z
  .string()
  .transform((value) => value.replace(/[\s()-]/gu, ''))
  .pipe(z.string().regex(/^\+?[0-9]{7,15}$/u));
const name = z.string().trim().min(2).max(80);
const orderId = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^LG-[2-9A-Z]{10}$/u);
const track = z.enum(['ar', 'en']);

const schemas = {
  create: z.object({
    track,
    plan: z.enum(['individual']),
    name,
    email,
    whatsapp,
  }),
  lookup: z.object({ orderId, email }),
  verify: z.object({
    orderId,
    email,
    txHash: z.string().trim().regex(TX_HASH),
  }),
  report: z.object({
    orderId,
    email,
    method: z.string().trim().min(2).max(60),
    reference: z.string().trim().min(3).max(120),
  }),
  paymentRequest: z.object({
    track,
    name,
    email,
    whatsapp,
    preferredMethod: z.string().trim().min(2).max(80),
    note: z.string().trim().max(500).optional(),
    orderId: orderId.optional().or(z.literal('')),
  }),
  confirm: z.object({
    orderId,
    reference: z.string().trim().max(120).optional(),
  }),
  cancel: z.object({ orderId }),
  codes: z.object({
    codes: z.array(z.string().trim().min(4).max(500)).min(1).max(1000),
  }),
  requestStatus: z.object({
    id: z.number().int().positive(),
    status: z.enum(['new', 'contacted', 'closed']),
  }),
};

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

async function readBody(request, schema) {
  const text = await request.text();
  if (text.length > MAX_BODY) throw new OrderError('payload_too_large', 413);
  let data;
  try {
    data = JSON.parse(text || '{}');
  } catch {
    throw new OrderError('invalid_json');
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    throw new OrderError('invalid_input', 400, {
      fields: [
        ...new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      ],
    });
  return parsed.data;
}

function digest(value) {
  return createHash('sha256').update(value).digest();
}

function requireAdmin(request, config) {
  if (config.adminToken.length < 24)
    throw new OrderError('admin_disabled', 503);
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!timingSafeEqual(digest(token), digest(config.adminToken)))
    throw new OrderError('unauthorized', 401);
}

function requireCodesKey(config) {
  if (!config.codesKey) throw new OrderError('codes_key_missing', 503);
}

export const handlers = {
  'order-create': {
    POST: async (request, { db, config }) =>
      json(
        201,
        await createOrder(db, config, await readBody(request, schemas.create)),
      ),
  },
  'order-lookup': {
    POST: async (request, { db, config }) => {
      requireCodesKey(config);
      return json(
        200,
        await lookupOrder(db, config, await readBody(request, schemas.lookup)),
      );
    },
  },
  'order-verify': {
    POST: async (request, { db, config, fetchImpl }) => {
      requireCodesKey(config);
      const body = await readBody(request, schemas.verify);
      return json(200, await verifyCryptoPayment(db, config, body, fetchImpl));
    },
  },
  'order-report': {
    POST: async (request, { db, config }) => {
      requireCodesKey(config);
      return json(
        200,
        await reportManualPayment(
          db,
          config,
          await readBody(request, schemas.report),
        ),
      );
    },
  },
  'payment-request': {
    POST: async (request, { db }) =>
      json(
        201,
        await createPaymentRequest(
          db,
          await readBody(request, schemas.paymentRequest),
        ),
      ),
  },
  'admin-orders': {
    GET: async (request, { db, config }) => {
      requireAdmin(request, config);
      const status = new URL(request.url).searchParams.get('status') || null;
      return json(200, {
        orders: await adminListOrders(db, status),
        available: await stockCount(db),
      });
    },
  },
  'admin-confirm': {
    POST: async (request, { db, config }) => {
      requireAdmin(request, config);
      requireCodesKey(config);
      const body = await readBody(request, schemas.confirm);
      const order = await markPaid(db, normalizeOrderId(body.orderId), {
        method: 'manual',
        reference: body.reference || null,
        by: 'admin',
      });
      return json(200, {
        id: order.id,
        status: order.status,
        available: await stockCount(db),
      });
    },
  },
  'admin-cancel': {
    POST: async (request, { db, config }) => {
      requireAdmin(request, config);
      return json(
        200,
        await adminCancelOrder(
          db,
          (await readBody(request, schemas.cancel)).orderId,
        ),
      );
    },
  },
  'admin-codes': {
    GET: async (request, { db, config }) => {
      requireAdmin(request, config);
      return json(200, { available: await stockCount(db) });
    },
    POST: async (request, { db, config }) => {
      requireAdmin(request, config);
      requireCodesKey(config);
      const { codes } = await readBody(request, schemas.codes);
      return json(200, await importCodes(db, config, [...new Set(codes)]));
    },
  },
  'admin-requests': {
    GET: async (request, { db, config }) => {
      requireAdmin(request, config);
      return json(200, { requests: await adminListPaymentRequests(db) });
    },
    POST: async (request, { db, config }) => {
      requireAdmin(request, config);
      return json(
        200,
        await adminUpdatePaymentRequest(
          db,
          await readBody(request, schemas.requestStatus),
        ),
      );
    },
  },
};

/** Dispatches one API route; errors become stable codes the UI can translate. */
export async function handle(name, request, context) {
  const handler = handlers[name]?.[request.method];
  if (!handler) return json(405, { error: 'method_not_allowed' });
  try {
    return await handler(request, context);
  } catch (error) {
    if (error instanceof OrderError)
      return json(error.status, { error: error.code, ...error.detail });
    console.error(`[api:${name}]`, error);
    return json(500, { error: 'server_error' });
  }
}
