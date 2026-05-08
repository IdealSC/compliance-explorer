# Home Page Concept

**Phase:** 5.0 — Deliverable 2: Home Page Concept  
**Date:** 2026-05-07  
**Classification:** Product Design  
**Status:** APPROVED — Ready for Implementation  
**Author:** Brian Adams + Design Partner

---

## Purpose

Replace the current dashboard-style home page with a senior-leader orientation surface.

The new home page should help a senior supply chain leader at a late-stage or emerging biopharma company quickly understand:

> *"What regulatory landscape surrounds my supply chain responsibilities, where should I start, and which lens helps me orient fastest?"*

This page is **not** a dashboard. It is **not** a compliance scorecard. It is **not** a task queue. It is **not** a governance control center. It is the **front door** into the regulatory landscape surrounding biopharma supply chain execution.

---

## 1. Design Principle

The home page should feel like a **guided executive briefing**, not a software dashboard.

### User Mindset

The user is likely thinking:

- "We are moving from clinical development toward commercial execution."
- "I am accountable for supply chain execution."
- "Quality, Regulatory, Manufacturing, and Distribution all own pieces of this."
- "I need to know enough to lead the conversation and avoid blind spots."
- "I do not need a regulatory database or chatbot."

### Page Job

Orient the user in under 5 minutes.

### Primary Action

Route the user into the right orientation lens.

### Do NOT Include

- Obligation counters
- Risk counters
- Dashboard metrics
- Audit snapshots
- Action center cards
- Task lists
- Governance status
- Approval status
- Compliance health scores
- Regulatory update feeds
- AI assistant prompts
- Chatbot entry points

---

## 2. Page Structure

| # | Section | Purpose |
|---|---|---|
| 1 | Hero orientation | Headline, subheadline, primary CTA |
| 2 | Context selector | Jurisdiction × entity role × lifecycle stage |
| 3 | Six entry doors | Route user into the right lens |
| 4 | Landscape preview | What the regulated supply chain touches |
| 5 | Common paths | "I need to understand…" question cards |
| 6 | Source credibility strip | Trust signal without database feel |
| 7 | Footer / admin separation | Clean public footer, no admin links |

---

## 3. Section Specifications

### Section 1: Header

```
ISC Compliance Explorer

Start Here | Landscape Map | Topics | What Applies to Us | Ownership by Role | Sources & Standards

Context: [US + EU] [NDA Holder] [Pre-commercial]
```

**Microcopy:** *"Set context to highlight what changes by jurisdiction, entity role, and lifecycle stage."*

---

### Section 2: Hero Orientation

| Element | Content |
|---|---|
| **Headline** | The regulatory landscape for biopharma supply chain execution. |
| **Subheadline** | A focused orientation tool for supply chain leaders moving from clinical development toward commercial execution. Understand what your function is accountable for, where ownership crosses into Quality, Regulatory, Manufacturing, Distribution, Legal, and partners, and which sources shape the work. |
| **Primary CTA** | Start with the Landscape Map |
| **Secondary CTA** | Browse Topics |
| **Tertiary link** | See What Applies to Us |

**Tone:** Confident, practical, executive-level. Avoid marketing exaggeration.

---

### Section 3: Context Selector

| Element | Content |
|---|---|
| **Section label** | Set your operating context |
| **Selectors** | Jurisdiction: `[US + EU]` · Entity Role: `[NDA Holder]` · Lifecycle Stage: `[Pre-commercial]` |
| **Supporting copy** | Your context changes which requirements are emphasized, who owns the work, and which handoffs matter most. You can change this anytime. |

---

### Section 4: Six Entry Doors

**Section headline:** *Choose the lens that matches the question in front of you.*

#### Door 1: Landscape Map

| Field | Value |
|---|---|
| **Description** | See how supply chain work connects across Plan, Source, Make, and Deliver. |
| **Best for** | "I need the big picture." |
| **CTA** | Open Landscape Map |
| **Route** | `/map` |

#### Door 2: Topics

| Field | Value |
|---|---|
| **Description** | Look up a regulatory topic quickly and understand what it means for supply chain. |
| **Best for** | "A term came up in a meeting and I need to orient fast." |
| **CTA** | Browse Topics |
| **Route** | `/topics` |

#### Door 3: What Applies to Us

| Field | Value |
|---|---|
| **Description** | Filter requirements by jurisdiction, entity role, and lifecycle stage. |
| **Best for** | "What changes because of our role, market, or lifecycle stage?" |
| **CTA** | Check Applicability |
| **Route** | `/applicability` |

#### Door 4: Ownership by Role

| Field | Value |
|---|---|
| **Description** | Clarify what supply chain owns directly and where other functions or partners own adjacent responsibilities. |
| **Best for** | "Who owns this, and where is the handoff?" |
| **CTA** | View Ownership |
| **Route** | `/ownership` |

#### Door 5: Sources & Standards

| Field | Value |
|---|---|
| **Description** | Trace topics back to the regulators, standards, and source materials behind them. |
| **Best for** | "Where does this expectation come from?" |
| **CTA** | View Sources |
| **Route** | `/sources` |

#### Door 6: Supply Chain Workstreams

