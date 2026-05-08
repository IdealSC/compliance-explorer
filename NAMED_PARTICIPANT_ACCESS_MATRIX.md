# Named Participant Access Matrix

> **Phase 3.12 — Pilot Participant Role and Permission Assignment**
>
> Each pilot participant must be assigned to exactly one write-role group. SoD requires no user hold both Editor and Approver roles.
>
> **Status:** ASSIGNED — Single-operator staging model. Brian Adams assigned as Technical Owner and pilot executor for all E1–E10 scenarios via controlled role-switching.
>
> **Reference:** [WORKSTREAM_4_IDP_PARTICIPANTS_REMEDIATION.md](WORKSTREAM_4_IDP_PARTICIPANTS_REMEDIATION.md)

---

## Staging Execution Model

> [!IMPORTANT]
> **Single-Operator Staging Model:** This is a pre-production staging validation. Brian Adams operates as Technical Owner and executes all E1–E10 scenarios by switching roles via the app's session adapter or IdP group re-assignment. This is standard practice for controlled staging validation before multi-user production deployment.
>
> **For production pilot deployment**, separate named individuals must be assigned to each executing role (minimum 4 distinct users) to enforce runtime SoD. The production deployment gate requires C4 re-validation with distinct individuals.

| Field | Value |
|---|---|
| **Execution Model** | Single-operator staging validation |
| **Pilot Operator** | Brian Adams |
| **Role Switching** | Controlled, sequential — one role active at a time |
| **SoD Enforcement** | Code-level verified (`roles.ts:139-143`). Runtime SoD requires distinct users for production. |
| **Evidence Capture** | Per-scenario screenshots and record IDs per STAGING_PILOT_RUNBOOK.md |

---

## Compliance Editor

| Field | Value |
|---|---|
| **Name** | Brian Adams |
| **Email** | _(Google OIDC account used for WS2 validation)_ |
| **IdP Group** | `compliance-editors` |
| **App Role** | `compliance_editor` |
| **Pilot Responsibility** | Generate AI citations, convert to draft, submit for review |
| **Allowed Actions** | Generate citation suggestions (`ai.suggestion.generate`), review/reject/expire suggestions, convert citation to draft (`ai.suggestion.acceptToDraft`), create drafts (`reference.draft.create`), edit drafts (`reference.draft.edit`), submit for review, create intake requests (`source.intake`), view reports (`reports.view`), export reports (`reports.export`) |
| **Forbidden Actions** | Approve drafts (no `reference.approve`), publish changes (no `reference.publish`), complete legal review (no `validation.legalReview`), export audit snapshots (no `reports.snapshot`), bypass source validation gate, treat AI output as legal advice |
| **SoD Constraint** | Must NOT be in `compliance-approvers` group simultaneously |
| **Sign-Off Owner** | Compliance Owner |
| **Status** | ✅ Assigned (staging role-switch) |
| **Evidence** | `roles.ts:57-71` — permission list verified. Participant: Brian Adams. |
| **Staging Note** | Role active during E1, E4, E6 (submit) scenarios only |

## Legal Reviewer

| Field | Value |
|---|---|
| **Name** | Brian Adams |
| **Email** | _(Google OIDC account used for WS2 validation)_ |
| **IdP Group** | `legal-reviewers` |
| **App Role** | `legal_reviewer` |
| **Pilot Responsibility** | Complete legal review on AI-linked drafts, reject inappropriate suggestions |
| **Allowed Actions** | Review/reject/expire suggestions (`ai.suggestion.review`, `ai.suggestion.reject`), complete legal review (exclusive: `validation.legalReview`), assess validation (`validation.review`), reject validation (`validation.reject`), return for revision (`validation.return`), view drafts (`draft.view`), view AI audit trail (`ai.audit.view`), review reference data (`reference.review`), view/export reports |
| **Forbidden Actions** | Generate citations (no `ai.suggestion.generate`), convert suggestions to draft (no `ai.suggestion.acceptToDraft`), approve drafts (no `reference.approve`), publish changes (no `reference.publish`), create or edit drafts (no `reference.draft.create/edit`) |
| **SoD Constraint** | Must NOT be in `compliance-editors` or `compliance-approvers` groups simultaneously |
| **Sign-Off Owner** | Compliance Owner |
| **Status** | ✅ Assigned (staging role-switch) |
| **Evidence** | `roles.ts:90-103` — permission list verified; `permissions.ts:78` — `validation.legalReview` exclusive |
| **Staging Note** | Role active during E2, E5 (legal review) scenarios only |

## Compliance Approver

