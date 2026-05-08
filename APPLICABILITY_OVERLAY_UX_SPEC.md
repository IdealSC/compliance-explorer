# Applicability Overlay UX Spec

**Phase:** 5.0 — Deliverable 5: Applicability Overlay UX Spec  
**Date:** 2026-05-07  
**Classification:** Product Design  
**Status:** APPROVED — Ready for Implementation  
**Author:** Brian Adams + Design Partner

---

## Purpose

The applicability overlay helps senior biopharma supply chain leaders understand how regulatory expectations shift based on operating context.

The overlay answers:

> *"Does this topic change because of our jurisdiction, entity role, or lifecycle stage?"*

The overlay should **not** feel like a database filter, compliance search tool, or workflow control. It should feel like a **lightweight operating context selector** that changes emphasis across the product.

---

## 1. Design Decision

Use a **persistent context selector** with three compact chips:

1. Jurisdiction
2. Entity Role
3. Lifecycle Stage

**Recommended default:** `US + EU · NDA Holder · Pre-commercial`

### Rules

- Do not use tabs as the primary pattern
- Do not create separate pages for every context combination
- Do not treat applicability as a seventh public navigation lens

The approved public navigation remains:

1. Start Here
2. Landscape Map
3. Topics
4. What Applies to Us
5. Ownership by Role
6. Sources & Standards

---

## 2. UX Principle

**Applicability should change emphasis, not create a new product.**

### The selected context MAY change:

- Ownership posture
- Applicability highlights
- Source emphasis
- Related topics
- Common pitfalls
- Suggested next questions
- Warning or watchout language

### The selected context should NOT change:

- The canonical page route
- The five-section topic page structure
- The core topic definition
- The existence of source references
- Public navigation
- Admin separation
- Approved regulatory content

---

## 3. Terminology

### Use

| Term | Context |
|---|---|
| Operating context | What the user has selected |
| Current context | What is currently active |
| Context selector | The UI component |
| Highlighted for your context | Content emphasis cue |
| What changes in this context | Section label for context-specific content |

### Avoid

| Term | Reason |
|---|---|
| Filters / Advanced filters | Signals database tool |
| Compliance profile | Signals compliance platform |
| Regulatory determination | Implies legal conclusion |
| Applicability engine | Implies automated system |
| Obligation calculator | Implies computation |
| Compliance score | Signals dashboard |
| Risk posture | Signals GRC tool |
| Audit view | Signals governance platform |

---

## 4. Overlay Dimensions

### Dimension 1 — Jurisdiction

| Field | Value |
|---|---|
| **Options** | US · EU · US + EU |
| **UX label** | `Jurisdiction` |
| **Default** | `US + EU` |
| **Selection rule** | Single select |
| **Rationale** | The goal is orientation, not exhaustive country-level regulatory mapping |

### Dimension 2 — Entity Role

| Field | Value |
|---|---|
| **Options** | NDA Holder · MAH · Licensed US Distributor · Importer · 3PL · CDMO Relationship |
| **UX label** | `Entity Role` |
| **Default** | `NDA Holder` |
| **Selection rule** | Single primary role |
| **Rationale** | Many companies have multiple responsibilities, but the public UX should not become a multi-role compliance engine. The selected role identifies the primary lens for emphasis. Related roles can still appear inside content as handoffs. |

### Dimension 3 — Lifecycle Stage

| Field | Value |
|---|---|
| **Options** | Preclinical · Late-stage Clinical · Pre-commercial · Launch · Post-commercial |
| **UX label** | `Lifecycle Stage` |
| **Default** | `Pre-commercial` |
| **Selection rule** | Single select |
| **Rationale** | Lifecycle stage changes the nature of the question: early awareness, readiness, execution, or maintenance |

---

## 5. Global Placement

### Desktop

Show the context selector as a compact row below the public navigation.

```
ISC Compliance Explorer

Start Here | Landscape Map | Topics | What Applies to Us | Ownership by Role | Sources & Standards

Operating Context: [US + EU] [NDA Holder] [Pre-commercial]
```

### Mobile

Collapse the context selector into a single row that expands on tap. Show the current context as a compact summary.

```
Operating Context: US + EU · NDA Holder · Pre-commercial  [Change]
```

### Placement Rules

- Context selector appears on every public page
- Context selector is **below** the navigation, never above
- Context selector is visually lighter than the navigation — it is secondary
- Context selector does not appear on admin pages
- Context selector state persists across page navigation (client-side state or URL params)

---

## 6. URL Behavior

### Canonical Page (No Context)

```
/topics/packaging
```

The page renders with the default context (`US + EU · NDA Holder · Pre-commercial`) or with no context emphasis if defaults are not set.

### Contextualized Page (With Context)

```
/topics/packaging?jurisdiction=us&entityRole=nda-holder&stage=pre-commercial
/topics/packaging?jurisdiction=eu&entityRole=mah&stage=launch
/topics/packaging?jurisdiction=us-eu&entityRole=3pl&stage=post-commercial
```

### URL Rules

- Context is expressed as query parameters, not path segments
- The canonical path (`/topics/packaging`) remains the same regardless of context
- Context parameters are optional — pages work without them
- Context parameters are shareable — a URL with context can be sent to a colleague
- Context parameters do not create new pages in the sitemap

### Parameter Encoding

| Dimension | Parameter | Values |
|---|---|---|
| Jurisdiction | `jurisdiction` | `us`, `eu`, `us-eu` |
| Entity Role | `entityRole` | `nda-holder`, `mah`, `licensed-us-distributor`, `importer`, `3pl`, `cdmo-relationship` |
| Lifecycle Stage | `stage` | `preclinical`, `late-stage-clinical`, `pre-commercial`, `launch`, `post-commercial` |

