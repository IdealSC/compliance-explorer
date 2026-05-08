/**
 * Smoke Test — Environment & Build Validation
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts
 *
 * This script validates:
 * 1. Environment variable configuration
 * 2. Data source mode
 * 3. Database connectivity (if database mode)
 * 4. Build readiness
 *
 * It does NOT start the app or modify any data.
 */
import 'dotenv/config';

// ── ANSI Colors ─────────────────────────────────────────────────
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function pass(msg: string) { console.log(`  ${GREEN}✓${RESET} ${msg}`); }
function fail(msg: string) { console.log(`  ${RED}✗${RESET} ${msg}`); }
function warn(msg: string) { console.log(`  ${YELLOW}⚠${RESET} ${msg}`); }
function info(msg: string) { console.log(`  ${CYAN}ℹ${RESET} ${msg}`); }

let failures = 0;
let warnings = 0;

// ── Helpers ─────────────────────────────────────────────────────

function check(condition: boolean, passMsg: string, failMsg: string): boolean {
  if (condition) {
    pass(passMsg);
    return true;
  } else {
    fail(failMsg);
    failures++;
    return false;
  }
}



// ══════════════════════════════════════════════════════════════════
console.log(`\n${BOLD}Compliance Operating Map — Smoke Test${RESET}\n`);
console.log('─'.repeat(50));

// ── 1. Environment Variables ────────────────────────────────────
console.log(`\n${BOLD}1. Environment Variables${RESET}\n`);

const dataSource = process.env.DATA_SOURCE ?? 'json';
if (!process.env.DATA_SOURCE) {
  warn('DATA_SOURCE not set — defaulting to "json"');
  warnings++;
} else {
  check(
    dataSource === 'json' || dataSource === 'database',
    `DATA_SOURCE = "${dataSource}"`,
    `DATA_SOURCE must be "json" or "database". Got: "${dataSource}"`,
  );
}

const publicDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
if (publicDataSource) {
  check(
    publicDataSource === dataSource,
    `NEXT_PUBLIC_DATA_SOURCE matches DATA_SOURCE`,
    `NEXT_PUBLIC_DATA_SOURCE="${publicDataSource}" does not match DATA_SOURCE="${dataSource}"`,
  );
} else {
  warn('NEXT_PUBLIC_DATA_SOURCE not set — UI mode indicators may not display');
  warnings++;
}

const isDatabaseMode = dataSource === 'database';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

if (isDatabaseMode) {
  check(
    hasDatabaseUrl,
    'DATABASE_URL is set (database mode)',
    'DATABASE_URL is required when DATA_SOURCE=database',
  );
} else {
  info(`DATABASE_URL ${hasDatabaseUrl ? 'is set but' : 'not set —'} JSON mode active, database not required`);
}

check(
  !process.env.NEXT_PUBLIC_DATABASE_URL,
  'No NEXT_PUBLIC_DATABASE_URL (secrets safe)',
  'NEXT_PUBLIC_DATABASE_URL is set — this leaks database credentials to the client!',
);
check(
  !process.env.NEXT_PUBLIC_AUTH_SECRET,
  'No NEXT_PUBLIC_AUTH_SECRET (secrets safe)',
  'NEXT_PUBLIC_AUTH_SECRET is set — this leaks the JWT encryption key to the client!',
);
check(
  !process.env.NEXT_PUBLIC_AUTH_OIDC_SECRET,
  'No NEXT_PUBLIC_AUTH_OIDC_SECRET (secrets safe)',
  'NEXT_PUBLIC_AUTH_OIDC_SECRET is set — this leaks the OIDC client secret to the client!',
);

const demoAuth = process.env.DEMO_AUTH_ENABLED;
const demoEnabled = demoAuth !== 'false';
info(`DEMO_AUTH_ENABLED = "${demoAuth ?? '(not set, defaults to true)'}"`);

const nodeEnv = process.env.NODE_ENV ?? 'development';
info(`NODE_ENV = "${nodeEnv}"`);

if (nodeEnv === 'production' && demoEnabled) {
  warn('Demo auth is enabled in production — this is NOT secure!');
  warnings++;
}

if (nodeEnv === 'production' && !isDatabaseMode) {
  warn('JSON mode in production — writes will not persist');
  warnings++;
}

// ── Auth.js / OIDC (Phase 3.1) ──────────────────────────────
if (!demoEnabled) {
  // SSO mode — Auth.js credentials are required
  check(
    !!process.env.AUTH_SECRET,
    'AUTH_SECRET is set (required for SSO mode)',
    'AUTH_SECRET is not set — Auth.js JWT encryption will fail in SSO mode',
  );
  const hasOidc = !!(
    process.env.AUTH_OIDC_ISSUER &&
    process.env.AUTH_OIDC_ID &&
    process.env.AUTH_OIDC_SECRET
  );
  check(
    hasOidc,
    'OIDC credentials configured (AUTH_OIDC_ISSUER, AUTH_OIDC_ID, AUTH_OIDC_SECRET)',
    'OIDC credentials incomplete — SSO login will not work',
  );
} else {
  info('Demo auth active — Auth.js/OIDC credentials not required');
}

