# Topic Page Template

**Phase:** 5.0 — Deliverable 3: Topic Page Template  
**Date:** 2026-05-07  
**Classification:** Product Design  
**Status:** APPROVED — Ready for Implementation  
**Author:** Brian Adams + Design Partner

---

## Purpose

Topic pages are the **core reusable content unit** of Compliance Explorer.

Each topic page should help a senior biopharma supply chain leader quickly understand:

> *"What is this topic, what does supply chain own, what changes based on our operating context, where does the expectation come from, and what should I connect it to next?"*

The page must be useful in two modes:

1. **90-second scan** — enough to participate credibly in a meeting
2. **5-minute read** — enough to understand ownership boundaries, applicability, sources, and handoffs

Topic pages are **not** regulatory database records. They are **not** Q&A pages. They are **not** SOPs. They are **not** workflow pages. They are **not** obligation-control-evidence workbenches.

They are **structured orientation pages**.

---

## 1. Standard Topic Page Structure

Every topic page follows the same five-section structure:

| # | Section | Purpose |
|---|---|---|
| 1 | **What this is** | Plain-language explanation |
| 2 | **What supply chain owns vs. what is adjacent** | Ownership boundaries and handoffs |
| 3 | **How applicability changes it** | Jurisdiction, entity role, lifecycle stage impact |
| 4 | **Where it sits in the regulatory chain** | Source traceability |
| 5 | **What it touches next** | Connected topics and handoffs |

This order does not change from topic to topic. **The consistency is the product.**

---

## 2. Page Header

### Header Elements

Each topic page begins with:

- Topic title
- One-sentence plain-language summary
- Applicability overlay chips
- Primary ownership summary
- Source confidence / source visibility cue
- Section anchors

### Header Wireframe

```
Breadcrumb:
Topics / Packaging

Title:
Packaging

Plain-language summary:
Packaging is the physical system that protects the product, carries required labeling,
supports distribution, and helps preserve product quality through the intended storage
and handling conditions.

Applicability context:
[US + EU] [NDA Holder] [Pre-commercial]

Primary supply chain ownership:
Supply chain typically owns packaging readiness, packaging supplier coordination,
packaging-component availability, and handoffs with Quality, Regulatory, Manufacturing,
and artwork/labeling teams.

Source cue:
Source-backed orientation · FDA / EMA / USP / ICH references available below

Section anchors:
What this is | Ownership boundaries | Applicability | Regulatory chain | What it touches next
```

### Header Design Rules

- Title should be the plain topic name — no "Regulatory Guidance on…" prefix
- Plain-language summary is one sentence, not a paragraph
- Applicability chips reflect the user's current context selection
- Ownership summary is advisory, not prescriptive
- Source cue indicates which regulators/standards are referenced, not a confidence score
- Section anchors provide in-page navigation

---

## 3. Section 1 — What This Is

### Purpose

Explain the topic in plain language that a senior supply chain leader can absorb in 30 seconds.

### Content Structure

| Element | Description |
|---|---|
| **Lead paragraph** | 2–3 sentences explaining what this topic is and why it matters for supply chain |
| **Key terms** | Short glossary of 3–5 terms the reader may not know (inline, not a separate page) |
| **Supply chain relevance** | One sentence connecting this topic to supply chain execution |

### Wireframe

```
Section 1: What this is

Packaging in the pharmaceutical context includes primary packaging (container closure
systems that directly contact the product), secondary packaging (cartons, labels, 
inserts), and tertiary packaging (shippers, pallets). Packaging decisions affect product
stability, patient safety, regulatory compliance, and distribution feasibility.

Key terms:
- Container closure system: the primary package + closure that contacts the drug product
- Child-resistant packaging: packaging meeting CPSC standards under the PPPA
- Serialization-ready packaging: packaging with space and surface for unique identifiers

Why this matters for supply chain:
Packaging readiness is a gating item for commercial launch — if packaging components
are not qualified, approved, and available, the product cannot ship.
```