---

## 7. Interaction Behavior

### Opening the Selector

- Clicking any chip opens a dropdown or popover for that dimension
- Only one dimension dropdown is open at a time
- Clicking outside closes the dropdown

### Changing Context

- Selecting a new option in any dimension immediately updates the page
- The page does not reload — content emphasis updates in place
- URL query parameters update to reflect the new context
- A subtle transition or highlight animation signals the content change

### Resetting Context

- A "Reset to defaults" link restores `US + EU · NDA Holder · Pre-commercial`
- Resetting removes query parameters from the URL

### Context Not Set

If the user has never interacted with the context selector, show the default context with a gentle prompt:

> *"Set your operating context to see how this topic changes by jurisdiction, entity role, and lifecycle stage."*

---

## 8. Content Response to Context

### What Changes on Topic Pages

| Section | Context Effect |
|---|---|
| **Header** | Applicability chips reflect current context |
| **Section 1: What this is** | No change — core definition is context-independent |
| **Section 2: Ownership** | Ownership table may shift based on entity role (e.g., 3PL vs. NDA Holder) |
| **Section 3: Applicability** | Jurisdiction comparison highlights selected jurisdiction; entity role section highlights selected role; lifecycle section highlights selected stage; context callout updates |
| **Section 4: Regulatory chain** | Source table may prioritize sources for selected jurisdiction |
| **Section 5: What it touches next** | Connected topics may reorder based on relevance to context |

### What Changes on Other Page Types

| Page Type | Context Effect |
|---|---|
| **Home (Orientation)** | Context chips displayed; no content change |
| **Landscape Map** | Topics may show context-relevant badges or emphasis |
| **Matrix (Applicability)** | Table rows may highlight or sort based on context |
| **Ownership** | Role pages may emphasize context-relevant responsibilities |
| **Sources** | Source list may sort by jurisdiction relevance |

### What Never Changes

- The five-section structure of every topic page
- The existence and position of navigation items
- The core definition of any topic
- Source references (they remain available regardless of context)
- Admin tier content and behavior

---

## 9. Visual Design Guidance

### Chip Appearance

| State | Treatment |
|---|---|
| **Default / idle** | Light background, subtle border, readable text |
| **Hover** | Slightly darker background, pointer cursor |
| **Active / dropdown open** | Highlighted border, dropdown visible |
| **Selected** | Filled or accented background indicating active selection |

### Context Bar Appearance

- Visually distinct from the navigation bar — lighter, thinner, secondary
- Should not compete with the page hero or primary content
- Background color should be neutral — not an accent or brand color
- Text should be small but readable

### Content Emphasis Treatment

When context changes content emphasis:

- Use a subtle highlight or callout box for context-specific notes
- Do not hide content that doesn't match the context — reduce emphasis instead
- Do not use red/green/yellow traffic-light signals — those imply compliance scoring
- Use a consistent "highlighted for your context" label or icon

---

## 10. State Persistence

### Client-Side State

- Context selection persists during a session using client-side state (React context or localStorage)
- When the user navigates between pages, their context selection is maintained
- Context state is reflected in URL query parameters for shareability

### No Server-Side State

- Context is not stored in a database or user profile
- Context is not tied to authentication or identity
- Context is a lightweight client-side preference

### First Visit Behavior

- On first visit, use defaults: `US + EU · NDA Holder · Pre-commercial`
- Show the gentle prompt: "Set your operating context..."
- Once the user interacts with the selector, suppress the prompt for the session

---

## 11. Accessibility

| Requirement | Implementation |
|---|---|
| Keyboard navigation | All chips and dropdowns are keyboard-accessible (Tab, Enter, Escape) |
| Screen reader | Each chip announces its dimension and current value (e.g., "Jurisdiction: US + EU") |
| Focus management | Focus moves into dropdown on open; returns to chip on close |
| Motion sensitivity | Transition animations respect `prefers-reduced-motion` |
| Color contrast | All text meets WCAG AA contrast requirements |

---

## 12. Edge Cases

| Scenario | Behavior |
|---|---|
| User selects "EU" but views a US-only topic | Show full topic with a note: "This topic is primarily US-focused. EU equivalent or related expectations are noted where available." |
| User selects "3PL" but views a topic with no 3PL-specific content | Show full topic; highlight the ownership table row closest to the 3PL perspective |
| User shares a contextualized URL | Recipient sees the page with the shared context pre-selected |
| User clears browser storage | Context resets to defaults on next visit |
| User navigates to admin | Context selector is hidden; admin pages are not context-aware |
| Invalid query parameters | Ignore invalid params; use defaults for that dimension |

---

## 13. What This Spec Does NOT Cover

- The visual design system (colors, typography, spacing) — covered in a future design system deliverable
- Component library or framework selection — covered in the implementation plan
- Admin-side applicability tools — admin uses existing surfaces
- Content authoring for each context combination — covered in topic content deliverables
- Analytics or tracking of context usage — deferred

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Applicability overlay UX spec created. 3 dimensions (jurisdiction, entity role, lifecycle stage). Persistent context selector placement. URL behavior with query params. Content response rules. State persistence. Accessibility requirements. Edge cases. | System |

---

> **Governance Notice:** This document is a UX specification only. No code changes are authorized by this document alone. Implementation requires a separate build phase. The applicability overlay does not create new navigation items, new pages, or new data models. It changes content emphasis using client-side state and URL parameters.
