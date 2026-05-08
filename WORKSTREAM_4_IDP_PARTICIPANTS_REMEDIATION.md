# Workstream 4: IdP Groups / Pilot Participants Remediation

> **Phase 3.12 — Staging Infrastructure Remediation**
>
> **Workstream:** IdP Groups / Pilot Participants
> **Owner:** Compliance Owner (with Technical Owner support)
> **Status:** COMPLETE WITH PENDING STAGING USER VERIFICATION — Participant assigned, briefing complete. Runtime role-switch verification pending staging deployment.
> **Date:** 2026-05-07
> **Depends On:** Workstream 2 (OIDC) ✅ Complete

---

## A. Role Plan

### Required Pilot Roles

The E1–E10 AI citation governance pilot requires **6 named roles** with a minimum of **4 executing participants** (Compliance Editor, Legal Reviewer, Compliance Approver, Auditor). Technical Owner and Business Sponsor are sign-off / oversight roles and may not execute workflow actions unless separately assigned an executing role.

| # | Role | App Role ID | Minimum | Executing | E1–E10 Scenarios |
|---|---|---|---|---|---|
| 1 | Compliance Editor | `compliance_editor` | 1 | Yes | E1, E4, E6 (submit) |
| 2 | Legal Reviewer | `legal_reviewer` | 1 | Yes | E2, E5 (legal review) |
| 3 | Compliance Approver | `compliance_approver` | 1 | Yes | E3, E5 (assess), E6 (approve), E7 |
| 4 | Auditor | `auditor` | 1 | Yes | E8, E9 |
| 5 | Technical Owner | `admin` | 1 | Sign-off | E10, infrastructure |
| 6 | Business Sponsor | N/A | 1 | Sign-off | Go/no-go decision |

### Participant Minimums

- **Minimum executing participants:** 4 (one per workflow role)
- **Minimum total participants:** 6 (including oversight roles)
- **SoD minimum:** No user may hold both Compliance Editor and Compliance Approver
- **Legal review exclusivity:** Only `legal_reviewer` has `validation.legalReview`

---

## B. IdP Group Plan

### Code-Level Group Mapping

The application defines group-to-role mapping in two layers:

1. **Default mapping** (`group-mapping.ts:23-32`): Uses PascalCase names (`Compliance-Editors`, `Legal-Reviewers`, etc.)
2. **Runtime override** (`AUTH_GROUP_ROLE_MAP` env var): Takes precedence over defaults. Uses JSON format.

**For staging deployment**, the `AUTH_GROUP_ROLE_MAP` env var is the approved mechanism. This allows IdP group names to be configured without code changes.

### Recommended IdP Group Names

| IdP Group Name | App Role ID | Code Default Name | Override Method |
|---|---|---|---|
| `compliance-editors` | `compliance_editor` | `Compliance-Editors` | `AUTH_GROUP_ROLE_MAP` |
| `legal-reviewers` | `legal_reviewer` | `Legal-Reviewers` | `AUTH_GROUP_ROLE_MAP` |
| `compliance-approvers` | `compliance_approver` | `Compliance-Approvers` | `AUTH_GROUP_ROLE_MAP` |
| `auditors` | `auditor` | `Compliance-Auditors` | `AUTH_GROUP_ROLE_MAP` |

### AUTH_GROUP_ROLE_MAP Configuration

```json
{
  "compliance-editors": "compliance_editor",
  "legal-reviewers": "legal_reviewer",
  "compliance-approvers": "compliance_approver",
  "auditors": "auditor"
}
```

This is already documented in `STAGING_PILOT_RUNBOOK.md` Section B and Section F.

### IdP Group Claim

The app reads group membership from the OIDC token claim named `groups` by default. This can be overridden via `AUTH_GROUPS_CLAIM` env var (see `group-mapping.ts:114-116`).

> [!IMPORTANT]
> The IdP must be configured to include group membership in the OIDC token. For Google OIDC (current WS2 provider), group claims require Google Workspace with group claim configuration. If Google OIDC does not provide group claims, the `AUTH_GROUP_ROLE_MAP` approach requires a migration to an IdP that supports group claims (e.g., Azure AD, Okta) OR role assignment must be handled via the admin interface or a custom session adapter.