### Content Rules

- Write for a reader who is smart but may not know this specific regulatory neighborhood
- Do not assume the reader knows acronyms — expand on first use
- Do not write in regulatory-document style — write in executive-briefing style
- Keep the section to 150–250 words

---

## 4. Section 2 — What Supply Chain Owns vs. What Is Adjacent

### Purpose

Clarify ownership boundaries. The most valuable thing this section does is prevent a supply chain leader from being blindsided by a responsibility they didn't know was theirs — or from overstepping into another function's territory.

### Content Structure

| Element | Description |
|---|---|
| **Ownership table** | Three-column table: Supply Chain Owns / Adjacent (Shared) / Other Function Owns |
| **Handoff callouts** | 2–3 specific handoff points where ownership transfers |
| **Common blindspot** | One common misunderstanding about who owns what |

### Wireframe

```
Section 2: What supply chain owns vs. what is adjacent

┌─────────────────────┬──────────────────────┬──────────────────────┐
│ Supply Chain Owns   │ Adjacent / Shared    │ Other Function Owns  │
├─────────────────────┼──────────────────────┼──────────────────────┤
│ Packaging component │ Stability protocol   │ Container closure    │
│ supplier readiness  │ design (with Quality)│ system approval      │
│                     │                      │ (Quality/Regulatory) │
├─────────────────────┼──────────────────────┼──────────────────────┤
│ Packaging line      │ Artwork content      │ Labeling content     │
│ availability and    │ review coordination  │ approval             │
│ scheduling          │                      │ (Regulatory)         │
├─────────────────────┼──────────────────────┼──────────────────────┤
│ Serialization       │ Serialization system │ Serialization        │
│ line readiness      │ validation           │ master data setup    │
│                     │ (with IT/Quality)    │ (IT/Operations)      │
└─────────────────────┴──────────────────────┴──────────────────────┘

Key handoffs:
→ Quality hands off packaging specifications; Supply Chain owns component sourcing
→ Regulatory approves labeling content; Supply Chain owns print-ready artwork production
→ Supply Chain coordinates serialization line readiness; IT owns aggregation hierarchy

Common blindspot:
Supply chain leaders sometimes assume packaging-component qualification is purely a
Quality responsibility. In practice, supply chain owns vendor readiness and lead-time
management for packaging components, which directly affects qualification timelines.
```

### Content Rules

- The table must always have three columns: Owns / Adjacent / Other
- Handoffs should be specific actions, not vague descriptions
- The "common blindspot" must be a real-world mistake, not a generic reminder
- Context-aware: if the user's context is "3PL" or "CDMO Relationship," the ownership table should shift accordingly

---

## 5. Section 3 — How Applicability Changes It

### Purpose

Show how jurisdiction, entity role, and lifecycle stage change the regulatory expectations for this topic.

### Content Structure

| Element | Description |
|---|---|
| **Jurisdiction comparison** | US vs. EU differences for this topic |
| **Entity role impact** | How NDA Holder, MAH, distributor, importer, 3PL, CDMO change what applies |
| **Lifecycle stage impact** | What changes pre-commercial vs. launch vs. post-commercial |
| **Context-specific callout** | Highlighted note based on the user's current context selection |

### Wireframe