| Field | Value |
|---|---|
| **Description** | Orient by practical supply chain workstream: packaging, serialization, cold chain, distribution, returns, recalls, shortages, and outsourced manufacturing. |
| **Best for** | "What regulatory neighborhoods surround this workstream?" |
| **CTA** | Explore Workstreams |
| **Route** | `/map/workstreams` |

---

### Section 5: Landscape Preview

**Headline:** *What the regulated supply chain touches*

**Intro:** Biopharma supply chain execution sits inside multiple regulatory neighborhoods. This map gives you a practical way to see the terrain without turning the product into a compliance database.

#### Preview Layout

| Phase | Topics |
|---|---|
| **Plan** | Supply planning · Shortages and supply continuity · Commercial readiness handoffs |
| **Source** | Supplier qualification touchpoints · CDMO and 3PL relationships · Importer and distributor role clarity |
| **Make** | Packaging · Labeling and artwork · Serialization · Release and disposition handoffs |
| **Deliver** | Distribution · Cold chain · Returns · Recalls · Controlled temperature transport |

**CTA:** View Full Landscape Map → `/map`

---

### Section 6: Common Paths

**Headline:** *Common questions this tool helps answer*

| # | Question | Route |
|---|---|---|
| 1 | "What does supply chain actually own here?" | Ownership by Role (`/ownership`) |
| 2 | "Does this apply in the US, EU, or both?" | What Applies to Us (`/applicability`) |
| 3 | "What changes before and after commercial approval?" | Lifecycle Applicability (`/applicability/lifecycle`) |
| 4 | "What is the source behind this expectation?" | Sources & Standards (`/sources`) |
| 5 | "What related topics should I understand next?" | Topics (`/topics`) |

---

### Section 7: Source Credibility Strip

**Headline:** *Source-backed, but built for orientation.*

**Body:** Compliance Explorer connects topics to relevant regulators, standards, and source materials. Sources are visible when needed, but the primary experience is designed for fast orientation and cross-functional supply chain leadership.

**Example source categories:** FDA · EMA · European Commission · USP · ICH · GDP / GMP references · Product and distribution standards

**CTA:** View Source Library → `/sources/library`

---

### Section 8: Footer

**Footer links:** Start Here · Landscape Map · Topics · What Applies to Us · Ownership by Role · Sources & Standards

**Admin link:** Not shown in public footer. Admin remains available only through direct protected route: `/admin`

---

## 4. Current vs. New Comparison

| Dimension | Current Home Page | New Home Page |
|---|---|---|
| **Mental model** | Software dashboard with counters | Executive briefing with entry doors |
| **First impression** | "110 obligations · 12 functions · 71 risks" | "The regulatory landscape for biopharma supply chain execution" |
| **Primary action** | Click a tile with a number | Choose the lens that matches your question |
| **Content** | Obligation counts, risk counts, SCOR phases, health metrics | Hero, context selector, 6 doors, landscape preview, question cards |
| **Language** | Obligations, controls, evidence, gaps, data quality | Topics, ownership, applicability, sources, workstreams |
| **Audience signal** | Compliance analyst / system admin | Head of supply chain / senior leader |
| **Admin presence** | Mixed with public content | Completely hidden |

---

## 5. Acceptance Criteria

The home page is acceptable when:

- It no longer resembles a dashboard
- It does not show obligation, risk, audit, or governance counters
- It clearly addresses senior biopharma supply chain leaders
- It supports the clinical-to-commercial transition without making "launch" the dominant product frame
- It routes users into the six approved public lenses
- It includes a visible but lightweight context selector
- It explains the product in plain senior-leader language
- It provides source credibility without turning the home page into a source database
- It can be scanned in under 90 seconds
- It preserves the narrowed scope and does not introduce new features

---

## 6. Implementation Notes

### What This Replaces

The current `src/app/page.tsx` home page with:
- `PageHeader` ("Compliance Operating Map")
- `OperatingMapFlow` (obligation → phase → function → risk chain)
- `QuickViewGrid` (12 dashboard tiles with counts)
- `HealthSnapshot` (critical severity, needs review, launch-critical, open gaps)
- Footer ("Pilot v1.0 · Content from source workbook · Not legal advice")

### What This Preserves

- All underlying data and API routes remain intact
- All governance controls preserved in admin tier
- RBAC, audit trail, controlled publishing unchanged
- No data model changes required

### Build Order Recommendation

1. Header + nav component (shared across all public pages)
2. Context selector component (shared state)
3. Hero section
4. Entry doors grid
5. Landscape preview
6. Common paths cards
7. Source credibility strip
8. Footer

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Home page concept created. 7-section page structure. 6 entry doors. Context selector. Landscape preview. Common paths. Source credibility strip. Current vs. new comparison. | System |
| 2026-05-07 | **Revised:** Removed explicit "first commercial launch" framing. Product repositioned around clinical-to-commercial transition. Global language replacements applied. "Launch Workstreams" → "Supply Chain Workstreams." Context selector label → "Set your operating context." Acceptance criteria added. | System |

---

> **Governance Notice:** This document is a design specification only. No code changes are authorized by this document alone. Implementation requires a separate build phase. All existing governance controls remain intact.
