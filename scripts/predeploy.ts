/**
 * Predeploy Validation — Composite deployment gate.
 *
 * Usage:
 *   npx tsx scripts/predeploy.ts
 *   npm run predeploy
 *
 * Runs all pre-deployment checks in sequence:
 * 1. Environment validation (secret exposure, credential completeness)
 * 2. Production safety guards (demo auth, JSON mode)
 * 3. TypeScript type checking (tsc --noEmit)
 * 4. Build verification (next build)
 * 5. Smoke test
 *
 * Exit code:
 *   0 = all checks passed
 *   1 = one or more checks failed
 *
 * Environment overrides:
 *   ALLOW_DEMO_IN_PRODUCTION=true — Skip demo auth production block
 *   SKIP_BUILD=true — Skip build step (for CI where build runs separately)
 *   SKIP_TYPECHECK=true — Skip typecheck step
 *
 * This script does NOT modify any data or state.
 */
import 'dotenv/config';
import { execSync } from 'child_process';

// ── ANSI Colors ─────────────────────────────────────────────────
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function pass(msg: string) { console.log(`  ${GREEN}✓${RESET} ${msg}`); }
function fail(msg: string) { console.log(`  ${RED}✗${RESET} ${msg}`); }
function warn(msg: string) { console.log(`  ${YELLOW}⚠${RESET} ${msg}`); }
function info(msg: string) { console.log(`  ${CYAN}ℹ${RESET} ${msg}`); }
function step(msg: string) { console.log(`\n${BOLD}${msg}${RESET}\n`); }

let failures = 0;
let warnings = 0;

function check(condition: boolean, passMsg: string, failMsg: string): boolean {
  if (condition) { pass(passMsg); return true; }
  fail(failMsg); failures++; return false;
}

