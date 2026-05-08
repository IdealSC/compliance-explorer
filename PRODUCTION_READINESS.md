# Production Readiness Guide — Compliance Operating Map

> **Phase 2.9 / 3.1 / 3.2 / 3.3 / 3.4 / 3.8 / 3.9 / 3.10 / 3.11 — Security Hardening, Production Identity, Deployment, Storage, Intake Workflow, AI Provider Integration, Citation → Draft Conversion, Validation Workbench, & Pilot Readiness**
>
> This document covers architecture, configuration, security, and deployment
> for the Compliance Operating Map application.
>
> **Related documentation:**
> - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — Environment separation, platform guidance, checklists
> - [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) — Pre-release gate checklist
> - [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) — Operational procedures and incident response
> - [docs/API_AUTH_PATTERN.md](docs/API_AUTH_PATTERN.md) — Developer guide for API auth pattern
> - [PRODUCTION_QA_CHECKLIST.md](PRODUCTION_QA_CHECKLIST.md) — Comprehensive QA test checklist

---

## Architecture Summary

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | Server + client components, SSR |
| **UI** | Tailwind CSS v4 + shadcn/ui | Design system, component library |
| **Database** | PostgreSQL (Neon serverless) | Persistent storage |
| **ORM** | Drizzle ORM | Schema, queries, migrations |
| **Auth** | Auth.js v5 / OIDC + Demo fallback (Phase 3.1) | Dual-mode identity (SSO + demo) |
| **Charts** | Recharts | Data visualizations |

### Dual-Mode Architecture

The app supports two data source modes:

| Mode | Behavior |
|---|---|
| `json` | Reads from static JSON files. No writes persist. No database required. |
| `database` | Full persistence via PostgreSQL. RBAC, audit trail, versioning, publishing. |

---

## Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|---|---|---|
| `DATA_SOURCE` | Yes | `json` or `database` |
| `NEXT_PUBLIC_DATA_SOURCE` | Yes | Must match `DATA_SOURCE` — client-side mode indicator |
| `DATABASE_URL` | When `database` | PostgreSQL connection string (Neon) |
| `DEMO_AUTH_ENABLED` | No | `true` (default dev) or `false` (production SSO) |
| `AUTH_SECRET` | When SSO | JWT encryption secret. Generate: `openssl rand -base64 32` |
| `AUTH_OIDC_ISSUER` | When SSO | OIDC discovery URL (e.g., `https://login.microsoftonline.com/{tenant}/v2.0`) |
| `AUTH_OIDC_ID` | When SSO | OIDC client ID from IdP app registration |
| `AUTH_OIDC_SECRET` | When SSO | OIDC client secret |
| `AUTH_GROUPS_CLAIM` | No | Custom OIDC group claim name (default: `groups`) |
| `AUTH_GROUP_ROLE_MAP` | No | JSON override for group-to-role mapping |
| `NODE_ENV` | No | Set by runtime — `development`, `production` |
| `AI_PROVIDER` | No | `none` (default, disabled) or `azure_openai` |
| `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` | No | `false` (default). Set `true` to enable citation generation |
| `AZURE_OPENAI_ENDPOINT` | When `azure_openai` | Azure OpenAI resource endpoint URL |
| `AZURE_OPENAI_API_KEY` | When `azure_openai` | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | When `azure_openai` | Azure OpenAI model deployment name |
| `AZURE_OPENAI_API_VERSION` | No | Azure OpenAI API version (default: `2024-02-01`) |
| `AI_REQUIRE_SOURCE_RECORD_VALIDATED` | No | `true` (default). Require validated source before generation |
| `AI_MAX_SOURCE_CHARS` | No | Max source excerpt length (default: `12000`) |
| `AI_REQUEST_TIMEOUT_MS` | No | Provider request timeout (default: `30000`) |

### Security Rules

- **`DATABASE_URL` must never be a `NEXT_PUBLIC_` variable.** This would leak credentials to the client bundle.
- **`AUTH_SECRET`, `AUTH_OIDC_SECRET` must never be `NEXT_PUBLIC_` variables.** These are server-only secrets.
- **`AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` must never be `NEXT_PUBLIC_` variables.** AI provider secrets are server-only. Predeploy and smoke-test scripts detect `NEXT_PUBLIC_AI_*` and `NEXT_PUBLIC_AZURE_OPENAI_*` leaks.
- **`DEMO_AUTH_ENABLED` should be `false` in production.** Demo auth uses plain-text cookies.
- When `DEMO_AUTH_ENABLED=false`, `AUTH_SECRET` and OIDC credentials are **required** — the app will error on startup if they are missing.
- The app validates environment on startup and will warn/fail on misconfigurations.

---

## Database Setup

### Prerequisites