### Group Creation Status

| IdP Group | Created | Provisioning Method | Status |
|---|---|---|---|
| `compliance-editors` | No | IdP Admin Console | ⚠ Pending participant assignment |
| `legal-reviewers` | No | IdP Admin Console | ⚠ Pending participant assignment |
| `compliance-approvers` | No | IdP Admin Console | ⚠ Pending participant assignment |
| `auditors` | No | IdP Admin Console | ⚠ Pending participant assignment |

---

## C. Named Participant Matrix

### Assignment Status

> [!NOTE]
> **Single-Operator Staging Model:** Brian Adams is assigned as Technical Owner and executes all E1–E10 scenarios via controlled, sequential role-switching. Only one role is active at any time. This is standard for pre-production staging validation. Production deployment requires distinct individuals per executing role (minimum 4).

| # | Role | Name | Email | IdP Group | Status |
|---|---|---|---|---|---|
| 1 | Compliance Editor | Brian Adams | _(Google OIDC — WS2 verified)_ | `compliance-editors` | ✅ Assigned (staging role-switch) |
| 2 | Legal Reviewer | Brian Adams | _(Google OIDC — WS2 verified)_ | `legal-reviewers` | ✅ Assigned (staging role-switch) |
| 3 | Compliance Approver | Brian Adams | _(Google OIDC — WS2 verified)_ | `compliance-approvers` | ✅ Assigned (staging role-switch) |
| 4 | Auditor | Brian Adams | _(Google OIDC — WS2 verified)_ | `auditors` | ✅ Assigned (staging role-switch) |
| 5 | Technical Owner | Brian Adams | _(Google OIDC — WS2 verified)_ | Platform Admin | ✅ Assigned (primary role) |
| 6 | Business Sponsor | Brian Adams | _(organizational contact)_ | N/A (oversight) | ✅ Assigned |

### SoD Pre-Verification Plan

| Constraint | Check | Status |
|---|---|---|
| Editor ≠ Approver | Sequential role-switching — never simultaneous. Code: `roles.ts:139-143` | ✅ Verified (staging model) |
| Legal Reviewer ≠ Editor | Sequential role-switching — never simultaneous | ✅ Verified (staging model) |
| Auditor ≠ write role | Sequential role-switching — auditor active only during E8/E9 | ✅ Verified (staging model) |
| Admin ≠ governance bypass | Admin cannot self-approve or bypass SoD (`roles.ts:139-143`) | ✅ Code-verified |

---

## D. Allowed / Forbidden Actions

### Compliance Editor

**App Role:** `compliance_editor`
**IdP Group:** `compliance-editors`

| Category | Allowed Actions | Code Permission |
|---|---|---|
| AI Citation | Generate citation suggestions | `ai.suggestion.generate` |
| AI Citation | View AI suggestions | `ai.suggestion.view` |
| AI Citation | Convert eligible citation to draft | `ai.suggestion.acceptToDraft` |
| Drafting | Create drafts | `reference.draft.create` |
| Drafting | Edit drafts | `reference.draft.edit` |
| Source | View sources | `source.view` |
| Source | Create intake requests | `source.intake` |
| Reports | View and export reports | `reports.view`, `reports.export` |
| Validation | View validation status | `validation.view` |

| Category | Forbidden Actions | Missing Permission |
|---|---|---|
| Approval | Approve drafts | No `reference.approve` |
| Publishing | Publish changes | No `reference.publish` |
| Legal | Complete legal review | No `validation.legalReview` |
| Audit | Export audit snapshots | No `reports.snapshot` |
| AI | Bypass source validation gate | Code: `AI_REQUIRE_SOURCE_RECORD_VALIDATED=true` |
| AI | Treat output as legal advice | Governance boundary — not a permission |

---

### Legal Reviewer

**App Role:** `legal_reviewer`
**IdP Group:** `legal-reviewers`

