# Information Architecture & Navigation

**Phase:** 5.0 — Deliverable 1: Information Architecture & Navigation  
**Date:** 2026-05-07  
**Classification:** Strategy — Product Design  
**Author:** Brian Adams (Business Sponsor + Product Owner)  
**Status:** APPROVED — Ready for Implementation

---

## Product Direction

The Compliance Explorer is being redesigned as a **focused orientation tool for senior supply chain leaders** at late-stage or emerging biopharma companies managing the transition from clinical development into commercial execution.

### The product should help users answer:

> *"What regulatory landscape am I accountable for as head of supply chain, what does my function own, and where do I need to coordinate with Quality, Regulatory, Manufacturing, Distribution, Legal, or external partners?"*

### The product should NOT feel like:

> *"A compliance governance platform with dashboards, workflows, audit trails, approvals, and risk registers."*

### Design Principle:

The IA organizes around **orientation lenses**, not compliance operations.

---

## 1. Public / Client-Facing Navigation

### Final Top Navigation (6 Items)

| # | Label | URL | Purpose |
|---|---|---|---|
| 1 | **Start Here** | `/` | Senior-leader home page. Orient and route. |
| 2 | **Landscape Map** | `/map` | Visual orientation: how regulated biopharma supply chain work connects to regulatory expectations |
| 3 | **Topics** | `/topics` | 90-second orientation library for regulatory terms, supply chain topics, cross-functional handoffs |
| 4 | **What Applies to Us** | `/applicability` | Understand which requirements are relevant by jurisdiction, entity role, lifecycle stage |
| 5 | **Ownership by Role** | `/ownership` | Clarify what different supply-chain roles own, influence, or coordinate |
| 6 | **Sources & Standards** | `/sources` | Source credibility without feeling like a regulation database |

---

## 2. Public Sitemap

### Start Here (`/`)

| Field | Value |
|---|---|
| **URL** | `/` |
| **Purpose** | New senior-leader home page replacing the current tile-counter dashboard |
| **Primary job** | Orient a head of supply chain moving from clinical development toward commercial execution and route into the right lens |
| **Excludes** | Obligation counters, risk counters, dashboard cards, action center language, audit/governance language |

---

### Landscape Map (`/map`)

| Field | Value |
|---|---|
| **URL** | `/map` |
| **Renamed from** | Operating Map |
| **Purpose** | Main visual orientation surface showing how regulated biopharma supply chain work connects to regulatory expectations |

#### Second-Level Pages

| URL | Label | Type |
|---|---|---|
| `/map` | Full Landscape | Map |
| `/map/phases` | By Supply Chain Phase | Map |
| `/map/phases/plan` | Plan | Map |
| `/map/phases/source` | Source | Map |
| `/map/phases/make` | Make | Map |
| `/map/phases/deliver` | Deliver | Map |
| `/map/workstreams` | By Supply Chain Workstream | Map |
| `/map/workstreams/distribution` | Distribution | Map |
| `/map/workstreams/serialization` | Serialization | Map |
| `/map/workstreams/cold-chain` | Cold Chain | Map |
| `/map/workstreams/3pl-management` | 3PL Management | Map |
| `/map/workstreams/returns-recalls` | Returns & Recalls | Map |
| `/map/workstreams/shortages-supply-continuity` | Shortages & Supply Continuity | Map |

---

### Topics (`/topics`)

| Field | Value |
|---|---|
| **URL** | `/topics` |
| **Purpose** | 90-second orientation library for unfamiliar regulatory terms, supply chain topics, and cross-functional handoffs |
| **Mental model** | A supply chain leader hears a term in a meeting and needs to orient quickly |

#### Second-Level Pages

