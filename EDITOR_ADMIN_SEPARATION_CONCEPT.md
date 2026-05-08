# Editor / Admin Separation Concept

**Phase:** 5.0 — Deliverable 6: Editor/Admin Separation Concept  
**Date:** 2026-05-07  
**Classification:** Product Design  
**Status:** APPROVED — Ready for Implementation  
**Author:** Brian Adams + Design Partner

---

## Purpose

Separate the public/client-facing Compliance Explorer experience from the private editor/admin workspace.

The **public product** is a regulatory landscape orientation tool for senior biopharma supply chain leaders.

The **admin workspace** is where Brian maintains the controlled regulatory interpretation layer, source mappings, draft content, review status, and internal governance surfaces.

- The public user should **never** feel like they are inside a compliance governance platform.
- The editor/admin user should **always** know they are inside a controlled content management environment.

---

## 1. Core Design Decision

Use two clearly separated product tiers:

### Public Tier

```
/
/map
/topics
/applicability
/ownership
/sources
```

- Orientation-focused
- No admin language
- No governance signals
- Context selector visible
- Clean, executive-briefing aesthetic

### Admin Tier

```
/admin
/admin/content
/admin/sources
/admin/review
/admin/monitor
/admin/legacy
```

- Operational / editor-focused
- Governance language is appropriate
- Compact, functional aesthetic
- Admin badge always visible
- Context selector hidden

---

## 2. Separation Principles

| Principle | Public Tier | Admin Tier |
|---|---|---|
| **Audience** | Senior supply chain leaders, external stakeholders | Brian, editors, content maintainers |
| **Mental model** | "I'm exploring a regulatory landscape" | "I'm maintaining a content system" |
| **Language** | Topics, ownership, applicability, sources | Drafts, validation, review, audit, approval |
| **Visual tone** | Clean, spacious, hero-driven | Compact, operational, data-dense |
| **Navigation** | 6 public lenses | 5 admin categories |
| **Context selector** | Visible on every page | Hidden — not relevant to admin |
| **Access** | Open (no auth required for public content) | Protected (OIDC auth required) |
| **URL prefix** | `/` | `/admin` |

---

## 3. Public Tier Specification

### Navigation

```
ISC Compliance Explorer

Start Here | Landscape Map | Topics | What Applies to Us | Ownership by Role | Sources & Standards

Operating Context: [US + EU] [NDA Holder] [Pre-commercial]
```

### Visual Identity

| Element | Treatment |
|---|---|
| **Header** | "ISC Compliance Explorer" — no "Admin" badge |
| **Page style** | Hero sections, orientation copy, entry doors, preview cards |
| **Typography** | Larger, more spacious — executive-briefing feel |
| **Color** | Primary brand palette |
| **Content density** | Low to medium — scannable in 90 seconds |
| **Footer** | Public nav links only — no admin links |

### What the Public Tier Shows

- Orientation pages (Start Here, overviews)
- Landscape Map (visual supply chain phase and workstream maps)
- Topic pages (14 structured orientation pages)
- Applicability views (matrix, entity role, lifecycle stage)
- Ownership views (10 role-specific pages)
- Sources & Standards (source chain, standards, source library)

### What the Public Tier Does NOT Show

- Draft content
- Review status or approval status
- Validation workbench
- Source intake forms
- Data quality metrics
- Audit log
- Version history
- Regulatory update monitoring
- Action center or task queues
- Admin navigation
- Editor controls or edit buttons
- Governance language in any header, label, or CTA

---

## 4. Admin Tier Specification

### Navigation

```
ISC Compliance Explorer  ▸ Admin

Content | Sources | Review | Monitor | Legacy
```

### Visual Identity

| Element | Treatment |
|---|---|
| **Header** | "ISC Compliance Explorer ▸ Admin" — admin badge always visible |
| **Page style** | Tables, forms, status badges, action buttons |
| **Typography** | Smaller, denser — workspace feel |
| **Color** | Muted variant of brand palette — distinct from public |
| **Content density** | High — operational data surfaces |
| **Footer** | Minimal — system info, version, environment |

### Admin Categories

| Category | URL | Purpose | Contains |
|---|---|---|---|
| **Content** | `/admin/content` | Create, edit, and manage topic content | Topic Drafts · Requirement Records · Source Records · Workstream Mapping · Applicability Mapping |
| **Sources** | `/admin/sources` | Manage regulatory source materials | Source Intake · Source Registry Admin · Source Validation · As-Of Trace |
| **Review** | `/admin/review` | Review and approve content changes | Review Queue · Approval Status · Validation Workbench |
| **Monitor** | `/admin/monitor` | Monitor system health and content status | Regulatory Updates · Data Quality Checks · Version History · Audit Log |
| **Legacy** | `/admin/legacy` | Access legacy surfaces from earlier phases | Legacy Reference |

### What the Admin Tier Shows

- All governance, editorial, and maintenance surfaces
- Content creation and editing interfaces
- Review queues and approval workflows
- Source intake and validation
- Audit trail and version history
- Data quality metrics
- System monitoring

### What the Admin Tier Does NOT Show

- Public-facing hero copy or orientation language
- Context selector (admin is not context-aware)
- "Entry door" cards or orientation pages
- Marketing or executive-briefing visual treatment

---

## 5. Access Control

### Public Tier Access

| Rule | Detail |
|---|---|
| **Authentication** | Not required for viewing published content |
| **Authorization** | All published content is visible to any visitor |
| **Admin link** | Not shown anywhere in public navigation or footer |
| **Admin access** | Only via direct URL (`/admin`) |

### Admin Tier Access

