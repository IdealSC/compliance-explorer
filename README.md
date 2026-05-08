# Compliance Operating Map

A searchable, filterable, role-based compliance operating map for pharmaceutical regulatory requirements. Built as a modern web application with dual-mode architecture supporting both static JSON and full database persistence.

## Pilot Disclaimer

> **This is a pilot application.** It is not a validated GxP system, legal advice engine, QMS, evidence repository, or system of record. It is a compliance decision-support and navigation tool only.

## Current Capabilities

### Phase 1.x — Core Application
- 110-row regulatory compliance matrix from Excel workbook
- Role-based views for supply chain, quality, regulatory, legal, manufacturing
- Launch-critical obligation surfacing
- Executive dashboard with KPIs and charts
- Standards crosswalk, business function mapping
- Risk register and evidence requirements
- Impact analysis and data quality views

### Phase 2.x — Persistence & Governance
- **Database Foundation** (2.1) — PostgreSQL via Neon serverless + Drizzle ORM
- **Auth & RBAC** (2.2) — Demo cookie sessions, 6 roles, 20+ permissions, SoD
- **Operational Persistence** (2.3) — Actions, controls, evidence writes
- **Draft/Staging** (2.4) — Regulatory update staging, draft change workspace
- **Review Workflow** (2.5A) — Approval reviews with accept/reject/revise
- **Controlled Publishing** (2.5B) — Versioned active records, supersession, stableReferenceId
- **Audit Immutability** (2.6) — SHA-256 checksums, immutability guard, version history, as-of trace
- **Source Registry** (2.7) — Source validation workflow, SRC- IDs, checklist persistence
- **Report Snapshots** (2.8) — Export governance, snapshot persistence, checksum envelopes
- **Production Readiness** (2.9) — Env validation, security headers, deployment docs, QA checklists

### Phase 3.x — Enterprise Identity
- **Production Identity** (3.1) — Auth.js v5 / OIDC integration, dual-mode session (demo + SSO), group-to-role mapping, request-scoped session store

## Technology Stack

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org/) 16 | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI component library |
| [Drizzle ORM](https://orm.drizzle.team/) | Database ORM + migrations |
| [Neon](https://neon.tech) | Serverless PostgreSQL |
| [TanStack Table](https://tanstack.com/table) | Headless table engine |
| [Recharts](https://recharts.org/) | Chart visualizations |
| [SheetJS (xlsx)](https://sheetjs.com/) | Workbook import/parsing |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (optional — app runs in JSON-only mode without it)

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local — see PRODUCTION_READINESS.md for full variable reference
```

### JSON Mode (No Database)

```bash
# Uses static JSON files — no persistence, no writes
DATA_SOURCE=json npm run dev
```

### Database Mode

```bash
# 1. Set DATABASE_URL in .env.local
# 2. Push schema
npx drizzle-kit push

# 3. Seed demo data
npm run db:seed

# 4. Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Application Routes (56 routes)

### Pages (24 routes)

| Route | View | Section |
|---|---|---|
| `/` | Operating Map | Home |
| `/obligations` | Obligation Matrix | Explore |
| `/requirements` | All Requirements | Explore |
| `/crosswalk` | Standards Crosswalk | Explore |
| `/business-functions` | Business Functions | Explore |
| `/supply-chain` | Supply Chain | Curated |
| `/launch-critical` | Launch-Critical | Curated |
| `/executive-dashboard` | Executive Dashboard | Monitor |
| `/action-center` | Action Center | Monitor |
| `/reports` | Reports & Exports | Monitor |
| `/controls-evidence` | Controls & Evidence | Monitor |
| `/risks` | Risk Register | Monitor |
| `/regulatory-updates` | Regulatory Updates | Governance |
| `/impact-analysis` | Impact Analysis | Governance |
| `/draft-mapping` | Draft Workspace | Governance |
| `/review-approval` | Review & Approval | Governance |
| `/version-history` | Version History | Governance |
| `/as-of-trace` | As-Of Trace | Governance |
| `/audit-log` | Audit Log | Governance |
| `/source-registry` | Source Registry | Governance |
| `/data-quality` | Data Quality | Governance |
| `/evidence` | Evidence (Legacy) | Legacy |
| `/gaps` | Gaps & Actions (Legacy) | Legacy |
| `/sources` | Sources (Legacy) | Legacy |

### API Route Groups (31 endpoints)

| Group | Endpoints | Purpose |
|---|---|---|
| `/api/auth/*` | 2+ | Demo login + Auth.js OIDC |
| `/api/operational/*` | 3 | Action, control, evidence writes |
| `/api/staging/*` | 6 | Draft changes, regulatory updates |
| `/api/review/*` | 3 | Approval reviews |
| `/api/publishing/*` | 4 | Controlled publishing |
| `/api/version-history/*` | 2 | Version history + as-of queries |
| `/api/audit/*` | 1 | Integrity verification |
| `/api/sources/registry/*` | 6 | Source registry CRUD + validation |
| `/api/reports/*` | 3 | Snapshots + exports |

## Deployment

See [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for:
- Required environment variables
- Database setup & migration
- Security configuration
- Pre-deployment checklist
- Post-deployment smoke test

See [PRODUCTION_QA_CHECKLIST.md](./PRODUCTION_QA_CHECKLIST.md) for the full QA validation checklist.

## Known Limitations

1. **Demo authentication** — Cookie-based, not cryptographically secure. For production, set `DEMO_AUTH_ENABLED=false` and configure Auth.js OIDC (Phase 3.1).
2. **No CSP** — Must be configured at CDN/proxy level.
3. **No rate limiting** — Add at deployment layer.
4. **No file upload** — Evidence and source documents are metadata-only.
5. **No real-time collaboration** — Single-user sessions.
6. **Sample/demo data** — All seeded data is illustrative, not validated.

## License

Internal pilot — not for external distribution.