| URL | Label |
|---|---|
| `/topics` | All Topics |
| `/topics/packaging` | Packaging |
| `/topics/labeling-artwork` | Labeling & Artwork |
| `/topics/serialization` | Serialization |
| `/topics/importation-plair` | Importation / PLAIR |
| `/topics/cold-chain` | Cold Chain |
| `/topics/distribution-3pls` | Distribution & 3PLs |
| `/topics/returns` | Returns |
| `/topics/recalls` | Recalls |
| `/topics/shortages` | Shortages |
| `/topics/outsourced-manufacturing` | Outsourced Manufacturing |
| `/topics/release-disposition-handoffs` | Release & Disposition Handoffs |
| `/topics/child-resistant-special-packaging` | Child-Resistant / Special Packaging |
| `/topics/controlled-temperature-transport` | Controlled Temperature Transport |
| `/topics/importer-distributor-responsibilities` | Importer / Distributor Responsibilities |

#### Topic Page Structure (Every Topic)

Each topic page follows the same five-section structure:

1. **What this is** in plain language
2. **What the supply chain head owns** vs. what is adjacent
3. **How jurisdiction, entity role, and lifecycle stage change it**
4. **Where it sits in the regulatory chain**
5. **What it touches next**

---

### What Applies to Us (`/applicability`)

| Field | Value |
|---|---|
| **URL** | `/applicability` |
| **Renamed from** | Obligation Matrix |
| **Purpose** | Help a senior supply chain leader understand which requirements are relevant based on jurisdiction, entity role, and lifecycle stage |

#### Second-Level Pages

| URL | Label |
|---|---|
| `/applicability` | Applicability Overview |
| `/applicability/matrix` | Requirement Matrix |
| `/applicability/entity-roles` | By Entity Role |
| `/applicability/entity-roles/nda-holder` | NDA Holder |
| `/applicability/entity-roles/mah` | MAH |
| `/applicability/entity-roles/licensed-us-distributor` | Licensed US Distributor |
| `/applicability/entity-roles/importer` | Importer |
| `/applicability/entity-roles/3pl` | 3PL |
| `/applicability/entity-roles/cdmo-relationship` | CDMO Relationship |
| `/applicability/lifecycle` | By Lifecycle Stage |
| `/applicability/lifecycle/preclinical` | Preclinical |
| `/applicability/lifecycle/late-stage-clinical` | Late-stage Clinical |
| `/applicability/lifecycle/pre-commercial` | Pre-commercial |
| `/applicability/lifecycle/launch` | Launch |
| `/applicability/lifecycle/post-commercial` | Post-commercial |

---

### Ownership by Role (`/ownership`)

| Field | Value |
|---|---|
| **URL** | `/ownership` |
| **Renamed from** | By Business Function |
| **Purpose** | Clarify what different supply-chain roles own, influence, or need to coordinate |

#### Second-Level Pages

| URL | Label |
|---|---|
| `/ownership` | Ownership Overview |
| `/ownership/head-of-supply-chain` | Head of Supply Chain |
| `/ownership/supply-planning` | Supply Planning |
| `/ownership/package-engineering` | Package Engineering |
| `/ownership/serialization-owner` | Serialization Owner |
| `/ownership/3pl-relationship-manager` | 3PL Relationship Manager |
| `/ownership/distribution-lead` | Distribution Lead |
| `/ownership/cold-chain-logistics-lead` | Cold Chain / Logistics Lead |
| `/ownership/outsourced-manufacturing-technical-lead` | Outsourced Manufacturing Technical Lead |
| `/ownership/quality-interface` | Quality Interface |
| `/ownership/regulatory-interface` | Regulatory Interface |

---

### Sources & Standards (`/sources`)

| Field | Value |
|---|---|
| **URL** | `/sources` |
| **Combines/Renames** | Regulatory Chain + Standards Crosswalk + Source Registry |
| **Purpose** | Keep source credibility visible without making the product feel like a regulation database |

#### Second-Level Pages

| URL | Label |
|---|---|
| `/sources` | Sources Overview |
| `/sources/chain` | Source-to-Ownership Chain |
| `/sources/standards` | Standards Connections |
| `/sources/library` | Source Library |
| `/sources/regulators` | Regulators |
| `/sources/source-types` | Source Types |

---

## 3. Applicability Overlays

The three applicability dimensions behave as **persistent context filters** across the public experience — not additional navigation sections.

### Overlay Dimensions

