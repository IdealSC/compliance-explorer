# Workstream 1: Database / Persistence — Remediation Record

> **Phase 3.12 — Staging Environment Remediation**
>
> **Workstream:** Database / Persistence
> **Owner:** Technical Owner
> **Status:** COMPLETE WITH PENDING HTTPS
> **Date:** 2026-05-07

---

## A. Database Provisioning Requirements

| Field | Value |
|---|---|
| **Provider** | Neon Serverless PostgreSQL |
| **Driver** | `@neondatabase/serverless ^1.1.0` |
| **ORM** | `drizzle-orm ^0.45.2` |
| **Schema Sync** | `drizzle-kit push` (schema push, not migration files) |
| **Database Name** | `compliance-staging` (recommended) |
| **Region** | Match deployment region (e.g., `us-east-1`) |
| **Connection Method** | Neon serverless HTTP driver (no persistent connection pool) |
| **Backup Setting** | Neon provides automatic point-in-time recovery |
| **Access Restriction** | Connection string (server-side only via `DATABASE_URL`) |
| **Owner** | Technical Owner |
| **Provision Date** | 2026-05-07 |

---

## B. Provisioning Steps

### Step 1: Create Neon Project

1. Navigate to [console.neon.tech](https://console.neon.tech)
2. Create new project: `compliance-staging`
3. Select region matching deployment target
4. Record the connection string (format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

### Step 2: Create `.env.local`

```env
# Staging Database Configuration
DATA_SOURCE=database
NEXT_PUBLIC_DATA_SOURCE=database
DATABASE_URL=postgresql://user:password@host.neon.tech/compliance-staging?sslmode=require
```

> [!IMPORTANT]
> `DATABASE_URL` must NEVER appear as `NEXT_PUBLIC_DATABASE_URL`. The `env.ts` predeploy guard detects this as a credential leak.

### Step 3: Push Schema

```bash
npx drizzle-kit push
```

This synchronizes all 13 schema files to the Neon database:
- `ai-suggestions.ts` — AI citation suggestion tables
- `audit.ts` — Audit events, report snapshots
- `identity.ts` — Users, roles, assignments
- `legacy.ts` — Legacy workbook tables
- `operational.ts` — Draft changes, regulatory updates, controls
- `quality.ts` — Data quality issues
- `reference.ts` — Regulatory reference records, versions
- `source-files.ts` — Source file metadata
- `source-intake.ts` — Source intake requests
- `sources.ts` — Source records, validation checklists
- `staging.ts` — Staging/governance tables
- `validation.ts` — Draft validation reviews

### Step 4: Seed Decision

**Decision: Use controlled pilot seed data**

Run the additive seed (no `--reset` flag):

```bash
npm run db:seed
```

This inserts JSON reference data (requirements, crosswalks, sources, controls, etc.) into the database using `onConflictDoNothing()` — safe and idempotent.

**Rationale:**
- The pilot scenarios E1–E10 begin with source intake (Stage 1) and create new records
- Seed data provides the baseline regulatory reference records needed for context
- The seed script has production safety guards (blocks `--reset` in production)
- All seeded data is labeled as existing reference data, not pilot-generated data

> [!WARNING]
> Do NOT run `npm run db:reset`. The `--reset` flag truncates ALL tables. Only `npm run db:seed` (additive) is authorized for staging pilot.

### Step 5: Verify Connectivity

```bash
# Start app in database mode
npm run dev

# Test read API
curl http://localhost:3000/api/sources/registry
# Expected: { "dataSource": "database", ... }

# Test write API (citation generation)
curl -X POST http://localhost:3000/api/ai/citation-suggestions/generate \
  -H "Content-Type: application/json" \
  -d '{"sourceRecordId":"SRC-001","sourceExcerpt":"test","sourceReference":"test"}'
# Expected: NOT 503 JSON_MODE (may return 401 if auth required, or 503 FEATURE_DISABLED if AI not configured)
```

### Step 6: Verify Write Capabilities

After database mode is confirmed, verify write paths:

```bash
# Test source intake creation
curl -X POST http://localhost:3000/api/sources/intake \
  -H "Content-Type: application/json" \
  -d '{"sourceTitle":"Test Source","sourceType":"guidance","requestedBy":"system"}'
# Expected: 200 or 201 with record ID (not 503)

# Test audit event creation (happens automatically on writes)
curl http://localhost:3000/api/audit/events
# Expected: Audit events visible with timestamps
```

---

## C. Environment Variables to Configure

| Variable | Value | Scope | Status |
|---|---|---|---|
| `DATA_SOURCE` | `database` | Server | ✅ Configured |
| `NEXT_PUBLIC_DATA_SOURCE` | `database` | Client + Server | ✅ Configured |
| `DATABASE_URL` | `postgresql://...` | Server only | ✅ Configured |

### Prohibited Variables

| Variable | Status |
|---|---|
| `NEXT_PUBLIC_DATABASE_URL` | Must NOT exist |
| `ALLOW_SEED_RESET` | Must NOT be set (or `false`) |

---

## D. Validation Items Covered

This workstream resolves the following STAGING_ENV_VALIDATION_RECORD items:

| ID | Description | Required Evidence | Status |
|---|---|---|---|
| ENV-01 | `DATA_SOURCE=database` | API returns `dataSource: "database"` | ✅ Pass |
| ENV-02 | `NEXT_PUBLIC_DATA_SOURCE=database` | Client mode matches | ✅ Pass |
| ENV-04 | `DATABASE_URL` configured | Predeploy DB check passes | ✅ Pass |
| DB-01 | PostgreSQL created | Neon project provisioned | ✅ Pass |
| DB-02 | Schema pushed | `drizzle-kit push` succeeded | ✅ Pass |
| DB-03 | Controlled seed data | `db:seed` additive (no `--reset`) | ✅ Pass |
| DB-04 | No destructive reset | `--reset` not used | ✅ Pass |
| DB-05 | App connects | Smoke test passed, database mode active | ✅ Pass |
| HDR-01 | HSTS header | Present after HTTPS deployment | ⚠ Pending |

---

## E. Exit Criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Neon project created | ✅ Pass |
| 2 | `DATABASE_URL` set in `.env.local` | ✅ Pass |
| 3 | `DATA_SOURCE=database` set | ✅ Pass |
| 4 | `NEXT_PUBLIC_DATA_SOURCE=database` set | ✅ Pass |
| 5 | Schema pushed (`drizzle-kit push`) | ✅ Pass |
| 6 | Seed data loaded (`npm run db:seed`) | ✅ Pass |
| 7 | Read APIs return `dataSource: "database"` | ✅ Pass (smoke test) |
| 8 | Write APIs do NOT return 503 `JSON_MODE` | ✅ Pass (smoke test) |
| 9 | Audit events can be written and read | ✅ Pass |
| 10 | No `NEXT_PUBLIC_DATABASE_URL` exists | ✅ Pass (predeploy verified) |
| 11 | `npm run predeploy` passes with database mode | ✅ Pass |
| 12 | Technical Owner sign-off | ⚠ Pending |

**11/12 criteria passed. HDR-01 (HSTS) pending HTTPS deployment.**

---

## F. Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| Technical Owner | ___ | ___ | Pending |

---

## G. Execution Results

### Attempt 1 — 2026-05-07 (Automated)

| Step | Action | Result | Notes |
|---|---|---|---|
| 1 | Check `DATABASE_URL` | Not set | No `.env.local` |
| 2 | Check `neonctl` | Available (v2.22.0) | |
| 3 | Authenticate `neonctl` | BLOCKED | OAuth requires browser |
| 4 | Try Neon console | BLOCKED | Browser CDP error |

**Result:** Blocked on Neon OAuth authentication.

### Attempt 2 — 2026-05-07 (Manual — Technical Owner)

| Step | Action | Result | Evidence |
|---|---|---|---|
| 1 | Provision Neon database | ✅ Success | Neon project created |
| 2 | Configure `DATABASE_URL` | ✅ Success | Entered securely in PowerShell |
| 3 | Set `DATA_SOURCE=database` | ✅ Success | `.env.local` configured |
| 4 | Set `NEXT_PUBLIC_DATA_SOURCE=database` | ✅ Success | `.env.local` configured |
| 5 | Run `npm run db:push` | ✅ Success | Schema synced to Neon |
| 6 | Run `npm run db:seed` | ✅ Success | Baseline data loaded (additive) |
| 7 | Run `npm run smoke-test` | ✅ Pass | All routes respond |
| 8 | Run `npm run predeploy` | ✅ Pass | No secret leaks |
| 9 | Verify `NEXT_PUBLIC_DATABASE_URL` absent | ✅ Confirmed | Not detected |
| 10 | Verify no `--reset` used | ✅ Confirmed | Additive seed only |
| 11 | Verify database mode active | ✅ Confirmed | API returns database records |

### Remaining Items

| Item | Status | Notes |
|---|---|---|
| HDR-01 (HSTS) | ⚠ Pending | Requires HTTPS staging deployment |
| Demo auth replacement | ⚠ Pending | OIDC configuration in Workstream 2 |
| AI provider | ⚠ Pending | Azure OpenAI in Workstream 3 |
| Technical Owner sign-off | ⚠ Pending | |

### Workstream 1 Decision

**COMPLETE WITH PENDING HTTPS**

- 8/9 database validation items passed
- HDR-01 remains pending HTTPS deployment
- Demo auth remains enabled — to be replaced by OIDC in Workstream 2
- AI remains disabled — to be configured in Workstream 3
- No application code changes were required

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | Database remediation record created | 3.12 |
| 2026-05-07 | Execution attempted: BLOCKED on Neon OAuth. Provisioning script created. | 3.12 |
| 2026-05-07 | Manual provisioning completed by Technical Owner. 8/9 items passed. COMPLETE WITH PENDING HTTPS. | 3.12 |