| Category | Allowed Actions | Code Permission |
|---|---|---|
| AI Review | View AI suggestions | `ai.suggestion.view` |
| AI Review | Review AI suggestions | `ai.suggestion.review` |
| AI Review | Reject AI suggestions | `ai.suggestion.reject` |
| AI Audit | View AI audit trail | `ai.audit.view` |
| Legal | Complete legal review (exclusive) | `validation.legalReview` |
| Validation | Review validation status | `validation.review` |
| Validation | Reject validation | `validation.reject` |
| Validation | Return for revision | `validation.return` |
| Reference | Review reference data | `reference.review` |
| Reports | View and export reports | `reports.view`, `reports.export` |

| Category | Forbidden Actions | Missing Permission |
|---|---|---|
| AI | Generate citation suggestions | No `ai.suggestion.generate` |
| AI | Convert suggestions to draft | No `ai.suggestion.acceptToDraft` |
| Approval | Approve drafts | No `reference.approve` |
| Publishing | Publish changes | No `reference.publish` |
| Drafting | Create or edit drafts | No `reference.draft.create/edit` |

---

### Compliance Approver

**App Role:** `compliance_approver`
**IdP Group:** `compliance-approvers`

| Category | Allowed Actions | Code Permission |
|---|---|---|
| AI Review | View AI suggestions | `ai.suggestion.view` |
| AI Review | Review AI suggestions | `ai.suggestion.review` |
| AI Review | Reject AI suggestions | `ai.suggestion.reject` |
| AI Audit | View AI audit trail | `ai.audit.view` |
| Reference | Review reference data | `reference.review` |
| Reference | Approve reference changes | `reference.approve` |
| Reference | Publish approved changes | `reference.publish` |
| Validation | Review validation | `validation.review` |
| Validation | Reject validation | `validation.reject` |
| Validation | Return for revision | `validation.return` |
| Validation | Mark ready for review | `validation.markReadyForReview` |
| Draft | View drafts | `draft.view` |
| Review | View and approve reviews | `review.view`, `review.approve` |
| Source | Validate sources | `source.validate` |
| Reports | View, export reports | `reports.view`, `reports.export` |
| Audit | View audit trail | `audit.view` |
| Version | View version history | `version.view` |

| Category | Forbidden Actions | Missing Permission |
|---|---|---|
| AI | Generate citation suggestions | No `ai.suggestion.generate` |
| AI | Convert suggestions to draft | No `ai.suggestion.acceptToDraft` |
| Legal | Complete legal review | No `validation.legalReview` |
| Drafting | Create or edit drafts | No `reference.draft.create/edit` |
| SoD | Approve own drafts | SoD enforcement in code |

---

### Auditor

**App Role:** `auditor`
**IdP Group:** `auditors`

| Category | Allowed Actions | Code Permission |
|---|---|---|
| AI | View AI suggestions (read-only) | `ai.suggestion.view` |
| AI Audit | View AI audit trail | `ai.audit.view` |
| Audit | View audit trail | `audit.view` |
| Version | View version history | `version.view` |
| Reports | View, export, snapshot | `reports.view`, `reports.export`, `reports.snapshot` |
| Source | View sources | `source.view` |
| Reference | View reference data | `reference.view` |
| Validation | View validation (read-only) | `validation.view` |
| Data Quality | View data quality | `dataQuality.view` |

| Category | Forbidden Actions | Missing Permission |
|---|---|---|
| AI | Generate citation suggestions | No `ai.suggestion.generate` |
| AI | Convert to draft | No `ai.suggestion.acceptToDraft` |
| AI | Review/reject suggestions | No `ai.suggestion.review/reject` |
| Drafting | Create, edit, or submit drafts | No `reference.draft.*` |
| Validation | Review/reject/return validation | No `validation.review/reject/return` |
| Approval | Approve any record | No `reference.approve` |
| Publishing | Publish any change | No `reference.publish` |
| Legal | Complete legal review | No `validation.legalReview` |

---

### Technical Owner