| Rule | Detail |
|---|---|
| **Authentication** | OIDC login required |
| **Authorization** | RBAC roles (editor, reviewer, approver, admin) |
| **Unauthenticated access** | Redirect to login page |
| **Unauthorized role** | Show "insufficient permissions" — do not expose admin content |
| **Session expiry** | Redirect to login with return URL |

### Role Permissions (Existing RBAC)

| Role | Content | Sources | Review | Monitor | Legacy |
|---|---|---|---|---|---|
| **Admin** | Full | Full | Full | Full | Full |
| **Editor** | Create, Edit | Intake, Edit | Submit | View | View |
| **Reviewer** | View | View | Review, Approve | View | View |
| **Viewer** | View | View | View | View | View |

These roles are already implemented in the existing RBAC system. No new roles are introduced.

---

## 6. Navigation Isolation

### Public → Admin Transition

- No visible link, button, or menu item in public navigation leads to admin
- Admin is accessed only by navigating directly to `/admin`
- On transition, the header, navigation, context selector, and visual treatment all change
- The user should feel they have "entered the workspace"

### Admin → Public Transition

- Admin header includes a "View Public Site" link that opens the public site
- This link opens in the same tab (not a new tab) — the user leaves admin context
- On transition, the header, navigation, and visual treatment revert to public

### Deep Linking

- Public pages are linkable: `/topics/packaging`
- Admin pages are linkable: `/admin/content/topics/packaging`
- Public and admin URLs are distinct — no ambiguity
- Sharing a public link never exposes admin surfaces

---

## 7. Visual Differentiation

### How the User Knows They Are in Admin

| Signal | Implementation |
|---|---|
| **Header text** | "ISC Compliance Explorer ▸ Admin" |
| **Admin badge** | Persistent visual badge or label in the header |
| **Navigation** | Different nav items (Content, Sources, Review, Monitor, Legacy) |
| **Background** | Subtle background color difference (e.g., slightly darker or different hue) |
| **Typography** | Denser, smaller, more operational |
| **Context selector** | Hidden |
| **Footer** | System info instead of public nav links |

### How the User Knows They Are in Public

| Signal | Implementation |
|---|---|
| **Header text** | "ISC Compliance Explorer" — no admin badge |
| **Navigation** | 6 public lenses |
| **Context selector** | Visible |
| **Hero sections** | Present on orientation pages |
| **Visual density** | Lower — spacious, scannable |
| **Footer** | Public nav links only |

---

## 8. Route Guard Implementation

### Public Routes

```
/                          → Home (Start Here)
/map/*                     → Landscape Map pages
/topics/*                  → Topic pages
/applicability/*           → Applicability pages
/ownership/*               → Ownership pages
/sources/*                 → Sources pages
```

No authentication check. All content served to any visitor.

### Admin Routes

```
/admin                     → Admin home (Editor Workspace)
/admin/content/*           → Content management
/admin/sources/*           → Source management
/admin/review/*            → Review and approval
/admin/monitor/*           → Monitoring
/admin/legacy/*            → Legacy surfaces
```

All routes require:
1. OIDC authentication check
2. RBAC role authorization check
3. Redirect to login if unauthenticated
4. "Insufficient permissions" if unauthorized

### Middleware Order

1. Check if route starts with `/admin`
2. If yes: verify OIDC session → verify RBAC role → serve or redirect
3. If no: serve public content without auth check

---

## 9. Content Publishing Model

### How Content Flows from Admin to Public

```
Draft (Admin)
  → Review (Admin)
    → Approved (Admin)
      → Published (Public)
```

| State | Visible In | Editable |
|---|---|---|
| **Draft** | Admin only | Yes (editor) |
| **In Review** | Admin only | No (locked for review) |
| **Approved** | Admin only (until published) | No |
| **Published** | Public + Admin | No (new draft required for changes) |
| **Archived** | Admin only | No |

### Publishing Rules

- Only approved content can be published to the public tier
- Publishing is a controlled action requiring appropriate RBAC role
- Published content is immutable — changes require a new draft cycle
- The public tier never shows draft, review, or approval status

These rules align with the existing controlled publishing workflow established in the pilot phases.

---

## 10. What This Spec Preserves

| Existing Asset | Status |
|---|---|
| RBAC roles and permissions | Preserved — no new roles |
| OIDC authentication | Preserved — required for admin |
| Audit trail (append-only) | Preserved — continues in admin |
| Controlled publishing workflow | Preserved — draft → review → approve → publish |
| Separation of Duties (SoD) | Preserved — editor ≠ reviewer ≠ approver |
| Version history | Preserved — in admin monitor |
| Data quality checks | Preserved — in admin monitor |
| Source registry | Preserved — in admin sources |
| API routes | Preserved — no changes to existing APIs |

---

## 11. What This Spec Does NOT Cover

- Visual design system specifics (colors, typography, spacing) — future deliverable
- Component library implementation — future deliverable
- Admin page-by-page wireframes — covered during implementation
- Migration plan for moving existing surfaces into admin routes — covered during implementation
- Analytics or usage tracking — deferred

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Editor/Admin separation concept created. Two-tier architecture (public orientation + admin workspace). 6 public routes, 5 admin categories, ~20 admin routes. Access control rules. Navigation isolation. Visual differentiation signals. Route guard specification. Content publishing model. RBAC/OIDC/audit preservation confirmed. | System |

---

> **Governance Notice:** This document is a design specification only. No code changes are authorized by this document alone. All existing governance controls (RBAC, OIDC, audit trail, controlled publishing, SoD) are explicitly preserved. The separation creates visual and navigational isolation, not a new authorization model.
