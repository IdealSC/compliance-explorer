# Project Control Baseline — Compliance Operating Map

> **Purpose:** This document formalizes system boundaries, governance controls, and scope constraints to prevent unauthorized scope drift. It serves as the "source of truth" for what this system IS and what it must NEVER do without explicit authorization.

---

## System Identity

**Name:** Compliance Operating Map
**Type:** Regulatory compliance governance, traceability, and operational visibility tool
**Architecture:** Next.js 15 + PostgreSQL (Drizzle ORM) + Auth.js v5

**North Star:**
This system provides a governed operating map of regulatory obligations, risks, controls, evidence, and source materials. It enforces controlled publishing, RBAC, audit immutability, version history, and as-of traceability.

---

## Governance Principles

1. **Controlled Publishing Only** — No data becomes active reference without explicit review, approval, versioning, and audit logging.
2. **Metadata-Only Source Files** — Source file records track identity, integrity, and lifecycle state. No file content is stored, parsed, extracted, or analyzed within this application.
3. **RBAC Enforcement** — Every API route enforces role-based access control. No route is publicly accessible.
4. **Audit Immutability** — All write operations produce immutable audit events. Audit records cannot be modified or deleted.
5. **Dual-Mode Safety** — JSON mode is read-only demo. Database mode enables full persistence. Mode switching cannot bypass governance.
6. **Environment Separation** — Demo auth is local-only. OIDC is required for production. Seed/reset is disabled in production by default.
7. **No Secret Leakage** — Server-side credentials must never appear in `NEXT_PUBLIC_*` variables. Predeploy validation enforces this.

---

## Scope Boundaries — What This System Does

| Capability | Status | Notes |
|---|---|---|
| Obligation registry | ✅ Active | Governed lifecycle, version-controlled |
| Risk register | ✅ Active | Linked to obligations and controls |
| Control framework | ✅ Active | Mapped to obligations and evidence |
| Evidence tracking | ✅ Active | Linked to controls |
| Source registry | ✅ Active | Metadata, validation, checklist |
| Source file metadata | ✅ Active (Phase 3.3) | File identity + lifecycle tracking |
| Draft mapping workspace | ✅ Active | Staging before controlled publishing |
| Review & approval workflow | ✅ Active | RBAC-enforced, multi-role |
| Controlled publishing | ✅ Active | Requires approval chain |
| Version history | ✅ Active | Full change tracking |
| As-of traceability | ✅ Active | Point-in-time state reconstruction |
| Audit logging | ✅ Active | Immutable event trail |
| Report snapshots | ✅ Active | Timestamped, metadata-stamped |
| CSV/JSON export | ✅ Active | Governance-disclosed |
| Dashboard metrics | ✅ Active | Real-time operational visibility |
| Demo auth | ✅ Active (dev only) | Local role switcher |
| OIDC SSO | ✅ Active (Phase 3.1) | Auth.js v5, group-to-role mapping |
| CI/CD readiness | ✅ Active (Phase 3.2) | Predeploy validation, GitHub Actions |
| Object storage readiness | ✅ Active (Phase 3.3) | Provider config, no active upload |
| Source intake workflow | ✅ Active (Phase 3.4) | Triage, validation, conversion — metadata-only |
| AI extraction planning | ✅ Complete (Phase 3.5) | Planning-only, no implementation |
| Zod request validation | ✅ Active (Phase 3.6) | Strict schema validation on intake/AI routes |
| AI suggestion governance | ✅ Active (Phase 3.6) | Draft-only AI extraction suggestion records |
| AI prompt version registry | ✅ Active (Phase 3.6) | Controlled prompt versioning, risk levels |
| AI suggestion review workbench | ✅ Active (Phase 3.7) | Human triage, reject, expire, annotate, legal flag |
| AI workbench metrics | ✅ Active (Phase 3.7) | Summary cards, review queue metrics |
| AI citation suggestion generation | ✅ Active (Phase 3.8) | Controlled, citation-only AI provider integration |
| AI provider abstraction | ✅ Active (Phase 3.8) | AzureOpenAI + Noop provider, governed prompt versioning |
| AI secret protection | ✅ Active (Phase 3.8) | No NEXT_PUBLIC AI vars, predeploy/smoke detection |
| AI citation → draft conversion | ✅ Active (Phase 3.9) | Human-controlled, citation-only suggestion to draft change |
| Draft validation workbench | ✅ Active (Phase 3.10) | Advisory pre-review validation for source support, citation accuracy, legal review |
| Validation status integration | ✅ Active (Phase 3.10) | Validation badges on draft mapping and review pages — informational only |