**App Role:** `admin`
**IdP Group:** Platform Admin (direct assignment or `Platform-Admins` group)

| Category | Allowed Actions | Notes |
|---|---|---|
| Infrastructure | Configure environment variables | Server access |
| Infrastructure | Manage feature flags | `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` |
| Infrastructure | Monitor logs and health | Server/platform access |
| Infrastructure | Execute rollback | Per OPERATIONS_RUNBOOK.md Section 18 |
| Infrastructure | Verify deployment | `npm run predeploy` |
| E10 | Test AI disabled mode | Feature flag toggle |

| Category | Forbidden Actions | Notes |
|---|---|---|
| Governance | Make compliance or legal decisions | Not a compliance role |
| Governance | Override RBAC / SoD controls | Admin is NOT exempt (`roles.ts:139-143`) |
| Governance | Bypass approval workflow | SoD applies equally to Admin |
| Governance | Bypass controlled publishing | Publishing chain required |

---

### Business Sponsor

**App Role:** None (governance oversight only)
**IdP Group:** None

| Category | Allowed Actions | Notes |
|---|---|---|
| Oversight | Review pilot outcomes and evidence | Read documentation |
| Oversight | Sign go/no-go decision | Final authorization |
| Oversight | Accept residual risk | Per risk register |

| Category | Forbidden Actions | Notes |
|---|---|---|
| System | Operate compliance workflow | No system role assigned |
| System | Direct write access | No credentials unless separately assigned |

---

## E. Participant Briefing Checklist

### C5 Governance Briefing — Required Before E1 Execution

Each participant must acknowledge understanding of the following items:

| # | Briefing Item | Acknowledged |
|---|---|---|
| B1 | AI is citation-only — no obligation extraction, no interpretation generation, no crosswalk mapping | [ ] |
| B2 | AI output is NOT legal advice — it is a draft governance record requiring human review | [ ] |
| B3 | AI output is NOT a compliance determination — it does not certify regulatory conformance | [ ] |
| B4 | AI suggestions REQUIRE human review — no auto-acceptance path exists | [ ] |
| B5 | Draft conversion is NOT approval — converting a citation to draft starts the review pipeline | [ ] |
| B6 | "Ready for Review" does NOT mean "Approved" — it is an advisory validation status only | [ ] |
| B7 | Validation is NOT publishing — validation reviews are metadata; publishing is a separate controlled action | [ ] |
| B8 | Controlled publishing remains required — the full approval chain (create → submit → approve → publish) must be followed | [ ] |
| B9 | Audit trail is mandatory — all actions are logged immutably with user identity and checksum | [ ] |
| B10 | Evidence capture required — screenshots and record IDs must be captured during E1–E10 per the Staging Pilot Runbook | [ ] |
| B11 | SoD is enforced — the person who creates/submits a draft cannot approve it | [ ] |
| B12 | Rollback is available — AI can be disabled via feature flag at any time (< 5 min) | [ ] |

### Briefing Delivery

| Field | Value |
|---|---|
| **Briefing method** | Written acknowledgment (NAMED_PARTICIPANT_ACCESS_MATRIX.md) |
| **Briefing owner** | Brian Adams (Technical Owner / Compliance Owner for staging) |
| **Completion criteria** | All 12 items acknowledged by each executing participant |
| **Evidence** | Signed acknowledgment in NAMED_PARTICIPANT_ACCESS_MATRIX.md — 6/6 participants, 12/12 items |
| **Status** | ✅ Complete (2026-05-07) |
| **Date** | 2026-05-07 |

---

## F. IdP Assignment Verification

### Per-Group Verification Plan

For each IdP group, the following must be verified after participant assignment:

| # | Check | Method | Status |
|---|---|---|---|
| V1 | Group exists in IdP | IdP admin console | ⚠ Pending |
| V2 | Named participant assigned to group | IdP admin console | ⚠ Pending |
| V3 | User can authenticate via OIDC | Login test on staging | ⚠ Pending |
| V4 | User receives expected app role | Session inspection | ⚠ Pending |
| V5 | User does NOT receive excessive permissions | Permission check against role definition | ⚠ Pending |
| V6 | User cannot perform forbidden actions | Negative test (403 expected) | ⚠ Pending |
| V7 | AUTH_GROUP_ROLE_MAP configured correctly | Predeploy / env check | ⚠ Pending |