// ── 1b. AI Configuration (Phase 3.8) ───────────────────────────
console.log(`\n${BOLD}1b. AI Configuration${RESET}\n`);

const aiProvider = process.env.AI_PROVIDER ?? 'none';
const validAiProviders = ['none', 'azure_openai'];
check(
  validAiProviders.includes(aiProvider),
  `AI_PROVIDER = "${aiProvider}" (valid)`,
  `AI_PROVIDER = "${aiProvider}" is not valid. Allowed: ${validAiProviders.join(', ')}`,
);

const aiCitationsEnabled = process.env.AI_FEATURE_CITATION_SUGGESTIONS_ENABLED === 'true';
info(`AI_FEATURE_CITATION_SUGGESTIONS_ENABLED = ${aiCitationsEnabled}`);

if (aiProvider !== 'none' && aiCitationsEnabled) {
  info('AI citation generation is ENABLED');
} else {
  info('AI citation generation is DISABLED (default safe posture)');
}

// Secret exposure checks
const aiSecretLeaks = [
  'NEXT_PUBLIC_AZURE_OPENAI_API_KEY',
  'NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT',
  'NEXT_PUBLIC_AI_PROVIDER',
];
for (const key of aiSecretLeaks) {
  check(
    !process.env[key],
    `No ${key} (AI secrets safe)`,
    `${key} is set — AI credentials must not be exposed to the client!`,
  );
}

// Detect any NEXT_PUBLIC_AI_ or NEXT_PUBLIC_AZURE_ variables
const aiLeaks = Object.keys(process.env).filter(k =>
  k.startsWith('NEXT_PUBLIC_AI_') || k.startsWith('NEXT_PUBLIC_AZURE_OPENAI_'),
);
if (aiLeaks.length > 0) {
  for (const key of aiLeaks) {
    fail(`${key} is set — AI variables must not be exposed to the client bundle.`);
    failures++;
  }
} else {
  pass('No NEXT_PUBLIC_AI_* or NEXT_PUBLIC_AZURE_OPENAI_* variables detected');
}

// ── 2. Database Connectivity ────────────────────────────────────

async function checkDatabase() {
  if (isDatabaseMode && hasDatabaseUrl) {
    console.log(`\n${BOLD}2. Database Connectivity${RESET}\n`);

    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      const result = await sql`SELECT 1 as health_check`;
      if (result && result.length > 0) {
        pass('Database connection successful');
      } else {
        fail('Database returned unexpected result');
        failures++;
      }
    } catch (err) {
      fail(`Database connection failed: ${err instanceof Error ? err.message : String(err)}`);
      failures++;
    }
  } else {
    console.log(`\n${BOLD}2. Database Connectivity${RESET}\n`);
    info('Skipped — not in database mode or DATABASE_URL not set');
  }
}

// ── 3. File Structure ───────────────────────────────────────────

import { existsSync } from 'fs';
import { resolve } from 'path';

function checkFiles() {
  console.log(`\n${BOLD}3. Key File Checks${RESET}\n`);

  const root = resolve(__dirname, '..');
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'drizzle.config.ts',
    'src/middleware.ts',
    'src/config/env.ts',
    'src/auth/session.ts',
    'src/auth/rbac.ts',
    'src/auth/route-access.ts',
    'src/lib/services/immutability-guard.ts',
    'src/auth.config.ts',
    'src/auth/group-mapping.ts',
    'src/auth/session-store.ts',
    'PRODUCTION_READINESS.md',
    'PRODUCTION_QA_CHECKLIST.md',
    'DEPLOYMENT_GUIDE.md',
    'RELEASE_CHECKLIST.md',
    'OPERATIONS_RUNBOOK.md',
    'docs/API_AUTH_PATTERN.md',
    'scripts/predeploy.ts',
    'src/lib/services/validation-writes.ts',
    'src/validation/validation-workbench.ts',
    '.github/workflows/ci.yml',
  ];

  for (const file of requiredFiles) {
    check(
      existsSync(resolve(root, file)),
      `${file} exists`,
      `${file} is missing`,
    );
  }
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  await checkDatabase();
  checkFiles();

  // ── Summary ───────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));

  if (failures === 0 && warnings === 0) {
    console.log(`\n${GREEN}${BOLD}All checks passed.${RESET}\n`);
  } else if (failures === 0) {
    console.log(`\n${YELLOW}${BOLD}Passed with ${warnings} warning(s).${RESET}\n`);
  } else {
    console.log(`\n${RED}${BOLD}${failures} failure(s), ${warnings} warning(s).${RESET}\n`);
  }

  process.exit(failures > 0 ? 1 : 0);
}

main();