---

## Scope Boundaries — What This System Must NOT Do

> **These constraints are non-negotiable. Any implementation of these features requires explicit authorization, a new phase designation, and an updated PROJECT_CONTROL_BASELINE.**

| Prohibited Scope | Reason |
|---|---|
| **File upload / file storage** | No file binary content flows through or is stored by this application |
| **OCR / text extraction** | No optical character recognition or document text extraction |
| **AI obligation extraction** | No AI-powered obligation, interpretation, or business-function extraction |
| **AI model for non-citation use** | AI provider integration is limited to citation suggestion generation only (Phase 3.8). No other AI use case is authorized |
| **AI suggestion auto-acceptance** | AI suggestions cannot be auto-promoted to draft or active records. Human-controlled citation conversion requires explicit user action (Phase 3.9). No obligation, interpretation, or non-citation conversion is permitted |
| **AI draft auto-approval** | Converted drafts from AI citation suggestions must go through the standard review → approval → publish pipeline. No automatic approval or publication of AI-originated drafts |
| **Automatic citation extraction** | Citation generation requires explicit user action — no background or automated extraction |
| **Automatic obligation creation** | Source files/intakes do not auto-create obligations or draft records |
| **Automatic draft mapping** | No automated mapping from files/intakes to obligations |
| **Intake auto-extraction** | Intake requests do not auto-extract obligations, citations, or metadata from file content |
| **Automatic publishing** | No system-initiated publication without human approval chain |
| **Reference data mutation from files** | File metadata never modifies controlled regulatory reference data |
| **Real-time file ingestion** | No real-time processing pipeline for incoming files |
| **External API integrations** | No calls to third-party regulatory APIs (EDGAR, eCFR, etc.) |
| **Weakening RBAC** | No route may bypass permission checks |
| **Weakening audit immutability** | No audit record may be modified or deleted |
| **Removing JSON fallback** | JSON mode must always function for demo/CI |
| **Removing controlled publishing** | All active data requires approval workflow |
| **Validation auto-approval** | Validation review status ("validated_for_review") does not auto-approve or auto-publish. It is advisory metadata only (Phase 3.10) |
| **AI-invoked validation** | No AI provider is called during validation. All validation assessment is human-driven (Phase 3.10) |

---

## Protected Architecture Components

These components must not be removed, weakened, or bypassed:

| Component | Location | Protection |
|---|---|---|
| RBAC engine | `src/auth/rbac.ts` | Required on all API routes |
| Permission definitions | `src/auth/permissions.ts` | Canonical role/permission map |
| Audit writer | `src/lib/services/audit-writer.ts` | Immutable event creation |
| Controlled publishing | `src/lib/services/*-writes.ts` | Status lifecycle enforcement |
| Intake transition rules | `src/lib/services/intake-writes.ts` | ALLOWED_TRANSITIONS map, server-side |
| Session resolver | `src/auth/session.ts` | `resolveSession()` on all API routes |
| Predeploy validation | `scripts/predeploy.ts` | Secret leak prevention |
| Governance banners | `src/components/governance/*` | User-visible scope disclosures |
| Zod validation schemas | `src/validation/*.ts` | Schema-level field rejection (.strict()) |
| Validation utility | `src/lib/validation.ts` | Centralized request body parsing |
| AI suggestion schema | `src/db/schema/ai-suggestions.ts` | Tier 2D, draft-only governance layer |
| AI suggestion writes | `src/lib/services/ai-suggestion-writes.ts` | reject/expire/mark-review/notes/legal — no accept-to-draft |
| AI suggestion metrics | `src/lib/services/ai-suggestion-reads.ts` | Workbench metrics computation |
| AI workbench drawer | `src/components/ai/AiSuggestionDetailDrawer.tsx` | Detail view with reviewer actions |

