/**
 * Environment Validation — Server-safe configuration validation.
 *
 * Validates all required environment variables at startup and provides
 * typed access to configuration values. This module is server-only —
 * it must never be imported from client components.
 *
 * GOVERNANCE:
 * - DATABASE_URL is never exposed client-side
 * - NEXT_PUBLIC_DATABASE_URL existence is detected as a credential leak
 * - NEXT_PUBLIC_DATA_SOURCE is validated to match DATA_SOURCE
 * - DEMO_AUTH_ENABLED triggers production warnings
 * - AUTH_SECRET and OIDC credentials validated when SSO is active
 * - Missing secrets are clearly reported
 *
 * ADOPTION: Import getEnvConfig() from a server-side entry point
 * (e.g., instrumentation.ts or a layout server component) to activate
 * startup validation. Currently available but not auto-invoked.
 *
 * Phase 2.9: Security Hardening & Deployment Readiness
 * Phase 3.1: Auth.js / OIDC environment validation
 */

import type { DataSourceMode } from '@/lib/data-source';

// ── Types ───────────────────────────────────────────────────────

export interface EnvConfig {
  /** Current data source mode */
  dataSource: DataSourceMode;
  /** Whether database mode is active */
  isDatabaseMode: boolean;
  /** Whether demo auth is enabled */
  demoAuthEnabled: boolean;
  /** Current Node environment */
  nodeEnv: string;
  /** Whether running in production */
  isProduction: boolean;
  /** Whether DATABASE_URL is configured */
  hasDatabaseUrl: boolean;
  /** Auth provider mode: 'demo' | 'oidc' */
  authProvider: 'demo' | 'oidc';
  /** Whether OIDC credentials are configured */
  hasOidcConfig: boolean;
  /** Storage provider: 'none' | 'local' | 's3' | 'azure' | 'gcs' */
  storageProvider: string;
}

export interface EnvValidationResult {
  valid: boolean;
  config: EnvConfig;
  warnings: string[];
  errors: string[];
}

// ── Validation ──────────────────────────────────────────────────

/**
 * Validate all environment variables and return typed config.
 * Errors are fatal misconfigurations; warnings are advisory.
 */
