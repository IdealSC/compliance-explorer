# Compliance Explorer Web App

A searchable, filterable, role-based compliance matrix explorer for pharmaceutical regulatory requirements. Built from an Excel-based regulatory compliance workbook and rendered as a modern web application.

## Pilot Disclaimer

> **This is a pilot application.** It is not a validated GxP system, legal advice engine, QMS, evidence repository, workflow approval tool, or system of record. It is a compliance decision-support and navigation tool only.

## What This App Does

- Converts a 110-row regulatory compliance matrix (Excel workbook) into a searchable, filterable web application
- Provides role-based views for supply chain, quality, regulatory, legal, manufacturing, procurement, and digital operations leaders
- Surfaces launch-critical obligations, highest-risk themes, and evidence requirements
- Presents an executive dashboard with KPIs, charts, and preview tables

## What This App Is NOT

- Not a validated GxP system
- Not a quality management system (QMS)
- Not a legal advice engine
- Not an evidence upload or document management system
- Not a workflow or approval tool
- Not a system of record
- Not a substitute for regulatory counsel

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js](https://nextjs.org/) 16 | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI component library |
| [TanStack Table](https://tanstack.com/table) | Headless table engine |
| [Recharts](https://recharts.org/) | Chart visualizations |
| [SheetJS (xlsx)](https://sheetjs.com/) | Workbook import/parsing |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Primary typeface |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Monospace (IDs, codes) |

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Install Dependencies

```bash
npm install
```

### Import Workbook Data

The application reads from static JSON files in `src/data/`. To regenerate from the source Excel workbook:

```bash
npx tsx scripts/importWorkbook.ts
```

This parses all 13 sheets from the workbook and generates:

| File | Source Sheet | Records |
|------|-------------|---------|
| `requirements.json` | Compliance Matrix | 110 |
| `risks.json` | Highest Risk Obligations | 71 |
| `evidence.json` | Evidence Requirements | 16 |
| `sources.json` | Regulatory Sources | — |
| `gaps.json` | Gap Analysis | — |
| `lists.json` | Controlled Vocabulary | — |
| `metadata.json` | Import metadata | 1 |

### Run Development Server

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

## Deploy to Netlify

This app is pre-configured for Netlify deployment via `netlify.toml`. All pages are statically pre-rendered at build time — no server runtime, database, or environment variables are required.

### Option A: Git-based deployment (recommended)

1. Push the project to a GitHub, GitLab, or Bitbucket repository
2. In the [Netlify dashboard](https://app.netlify.com/), click **"Add new site" → "Import an existing project"**
3. Connect your repository
4. Netlify will auto-detect `netlify.toml` settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Click **Deploy site**

### Option B: Netlify CLI

```bash
# Install CLI (one-time)
npm install -g netlify-cli

# Login
netlify login

# Initialize (from project root)
netlify init

# Deploy a preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Notes

- The `@netlify/plugin-nextjs` plugin is configured in `netlify.toml` and will be auto-installed during deployment
- No environment variables or secrets are required
- The workbook import script (`scripts/importWorkbook.ts`) is a dev-only tool and is **not** executed during Netlify builds
- All data is bundled as static JSON in `src/data/` and included in the build output
- The source Excel workbook (`.xlsx`) is excluded via `.gitignore` and should never be committed

## Application Routes

| Route | View | Description |
|-------|------|-------------|
| `/` | Home Dashboard | Executive overview with KPIs, charts, navigation, and preview tables |
| `/requirements` | All Requirements | Full 110-row compliance matrix with search, 8 filters, sortable columns |
| `/supply-chain` | Supply Chain View | Curated view for supply chain leaders (~88 obligations) |
| `/launch-critical` | Launch-Critical | Requirements flagged for commercial launch readiness (99 obligations) |
| `/risks` | Highest Risk | Risk-themed dashboard with 71 risk entries and linked requirements |
| `/evidence` | Evidence | 16 evidence items with enriched requirement linkage |

## Component Architecture

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home Dashboard
│   ├── requirements/page.tsx     # All Requirements
│   ├── supply-chain/page.tsx     # Supply Chain View
│   ├── launch-critical/page.tsx  # Launch-Critical View
│   ├── risks/page.tsx            # Highest Risk View
│   └── evidence/page.tsx         # Evidence View
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Root layout with sidebar + main content
│   │   ├── SidebarNav.tsx        # Navigation sidebar (responsive)
│   │   ├── PageHeader.tsx        # Shared page title + description
│   │   └── CuratedDisclaimer.tsx # Curated view disclaimer banner
│   │
│   ├── tables/
│   │   ├── RequirementsTable.tsx  # TanStack Table for requirements
│   │   └── DataTable.tsx          # Generic TanStack Table (risks, evidence)
│   │
│   ├── filters/
│   │   ├── FilterBar.tsx          # Requirements filter bar (8 filters)
│   │   └── GenericFilterBar.tsx    # Dynamic filter bar (risks, evidence)
│   │
│   ├── cards/
│   │   └── SummaryCards.tsx        # KPI summary card grid
│   │
│   ├── detail/
│   │   └── RequirementDrawer.tsx   # Side-panel drawer for requirement detail
│   │
│   ├── badges.tsx                  # Severity, Flag, and Status badges
│   │
│   └── ui/                         # shadcn/ui primitives
│
├── lib/
│   ├── data.ts                     # Data loading + utility functions
│   ├── columns.ts                  # TanStack column definitions
│   ├── filters.ts                  # Filter state + matching logic
│   ├── curated-filters.ts          # Supply chain / launch-critical inclusion rules
│   └── utils.ts                    # General utilities (cn helper)
│
├── data/                           # Static JSON (generated from workbook)
│   ├── requirements.json
│   ├── risks.json
│   ├── evidence.json
│   └── ...
│
├── types/
│   └── index.ts                    # TypeScript type definitions
│
└── scripts/
    └── importWorkbook.ts           # Excel → JSON import pipeline
```

## Data Source

The source of truth is an Excel workbook containing 13 sheets:

1. **Compliance Matrix** — 110 regulatory requirements (primary entity)
2. **Highest Risk Obligations** — 71 risk-themed entries
3. **Evidence Requirements** — 16 evidence/documentation items
4. **Regulatory Sources** — Reference documents and frameworks
5. **Gap Analysis** — Compliance gap assessments
6. **Controlled Vocabulary / Lists** — Picklist values and taxonomy
7. Additional supporting sheets (crosswalks, function impacts, etc.)

All data is imported as-is. No regulatory content is rewritten, invented, or inferred.

## Key Design Decisions

- **Read-only pilot** — No write operations, authentication, or persistence
- **Static JSON** — All data pre-generated at build time from the workbook
- **Shared components** — Single RequirementDrawer, FilterBar, and badge system used across all views
- **Dynamic calculations** — All KPI counts, chart data, and filter options computed from JSON at render time
- **Responsive layout** — Mobile hamburger nav, responsive grids, horizontal table scrolling

## Known Limitations

1. **No authentication or role-based access control** — All users see all data
2. **No evidence upload or document management** — Evidence view is read-only
3. **No workflow or approval system** — Status fields are display-only
4. **No database** — Data changes require re-running the import script
5. **Evidence linkage is fuzzy** — Evidence items are matched to requirements via text similarity, not explicit IDs
6. **No real-time collaboration** — Static pilot with no multi-user support
7. **No audit trail** — No change tracking or versioning
8. **Browser-only** — No native mobile app

## Suggested Next-Phase Enhancements

- Role-based access control and authentication
- Evidence upload and document attachment workflow
- Approval and review workflow with audit trail
- Database persistence (PostgreSQL or similar)
- Real-time collaboration features
- Advanced analytics and trend reporting
- Integration with existing GxP systems (QMS, ERP)
- Export to PDF/Excel for offline review
- AI-assisted gap analysis and recommendation engine
- Full brand system polish (Ideal Supply Chain design standards)

## License

Internal pilot — not for external distribution.
