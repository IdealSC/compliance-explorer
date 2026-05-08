# Topic Content Production Protocol — ISC Compliance Explorer

> **Purpose:** This document defines the controlled process for populating topic pages in the Compliance Explorer. It prevents implementation agents, AI tools, or template scaffolds from inventing regulatory content. Each topic must move through a controlled content lifecycle before implementation.
>
> **Authority of record:** Brian / ISC owns the regulatory interpretation. AI may assist the editorial process but is not the authority of record.

---

## Governing Documents

| Document | Purpose |
|---|---|
| [TOPIC_PAGE_TEMPLATE.md](TOPIC_PAGE_TEMPLATE.md) | Standard topic page structure (5 user-facing sections) |
| [TOPIC_PACKAGING.md](TOPIC_PACKAGING.md) | Reference implementation (first worked example) |
| [INFORMATION_ARCHITECTURE_AND_NAVIGATION.md](INFORMATION_ARCHITECTURE_AND_NAVIGATION.md) | Canonical sitemap and navigation structure |
| [APPLICABILITY_OVERLAY_UX_SPEC.md](APPLICABILITY_OVERLAY_UX_SPEC.md) | Context overlay behavior rules |
| [EDITOR_ADMIN_SEPARATION_CONCEPT.md](EDITOR_ADMIN_SEPARATION_CONCEPT.md) | Public/admin tier separation |
| [PROJECT_CONTROL_BASELINE.md](PROJECT_CONTROL_BASELINE.md) | Scope boundaries and governance controls |
| [PHASE_5_0_DESIGN_BASELINE.md](PHASE_5_0_DESIGN_BASELINE.md) | Approved Phase 5.0 design baseline |

---

## Content Lifecycle

Every topic page must progress through six controlled stages. No stage may be skipped.

---

### Stage 0 — Topic Candidate

Topic exists as a placeholder route only.

**Allowed:**

- Route label
- Placeholder template
- Approved IA label

**Not allowed:**

- Regulatory interpretation
- Source references
- Applicability claims
- Ownership claims

**Current state:** All 13 remaining topics are at Stage 0.

---

### Stage 1 — Draft Content

Draft topic content may be prepared outside the public app.

**Allowed:**

- Brian-authored notes
- Source excerpts or source IDs
- Draft ownership boundaries
- Draft applicability notes
- Draft related-topic hypotheses

**Not allowed in public:**

- Draft regulatory interpretations
- Unverified citations
- Unapproved applicability notes

**Output:** Working draft notes (not yet source-anchored).

---

### Stage 2 — Source-Anchored Draft

The topic draft must include all required sections with source anchoring.

**Required content:**

- Source list
- Source relevance notes
- Ownership boundaries
- Jurisdiction notes
- Entity role notes
- Lifecycle notes
- Related topics
- Common pitfalls
- What-to-ask-next prompts

**Source reference status markers:**

Every source reference must be marked with one of:

| Marker | Meaning |
|---|---|
| ✅ Verified | Source confirmed, content accurate |
| ⚠️ Draft reference — verify before publication | Source identified but not yet fully verified |
| ❌ Source gap — editor review needed | No confirmed source; content requires editorial review |

**Output:** TOPIC_[TOPIC_NAME].md draft file with source anchoring.

---

### Stage 3 — Brian / ISC Review

Brian reviews the source-anchored draft for:

- Regulatory interpretation accuracy
- Source accuracy and sufficiency
- Applicability claims
- Ownership boundaries
- Tone and writing quality
- Scope appropriateness
- Public suitability

**Gate:** No topic moves to Stage 4 without explicit approval from Brian.

**Output:** Approved TOPIC_[TOPIC_NAME].md file.

---

### Stage 4 — Implementation Candidate

Antigravity may implement only from an approved topic markdown file.

**Required approved file pattern:**

```
TOPIC_[TOPIC_NAME].md
```

**Examples:**

- `TOPIC_PACKAGING.md`
- `TOPIC_SERIALIZATION.md`
- `TOPIC_COLD_CHAIN.md`

**Implementation agent constraints:**

The implementation agent must not:

- Rewrite wording
- Add sources
- Add citations
- Add obligations
- Infer applicability
- Fill content gaps
- Improve regulatory meaning
- Add topic sections not in the approved file
- Add relationship explanations not in the approved file
- Add source relevance notes not in the approved file
- Add applicability notes not in the approved file
- Populate additional topics beyond the approved scope

