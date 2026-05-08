/**
 * Storage Configuration — Server-safe object storage provider config.
 *
 * Reads environment variables and returns typed storage configuration.
 * No SDK imports — this module only provides configuration values.
 * Actual SDK usage is deferred to a future upload phase.
 *
 * GOVERNANCE:
 * - Storage configuration is server-only (never exposed to client)
 * - NEXT_PUBLIC_STORAGE_* existence is detected as a credential leak (in env.ts)
 * - Default provider is 'none' (metadata-only, no real storage)
 *
 * Phase 3.3: Object Storage & Source File Metadata
 */

// ── Types ───────────────────────────────────────────────────────

export type StorageProvider = 'none' | 'local' | 's3' | 'azure' | 'gcs';

export interface StorageConfig {
  /** Active storage provider */
  provider: StorageProvider;
  /** S3 / GCS bucket name or Azure container name */
  bucket?: string;
  /** AWS S3 region */
  region?: string;
  /** Local filesystem storage path */
  localPath?: string;
  /** Azure Storage connection string */
  connectionString?: string;
}

// ── Valid Providers ─────────────────────────────────────────────

const VALID_PROVIDERS: StorageProvider[] = ['none', 'local', 's3', 'azure', 'gcs'];

// ── Configuration ───────────────────────────────────────────────

let _cachedConfig: StorageConfig | null = null;

/**
 * Get the current storage configuration from environment variables.
 * Cached after first call.
 *
 * Provider-specific env vars:
 * - local: STORAGE_LOCAL_PATH (defaults to ./storage)
 * - s3:    STORAGE_S3_BUCKET, STORAGE_S3_REGION (AWS creds via SDK chain)
 * - azure: STORAGE_AZURE_CONTAINER, STORAGE_AZURE_CONNECTION_STRING
 * - gcs:   STORAGE_GCS_BUCKET
 */
export function getStorageConfig(): StorageConfig {
  if (_cachedConfig) return _cachedConfig;

  const rawProvider = process.env.STORAGE_PROVIDER ?? 'none';
  const provider = VALID_PROVIDERS.includes(rawProvider as StorageProvider)
    ? (rawProvider as StorageProvider)
    : 'none';

  const config: StorageConfig = { provider };

  switch (provider) {
    case 'local':
      config.localPath = process.env.STORAGE_LOCAL_PATH ?? './storage';
      break;

    case 's3':
      config.bucket = process.env.STORAGE_S3_BUCKET;
      config.region = process.env.STORAGE_S3_REGION;
      break;

    case 'azure':
      config.bucket = process.env.STORAGE_AZURE_CONTAINER;
      config.connectionString = process.env.STORAGE_AZURE_CONNECTION_STRING;
      break;

    case 'gcs':
      config.bucket = process.env.STORAGE_GCS_BUCKET;
      break;
  }

  _cachedConfig = config;
  return config;
}

/**
 * Check if a real storage provider is configured (not 'none').
 */
export function isStorageConfigured(): boolean {
  return getStorageConfig().provider !== 'none';
}

/**
 * Get the active storage provider name.
 */
export function getStorageProvider(): StorageProvider {
  return getStorageConfig().provider;
}