| Dimension | Options |
|---|---|
| **Jurisdiction** | US · EU · US + EU |
| **Entity Role** | NDA Holder · MAH · Licensed US Distributor · Importer · 3PL · CDMO Relationship |
| **Lifecycle Stage** | Preclinical · Late-stage Clinical · Pre-commercial · Launch · Post-commercial |

### URL Behavior

| Type | Example |
|---|---|
| Canonical (clean) | `/topics/packaging` |
| Contextualized | `/topics/packaging?jurisdiction=us&entityRole=nda-holder&stage=pre-commercial` |
| Contextualized | `/topics/packaging?jurisdiction=eu&entityRole=mah&stage=launch` |

### UX Principle

The clean URL remains the canonical page. The selected context changes:
- Applicability notes
- Emphasis
- Warnings
- Ownership boundaries
- Related handoffs
- Relevant source highlights

The selected context does **not** create a separate page for every combination.

---

## 4. Public Header

### Structure

```
ISC Compliance Explorer

Start Here | Landscape Map | Topics | What Applies to Us | Ownership by Role | Sources & Standards

Context: [US + EU] [NDA Holder] [Pre-commercial]
```

### Microcopy

> *"Set context to highlight what changes by jurisdiction, entity role, and lifecycle stage."*

### Header Rules

- Keep context selector visible but not dominant
- Do not make the header feel like a dashboard control bar
- Avoid admin language: validation, approval, workflow, review, audit, governance

---

## 5. Editor / Admin Navigation

The admin tier is **clearly separated** from the public experience.

### Admin Entry

| Field | Value |
|---|---|
| **URL** | `/admin` |
| **Public visibility** | Not shown in public navigation |
| **Label** | Editor Workspace |
| **Purpose** | Governance, source management, review, validation, monitoring, and legacy surfaces |

### Admin Sitemap

| URL | Label | Category |
|---|---|---|
| `/admin` | Editor Workspace | — |
| `/admin/content` | Content | **Content** |
| — | Topic Drafts | Content |
| — | Requirement Records | Content |
| — | Source Records | Content |
| — | Workstream Mapping | Content |
| — | Applicability Mapping | Content |
| `/admin/sources` | Sources | **Sources** |
| — | Source Intake | Sources |
| — | Source Registry Admin | Sources |
| — | Source Validation | Sources |
| — | As-Of Trace | Sources |
| `/admin/review` | Review | **Review** |
| — | Review Queue | Review |
| — | Approval Status | Review |
| — | Validation Workbench | Review |
| `/admin/monitor` | Monitor | **Monitor** |
| — | Regulatory Updates | Monitor |
| — | Data Quality Checks | Monitor |
| — | Version History | Monitor |
| — | Audit Log | Monitor |
| `/admin/legacy` | Legacy | **Legacy** |
| — | Legacy Reference | Legacy |

### Admin Header

```
ISC Compliance Explorer Admin

Content | Sources | Review | Monitor | Legacy
```

### Admin Visual Rules

- Always show "Admin" in the header
- Use a visually distinct admin treatment
- Keep admin pages more compact and operational
- Do not use public-facing hero copy inside admin
- Keep all admin routes under `/admin`

---

## 6. Cut / Keep / Rename Decisions

### Keep on Public Surface (Renamed)

| Current | New Location | New Label | Rationale |
|---|---|---|---|
| Operating Map | `/map` | Landscape Map | Core orientation surface; renamed away from "operating system" language |
| Obligation Matrix | `/applicability/matrix` | Requirement Matrix | Still useful, framed under "What Applies to Us" |
| Regulatory Chain | `/sources/chain` | Source-to-Ownership Chain | Keeps traceability; makes business relevance explicit |
| Standards Crosswalk | `/sources/standards` | Standards Connections | Softer, more understandable label |
| Source Registry | `/sources/library` | Source Library | Keeps credibility without feeling like an internal database |
| By Business Function | `/ownership` | Ownership by Role | More direct and leader-relevant |
| SCOR Phase Views | `/map/phases` | By Supply Chain Phase | Keeps Plan/Source/Make/Deliver; avoids SCOR as first hurdle |
| Supply Chain View | `/topics` + `/map/workstreams` | Topics / Supply Chain Workstreams | Splits fast topic lookup from map-based exploration |