---

## Phase History

| Phase | Description | Status |
|---|---|---|
| 1.0–1.9 | Core operating map, dashboard, source registry | ✅ Complete |
| 2.0–2.9 | Persistence, RBAC, audit, controlled publishing, versioning | ✅ Complete |
| 3.0 | Production strategy | ✅ Complete |
| 3.1 | OIDC identity readiness | ✅ Complete |
| 3.2 | CI/CD and deployment readiness | ✅ Complete |
| 3.3 | Object storage and source file metadata | ✅ Complete |
| 3.3.1 | QA fixes and project control baseline | ✅ Complete |
| 3.4 | Controlled source intake workflow | ✅ Complete |
| 3.5 | AI-assisted extraction planning (planning-only) | ✅ Complete |
| 3.6 | Zod validation + AI suggestion data model foundation | ✅ Complete |
| 3.7 | AI suggestion review workbench | ✅ Complete |
| 3.8 | Controlled AI provider integration — citation suggestions only | ✅ Complete |
| 3.9 | Human-controlled AI citation suggestion → draft conversion | ✅ Complete |
| 3.10 | Legal/compliance validation workbench | ✅ Complete |
| 3.11 | End-to-end AI citation governance QA & pilot readiness | ✅ Complete |
| 3.12 | Staging pilot execution + production pilot approval | ✅ Complete |
| 4.0 | Controlled production pilot launch planning | ✅ Complete |
| 5.0 | Design baseline (IA, home page, topic template, applicability overlay, admin separation) | ✅ Complete |
| 5.1 | IA shell, home page, topic template, Packaging, applicability overlay, admin separation | ✅ Complete |
| 5.2-A | Topic content production protocol | ✅ Complete |
| 5.2-B | Serialization topic draft packet (Stage 1) | ✅ Complete |
| 5.2-C | Serialization source-anchored draft packet (Stage 2) | ✅ Complete |
| 5.2-D | Serialization Stage 3 review packet | ✅ Complete |
| 5.2-D1 | Stage 3 decision rubric addendum | ✅ Complete |
| 5.2-D2 | Serialization Stage 3 classification table | ✅ Complete |
| 5.2-D3 | Serialization Stage 3 classification alignment | ✅ Complete |

---

## Drift Watchlist

The following patterns indicate potential scope drift and must be flagged for review before implementation:

| Warning Sign | Category | Response |
|---|---|---|
| Any `FormData` or `multipart` parsing in API routes | File upload | Requires new phase + baseline update |
| Import of `tesseract`, `pdf-parse`, `sharp`, or OCR libraries | OCR | Prohibited without explicit authorization |
| Import of `openai`, `anthropic`, `langchain`, or ML libraries | AI extraction | Prohibited without explicit authorization |
| New database tables that auto-populate from source files | Automatic ingestion | Requires new phase + baseline update |
| Code that reads file content from storage and creates records | Automatic draft creation | Prohibited without explicit authorization |
| Any `status = 'published'` transition without review/approval | Bypassing publishing | Architecture violation |
| API routes without `resolveSession()` wrapper | RBAC bypass | Architecture violation — must be fixed immediately |
| DELETE operations on `auditEvents` or `reportSnapshots` | Audit immutability | Architecture violation — must be fixed immediately |
| `NEXT_PUBLIC_` variables containing secrets or credentials | Secret leakage | Security incident — remove immediately |
| Removal of governance banners or intake warnings | Governance UI erosion | Must be justified and approved |
| Import of `openai`, `anthropic`, `langchain` in service layers | AI model integration | Prohibited until Phase 3.9+ authorization |
| AI suggestion `accepted_to_draft` status transition code | Accept-to-draft automation | Deferred to Phase 3.9 — requires explicit approval |
| Direct writes to aiExtractionSuggestions without audit event | Audit bypass | Architecture violation |

---

## Recommended Next Phases

| Phase | Focus | Prerequisites |
|---|---|---|
| 3.12 | E2E test suite (Playwright/Cypress) | Stable UI surface |
| 3.13 | CSP headers and advanced security hardening | CDN/reverse-proxy configured |
| 3.14 | File upload implementation | Storage provider configured, security review |
| 4.0 | AI scope expansion (obligation extraction, if authorized) | Explicit scope expansion approval, Phase 3.11 complete, pilot results reviewed |