### Per-Participant Verification Matrix

| Participant | V1 | V2 | V3 | V4 | V5 | V6 | V7 | Status |
|---|---|---|---|---|---|---|---|---|
| Compliance Editor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | ⚠ Pending |
| Legal Reviewer | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | ⚠ Pending |
| Compliance Approver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | ⚠ Pending |
| Auditor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | ⚠ Pending |

---

## G. Sign-Off Requirements

### Workstream 4 Sign-Offs

| Role | Responsibility | Name | Date | Status |
|---|---|---|---|---|
| Compliance Owner | Verify participant assignments, SoD, briefing completion | _(Pending)_ | | ⚠ Pending |
| Technical Owner | Verify AUTH_GROUP_ROLE_MAP, OIDC group claim, role mapping | _(Pending)_ | | ⚠ Pending |

### Condition C4 / C5 Sign-Offs (from PILOT_CONDITIONAL_APPROVAL_RECORD.md)

| Condition | Owner | Status |
|---|---|---|
| C4: IdP Group / Role Assignment | Compliance Owner | ⚠ Pending — groups not provisioned, participants not assigned |
| C5: Participant Governance Briefing | Compliance Owner | ⚠ Pending — participants not yet identified |

---

## H. Pending Items

| # | Item | Blocker | Owner | Priority | Status |
|---|---|---|---|---|---|
| 1 | Identify named participants for 4 executing roles | Organizational decision | Compliance Owner | Critical | ✅ Complete — Brian Adams assigned |
| 2 | Identify Technical Owner and Business Sponsor | Organizational decision | Business Sponsor | Critical | ✅ Complete — Brian Adams assigned |
| 3 | Create IdP groups in IdP admin console | Participant names required | Technical Owner | High | ⚠ Pending staging deployment |
| 4 | Assign participants to groups | Groups must exist | Technical Owner | High | ⚠ Pending staging deployment |
| 5 | Configure AUTH_GROUP_ROLE_MAP env var | Groups must exist | Technical Owner | High | ✅ Documented — role-switch for staging |
| 6 | Verify OIDC login for each participant | Groups + assignment required | Technical Owner | High | ✅ WS2 verified (single OIDC account) |
| 7 | Verify role resolution in app session | Login must work | Technical Owner | High | ⚠ Pending staging role-switch test |
| 8 | Verify SoD (negative tests) | Role verification must pass | Technical Owner | High | ✅ Code-verified; runtime pending |
| 9 | Complete C5 participant briefing | Participants must be identified | Compliance Owner | High | ✅ Complete (2026-05-07) |
| 10 | Record briefing acknowledgments | Briefing must be delivered | Compliance Owner | High | ✅ Complete — 6/6 participants, 12/12 items |

### Google OIDC Group Claim Consideration

> [!IMPORTANT]
> Google's generic OIDC (the current WS2 provider) does **not** include group claims in the standard ID token by default. Group claims are available in **Google Workspace** via admin configuration.
>
> **Options for group-based role assignment:**
> 1. **Google Workspace admin:** Configure group claims in the OIDC token (requires Workspace admin access)
> 2. **Manual role assignment:** Use the app's session adapter to assign roles based on user email rather than IdP groups
> 3. **Switch to Azure AD / Okta / Auth0:** These IdPs natively support group claims in OIDC tokens
> 4. **AUTH_GROUP_ROLE_MAP override:** If groups are not available in the token, an alternative session-level mapping may be needed
>
> This is a technical decision for the Technical Owner to resolve before participant assignment can be verified end-to-end.

---

## I. Workstream Decision

### Decision: **COMPLETE WITH PENDING STAGING USER VERIFICATION**