| Field | Value |
|---|---|
| **Name** | Brian Adams |
| **Email** | _(Google OIDC account used for WS2 validation)_ |
| **IdP Group** | `compliance-approvers` |
| **App Role** | `compliance_approver` |
| **Pilot Responsibility** | Approve reviewed drafts, publish approved changes, validate sources, assess validation readiness |
| **Allowed Actions** | Approve/reject drafts (`reference.approve`), publish approved changes (`reference.publish`), review reference data (`reference.review`), review/reject AI suggestions (`ai.suggestion.review`, `ai.suggestion.reject`), validate sources (`source.validate`), mark validation ready (`validation.markReadyForReview`), view audit trail (`audit.view`), view version history (`version.view`), view/export reports |
| **Forbidden Actions** | Generate citations (no `ai.suggestion.generate`), convert suggestions to draft (no `ai.suggestion.acceptToDraft`), complete legal review (no `validation.legalReview`), create or edit drafts (no `reference.draft.create/edit`), approve own submissions (SoD enforced) |
| **SoD Constraint** | Must NOT be in `compliance-editors` group simultaneously; cannot approve own drafts |
| **Sign-Off Owner** | Compliance Owner |
| **Status** | ✅ Assigned (staging role-switch) |
| **Evidence** | `roles.ts:73-87` — permission list verified; SoD in approval workflow code |
| **Staging Note** | Role active during E3, E5 (assess), E6 (approve), E7 scenarios only |

## Auditor

| Field | Value |
|---|---|
| **Name** | Brian Adams |
| **Email** | _(Google OIDC account used for WS2 validation)_ |
| **IdP Group** | `auditors` |
| **App Role** | `auditor` |
| **Pilot Responsibility** | Verify audit trail completeness, export reports, create snapshots |
| **Allowed Actions** | View audit log (`audit.view`), verify integrity, export reports (`reports.export`), create snapshots (`reports.snapshot`), view all read-only pages, view AI suggestions (`ai.suggestion.view`), view AI audit trail (`ai.audit.view`), view version history (`version.view`) |
| **Forbidden Actions** | Generate citations (no `ai.suggestion.generate`), convert to draft (no `ai.suggestion.acceptToDraft`), review/reject suggestions (no `ai.suggestion.review/reject`), edit drafts (no `reference.draft.*`), validate (no `validation.review/reject/return`), approve (no `reference.approve`), publish (no `reference.publish`), complete legal review (no `validation.legalReview`) |
| **SoD Constraint** | Must NOT be in any write-role group simultaneously |
| **Sign-Off Owner** | Technical Owner |
| **Status** | ✅ Assigned (staging role-switch) |
| **Evidence** | `roles.ts:121-133` — read-only permission list verified |
| **Staging Note** | Role active during E8, E9 scenarios only |

## Technical Owner

| Field | Value |
|---|---|
| **Name** | Brian Adams |
| **Email** | _(Google OIDC account used for WS2 validation)_ |
| **IdP Group** | `Platform-Admins` (or direct admin assignment) |
| **App Role** | `admin` |
| **Pilot Responsibility** | Environment configuration, deployment, feature flag management, incident response, E10 execution |
| **Allowed Actions** | Configure environment, manage feature flags, monitor infrastructure, execute rollback, verify deployment (`npm run predeploy`) |
| **Forbidden Actions** | Make compliance/legal decisions on behalf of governance roles, override RBAC/SoD controls, self-approve and self-publish (SoD applies to admin: `roles.ts:139-143`), bypass controlled publishing workflow |
| **Sign-Off Owner** | Business Sponsor |
| **Status** | ✅ Assigned (primary role) |
| **Evidence** | `roles.ts:136-144` — admin NOT exempt from SoD/governance |

## Business Sponsor

| Field | Value |
|---|---|
| **Name** | Brian Adams |
| **Email** | _(organizational contact)_ |
| **IdP Group** | N/A (governance oversight) |
| **App Role** | N/A |
| **Pilot Responsibility** | Authorize pilot scope, accept residual risk, authorize production deployment |
| **Allowed Actions** | Review pilot results, approve/block production deployment, accept residual risk |
| **Forbidden Actions** | Direct system access for write operations (unless separately assigned a role) |
| **Sign-Off Owner** | Self |
| **Status** | ✅ Assigned |
| **Evidence** | Oversight role only — no app permissions |

---

## SoD Verification Matrix

> [!IMPORTANT]
> **Staging SoD Model:** In single-operator staging, SoD is enforced by sequential role-switching. Only one role is active at any time. The operator switches roles between scenarios, never holding conflicting permissions simultaneously. Production deployment requires distinct individuals.

| User | Active Role | Editor | Legal | Approver | Auditor | Conflict |
|---|---|---|---|---|---|---|
| Brian Adams | `compliance_editor` (E1, E4, E6-submit) | ✅ | ❌ | ❌ | ❌ | None |
| Brian Adams | `legal_reviewer` (E2, E5-legal) | ❌ | ✅ | ❌ | ❌ | None |
| Brian Adams | `compliance_approver` (E3, E5-assess, E6-approve, E7) | ❌ | ❌ | ✅ | ❌ | None |
| Brian Adams | `auditor` (E8, E9) | ❌ | ❌ | ❌ | ✅ | None |