function run(label: string, cmd: string): boolean {
  info(`Running: ${DIM}${cmd}${RESET}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    pass(label);
    return true;
  } catch {
    fail(`${label} — command failed`);
    failures++;
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════
console.log(`\n${BOLD}Compliance Operating Map — Predeploy Validation${RESET}\n`);
console.log('═'.repeat(55));

// ── 1. Environment Checks ──────────────────────────────────────
step('1. Environment Validation');

const dataSource = process.env.DATA_SOURCE ?? 'json';
const isDatabaseMode = dataSource === 'database';
const demoEnabled = process.env.DEMO_AUTH_ENABLED !== 'false';
const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

check(
  dataSource === 'json' || dataSource === 'database',
  `DATA_SOURCE = "${dataSource}"`,
  `DATA_SOURCE must be "json" or "database". Got: "${dataSource}"`,
);

if (isDatabaseMode) {
  check(
    !!process.env.DATABASE_URL,
    'DATABASE_URL is set (database mode)',
    'DATABASE_URL is required when DATA_SOURCE=database',
  );
}

// ── 2. Secret Exposure Detection ───────────────────────────────
step('2. Secret Exposure Detection');

const secretLeaks = [
  'NEXT_PUBLIC_DATABASE_URL',
  'NEXT_PUBLIC_AUTH_SECRET',
  'NEXT_PUBLIC_AUTH_OIDC_SECRET',
  'NEXT_PUBLIC_AUTH_OIDC_ID',
];

for (const key of secretLeaks) {
  check(
    !process.env[key],
    `No ${key} (secrets safe)`,
    `${key} is set — this leaks credentials to the client bundle! Remove immediately.`,
  );
}

// Storage secret exposure (Phase 3.3)
const storageSecretPatterns = [
  'NEXT_PUBLIC_STORAGE_SECRET',
  'NEXT_PUBLIC_STORAGE_ACCESS_KEY',
  'NEXT_PUBLIC_STORAGE_SECRET_ACCESS_KEY',
  'NEXT_PUBLIC_STORAGE_CONNECTION_STRING',
];
for (const key of storageSecretPatterns) {
  check(
    !process.env[key],
    `No ${key} (storage secrets safe)`,
    `${key} is set — storage credentials must be server-side only! Remove immediately.`,
  );
}
// Also detect any NEXT_PUBLIC_STORAGE_ variable dynamically
const storageLeaks = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_STORAGE_'));
if (storageLeaks.length > 0) {
  for (const key of storageLeaks) {
    fail(`${key} is set — storage variables must not be exposed to the client bundle.`);
    failures++;
  }
} else {
  pass('No NEXT_PUBLIC_STORAGE_* variables detected');
}

// AI secret exposure (Phase 3.8)
const aiSecretLeakPatterns = [
  'NEXT_PUBLIC_AZURE_OPENAI_API_KEY',
  'NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT',
  'NEXT_PUBLIC_AI_PROVIDER',
];
for (const key of aiSecretLeakPatterns) {
  check(
    !process.env[key],
    `No ${key} (AI secrets safe)`,
    `${key} is set — AI provider credentials must be server-side only! Remove immediately.`,
  );
}
// Also detect any NEXT_PUBLIC_AI_ or NEXT_PUBLIC_AZURE_OPENAI_ variables dynamically
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

// STORAGE_PROVIDER validation (Phase 3.3)
const storageProvider = process.env.STORAGE_PROVIDER ?? 'none';
const validProviders = ['none', 'local', 's3', 'azure', 'gcs'];
check(
  validProviders.includes(storageProvider),
  `STORAGE_PROVIDER = "${storageProvider}" (valid)`,
  `STORAGE_PROVIDER = "${storageProvider}" is not valid. Allowed: ${validProviders.join(', ')}`,
);

// ── 3. Production Safety Guards ────────────────────────────────
step('3. Production Safety Guards');

if (isProduction && demoEnabled) {
  if (process.env.ALLOW_DEMO_IN_PRODUCTION === 'true') {
    warn('DEMO_AUTH_ENABLED=true in production — allowed by ALLOW_DEMO_IN_PRODUCTION override');
    warnings++;
  } else {
    fail(
      'DEMO_AUTH_ENABLED=true in production. ' +
      'Demo auth uses plain-text cookies and is NOT secure. ' +
      'Set DEMO_AUTH_ENABLED=false or set ALLOW_DEMO_IN_PRODUCTION=true to override.',
    );
    failures++;
  }
} else if (isProduction) {
  pass('Demo auth disabled in production');
} else {
  info(`Not production (NODE_ENV=${nodeEnv}) — demo auth check skipped`);
}

if (isProduction && !isDatabaseMode) {
  warn('JSON mode in production — writes will not persist');
  warnings++;
} else if (isProduction) {
  pass('Database mode active in production');
}

// ── 4. OIDC Credential Check ───────────────────────────────────
step('4. OIDC Credential Check');

if (!demoEnabled) {
  check(
    !!process.env.AUTH_SECRET,
    'AUTH_SECRET is set (SSO mode)',
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
  info('Demo auth active — OIDC credential check skipped');
}

// ── 5. TypeScript Type Check ───────────────────────────────────
step('5. TypeScript Type Check');

if (process.env.SKIP_TYPECHECK === 'true') {
  info('Skipped (SKIP_TYPECHECK=true)');
} else {
  run('TypeScript type check', 'npx tsc --noEmit');
}

// ── 6. Build ───────────────────────────────────────────────────
step('6. Build Verification');

if (process.env.SKIP_BUILD === 'true') {
  info('Skipped (SKIP_BUILD=true)');
} else {
  run('Next.js build', 'npx next build');
}

// ── 7. Smoke Test ──────────────────────────────────────────────
step('7. Smoke Test');

run('Smoke test', 'npx tsx scripts/smoke-test.ts');

// ── Summary ────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(55));

if (failures === 0 && warnings === 0) {
  console.log(`\n${GREEN}${BOLD}✓ All predeploy checks passed.${RESET}\n`);
} else if (failures === 0) {
  console.log(`\n${YELLOW}${BOLD}⚠ Passed with ${warnings} warning(s).${RESET}\n`);
} else {
  console.log(`\n${RED}${BOLD}✗ ${failures} failure(s), ${warnings} warning(s).${RESET}`);
  console.log(`${RED}  Deployment is NOT recommended until failures are resolved.${RESET}\n`);
}

process.exit(failures > 0 ? 1 : 0);