export function validateEnvironment(): EnvValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // ── DATA_SOURCE ────────────────────────────────────────────
  const dataSource = process.env.DATA_SOURCE ?? 'json';
  if (dataSource !== 'json' && dataSource !== 'database') {
    errors.push(
      `DATA_SOURCE must be "json" or "database". Got: "${dataSource}"`,
    );
  }

  const isDatabaseMode = dataSource === 'database';

  // ── NEXT_PUBLIC_DATA_SOURCE ────────────────────────────────
  const publicDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (publicDataSource && publicDataSource !== dataSource) {
    warnings.push(
      `NEXT_PUBLIC_DATA_SOURCE="${publicDataSource}" does not match DATA_SOURCE="${dataSource}". ` +
      `UI mode indicators may be incorrect.`,
    );
  }

  // ── DATABASE_URL ───────────────────────────────────────────
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  if (isDatabaseMode && !hasDatabaseUrl) {
    errors.push(
      'DATABASE_URL is required when DATA_SOURCE=database. ' +
      'Provide a PostgreSQL connection string (e.g., Neon serverless).',
    );
  }

  // Detect accidental client-side exposure of database credentials.
  // The real risk is someone creating NEXT_PUBLIC_DATABASE_URL, which
  // Next.js would bundle into the client JavaScript.
  if (process.env.NEXT_PUBLIC_DATABASE_URL) {
    errors.push(
      'NEXT_PUBLIC_DATABASE_URL is set — this leaks database credentials to the client bundle. ' +
      'Remove it immediately. Use DATABASE_URL (without NEXT_PUBLIC_ prefix) instead.',
    );
  }

  // Detect accidental client-side exposure of auth secrets
  if (process.env.NEXT_PUBLIC_AUTH_SECRET) {
    errors.push(
      'NEXT_PUBLIC_AUTH_SECRET is set — this leaks the JWT encryption secret to the client bundle. ' +
      'Remove it immediately. Use AUTH_SECRET (without NEXT_PUBLIC_ prefix) instead.',
    );
  }
  if (process.env.NEXT_PUBLIC_AUTH_OIDC_SECRET) {
    errors.push(
      'NEXT_PUBLIC_AUTH_OIDC_SECRET is set — this leaks the OIDC client secret to the client bundle. ' +
      'Remove it immediately. Use AUTH_OIDC_SECRET (without NEXT_PUBLIC_ prefix) instead.',
    );
  }
  if (process.env.NEXT_PUBLIC_AUTH_OIDC_ID) {
    errors.push(
      'NEXT_PUBLIC_AUTH_OIDC_ID is set — OIDC client IDs should not be exposed to the client bundle. ' +
      'Remove it immediately. Use AUTH_OIDC_ID (without NEXT_PUBLIC_ prefix) instead.',
    );
  }

  // Detect accidental client-side exposure of storage credentials (Phase 3.3)
  const storageLeaks = Object.keys(process.env).filter(
    (k) => k.startsWith('NEXT_PUBLIC_STORAGE_'),
  );
  for (const key of storageLeaks) {
    errors.push(
      `${key} is set — storage credentials must not be exposed to the client bundle. ` +
      `Remove it immediately. Use ${key.replace('NEXT_PUBLIC_', '')} (without NEXT_PUBLIC_ prefix) instead.`,
    );
  }

  // ── DEMO_AUTH_ENABLED ──────────────────────────────────────
  const demoAuthEnabled = process.env.DEMO_AUTH_ENABLED !== 'false';

  // ── NODE_ENV ───────────────────────────────────────────────
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  // ── Auth.js / OIDC Configuration ──────────────────────────
  const hasOidcConfig = !!(
    process.env.AUTH_OIDC_ISSUER &&
    process.env.AUTH_OIDC_ID &&
    process.env.AUTH_OIDC_SECRET
  );
  const hasAuthSecret = !!process.env.AUTH_SECRET;
  const authProvider: 'demo' | 'oidc' = demoAuthEnabled ? 'demo' : 'oidc';

  // When SSO is active (demo auth disabled), Auth.js credentials are REQUIRED.
  // Without them, all sessions resolve to null and the app is unusable.
  if (!demoAuthEnabled) {
    if (!hasAuthSecret) {
      errors.push(
        'AUTH_SECRET is not set but DEMO_AUTH_ENABLED=false (SSO mode). ' +
        'Auth.js requires a secret for JWT encryption. ' +
        'Generate one: openssl rand -base64 32',
      );
    }
    if (!hasOidcConfig) {
      errors.push(
        'OIDC credentials not fully configured (AUTH_OIDC_ISSUER, AUTH_OIDC_ID, AUTH_OIDC_SECRET) ' +
        'but DEMO_AUTH_ENABLED=false (SSO mode). ' +
        'Auth.js SSO login will not work without OIDC provider credentials. ' +
        'Either configure OIDC credentials or set DEMO_AUTH_ENABLED=true for demo mode.',
      );
    }
  }

  // ── Production Safety Checks ───────────────────────────────
  if (isProduction && demoAuthEnabled) {
    warnings.push(
      '⚠️  DEMO_AUTH_ENABLED is true in production. ' +
      'Demo authentication uses plain-text cookies and is NOT secure. ' +
      'Set DEMO_AUTH_ENABLED=false and configure Auth.js with an OIDC ' +
      'identity provider before handling real compliance data.',
    );
  }

  if (isProduction && !isDatabaseMode) {
    warnings.push(
      'DATA_SOURCE=json in production. Writes will not persist. ' +
      'Set DATA_SOURCE=database for production use.',
    );
  }

  // ── STORAGE_PROVIDER (Phase 3.3) ──────────────────────────
  const validStorageProviders = ['none', 'local', 's3', 'azure', 'gcs'];
  const storageProvider = process.env.STORAGE_PROVIDER ?? 'none';
  if (!validStorageProviders.includes(storageProvider)) {
    errors.push(
      `STORAGE_PROVIDER must be one of: ${validStorageProviders.join(', ')}. Got: "${storageProvider}"`,
    );
  }

  // Validate provider-specific configuration when storage is active
  if (storageProvider === 's3') {
    if (!process.env.STORAGE_S3_BUCKET) {
      warnings.push('STORAGE_PROVIDER=s3 but STORAGE_S3_BUCKET is not set.');
    }
  } else if (storageProvider === 'azure') {
    if (!process.env.STORAGE_AZURE_CONTAINER) {
      warnings.push('STORAGE_PROVIDER=azure but STORAGE_AZURE_CONTAINER is not set.');
    }
  } else if (storageProvider === 'gcs') {
    if (!process.env.STORAGE_GCS_BUCKET) {
      warnings.push('STORAGE_PROVIDER=gcs but STORAGE_GCS_BUCKET is not set.');
    }
  }

  const config: EnvConfig = {
    dataSource: (dataSource === 'database' ? 'database' : 'json') as DataSourceMode,
    isDatabaseMode,
    demoAuthEnabled,
    nodeEnv,
    isProduction,
    hasDatabaseUrl,
    authProvider,
    hasOidcConfig,
    storageProvider,
  };

  return {
    valid: errors.length === 0,
    config,
    warnings,
    errors,
  };
}

// ── Cached Config ───────────────────────────────────────────────

let _cachedConfig: EnvConfig | null = null;
let _validated = false;

/**
 * Get validated environment config (cached after first call).
 * Logs warnings to stderr on first validation. Throws on fatal errors.
 */
export function getEnvConfig(): EnvConfig {
  if (!_validated) {
    const result = validateEnvironment();
    _validated = true;

    // Log warnings
    for (const warning of result.warnings) {
      console.warn(`[ENV] ${warning}`);
    }

    // Fatal errors
    if (!result.valid) {
      const msg = result.errors.map((e) => `  • ${e}`).join('\n');
      throw new Error(
        `Environment validation failed:\n${msg}\n\n` +
        'Fix the above errors in .env.local (or your deployment environment) and restart.',
      );
    }

    _cachedConfig = result.config;
  }

  return _cachedConfig!;
}

/**
 * Check if demo auth is safe for the current environment.
 * Returns false if production + demo auth = unsafe combination.
 */
export function isDemoAuthSafeForEnvironment(): boolean {
  const config = getEnvConfig();
  return !(config.isProduction && config.demoAuthEnabled);
}
