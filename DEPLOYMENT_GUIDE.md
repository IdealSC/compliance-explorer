# Deployment Guide — Compliance Operating Map

> Environment separation, deployment checklists, and platform-specific guidance.

---

## Environment Separation Matrix

| Variable | Local Demo | Local Database | Staging | Production |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `development` | `production` | `production` |
| `DATA_SOURCE` | `json` | `database` | `database` | `database` |
| `NEXT_PUBLIC_DATA_SOURCE` | `json` | `database` | `database` | `database` |
| `DEMO_AUTH_ENABLED` | `true` | `true` | `false` | `false` |
| `AUTH_SECRET` | — | — | ✅ Required | ✅ Required |
| `AUTH_URL` | — | — | `https://staging.example.com` | `https://app.example.com` |
| `AUTH_OIDC_ISSUER` | — | — | ✅ Required | ✅ Required |
| `AUTH_OIDC_ID` | — | — | ✅ Required | ✅ Required |
| `AUTH_OIDC_SECRET` | — | — | ✅ Required | ✅ Required |
| `DATABASE_URL` | — | ✅ Required | ✅ Required | ✅ Required |
| `STORAGE_PROVIDER` | `none` | `none` | `none` or provider | Provider or `none` |

### Environment Rules

- **JSON mode** is for local demo and CI only. Writes do not persist.
- **Database mode** is required for all persistent workflows (drafts, reviews, publishing, audit).
- **Demo auth** is local/demo only. Never use for production compliance data.
- **OIDC** is required for staging and production deployments.
- **Seed/reset** must never be run against production data without explicit override.
- **Storage** defaults to `none` (metadata-only). No file upload or storage SDK is active unless a provider is configured.

### Storage Configuration (Phase 3.3)

| Variable | Required | Description |
|---|---|---|
| `STORAGE_PROVIDER` | No | `none` (default), `local`, `s3`, `azure`, `gcs` |
| `STORAGE_LOCAL_PATH` | When `local` | Filesystem path for local storage |
| `STORAGE_S3_BUCKET` | When `s3` | S3 bucket name |
| `STORAGE_S3_REGION` | When `s3` | AWS region |
| `STORAGE_AZURE_CONTAINER` | When `azure` | Azure Blob container name |
| `STORAGE_AZURE_CONNECTION_STRING` | When `azure` | Server-side only — never expose |
| `STORAGE_GCS_BUCKET` | When `gcs` | GCS bucket name |

> **⚠️ Storage secrets must be server-side only.** Never use `NEXT_PUBLIC_STORAGE_*` variables.
> The predeploy script and env validation detect and block `NEXT_PUBLIC_STORAGE_*` leaks.

**Phase 3.3 scope:** Source file metadata governance only. No file upload, no OCR, no AI extraction, no automatic ingestion, no automatic obligation creation, no automatic draft mapping, no automatic publishing from file content.

**Phase 3.4 scope:** Controlled source intake workflow. Formalizes triage, validation, assignment, and conversion of incoming regulatory materials. Intake requests are metadata-only workflow data — they do not parse file content, auto-extract obligations, or create draft mappings. Conversion creates a source record at `intake` status only.

---

## A. Local Demo Deployment

**Purpose:** Quick start, no external dependencies.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Defaults are correct: DATA_SOURCE=json, DEMO_AUTH_ENABLED=true

# 3. Build
npm run build

# 4. Smoke test
npm run smoke-test

# 5. Start
npm start
# Or: npm run dev (for hot reload)
```

**Expected behavior:**
- All pages render with static JSON data
- Role switcher available (demo personas)
- Write operations return 503 (JSON mode)
- No database required

---

## B. Local Database Deployment

**Purpose:** Full-feature development with persistent workflows.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local:
#   DATA_SOURCE=database
#   NEXT_PUBLIC_DATA_SOURCE=database
#   DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# 3. Push schema
npm run db:push

# 4. Seed data
npm run db:seed

# 5. Build
npm run build

# 6. Smoke test
npm run smoke-test

# 7. Start
npm start
```

**Expected behavior:**
- All CRUD operations persist
- Drafts, reviews, publishing workflow functional
- Audit events written to database
- Version history and as-of trace operational
- Demo auth with role switcher

---

## C. Staging Deployment

**Purpose:** Pre-production validation with real OIDC, real database, production-like configuration.

```bash
# Environment variables (set in deployment platform):
DATA_SOURCE=database
NEXT_PUBLIC_DATA_SOURCE=database
NODE_ENV=production
DEMO_AUTH_ENABLED=false
AUTH_SECRET=<generate: openssl rand -base64 32>
AUTH_URL=https://staging.example.com
AUTH_OIDC_ISSUER=https://login.microsoftonline.com/{tenant}/v2.0
AUTH_OIDC_ID=<staging-client-id>
AUTH_OIDC_SECRET=<staging-client-secret>
DATABASE_URL=<staging-database-url>
```

**Deployment steps:**
1. Configure all environment variables
2. Apply database migrations: `npm run db:migrate`
3. Optionally seed with demo data: `npm run db:seed`
4. Build: `npm run build`
5. Run smoke test: `npm run smoke-test`
6. Start: `npm start`
7. Verify OIDC login works
8. Test controlled publishing with a non-production record
9. Verify audit log capture
10. Verify report snapshot export

---

## D. Production Deployment

**Purpose:** Live compliance data, enterprise security, full governance.

```bash
# Environment variables (set in deployment platform):
DATA_SOURCE=database
NEXT_PUBLIC_DATA_SOURCE=database
NODE_ENV=production
DEMO_AUTH_ENABLED=false
AUTH_SECRET=<generate: openssl rand -base64 32>
AUTH_URL=https://app.example.com
AUTH_OIDC_ISSUER=https://login.microsoftonline.com/{tenant}/v2.0
AUTH_OIDC_ID=<production-client-id>
AUTH_OIDC_SECRET=<production-client-secret>
DATABASE_URL=<production-database-url>
```