> **Note:** Phases 3.12–3.14 are hardening and infrastructure. Phase 4.0 would represent AI scope expansion beyond citation suggestions, requiring explicit baseline revision and new risk assessment.

---

## Final Recommendation

The Compliance Operating Map is **governance-ready for controlled production pilot** as of Phase 3.12. All core governance controls — controlled publishing, RBAC, audit immutability, version history, as-of traceability, metadata-only source files, controlled source intake, Zod schema validation, AI suggestion governance, AI citation generation, human-controlled citation-to-draft conversion, legal/compliance validation workbench, and full pilot readiness documentation — are implemented and enforced. The E1–E10 staging pilot has been executed with 10/10 scenarios passed, 100/100 audit events verified, and a production pilot approval record formally signed.

**Project status: ✅ CONTROLLED PRODUCTION PILOT WEEK-1 COMPLETE — READY FOR RETROSPECTIVE**

**Production Pilot Approval:** [CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md](CONTROLLED_PRODUCTION_PILOT_APPROVAL_RECORD.md)

**Day-5 Closeout:** [CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md](CONTROLLED_PRODUCTION_PILOT_DAY5_RECORD.md)

---

## Revision History

| Date | Change | Author |
|---|---|---|
| Phase 3.3.1 | Initial baseline document created | System |
| Phase 3.3.1 QA | Added drift watchlist, recommended phases, final recommendation | System |
| Phase 3.4 | Added source intake workflow, updated prohibited scope, updated phase history | System |
| Phase 3.6 | Added Zod validation, AI suggestion governance, prompt versioning, updated drift watchlist and scope tables | System |
| Phase 3.7 | Added review workbench, detail drawer, reviewer actions, metrics API, RBAC expansion, no model integration, accept-to-draft remains blocked | System |
| Phase 3.8 | Added controlled AI provider integration, citation-only generation, feature flags, secret protection | System |
| Phase 3.9 | Added human-controlled AI citation → draft conversion, 8-gate eligibility, provenance stamping, duplicate guard | System |
| Phase 3.10 | Added legal/compliance validation workbench, 5-gate preconditions, advisory badges, RBAC for Legal Reviewer | System |
| Phase 3.11 | End-to-end traceability matrix, pilot readiness checklist, risk register, documentation hardening, button label fix | System |
| Phase 3.12 | E1–E10 staging pilot execution (10/10 PASS), production pilot approval record created, conditional approval closed, release checklist updated | System |
| Phase 4.0 | Controlled production pilot launch plan created (Sections A–S), approval/release/baseline updated with launch references | System |
| Phase 4.1 | Controlled production pilot Week-1 complete (Day-0 through Day-5). Positive lifecycle demonstrated. 12/12 negative tests PASS. Audit 100/100. 0 code changes. 0 blockers. Closeout snapshot SNAP-movzzprb-4shf. Decision: COMPLETE PILOT — READY FOR RETROSPECTIVE. | System |
| Phase 4.2 | Pilot retrospective, stakeholder briefing, and graduation planning complete. Graduation recommendation: GRADUATE WITH CONDITIONS (5 conditions). Post-pilot backlog: 30 items (0 critical, 4 P1). 4 pre-rollout required items. | System |
| Phase 4.3 | Production deployment readiness: OPS-01 (API_FIELD_GUIDE.md) and OPS-02 (ENDPOINT_REFERENCE.md) delivered. Deployment readiness record created. Stakeholder sign-off tracker created. Pre-rollout documentation 2/2 complete. Deployment-time items 2 pending (GOV-02, GOV-03). Predeploy PASS. | System |
| Phase 4.4 | Production deployment execution verification. All automated checks PASS: env vars 14/16 (2 deploy-time), secrets 0/8, audit 100/100, predeploy PASS, OIDC config verified (correct var names AUTH_OIDC_ID/AUTH_OIDC_SECRET confirmed). 10 deployment-day conditions documented. Decision: READY WITH CONDITIONS. | System |
| Phase 4.5 | Deployment day execution. 4th consecutive predeploy PASS. All automated verification passed. 11 activation conditions documented (infrastructure + personnel). 0 code defects. 0 security vulnerabilities. Decision: ACTIVATE WITH CONDITIONS. | System |
| Phase 4.5.1 | Condition closure assessment. 5th consecutive predeploy PASS. 2/11 conditions closed (AC-5 DEMO_AUTH config, AC-6 AUTH_URL config). 9 conditions remain open (all operational: 4 infrastructure, 3 verification, 2 personnel). All development and documentation work complete. Estimated ~45 min technical execution when infrastructure available. | System |
| Phase 4.5.2 | Production hosting deployed to Vercel (compliance-explorer.vercel.app). 6th consecutive predeploy PASS. OIDC login verified end-to-end (Brian Adams, demoUser=false). Demo auth disabled (HTTP 403). Security headers 7/7 verified (HSTS preload, X-Frame-Options DENY, etc.). OIDC client secret rotated. 15/15 env vars set on Vercel production. 9/11 activation conditions CLOSED. 2 personnel conditions remain (stakeholder sign-off, participant onboarding). 0 code changes. Decision: HOSTING VERIFIED WITH CONDITIONS. | System |
| **Phase 4.5.3** | **LIMITED MULTI-USER PILOT ACTIVATED.** Business Sponsor sign-off collected (2/5 minimum met). Second participant (badams@idealsupplychain.com) onboarded and OIDC verified (demoUser=false, viewer role, distinct user ID). 2 distinct OIDC identities operational. Governance briefing confirmed for both participants. ALL 11/11 activation conditions CLOSED. 0 code changes. Decision: **ACTIVATE LIMITED MULTI-USER PILOT.** | System |
| Phase 4.6 | Multi-user pilot operations. Day 1 monitoring: 11/11 checks PASS. Multi-user session completed with both identities. Data consistency verified (13 sources, 110 obligations). RBAC viewer enforcement confirmed. GC-5 (multi-user) satisfied. 3/5 graduation conditions met. 7th consecutive predeploy PASS. 10 user feedback items. 0 code changes. 0 stop conditions. Decision: READY FOR BROADER ROLLOUT ASSESSMENT. | System |
| Phase 4.7 | **ALL GRADUATION CONDITIONS CLOSED.** GC-3 closed: 4/4 sign-offs (Technical Owner, Business Sponsor, Compliance Owner, Legal Reviewer). GC-4 closed: 3/3 publications (PE-movzfjsn-k92c SRC-002, PE-mow5elxv-j7tk SRC-006, PE-mow5frq5-i39y SRC-003). 5/5 GCs met. 8th predeploy PASS. Audit 100/100. 0 code changes. 0 stop conditions. **Decision: READY FOR FULL GRADUATION ASSESSMENT.** | System |
| Phase 4.7A | Product purpose, user value, and positioning assessment. Recommended category: **Regulatory Compliance Governance Platform.** Primary user: compliance editors/analysts at regulated life sciences companies. Core value: "From regulatory source to audit-ready compliance decision — governed, traceable, defensible." 10 user groups assessed. 11 use cases ranked. UI and capability roadmap implications documented. 0 code changes. 0 scope changes. See [PRODUCT_PURPOSE_AND_VALUE_ASSESSMENT.md](PRODUCT_PURPOSE_AND_VALUE_ASSESSMENT.md). | System |
| **Phase 5.0-D1** | **Information Architecture & Navigation specification.** Product repositioned as orientation tool for senior supply chain leaders at late-stage emerging biopharma. 6-item public nav (Start Here, Landscape Map, Topics, What Applies to Us, Ownership by Role, Sources & Standards). 62 public routes. Admin tier separated under `/admin`. Page type system (5 types). Applicability overlay system (jurisdiction × entity role × lifecycle stage). Cut/keep/rename decisions for all existing surfaces. 0 code changes. See [INFORMATION_ARCHITECTURE_AND_NAVIGATION.md](INFORMATION_ARCHITECTURE_AND_NAVIGATION.md). | System |
| Phase 5.0-D2 | Home page concept specification. 7-section page structure replacing dashboard with senior-leader orientation surface: hero, context selector, 6 entry doors, landscape preview, common-question paths, source credibility strip, clean footer. Current vs. new comparison documented. Build order recommended. 0 code changes. See [HOME_PAGE_CONCEPT.md](HOME_PAGE_CONCEPT.md). | System |
| Phase 5.0-D3 | Topic page template specification. 5-section standard structure (what this is / ownership boundaries / applicability / regulatory chain / what it touches next). Header spec with breadcrumb, summary, context chips, ownership summary, source cue, section anchors. Ownership table (3-column: owns / adjacent / other). Applicability context behavior. Source chain visualization. Connected topics with handoffs. Writing standards and content boundaries. 14 topic pages inventoried and prioritized. 0 code changes. See [TOPIC_PAGE_TEMPLATE.md](TOPIC_PAGE_TEMPLATE.md). | System |
| Phase 5.0-D4 | **Packaging topic page** — first worked example of the D3 template. Full 5-section structure: ownership table (6 rows), decision rights, key handoffs (5), jurisdiction comparison (US/EU), 6 entity role profiles (NDA Holder, MAH, Distributor, Importer, 3PL, CDMO), 5 lifecycle stages, regulatory chain visualization (5 levels), 10 key sources, 5 connected topics, 4 ownership handoffs, 5 next-question prompts. 0 code changes. See [TOPIC_PACKAGING.md](TOPIC_PACKAGING.md). | System |
| Phase 5.0-D5 | Applicability overlay UX specification. 3 dimensions (jurisdiction, entity role, lifecycle stage). Persistent context selector below nav. URL query params (not path segments). Content emphasis rules (what changes vs. what never changes). State persistence (client-side, no server). Accessibility requirements. 12 edge cases. Visual design guidance. 0 code changes. See [APPLICABILITY_OVERLAY_UX_SPEC.md](APPLICABILITY_OVERLAY_UX_SPEC.md). | System |
| Phase 5.0-D6 | Editor/Admin separation concept. Two-tier architecture: public orientation (6 routes) + admin workspace (5 categories, ~20 routes). Navigation isolation (no public→admin links). Visual differentiation (7 signals). Route guard spec (OIDC + RBAC). Content publishing model (draft→review→approve→publish). All governance preserved (RBAC, OIDC, audit, SoD, controlled publishing). 0 code changes. See [EDITOR_ADMIN_SEPARATION_CONCEPT.md](EDITOR_ADMIN_SEPARATION_CONCEPT.md). | System |
| **Phase 5.0** | **PHASE COMPLETE — DESIGN BASELINE APPROVED.** 6 deliverables (D1–D6): IA & navigation, home page concept, topic page template, packaging worked example, applicability overlay UX, editor/admin separation. Product identity: regulatory landscape orientation tool for senior biopharma supply chain leaders. Regulatory content rule established: implementation agents must not invent interpretations, add obligations, infer applicability, or expose draft content. All governance preserved. 0 code changes. 0 scope changes. See [PHASE_5_0_DESIGN_BASELINE.md](PHASE_5_0_DESIGN_BASELINE.md). | System |
| **Phase 5.1-A** | **IA shell and route/nav cleanup.** Sidebar replaced with horizontal top-bar navigation (6 public lenses). Home page replaced with orientation landing (hero, 6 entry doors, landscape preview, common questions, source credibility). 5 public route placeholders created (/map, /topics, /applicability, /ownership, /sources replaced). 25 governance/legacy routes moved under /admin/* (Content, Sources, Review, Monitor, Legacy). Admin layout with sidebar restored for admin tier. AdminSidebar.tsx created. Metadata updated to "ISC Compliance Explorer." Build pass. Predeploy pass. No regulatory content changes. No new features. | System |
| Phase 5.1-B | Home page replacement with senior-leader orientation surface. Hero, static operating context, 6 entry doors, landscape preview, common-question paths, source credibility strip. 16/16 links resolve. 3 placeholder routes scaffolded (/map/workstreams, /applicability/lifecycle, /sources/library). 0 regulatory content changes. Commit `d7a25eb`. | System |
| Phase 5.1-C | Reusable topic page template component (`TopicPageLayout`). Dynamic `/topics/[slug]` route. 14 topic placeholder pages with neutral content. Topics index with cards. 0 regulatory content changes. Commit `eb37d77`. | System |
| Phase 5.1-D | Packaging topic page population from approved TOPIC_PACKAGING.md. 5-section structure, ownership table, jurisdiction comparison, entity role profiles, lifecycle stages, regulatory chain, connected topics. Fidelity audit passed. 0 other topic changes. Commit `39739b1`. | System |
| Phase 5.1-E | Applicability context overlay. Operating context selector (jurisdiction, entity role, lifecycle stage). URL query params, localStorage persistence, dynamic header chips, CSS emphasis/de-emphasis, unmapped context fallback. Admin exclusion. 0 regulatory content changes. Commit `ce665e3`. | System |
| Phase 5.1-F | Admin separation fix. Public nav hidden on admin routes via AppShell pathname guard. Context selector already excluded. Visual separation verified. 1 file changed (AppShell.tsx). 0 regulatory content changes. Commit `4fa6f74`. | System |
| **Phase 5.2-A** | **Topic content production protocol.** Created TOPIC_CONTENT_PRODUCTION_PROTOCOL.md defining 7-stage content lifecycle (Stage 0–6), AI-assisted drafting rules, Antigravity implementation constraints, fidelity audit requirements, commit discipline, gap handling, scope creep prevention, and 13-topic queue. 0 code changes. 0 topic content changes. 0 regulatory content changes. Commit `21d4a75`. | System |
| Phase 5.2-B | Serialization topic draft packet (Stage 1). Created TOPIC_SERIALIZATION_DRAFT_PACKET.md with drafting inputs checklist, source inventory placeholder, ownership boundary questions, applicability questions, regulatory chain structure, related topic map, context-sensitive issues, open questions, and draft approval checklist. 0 code changes. 0 topic content populated. 0 regulatory interpretation added. Commit `3e3eae5`. | System |
| Phase 5.2-C | Serialization source-anchored draft packet (Stage 2). Updated TOPIC_SERIALIZATION_DRAFT_PACKET.md with Brian / ISC source notes and interpretation inputs. 17 sources inventoried, 12 supply chain ownership themes, 6 adjacent ownership subsections, US/EU jurisdiction notes, 6 entity role profiles, 5 lifecycle stages, 7 related topics, 7 editorial risk notes, 3 operational risk questions, 12 regulatory/source-landscape gaps, drafting implications mapped. 0 code changes. 0 public topic content changed. 0 regulatory interpretation approved for publication. Commit `6d53c73`. | System |
| Phase 5.2-D | Serialization Stage 3 review packet. Created TOPIC_SERIALIZATION_STAGE_3_REVIEW.md for Brian / ISC line-by-line review decisions. All review decisions defaulted to "Needs Brian / ISC decision." 0 code changes. 0 public topic content changed. 0 regulatory interpretation approved for publication. Commit `7d0c19b`. | System |
| Phase 5.2-D1 | Added Stage 3 decision rubric to Serialization review packet. 5 decision labels, 6-question framework, default classification guidance with examples, conservative decision rule, and review table usage note. No review decisions pre-classified. 0 code changes. 0 public topic content changed. 0 regulatory interpretation approved for publication. Commit `8b26508`. | System |
| Phase 5.2-D2 | Created Serialization_Stage3_Classification.md as the unified Stage 3 classification table using Brian / ISC review guidance. 176 rows classified across 8 sections. 137 Approved, 15 Revise, 10 Keep internal, 10 Source gap, 4 Exclude. 0 code changes. 0 public topic content changed. 0 regulatory interpretation approved for publication. Commit `98edcc1`. | System |
| Phase 5.2-D3 | Aligned the Serialization Stage 3 classification table with Brian / ISC's updated review packet. Counts corrected to 135 Approved, 17 Revise, 10 Keep internal, 10 Source gap, and 4 Exclude across 176 rows. Rows 5.14 (VAWD/NABP DSAC) and 6.7 (EMVO onboarding) reclassified from Approved to Revise. No app code changed. No public topic content changed. No regulatory interpretation was approved for publication. | System |

---

> **To modify this baseline:** Update this document, increment the revision history, and obtain explicit approval before implementing changes that expand scope beyond the boundaries defined above.
