/**
 * Database client — Neon serverless driver + Drizzle ORM.
 *
 * Reads DATABASE_URL from environment. Falls back gracefully when
 * the env var is absent (JSON-only mode).
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Set DATA_SOURCE=json in .env.local to use JSON fallback, or provide a Neon connection string.'
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

/** Lazily-initialized Drizzle client. Only created when first accessed. */
let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export type AppDatabase = ReturnType<typeof createDb>;