- PostgreSQL database (recommended: [Neon](https://neon.tech) serverless)
- `DATABASE_URL` set in `.env.local`

### Schema Push (Development)

```bash
# Push schema to database (creates/updates tables)
npx drizzle-kit push
```

### Seed Data

```bash
# Additive insert (idempotent — safe to run multiple times)
npm run db:seed

# Destructive reset — truncates all tables, then re-seeds
npm run db:reset
```

> **⚠️ WARNING:** `db:reset` truncates ALL tables. Never run in production.
> Seed data is **sample/demo content only** — not validated regulatory data.

### Migrations (Production)

For production deployments, use Drizzle's migration system:

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

> **⚠️ Production Migration Safety:**
> - Never use `db:push` in production — it can drop columns.
> - Always back up the database before running migrations.
> - Review generated SQL in `drizzle/migrations/` before applying.
> - Test migrations on staging first.
> - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full migration safety rules.

---

## Authentication & Authorization

### Demo Auth (Local Development)

- Cookie-based demo sessions (`compliance-demo-user` cookie)
- Plain-text cookie — **not cryptographically secure**
- Role switcher allows switching between demo personas
- Active when `DEMO_AUTH_ENABLED=true` (default in development)
- Set `DEMO_AUTH_ENABLED=false` to switch to production SSO

> **⚠️ Demo auth must not be used for production deployments.**
> Demo users must not be treated as production accounts.

### Production SSO (Auth.js / OIDC) — Phase 3.1

The app supports any OIDC-compliant identity provider (Entra ID, Okta, Google, etc.) via Auth.js v5.

**To enable production SSO:**

1. Register an OIDC application in your identity provider
2. Configure the redirect URI: `https://your-domain/api/auth/callback/oidc`
3. Set environment variables:
   ```bash
   DEMO_AUTH_ENABLED=false
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   AUTH_OIDC_ISSUER=https://your-idp/.well-known/openid-configuration
   AUTH_OIDC_ID=<client-id>
   AUTH_OIDC_SECRET=<client-secret>
   ```
4. (Optional) Configure group claim mapping:
   ```bash
   AUTH_GROUPS_CLAIM=groups
   AUTH_GROUP_ROLE_MAP={"YourViewers":"viewer","YourEditors":"compliance_editor","YourApprovers":"compliance_approver","YourAdmins":"admin"}
   ```

**Group-to-Role Mapping:**

| IdP Group | System Role | Default |
|---|---|---|
| `Platform-Viewers` | viewer | ✓ (fallback) |
| `Compliance-BusinessOwners` | business_owner | |
| `Compliance-Editors` | compliance_editor | |
| `Compliance-Approvers` | compliance_approver | |
| `Platform-Auditors` | auditor | |
| `Platform-Admins` | admin | |

Users with no matching group default to `viewer` (least privilege).

**Session Architecture:**
- Sessions use JWT strategy (no server-side session store required)
- Tokens are encrypted with `AUTH_SECRET`
- Session max age: 8 hours
- API routes use `resolveSession()` to pre-resolve Auth.js sessions
  into request-scoped AsyncLocalStorage for synchronous RBAC access

### RBAC Overview

| Role | Key Permissions |
|---|---|
| **Viewer** | Read-only access to all reference data |
| **Business Owner** | Operational edits (actions, controls, evidence) |
| **Compliance Editor** | Draft creation, source registry management, AI citation generation, citation → draft conversion |
| **Compliance Approver** | Review decisions, controlled publishing |
| **Legal Reviewer** | Legal/compliance validation, legal review completion |
| **Auditor** | Read-only access to audit log, reports |
| **Admin** | User management, system configuration |

**Separation of Duties (SoD):** No single role can both author and approve changes.

### Route Access

All 24 application routes are mapped in `src/auth/route-access.ts` with required permissions. API routes enforce server-side permission checks via `requirePermission()`.

---

## Controlled Publishing

Reference data (regulatory requirements, crosswalks) follows a governed change workflow:

1. **Draft** → Compliance Editor creates a draft change
2. **Review** → Compliance Approver reviews with accept/reject/revise
3. **Publish** → Creates a new versioned active record, supersedes prior version
4. **Audit** → Every state transition is recorded with SHA-256 checksums

**Active reference data is never directly editable.** All changes must go through the draft → review → publish pipeline.

---

## Audit Immutability

- Audit events are append-only — no UPDATE or DELETE permitted
- `IMMUTABLE_TABLES` guard prevents runtime mutation
- SHA-256 checksums are generated on INSERT for tamper detection
- `ImmutabilityViolationError` thrown on violation attempts
- Audit integrity can be verified via `/api/audit/verify-integrity`

### Immutable Tables

- `auditEvents`
- `reportSnapshots`

---

## Report Snapshot Governance

Report exports are treated as governed output records:

- Each export creates a `report_snapshot` record
- SHA-256 checksum computed on export payload
- Audit event linked to each snapshot
- Snapshots are append-only (immutable after creation)
- CSV/JSON exports include snapshot ID and checksum in metadata envelope
- Print exports include hidden provenance header with checksum

---

## Source Validation Workflow

Source registry records follow a validation lifecycle:

1. **Create** → Source record with SRC- identifier
2. **Validate/Reject** → Compliance Editor validates or rejects
3. **Legal Review** → Mark for legal review if required
4. **Publishing Gate** → Source validation status checked (non-blocking) during publish

Source validation does not auto-publish. It is an independent quality gate.

---

## Export Governance

- CSV, JSON, and Print exports require `reports.export` permission
- All exports create snapshot records before data delivery
- Export metadata envelopes include:
  - Snapshot ID
  - SHA-256 checksum
  - Generation timestamp
  - Export format
  - Governance disclaimers

---

## Source File Metadata Governance (Phase 3.3)

Source file metadata tracks file identity, integrity, and lifecycle state for source documents.

**Key boundaries:**
- **Metadata-only** — no file content is stored, parsed, extracted, or analyzed
- **No automatic ingestion** — file metadata does not create obligations, mappings, or active reference data
- **No OCR / AI** — no optical character recognition or AI-powered extraction
- **Governed lifecycle** — registered → pending_upload → uploaded → verified → archived
- **Status transitions** enforce valid state machine guards
- **RBAC-enforced** — `source.intake` for writes, `source.validate` for status changes, `source.view` for reads
- **Audit-logged** — all create, update, status change, verify, and archive actions produce immutable audit events
- **Parent validation** — API routes validate file ownership against the parent source record (defense-in-depth)
- **Protected fields** — 22 fields are rejected at the API boundary for PATCH operations

### Storage Configuration

| Setting | Default | Notes |
|---|---|---|
| `STORAGE_PROVIDER` | `none` | Metadata-only by default |
| Supported providers | `none`, `local`, `s3`, `azure`, `gcs` | Provider secrets are server-side only |
| Predeploy validation | ✅ | `NEXT_PUBLIC_STORAGE_*` leaks are detected and blocked |

> **Warning:** `NEXT_PUBLIC_STORAGE_*` environment variables are strictly prohibited. The predeploy script rejects builds containing these.

---

## Source Intake Workflow Governance (Phase 3.4)

Source intake requests formalize how new regulatory materials enter the system for review.

**Key boundaries:**
- **Metadata-only workflow** — intake requests track triage, assignment, and validation state; they do not store or process file content
- **No automatic creation** — intake conversion creates only a source record at `intake` status; it does NOT create obligations, draft mappings, or active reference data
- **No auto-extraction** — intake does not parse, extract, or analyze file content
- **Server-enforced transitions** — `ALLOWED_TRANSITIONS` map prevents illegal state changes (HTTP 409)
- **RBAC-enforced** — `source.intake` for submission/metadata, `source.validate` for triage/status/conversion
- **Audit-logged** — every status change, metadata update, assignment, rejection, and conversion is audited
- **Checklist governance** — checklist items track required-for-triage and required-for-conversion gates

### Workflow Status Lifecycle

```
submitted → triage → metadata_review → assigned → validation_pending
  → legal_review_required (loopback to validation_pending)
  → ready_for_source_record → converted_to_source_record → closed
Rejection available from most active states → rejected → closed
```

### Intake API Routes

| Route | Methods | Permission |
|---|---|---|
| `/api/sources/intake` | GET, POST | `source.view`, `source.intake` |
| `/api/sources/intake/[id]` | GET, PATCH | `source.view`, `source.intake` |
| `/api/sources/intake/[id]/status` | PATCH | `source.validate` |
| `/api/sources/intake/[id]/assign` | PATCH | `source.validate` |
| `/api/sources/intake/[id]/checklist` | GET | `source.view` |
| `/api/sources/intake/[id]/checklist/[itemId]` | PATCH | `source.intake` |
| `/api/sources/intake/[id]/convert-to-source-record` | POST | `source.validate` |

---

## Security Headers

The application applies security headers via Next.js middleware (`src/middleware.ts`):

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | Restricts browser features |
| `X-DNS-Prefetch-Control` | `off` | Prevents DNS prefetching leakage |

> **Note:** Content-Security-Policy (CSP) is not applied via middleware because it can break Next.js inline scripts. Add CSP at the CDN/reverse-proxy level with proper nonce configuration.

---

## Security Limitations

| Area | Status | Recommendation |
|---|---|---|
| **Authentication** | ✅ Resolved (Phase 3.1) | Auth.js v5 / OIDC implemented |
| **Session security** | ✅ Resolved (Phase 3.1) | Encrypted JWTs via Auth.js |
| **CSP** | Not applied | Add at CDN/reverse-proxy level |
| **Rate limiting** | Not applied | Add at CDN/reverse-proxy level |
| **CORS** | Default Next.js | Configure for production domain |
| **Input sanitization** | Field whitelists only | Add Zod validation in Phase 3.x |
| **File upload** | Not implemented | Not in scope |
| **Storage secrets** | ✅ Validated (Phase 3.3) | Predeploy blocks `NEXT_PUBLIC_STORAGE_*` |
| **Source file metadata** | ✅ Governed (Phase 3.3) | Metadata-only, no ingestion |
| **Source intake workflow** | ✅ Governed (Phase 3.4) | Triage/validation pipeline, no auto-extraction |
| **AI provider secrets** | ✅ Validated (Phase 3.8) | Predeploy + smoke-test block `NEXT_PUBLIC_AI_*` and `NEXT_PUBLIC_AZURE_OPENAI_*` |
| **AI citation generation** | ✅ Governed (Phase 3.8) | Citation-only, disabled by default, mandatory human review |
| **AI citation → draft conversion** | ✅ Governed (Phase 3.9) | Human-controlled, 8-gate eligibility, duplicate guard, provenance stamping |
| **Draft validation workbench** | ✅ Governed (Phase 3.10) | Advisory pre-review validation, no auto-approval, no AI invocation |
| **Pilot readiness** | ✅ Documented (Phase 3.11) | Traceability matrix, risk register, readiness checklist |
| **AI rate limiting** | Not applied | Consider per-user limits at CDN/application level |
| **Encryption at rest** | Database provider dependent | Verify with Neon/provider |

---

## Pre-Deployment Checklist

> **See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for the comprehensive pre-release gate checklist.**
>
> The release checklist covers build validation, environment configuration, identity & access,
> database migrations, governance controls, audit trail, report snapshots, security, and infrastructure.
>
> **Quick validation:**
> ```bash
> npm run predeploy
> ```
> This runs environment validation, secret exposure detection, typecheck, build, and smoke test.

---

## Post-Deployment Smoke Test

1. App loads at production URL
2. Login works with production auth provider
3. Key pages render: `/`, `/executive-dashboard`, `/obligations`, `/reports`
4. Operational write (action center) succeeds
5. Draft creation succeeds
6. Review workflow completes
7. Controlled publishing creates new version
8. Audit log shows new events
9. Report export creates snapshot
10. Version history shows publication provenance
11. Source registry create + validate works
12. Source intake submit + triage + status transition works
13. Source intake conversion creates source record at `intake` status
14. API returns 403 for unauthorized requests
15. API returns 503 when database is unavailable
16. AI citation generation (if enabled): POST to `/api/ai/citation-suggestions/generate` returns citations
17. AI disabled: POST to `/api/ai/citation-suggestions/generate` returns 503 with `FEATURE_DISABLED`
18. No `NEXT_PUBLIC_AI_*` or `NEXT_PUBLIC_AZURE_OPENAI_*` variables in client bundle
19. AI citation → draft conversion: eligible suggestion converts to draft with provenance stamp
20. AI conversion creates audit event with suggestion ID linkage
21. Duplicate conversion blocked on retry (returns 409)
22. Validation workbench: create review, assess source support, assess citation accuracy
23. Validation "Ready for Review" ≠ approved — governance warning displayed
24. Legal review completion requires Legal Reviewer role (VALIDATION_LEGAL_REVIEW permission)
---

## CI/CD

A GitHub Actions workflow is available at `.github/workflows/ci.yml`.

**CI runs in safe mode:**
- `DATA_SOURCE=json` (no database required)
- `DEMO_AUTH_ENABLED=true` (no OIDC secrets required)
- Steps: `npm ci` → `npm run typecheck` → `npm run build` → `npm run smoke-test`

**Predeploy validation:**
```bash
npm run predeploy
```
Runs environment validation, secret exposure detection, typecheck, build, and smoke test.
Blocks deployment if demo auth is active in production (unless overridden).

**Available scripts:**

| Script | Purpose | CI Safe |
|---|---|---|
| `npm run typecheck` | TypeScript type check (no emit) | ✅ |
| `npm run build` | Next.js production build | ✅ |
| `npm run smoke-test` | Environment & file validation | ✅ |
| `npm run predeploy` | Composite deployment gate | ✅ |
| `npm run db:generate` | Generate migration SQL | ✅ |
| `npm run db:migrate` | Apply migrations | Needs DB |
| `npm run db:push` | Push schema (dev only) | Needs DB |
| `npm run db:seed` | Seed demo data | Needs DB |
| `npm run db:reset` | Destructive reset | 🛑 Blocked in prod |