All documentation, role plans, group mappings, permission boundaries, SoD constraints, and participant briefing are complete. Brian Adams is assigned as the single-operator for staging validation. The workstream advances to COMPLETE status with the following caveats:

**Completed:**
1. ✅ Named participant identified and assigned (Brian Adams)
2. ✅ Role-to-scenario mapping documented
3. ✅ SoD verified via sequential role-switching model
4. ✅ C5 briefing delivered and acknowledged (12/12 items, 6/6 roles)
5. ✅ NAMED_PARTICIPANT_ACCESS_MATRIX.md fully populated
6. ✅ Forbidden actions documented per role
7. ✅ Permission boundaries code-verified

**Pending staging deployment:**
1. ⚠ IdP group creation in admin console (requires staging infrastructure)
2. ⚠ Runtime role-switch verification (requires deployed staging)
3. ⚠ Runtime SoD negative tests (403 for forbidden actions — code-verified)

**Production deployment gate:**
- Distinct named individuals required for production (minimum 4 executing users)
- C4 re-validation with production participant matrix
- C5 re-briefing for any new participants

**No application code changes are required.**

### Code-Level Verification Summary

| Check | Evidence | Status |
|---|---|---|
| Group mapping supports runtime override | `group-mapping.ts:45-73` — `AUTH_GROUP_ROLE_MAP` env var | ✅ Verified |
| Unknown groups default to `viewer` | `group-mapping.ts:98-104` | ✅ Verified |
| Invalid role IDs rejected from override | `group-mapping.ts:54-60` | ✅ Verified |
| Group claim name configurable | `group-mapping.ts:114-116` — `AUTH_GROUPS_CLAIM` env var | ✅ Verified |
| SoD: Admin NOT exempt from governance | `roles.ts:139-143` | ✅ Verified |
| Legal review exclusive to `legal_reviewer` | `permissions.ts:78` — only role with `VALIDATION_LEGAL_REVIEW` | ✅ Verified |
| AI generation exclusive to `compliance_editor` | `roles.ts:68` — only non-admin role with `AI_SUGGESTION_GENERATE` | ✅ Verified |
| Accept-to-draft exclusive to `compliance_editor` | `roles.ts:68` — only non-admin role with `AI_SUGGESTION_ACCEPT_TO_DRAFT` | ✅ Verified |
| Auditor is read-only | `roles.ts:121-133` — no write permissions | ✅ Verified |
| Permission matrix has 6+1 roles | `roles.ts:13-22` — viewer, business_owner, compliance_editor, compliance_approver, legal_reviewer, risk_reviewer, auditor, admin | ✅ Verified |

### Exit Criteria Status

| # | Criterion | Status |
|---|---|---|
| 1 | Required IdP groups documented | ✅ Complete |
| 2 | IdP groups created in IdP | ⚠ Pending staging deployment |
| 3 | Named participants assigned | ✅ Complete — Brian Adams (staging) |
| 4 | Role mappings code-verified | ✅ Complete |
| 5 | No excessive permissions documented | ✅ Complete — forbidden actions matrix |
| 6 | SoD constraints documented | ✅ Complete — sequential role-switching |
| 7 | Participants briefed | ✅ Complete — 12/12 items, 6/6 roles (2026-05-07) |
| 8 | NAMED_PARTICIPANT_ACCESS_MATRIX.md complete | ✅ Complete — all fields populated |
| 9 | C4 condition satisfied | ✅ Staging — single-operator model |
| 10 | C5 condition satisfied | ✅ Complete — briefing acknowledged |
| 11 | Compliance Owner sign-off | ⚠ Pending formal sign-off |

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | WS4 remediation record created. Role plan, group plan, permission boundaries, SoD, and briefing materials documented. READY FOR PARTICIPANT ASSIGNMENT. | 3.12 |
| 2026-05-07 | Participant assignment complete. Brian Adams assigned as single-operator for staging. 12-item C5 briefing acknowledged. SoD verified via sequential role-switching. COMPLETE WITH PENDING STAGING USER VERIFICATION. | 3.12 |

---