```
Section 3: How applicability changes it

Your current context: [US + EU] [NDA Holder] [Pre-commercial]

By jurisdiction:
┌─────────────────────────────┬──────────────────────────────┐
│ US                          │ EU                           │
├─────────────────────────────┼──────────────────────────────┤
│ PPPA child-resistant reqs   │ EU FMD serialization reqs    │
│ FDA container closure       │ EMA Annex 11 / Annex 15      │
│ USP packaging standards     │ EU GDP storage/transport      │
│ DSCSA serialization         │ Country-specific labeling     │
└─────────────────────────────┴──────────────────────────────┘

By entity role:
- NDA Holder: Owns primary packaging decisions and regulatory submissions
- MAH: Owns EU market release and packaging compliance
- Licensed US Distributor: Receives finished packaging; owns storage conditions
- Importer: Responsible for relabeling and country-specific packaging adjustments
- 3PL: Handles tertiary packaging and shipping configuration
- CDMO: Executes packaging per sponsor specifications

By lifecycle stage:
- Pre-commercial: Component qualification, vendor selection, stability packaging
- Launch: First commercial packaging run, serialization go-live, artwork finalization
- Post-commercial: Change control for packaging updates, supplier requalification

⚠ Context highlight:
As a US + EU NDA Holder in pre-commercial stage, your primary packaging focus is
container closure qualification and serialization readiness for both DSCSA and EU FMD.
Dual-market artwork coordination is a common launch delay driver.
```

### Content Rules

- Always show jurisdiction comparison even if differences are minor
- Entity role descriptions should be one sentence each
- Lifecycle descriptions should be one sentence each
- Context highlight should be specific to the user's current selection, not generic
- If context is not set, show a prompt to set context

---

## 6. Section 4 — Where It Sits in the Regulatory Chain

### Purpose

Show the user where this topic's expectations come from — which laws, regulations, standards, and guidance documents shape the work.

### Content Structure

| Element | Description |
|---|---|
| **Source chain visualization** | Compact chain: Law → Regulation → Standard → Guidance |
| **Key sources table** | 3–5 most relevant sources with short descriptions |
| **Source confidence note** | Advisory note about source completeness |

### Wireframe

```
Section 4: Where it sits in the regulatory chain

Source chain:
Law (FD&C Act / EU Directive 2001/83/EC)
  → Regulation (21 CFR 211 / EU GMP Annex 15)
    → Standard (USP <1079> / ICH Q1A)
      → Guidance (FDA Container Closure / EMA Guideline on Packaging)

Key sources:
┌────────────────────────────┬────────────────┬──────────────────────┐
│ Source                     │ Type           │ Relevance            │
├────────────────────────────┼────────────────┼──────────────────────┤
│ 21 CFR 211.94              │ US Regulation  │ Container closure    │
│ USP <1079>                 │ Standard       │ Temp-sensitive pkging│
│ EU GMP Annex 15            │ EU Regulation  │ Qualification        │
│ FDA Guidance (CCS)         │ Guidance       │ Submission guidance  │
│ DSCSA                      │ US Law         │ Serialization        │
└────────────────────────────┴────────────────┴──────────────────────┘

Source confidence note:
This topic references 5 primary sources across US and EU jurisdictions.
View full source details in Sources & Standards.
```

### Content Rules

- Source chain should be 3–4 levels max (Law → Regulation → Standard → Guidance)
- Key sources table should have 3–5 rows, not 15
- Include both US and EU sources when the user's context includes both
- Source confidence note is advisory — never say "complete" or "exhaustive"
- Link to Sources & Standards for full source detail

---

## 7. Section 5 — What It Touches Next

### Purpose

Show the user which related topics, handoffs, and next steps connect to this topic. This is what prevents the user from orienting on packaging in isolation and missing the serialization, labeling, cold chain, or distribution dependencies.

### Content Structure

| Element | Description |
|---|---|
| **Connected topics** | 3–5 related topic pages with one-sentence connection explanation |
| **Ownership handoffs** | 2–3 cross-functional handoffs with role and direction |
| **Next action prompts** | 2–3 "what to ask next" prompts |

### Wireframe