**Structure mismatch rule:** If approved content does not fit the current component structure, Antigravity must report the mapping issue before changing the structure. Do not silently adapt content to fit components.

**Output:** Implemented topic route matching the approved markdown file.

---

### Stage 5 — Fidelity Audit

After implementation and before commit, Antigravity must compare:

**Approved topic markdown file** vs. **Implemented topic route**

**Audit must report:**

| Check | Description |
|---|---|
| Omitted text | Any approved text not present in implementation |
| Shortened text | Any approved text that was condensed |
| Reworded text | Any approved text that was rephrased |
| Moved text | Any approved text placed in a different section |
| Added text | Any text present in implementation but not in approved file |
| Source differences | Any source reference that differs from approved file |
| Applicability differences | Any applicability note that differs from approved file |
| Ownership differences | Any ownership claim that differs from approved file |

**Gate:** No commit until Brian explicitly approves the fidelity audit result.

**Output:** Fidelity audit report.

---

### Stage 6 — Commit and Closure

Commit only after explicit approval.

**Completion record must include:**

- Commit hash
- Topic route
- Approved source document filename
- Fidelity audit result (pass/fail + details)
- Build status (page count, exit code)
- Regulatory safety confirmation (no src/data changes)
- Other topic route safety confirmation (no changes to other topics)

---

## AI-Assisted Drafting Rules

### AI may assist with:

- Structuring drafts (applying the topic template to Brian's notes)
- Rewriting for tone after Brian review
- Checking consistency against the topic template
- Flagging missing sections
- Identifying source gaps for editor review
- Creating implementation scaffolds from approved content

### AI must not:

- Interpret laws independently
- Invent regulatory obligations
- Add citations not provided by Brian
- Decide applicability without Brian's input
- Generate public topic content from scratch
- Convert source text into final interpretation without Brian review
- Publish or commit content

### Required attribution language:

> Brian / ISC owns the regulatory interpretation. AI may assist the editorial process but is not the authority of record.

---

## Antigravity Implementation Rules

### Antigravity may implement:

- Approved markdown content (verbatim)
- Approved layout changes
- Approved route/component changes
- Formatting required to fit the approved topic template

### Antigravity must not:

- Improve regulatory wording
- Add citations
- Add topic sections
- Add relationship explanations
- Add source relevance notes
- Add applicability notes
- Populate additional topics
- Commit without explicit approval

### Structural discrepancy handling:

If approved content does not fit the current component structure:

1. Stop implementation
2. Report the specific mapping issue
3. Wait for Brian's decision on structure vs. content adaptation
4. Do not silently adapt content or structure

---

## Public/Admin Separation Rules

All topic content is public-facing. The following rules apply:

| Rule | Description |
|---|---|
| No admin links | Topic pages must not link to admin routes |
| No governance language | No "audit," "approval," "review queue," "draft status" on public pages |
| No draft content | Draft or unreviewed content must not appear on public pages |
| No admin badges | No admin UI elements on public pages |
| No editor tools | No edit/approve/reject actions on public pages |
| Context selector only | Public pages show the operating context selector, not admin controls |
| Placeholder safety | Placeholder topics display neutral orientation messaging only |

---

## Handling Missing or Ambiguous Content

When a topic has content gaps or ambiguity, the following rules apply:

### Allowed public-safe message:

> **Context-specific note requires editor review.**
>
> This topic has not yet been fully mapped for the selected operating context. The general topic orientation remains visible, but context-specific ownership, source emphasis, or applicability notes require editor review before publication.

### Prohibited language:

| Prohibited | Reason |
|---|---|
| Generated assumptions | Not source-anchored |
| Legal determinations | Not authorized |
| "Required / not required" | Regulatory determination |
| "Compliant / non-compliant" | Compliance judgment |
| "Pass / fail" | Assessment language |
| "Audit ready" | Compliance status claim |

---

## Commit Discipline

### Pre-commit rule:

Antigravity must stop after verification and wait for explicit approval before committing or pushing.

### Required pre-commit approval phrase:

```
Approved to commit and push.
```

Without that phrase, do not commit.

### Pre-commit confirmation checklist:

Before committing any topic implementation, confirm:

1. Only intended files are staged
2. No `src/data/*` files are staged
3. No admin/auth/data model changes are staged
4. Build passes (page count, exit code)
5. Other public routes remain unchanged
6. Other topic routes remain unchanged
7. Admin routes remain unchanged
8. Fidelity audit completed and approved

---

## Required Topic File Template

Each topic content file must follow this structure:

```markdown
# TOPIC_[TOPIC_NAME].md

## Topic Header

- Topic name
- One-line summary
- Primary jurisdiction(s)
- Primary entity roles
- Lifecycle relevance
- Source count

## Section 1 — What This Is

[90-second scan paragraph]

[5-minute read detail]

## Section 2 — Ownership Boundaries

[Ownership table: Who Owns / Adjacent / Other]
[Decision rights]
[Key handoffs]

## Section 3 — Applicability

[Jurisdiction comparison]
[Entity role profiles]
[Lifecycle stage notes]

## Section 4 — Regulatory Chain

[Source chain visualization data]
[Key sources with relevance notes]

## Section 5 — What It Touches Next

[Connected topics with handoff descriptions]
[Ownership handoffs]
[What-to-ask-next prompts]

## Context-Specific Display Notes

[Optional: applicability overlay emphasis data]
[Optional: context-specific callout content]

## 90-Second Scan Version

[Abbreviated content for quick orientation]

## Implementation Notes

[Component mapping notes]
[Any structural considerations]
[Data attribute requirements for applicability overlay]

## Acceptance Criteria

[Specific criteria for fidelity audit]
[Expected section count]
[Expected source count]
[Expected related topic count]
```

### Five user-facing sections (non-negotiable):

1. What this is
2. Ownership boundaries
3. Applicability
4. Regulatory chain
5. What it touches next

---

## Remaining Topic Queue

The following topics are currently at **Stage 0 — Topic Candidate** (placeholder route only):

| # | Topic | Route | Stage |
|---|---|---|---|
| 1 | Labeling & Artwork | `/topics/labeling-artwork` | 0 — Placeholder |
| 2 | Serialization | `/topics/serialization` | 0 — Placeholder |
| 3 | Importation / PLAIR | `/topics/importation` | 0 — Placeholder |
| 4 | Cold Chain | `/topics/cold-chain` | 0 — Placeholder |
| 5 | Distribution & 3PLs | `/topics/distribution` | 0 — Placeholder |
| 6 | Returns | `/topics/returns` | 0 — Placeholder |
| 7 | Recalls | `/topics/recalls` | 0 — Placeholder |
| 8 | Shortages | `/topics/shortages` | 0 — Placeholder |
| 9 | Outsourced Manufacturing | `/topics/outsourced-manufacturing` | 0 — Placeholder |
| 10 | Release & Disposition Handoffs | `/topics/release-disposition` | 0 — Placeholder |
| 11 | Child-Resistant / Special Packaging | `/topics/child-resistant-packaging` | 0 — Placeholder |
| 12 | Controlled Temperature Transport | `/topics/controlled-temperature` | 0 — Placeholder |
| 13 | Importer / Distributor Responsibilities | `/topics/importer-distributor` | 0 — Placeholder |

**Reference implementation (Stage 6 — Complete):**

| Topic | Route | Stage |
|---|---|---|
| Packaging | `/topics/packaging` | 6 — Complete (commit `39739b1`, audited) |

**Do not populate these topics without explicit instruction.**

**Do not prioritize them unless explicitly instructed.**

---

## Scope Creep Prevention

The following actions constitute scope creep and must be flagged:

| Action | Response |
|---|---|
| Populating a topic not explicitly authorized | Stop — requires explicit phase authorization |
| Adding sources not in the approved topic file | Stop — requires Brian review |
| Adding citations not in the approved topic file | Stop — requires Brian review |
| Adding applicability notes not in the approved topic file | Stop — requires Brian review |
| Modifying existing topic content (e.g., Packaging) | Stop — requires explicit authorization |
| Creating new topic routes | Stop — requires IA update authorization |
| Adding regulatory interpretation | Stop — requires Brian/ISC review |
| Populating multiple topics in a single phase | Stop — unless explicitly authorized |
| Generating draft content from AI without Brian's input | Stop — AI drafting requires Brian-provided source material |

---

## Revision History

| Date | Change | Author |
|---|---|---|
| Phase 5.2-A | Initial protocol document created | System |

---

> **To modify this protocol:** Update this document, increment the revision history, and obtain explicit approval before implementing changes that expand the content lifecycle or relax any control.
