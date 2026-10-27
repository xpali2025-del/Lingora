import pg from 'pg';

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS lingora_orders (
  id text PRIMARY KEY,
  track text NOT NULL CHECK (track IN ('ar', 'en')),
  plan text NOT NULL,
  customer_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  currency text NOT NULL,
  usdt_amount numeric(18, 4) NOT NULL,
  status text NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment', 'payment_review', 'paid', 'fulfilled', 'cancelled')),
  payment_method text,
  payment_reference text,
  tx_hash text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  fulfilled_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS lingora_orders_pending_amount
  ON lingora_orders (usdt_amount) WHERE status IN ('awaiting_payment', 'payment_review');
CREATE INDEX IF NOT EXISTS lingora_orders_status ON lingora_orders (status, created_at);
CREATE TABLE IF NOT EXISTS lingora_codes (
  id bigserial PRIMARY KEY,
  ciphertext text NOT NULL,
  fingerprint text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'void')),
  order_id text UNIQUE REFERENCES lingora_orders (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_at timestamptz
);
CREATE TABLE IF NOT EXISTS lingora_payment_requests (
  id bigserial PRIMARY KEY,
  track text NOT NULL CHECK (track IN ('ar', 'en')),
  customer_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  preferred_method text NOT NULL,
  note text NOT NULL DEFAULT '',
  order_id text REFERENCES lingora_orders (id),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lingora_events (
  id bigserial PRIMARY KEY,
  order_id text,
  type text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

function fromPool(pool) {
  return {
    query: (text, params) => pool.query(text, params),
    exec: (sql) => pool.query(sql),
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await work({
          query: (text, params) => client.query(text, params),
        });
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

/** Wraps an in-process PGlite database (tests and local preview only). */
export function fromPglite(database) {
  return {
    query: (text, params) => database.query(text, params),
    exec: (sql) => database.exec(sql),
    transaction: (work) =>
      database.transaction((tx) =>
        work({ query: (text, params) => tx.query(text, params) }),
      ),
  };
}

export async function connect(databaseUrl) {
  if (databaseUrl.startsWith('pglite:')) {
    const { PGlite } = await import('@electric-sql/pglite');
    return fromPglite(new PGlite());
  }
  const local = /@(localhost|127\.0\.0\.1)[:/]/u.test(databaseUrl);
  return fromPool(
    new pg.Pool({
      connectionString: databaseUrl,
      max: 3,
      ssl: local ? undefined : { rejectUnauthorized: true },
    }),
  );
}

export async function ensureSchema(db) {
  await db.exec(SCHEMA);
  return db;
}
