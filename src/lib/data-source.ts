/**
 * Data Source Toggle — Utility for checking the current data mode.
 *
 * DATA_SOURCE=json     → Static JSON files (default, no database needed)
 * DATA_SOURCE=database → PostgreSQL via Neon + Drizzle
 *
 * Used by API routes and service functions to gate write operations.
 */

export type DataSourceMode = 'json' | 'database';

export function getDataSource(): DataSourceMode {
  return process.env.DATA_SOURCE === 'database' ? 'database' : 'json';
}

export function isDatabaseMode(): boolean {
  return getDataSource() === 'database';
}

export function isJsonMode(): boolean {
  return getDataSource() === 'json';
}
