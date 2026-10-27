import { readConfig } from './config.mjs';
import { connect, ensureSchema } from './db.mjs';
import { handle, json } from './handlers.mjs';

let databasePromise;

function database(config) {
  databasePromise ??= connect(config.databaseUrl)
    .then(ensureSchema)
    .catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  return databasePromise;
}

/** Builds the Vercel Function exports (Web Request → Response) for one API route. */
export function route(name) {
  const run = async (request) => {
    const config = readConfig();
    if (!config.databaseUrl)
      return json(503, { error: 'database_unconfigured' });
    let db;
    try {
      db = await database(config);
    } catch (error) {
      console.error('[api] database connection failed', error);
      return json(503, { error: 'database_unavailable' });
    }
    return handle(name, request, { db, config, fetchImpl: fetch });
  };
  return { GET: run, POST: run };
}