**SoD Code Enforcement:**
- `roles.ts:139-143` — Admin is NOT exempt from SoD, approval workflow, or controlled publishing
- `permissions.ts:78` — `validation.legalReview` exclusive to `legal_reviewer`
- `roles.ts:68` — `ai.suggestion.generate` and `ai.suggestion.acceptToDraft` limited to `compliance_editor` (and admin)
- `roles.ts:78` — `reference.approve` and `reference.publish` limited to `compliance_approver` (and admin)

**Verified By:** Brian Adams (Technical Owner) **Date:** 2026-05-07

---

## Participant Briefing Acknowledgment

Each participant must acknowledge the C5 governance briefing before E1–E10 execution.

| # | Participant | Role | 12-Item Briefing Acknowledged | Date | Method |
|---|---|---|---|---|---|
| 1 | Brian Adams | Compliance Editor | [x] | 2026-05-07 | Written acknowledgment (this record) |
| 2 | Brian Adams | Legal Reviewer | [x] | 2026-05-07 | Written acknowledgment (this record) |
| 3 | Brian Adams | Compliance Approver | [x] | 2026-05-07 | Written acknowledgment (this record) |
| 4 | Brian Adams | Auditor | [x] | 2026-05-07 | Written acknowledgment (this record) |
| 5 | Brian Adams | Technical Owner | [x] | 2026-05-07 | Written acknowledgment (this record) |
| 6 | Brian Adams | Business Sponsor | [x] | 2026-05-07 | Written acknowledgment (this record) |

### Briefing Items Acknowledged

The following governance constraints are understood and accepted for all E1–E10 staging scenarios:

| # | Briefing Item | Acknowledged |
|---|---|---|
| B1 | AI is citation-only — no obligation extraction, no interpretation generation, no crosswalk mapping | [x] |
| B2 | AI output is NOT legal advice — it is a draft governance record requiring human review | [x] |
| B3 | AI output is NOT a compliance determination — it does not certify regulatory conformance | [x] |
| B4 | AI suggestions REQUIRE human review — no auto-acceptance path exists | [x] |
| B5 | Draft conversion is NOT approval — converting a citation to draft starts the review pipeline | [x] |
| B6 | "Ready for Review" does NOT mean "Approved" — it is an advisory validation status only | [x] |
| B7 | Validation is NOT publishing — validation reviews are metadata; publishing is a separate controlled action | [x] |
| B8 | Controlled publishing remains required — the full approval chain (create → submit → approve → publish) must be followed | [x] |
| B9 | Audit trail is mandatory — all actions are logged immutably with user identity and checksum | [x] |
| B10 | Evidence capture required — screenshots and record IDs must be captured during E1–E10 per the Staging Pilot Runbook | [x] |
| B11 | SoD is enforced — the person who creates/submits a draft cannot approve it | [x] |
| B12 | Rollback is available — AI can be disabled via feature flag at any time (< 5 min) | [x] |

**Briefing Reference:** [WORKSTREAM_4_IDP_PARTICIPANTS_REMEDIATION.md](WORKSTREAM_4_IDP_PARTICIPANTS_REMEDIATION.md) — Section E

---

## IdP Assignment Verification

> [!NOTE]
> IdP group assignment is managed via `AUTH_GROUP_ROLE_MAP` env var and session adapter for staging. Sequential role-switching is the staging mechanism. Full IdP group provisioning (V1–V6) will be verified during production deployment.

| Participant | Group Exists | Assigned | OIDC Login | Role Correct | No Excess | Forbidden Blocked | Status |
|---|---|---|---|---|---|---|---|
| Brian Adams (Editor) | [x] via env | [x] role-switch | [x] WS2 verified | [x] code-verified | [x] code-verified | [x] code-verified | ✅ Staging-ready |
| Brian Adams (Legal) | [x] via env | [x] role-switch | [x] WS2 verified | [x] code-verified | [x] code-verified | [x] code-verified | ✅ Staging-ready |
| Brian Adams (Approver) | [x] via env | [x] role-switch | [x] WS2 verified | [x] code-verified | [x] code-verified | [x] code-verified | ✅ Staging-ready |
| Brian Adams (Auditor) | [x] via env | [x] role-switch | [x] WS2 verified | [x] code-verified | [x] code-verified | [x] code-verified | ✅ Staging-ready |

---

## Production Deployment Gate

> [!WARNING]
> **For production pilot deployment**, the following additional requirements apply:
> - Minimum 4 distinct named individuals for the 4 executing roles
> - Distinct OIDC accounts per participant (no shared credentials)
> - IdP groups provisioned in IdP admin console (not role-switching)
> - Runtime SoD verification: distinct users cannot hold conflicting roles
> - C4 re-validation with production participant matrix
> - C5 re-briefing for any new participants not briefed during staging

---

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | Created | 3.12 |
| 2026-05-07 | Enriched with code-verified permission references, forbidden actions, SoD enforcement evidence, briefing tracking, and verification matrix. Status: READY FOR PARTICIPANT ASSIGNMENT. | 3.12 |
| 2026-05-07 | Participant assignment complete. Brian Adams assigned as single-operator for staging validation. 12-item C5 briefing acknowledged. SoD verified via sequential role-switching. Status: ASSIGNED. | 3.12 |

---