```
Section 5: What it touches next

Connected topics:
→ Serialization — Packaging must support serialization identifiers (DSCSA, EU FMD)
→ Labeling & Artwork — Artwork content is printed on secondary packaging
→ Cold Chain — Primary packaging affects cold chain qualification
→ Distribution & 3PLs — Tertiary packaging must support distribution requirements
→ Child-Resistant / Special Packaging — PPPA requirements affect primary packaging design

Ownership handoffs:
→ Quality → Supply Chain: Packaging specifications handed off for component sourcing
→ Supply Chain → Manufacturing: Qualified packaging components supplied for production
→ Regulatory → Supply Chain: Approved artwork content handed off for print production

What to ask next:
• "Is our container closure system qualified for the intended storage conditions?"
• "Have we confirmed serialization readiness on the packaging line?"
• "Is dual-market artwork coordination on the critical path?"
```

### Content Rules

- Connected topics should link to actual topic pages
- Handoffs should name the sending and receiving function
- "What to ask next" prompts should be real questions a supply chain leader would ask in a meeting
- Do not list more than 5 connected topics — prioritize the most important connections

---

## 8. Applicability Context Behavior

### How Context Affects Topic Pages

When the user has set their operating context (jurisdiction, entity role, lifecycle stage), topic pages should adjust:

| Element | Context Effect |
|---|---|
| **Applicability chips** | Reflect current context |
| **Ownership table** | Shift ownership based on entity role |
| **Jurisdiction comparison** | Highlight the selected jurisdiction |
| **Lifecycle stage** | Emphasize the selected stage |
| **Context highlight** | Show specific callout for the combination |
| **Source chain** | Prioritize sources for the selected jurisdiction |
| **Connected topics** | Adjust relevance based on context |

### Context Not Set

If the user has not set context, show the full (unfiltered) topic page with a gentle prompt:

> *"Set your operating context to see how this topic changes by jurisdiction, entity role, and lifecycle stage."*

---

## 9. Content Quality Standards

### Writing Style

| Principle | Rule |
|---|---|
| **Voice** | Confident, practical, executive-level |
| **Audience** | Smart but may not know this regulatory neighborhood |
| **Acronyms** | Expand on first use in each section |
| **Length** | 90-second scannable; 5-minute readable |
| **Tone** | Briefing, not textbook; advisory, not prescriptive |

### Content Boundaries

| Do | Don't |
|---|---|
| Explain what the topic is | Provide legal advice |
| Show ownership boundaries | Prescribe organizational structure |
| Highlight applicability differences | Claim completeness |
| Link to sources | Reproduce full regulatory text |
| Show connected topics | Create dependency chains |
| Use "typically" and "often" | Use "must" and "shall" |

---

## 10. Topic Page Inventory

The following topic pages will use this template:

| # | Topic | URL | Priority |
|---|---|---|---|
| 1 | Packaging | `/topics/packaging` | High |
| 2 | Labeling & Artwork | `/topics/labeling-artwork` | High |
| 3 | Serialization | `/topics/serialization` | High |
| 4 | Importation / PLAIR | `/topics/importation-plair` | High |
| 5 | Cold Chain | `/topics/cold-chain` | High |
| 6 | Distribution & 3PLs | `/topics/distribution-3pls` | High |
| 7 | Returns | `/topics/returns` | Medium |
| 8 | Recalls | `/topics/recalls` | Medium |
| 9 | Shortages | `/topics/shortages` | Medium |
| 10 | Outsourced Manufacturing | `/topics/outsourced-manufacturing` | Medium |
| 11 | Release & Disposition Handoffs | `/topics/release-disposition-handoffs` | Medium |
| 12 | Child-Resistant / Special Packaging | `/topics/child-resistant-special-packaging` | Low |
| 13 | Controlled Temperature Transport | `/topics/controlled-temperature-transport` | Low |
| 14 | Importer / Distributor Responsibilities | `/topics/importer-distributor-responsibilities` | Low |

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Topic page template created. 5-section structure. Header, ownership table, applicability overlays, source chain, connected topics. Writing standards and content boundaries defined. 14 topic pages inventoried. | System |

---

> **Governance Notice:** This document is a design template only. No code changes are authorized by this document alone. Topic content requires separate authoring per topic, following this template structure. All existing governance controls remain intact.