### Move to Admin Only

| Current | New Location | Rationale |
|---|---|---|
| Draft Workspace | `/admin/content` | Editor-only content creation |
| Source Intake | `/admin/sources` | Internal source management |
| Validation Workbench | `/admin/review` | Internal quality control |
| Review & Approval | `/admin/review` | Governance workflow, not client orientation |
| As-Of Trace | `/admin/sources` | Editorial traceability, not public navigation |
| Audit Log | `/admin/monitor` | Internal control surface |
| Version History | `/admin/monitor` | Internal editorial history |
| Data Quality & Validation | `/admin/monitor` | Internal maintenance |
| Regulatory Updates | `/admin/monitor` | Monitoring function, not orientation |

### Cut from Public Surface

| Current | Decision | Rationale |
|---|---|---|
| Executive Dashboard | Remove | Signals enterprise compliance platform; wrong mental model |
| Action Center | Remove | Implies workflow and task management; out of scope |
| Launch-Critical | Absorb into Home + Topics | Useful concept but should not be another dashboard lens |
| All Requirements | Absorb into Requirement Matrix | Too database-like as a primary nav item |
| Risk Register | Remove from public | Engagement-posture / governance artifact |
| Impact Analysis | Remove from public | Too consultative or workflow-oriented |
| Reports & Audit Snapshots | Remove from public | Signals audit/governance platform |
| Legacy Reference | Admin only or retire | Not client-facing |

---

## 7. Page Type System

The public app uses a small number of reusable page types:

| Type | Used For | Purpose |
|---|---|---|
| **A. Orientation Page** | Home, Applicability Overview, Ownership Overview, Sources Overview | Explain the lens and route the user |
| **B. Map Page** | Landscape Map, Supply Chain Phase views, Workstream views | Show how topics and responsibilities connect |
| **C. Topic Page** | Packaging, Serialization, Cold Chain, Returns, etc. | 90-second orientation + 5-minute deeper read |
| **D. Matrix Page** | Requirement Matrix, Applicability views | Scan what applies by jurisdiction, role, lifecycle, workstream |
| **E. Source Page** | Source-to-Ownership Chain, Standards Connections, Source Library | Provide credibility and traceability |

---

## 8. URL Naming Rules

### Use plain English, not internal compliance language.

**Preferred:**
```
/topics/packaging
/ownership/serialization-owner
/applicability/entity-roles/nda-holder
/sources/standards
```

**Avoid on public surface:**
```
/obligations
/controls
/evidence
/governance
/audit
/validation
/regulatory-updates
/action-center
```

**Exception:** Admin routes (`/admin/*`) may use operational language because they are not client-facing.

---

## 9. Complete Public Route Count

| Section | Routes |
|---|---|
| Start Here | 1 |
| Landscape Map | 13 |
| Topics | 15 |
| What Applies to Us | 16 |
| Ownership by Role | 11 |
| Sources & Standards | 6 |
| **Total Public Routes** | **62** |

| Section | Routes |
|---|---|
| Admin | ~20 |
| **Total All Routes** | **~82** |

---

## 10. Final IA Mental Model

### Public Product

> *"Explore the regulatory landscape for biopharma supply chain execution by topic, supply-chain phase, ownership role, and applicability context — with sources available when needed."*

### Editor / Admin Tier

> *"Maintain the underlying sources, mappings, validation, and version history privately."*

This preserves the existing governance assets while removing the platform signals that made the app feel too large, too internal, and too governance-heavy.

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Information architecture and navigation specification created. 6-item public nav, 62 public routes, admin separation, page type system, applicability overlays, cut/keep/rename decisions. | System |
| 2026-05-07 | **Revised:** Removed explicit launch framing per D2 revision. "By Launch Workstream" → "By Supply Chain Workstream." Language aligned with clinical-to-commercial transition positioning. | System |

---

> **Governance Notice:** This document defines the information architecture only. No code changes are authorized by this document alone. Implementation requires a separate phase with route-by-route build plan. All existing governance controls (RBAC, audit trail, controlled publishing, SoD) remain intact and are preserved in the admin tier.