**Deployment steps:**
1. ✅ Configure all environment variables
2. ✅ Verify database backup exists
3. ✅ Apply database migrations: `npm run db:migrate`
4. ❌ Do NOT seed or reset production data
5. ✅ Build: `npm run build`
6. ✅ Run predeploy validation: `npm run predeploy`
7. ✅ Start: `npm start`
8. ✅ Verify OIDC login works
9. ✅ Verify RBAC enforcement (test with viewer, editor, approver)
10. ✅ Verify controlled publishing with staging data first
11. ✅ Verify audit log writes
12. ✅ Verify security headers in browser DevTools
13. ✅ Confirm rollback plan is documented

---

## OIDC Callback URL Patterns

The OIDC redirect URI must be registered in your identity provider's app registration.

| Environment | Callback URL |
|---|---|
| Local dev | `http://localhost:3000/api/auth/callback/oidc` |
| Staging | `https://staging.example.com/api/auth/callback/oidc` |
| Production | `https://app.example.com/api/auth/callback/oidc` |

### Provider-Specific Setup

| Setting | Value |
|---|---|
| **Client ID** | From IdP app registration |
| **Client Secret** | From IdP app registration |
| **Issuer URL** | OIDC discovery endpoint (e.g., `https://login.microsoftonline.com/{tenant}/v2.0`) |
| **Redirect URI** | `https://your-domain/api/auth/callback/oidc` |
| **Scopes** | `openid profile email` (minimum) |
| **Groups Claim** | `groups` (default, configurable via `AUTH_GROUPS_CLAIM`) |
| **Email Claim** | `email` (standard OIDC claim) |
| **Name Claim** | `name` (standard OIDC claim) |

### Provider Examples

**Microsoft Entra ID:**
```
AUTH_OIDC_ISSUER=https://login.microsoftonline.com/{tenant-id}/v2.0
```
Requires: App Registration → Authentication → Redirect URI → Web → callback URL.

**Okta:**
```
AUTH_OIDC_ISSUER=https://your-org.okta.com
```
Requires: Applications → Create App Integration → OIDC → Web Application.

**Google:**
```
AUTH_OIDC_ISSUER=https://accounts.google.com
```
Requires: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID.

---

## Database Migration Safety

### Commands Reference

| Command | Purpose | Safety |
|---|---|---|
| `npm run db:push` | Push schema directly (dev) | ⚠️ Dev only — may drop columns |
| `npm run db:generate` | Generate migration SQL files | ✅ Safe — creates files only |
| `npm run db:migrate` | Apply generated migrations | ✅ Production path — additive |
| `npm run db:seed` | Insert demo/sample data | ⚠️ Dev/staging only |
| `npm run db:reset` | Truncate ALL tables + re-seed | 🛑 Destructive — blocked in production |

### Production Migration Rules

1. **Never use `db:push` in production.** It can drop columns and data.
2. **Always use `db:generate` + `db:migrate`** for production schema changes.
3. **Back up the database** before running migrations.
4. **Review generated SQL** before applying (in `drizzle/migrations/`).
5. **`db:reset` is blocked in production** unless `ALLOW_SEED_RESET=true` is set.
6. **Test migrations on staging first** before applying to production.
7. **Have a rollback plan** — keep the previous migration SQL and a database backup.

---

## Deployment Platform Guidance

### Vercel

```bash
# Build Command
npm run build

# Start Command (handled by Vercel)
# N/A — Vercel manages server start

# Environment Variables
# Set in: Vercel Dashboard → Project → Settings → Environment Variables
# All variables from the Environment Separation Matrix above
```

**Notes:**
- Vercel sets `NODE_ENV=production` automatically
- `AUTH_URL` should match the Vercel deployment URL
- Database: Use Neon serverless PostgreSQL (native integration available)
- Security headers: Applied by middleware — verify in browser DevTools
- Logging: Available in Vercel Functions logs

### Azure App Service

```bash
# Build Command
npm run build

# Start Command
npm start

# Environment Variables
# Set in: Azure Portal → App Service → Configuration → Application Settings
```

**Notes:**
- Set `NODE_ENV=production` manually
- `AUTH_URL` should match the App Service URL
- Database: Use Azure Database for PostgreSQL or Neon
- For custom domains: Update OIDC redirect URI in IdP
- Security headers: Applied by middleware — Azure also allows additional headers via web.config

### Container Deployment (Docker)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

**Notes:**
- Requires `output: 'standalone'` in `next.config.ts`
- All environment variables passed via container runtime (`-e` flags or `.env` file)
- Database connectivity must be reachable from container network
- OIDC callback URL must match the container's external hostname

---

## Security Limitations (Current)

| Limitation | Mitigation | Target Phase |
|---|---|---|
| Demo auth in production | Blocked by env validation + predeploy | Resolved (3.1) |
| No rate limiting | Add at platform/CDN layer (Vercel, Cloudflare) | Deployment config |
| No CSP headers | Implement after script/style inventory | Phase 3.x |
| Limited request validation | Add Zod schemas to API routes | Phase 3.5 |
| No E2E tests | Add Playwright or Cypress before production use | Phase 3.6 |
| No file/object storage | Evidence and sources are metadata-only | Phase 3.7+ |
| No real source ingestion | Manual data entry only | Phase 4.0+ |
| Intake workflow | ✅ Governed (Phase 3.4) — triage/validation pipeline | Resolved (3.4) |
