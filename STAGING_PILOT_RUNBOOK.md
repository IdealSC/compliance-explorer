# Staging Pilot Runbook — AI Citation Governance

> **Phase 3.12 — Staging Re-Execution Preparation**
>
> Step-by-step runbook for deploying the staging environment and executing E1–E10 with database mode, OIDC authentication, named participants, and Azure OpenAI.
>
> **Disclaimer:** AI citation suggestions are draft-only governance records. They do NOT represent legal advice, approved interpretations, or active regulatory reference data.

---

## A. Environment Setup

### Prerequisites

| Requirement | Details |
|---|---|
| **Infrastructure** | Azure App Service, AWS ECS, or equivalent with HTTPS |
| **Database** | PostgreSQL 14+ (staging-isolated, not shared with production) |
| **Node.js** | 18.x or 20.x LTS |
| **TLS** | Valid HTTPS certificate (required for OIDC callback) |
| **DNS** | Staging URL configured (e.g., `https://staging-compliance.example.com`) |
| **Network** | Outbound HTTPS to Azure OpenAI endpoint and OIDC issuer |

### Setup Steps

1. Provision staging infrastructure
2. Configure DNS and TLS certificate
3. Set all environment variables (Section B)
4. Deploy application: `npm run build` (verify 79 routes, 0 errors)
5. Run `npm run predeploy` — must pass
6. Apply database migrations: `npm run db:migrate`
7. Verify health: open staging URL, confirm 200 OK
8. Verify OIDC login (Section D)
9. Verify AI generation endpoint (Section E)
10. Proceed to E1–E10 execution (Section H)

---

## B. Required Environment Variables

### Core Application

```env
DATA_SOURCE=database
NEXT_PUBLIC_DATA_SOURCE=database
DATABASE_URL=postgresql://user:pass@host:5432/staging_compliance
DEMO_AUTH_ENABLED=false
```

### OIDC Authentication

```env
AUTH_SECRET=<random-32+-characters>
NEXTAUTH_URL=https://staging-compliance.example.com
AUTH_OIDC_ISSUER=https://login.microsoftonline.com/<tenant>/v2.0
AUTH_OIDC_ID=<client-id>
AUTH_OIDC_SECRET=<client-secret>
AUTH_GROUP_ROLE_MAP={"compliance-editors":"compliance_editor","legal-reviewers":"legal_reviewer","compliance-approvers":"compliance_approver","auditors":"auditor"}
```

### Azure OpenAI

```env
AI_PROVIDER=azure_openai
AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com
AZURE_OPENAI_API_KEY=<api-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AI_REQUIRE_SOURCE_RECORD_VALIDATED=true
AI_MAX_SOURCE_CHARS=12000
AI_REQUEST_TIMEOUT_MS=30000
```

### Prohibited Variables (Must NOT Exist)

```
NEXT_PUBLIC_AI_*
NEXT_PUBLIC_AZURE_OPENAI_*
NEXT_PUBLIC_AUTH_SECRET
```

**Verification:** `npm run predeploy` detects prohibited variables.

---

## C. Database Setup

### Steps

1. Create staging PostgreSQL database
2. Create database user with appropriate permissions
3. Set `DATABASE_URL` environment variable
4. Run migrations: `npm run db:migrate`
5. Verify connection: application health check returns 200

### Verification

- [ ] Database created and accessible
- [ ] Migrations applied without errors
- [ ] Application connects successfully
- [ ] No seed data applied (`db:seed` must NOT be run in staging)
- [ ] No production data present

---

## D. OIDC Setup

### Steps

1. Register OIDC application in Identity Provider (Azure AD / Okta / Auth0)
2. Set redirect URI: `{STAGING_URL}/api/auth/callback/oidc`
3. Generate client ID and client secret
4. Record issuer URL
5. Generate `AUTH_SECRET` (32+ random characters): `openssl rand -base64 32`
6. Configure `AUTH_GROUP_ROLE_MAP` JSON
7. Set all `AUTH_*` environment variables
8. Set `DEMO_AUTH_ENABLED=false`
9. Restart application
10. Test login — verify OIDC redirect, callback, and session creation

### Verification

- [ ] OIDC login redirects to IdP
- [ ] Callback returns to staging app
- [ ] Session contains user name, email, and roles from IdP groups
- [ ] Demo login endpoint is inaccessible (403 or not found)
- [ ] Role displayed in app header matches IdP group assignment

---

## E. Azure OpenAI Setup

### Steps

1. Create Azure OpenAI resource (or use existing)
2. Deploy model (e.g., `gpt-4o`)
3. Generate API key
4. Record endpoint URL and deployment name
5. Set `AI_PROVIDER=azure_openai`
6. Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true`
7. Set `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`
8. Verify no `NEXT_PUBLIC_AI_*` or `NEXT_PUBLIC_AZURE_OPENAI_*` variables
9. Run `npm run predeploy` — must pass
10. Test citation generation (E1)

### Verification

- [ ] Azure OpenAI resource accessible from staging network
- [ ] Model deployment responds to test requests
- [ ] Citation generation endpoint returns suggestions (not 503)
- [ ] Generated suggestions have `suggestionType: "citation"`
- [ ] Generated suggestions have `legalReviewRequired: true`
- [ ] AI disclaimer present in API responses
- [ ] No AI credentials exposed client-side

---

## F. IdP Group Mapping

### Required Groups

| IdP Group | App Role | Create In |
|---|---|---|
| `compliance-editors` | `compliance_editor` | IdP Admin Console |
| `legal-reviewers` | `legal_reviewer` | IdP Admin Console |
| `compliance-approvers` | `compliance_approver` | IdP Admin Console |
| `auditors` | `auditor` | IdP Admin Console |

### AUTH_GROUP_ROLE_MAP

```json
{
  "compliance-editors": "compliance_editor",
  "legal-reviewers": "legal_reviewer",
  "compliance-approvers": "compliance_approver",
  "auditors": "auditor"
}
```

### SoD Verification

- [ ] No user is a member of both `compliance-editors` AND `compliance-approvers`
- [ ] `legal-reviewers` members are NOT in `compliance-editors`
- [ ] `auditors` members are NOT in any write-role group
- [ ] Group membership verified in IdP admin console

---

## G. Named Participant Checklist

| Name | Email | IdP Group | Role | OIDC Login Verified | SoD Verified | Briefed (C5) |
|---|---|---|---|---|---|---|
| ___ | ___ | `compliance-editors` | Compliance Editor | [ ] | [ ] | [ ] |
| ___ | ___ | `legal-reviewers` | Legal Reviewer | [ ] | [ ] | [ ] |
| ___ | ___ | `compliance-approvers` | Compliance Approver | [ ] | [ ] | [ ] |
| ___ | ___ | `auditors` | Auditor | [ ] | [ ] | [ ] |

**Minimum 4 named participants required.** Each must log in via OIDC before E1 begins.

---

## H. E1–E10 Execution Steps

### Precondition: Source Data Setup (Stages 1–3)

Execute as **Compliance Editor**:

| Step | Action | Record |
|---|---|---|
| P1 | `POST /api/sources/intake` — create intake request | `intakeRequestId: ___` |
| P2 | `PATCH /api/sources/intake/{id}/status` — advance to `triage` | Status confirmed |
| P3 | `PATCH /api/sources/intake/{id}/status` — advance through pipeline | Status confirmed |
| P4 | `POST /api/sources/intake/{id}/convert-to-source-record` | `sourceRecordId: ___` |
| P5 | `POST /api/sources/registry/{id}/files` — register file metadata | `sourceFileId: ___` |
| P6 | `PATCH /api/sources/registry/{id}/validate` — validate source | Status: `validated` |

---

### E1. AI Citation Generation

**Role:** Compliance Editor

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Navigate to `/ai-suggestions` | Page loads, existing suggestions visible | — |
| 2 | `POST /api/ai/citation-suggestions/generate` with validated source | 200 OK with `suggestionIds` | `suggestionIds: [___]` |
| 3 | Verify suggestions in `/ai-suggestions` | Status: `pending_review`, type: `citation` | — |
| 4 | Verify `legalReviewRequired: true` on all generated suggestions | Boolean true | — |
| 5 | Check `/audit-log` | Events: `ai_citation_generation_requested`, `ai_citation_suggestion_created` | `auditEventIds: [___]` |

**Pass / Fail:** ___

---

### E2. AI Suggestion Rejection

**Role:** Legal Reviewer

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Select a generated suggestion | Detail drawer opens | — |
| 2 | `PATCH /api/ai/suggestions/{id}/review` with `rejected` + notes | 200 OK | — |
| 3 | Verify status → `rejected` (terminal) | No further transitions available | `rejectedSuggestionId: ___` |
| 4 | Check audit log | Event: `ai_suggestion_rejected` with reviewer identity | `auditEventId: ___` |

**Pass / Fail:** ___

---

### E3. AI Suggestion Expiration

**Role:** Compliance Approver

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Select a reviewable suggestion | Detail drawer opens | — |
| 2 | `PATCH /api/ai/suggestions/{id}/review` with `expired` | 200 OK | — |
| 3 | Verify status → `expired` (terminal) | No further transitions available | `expiredSuggestionId: ___` |
| 4 | Check audit log | Event: `ai_suggestion_expired` | `auditEventId: ___` |

**Pass / Fail:** ___

---

### E4. Citation → Draft Conversion

**Role:** Compliance Editor

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Select eligible citation suggestion (pending_review or marked_for_review) | Detail visible | — |
| 2 | `POST /api/ai/suggestions/{id}/accept-to-draft` | 200 OK with draft ID | `draftChangeId: ___` |
| 3 | Navigate to `/draft-mapping` | Draft visible with AI-linked badge | — |
| 4 | Verify `changeReason` contains `[AI Citation Suggestion: {id}]` | Provenance stamp present | — |
| 5 | Retry conversion on same suggestion | 409 — duplicate blocked | — |
| 6 | Check audit log | Event: `ai_suggestion_accepted_to_draft` with suggestion ID linkage | `auditEventId: ___` |

**Pass / Fail:** ___

---

### E5. Draft Validation (Advisory)

**Role:** Compliance Approver (create/assess) + Legal Reviewer (legal review)

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | `POST /api/validation/reviews` for AI-linked draft | 200 OK | `validationReviewId: ___` |
| 2 | Assess source support status | Status recorded | — |
| 3 | Assess citation accuracy status | Status recorded | — |
| 4 | As Legal Reviewer: complete legal review (if flagged) | Legal review completed | — |
| 5 | Mark "Ready for Review" | 5-gate preconditions enforced | — |
| 6 | Verify badge on `/draft-mapping` and `/review-approval` | "Ready for Review" badge (advisory) | — |
| 7 | Confirm "Ready for Review" ≠ approved | No auto-approval triggered | — |

**Pass / Fail:** ___

---

### E6. Review & Approval

**Role:** Compliance Editor (submit) + Compliance Approver (approve)

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | As Editor: submit draft for review | Approval review created | `approvalReviewId: ___` |
| 2 | As Approver (different user): approve | Draft approved | — |
| 3 | Attempt same-user approval | 403 — SoD violation | — |
| 4 | Check audit log | Event: `approval_decision_made` with approver identity | `auditEventId: ___` |

**Pass / Fail:** ___

---

### E7. Controlled Publishing

**Role:** Compliance Approver (with `reference.publish`)

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | `POST /api/publishing/draft-changes/{id}/publish` | 200 OK | `publicationEventId: ___` |
| 2 | Navigate to `/version-history` | New version created | `versionId: ___` |
| 3 | Verify prior version superseded (if applicable) | Superseded flag set | — |
| 4 | Check audit log | Events: `draft_change_published`, `reference_record_created` | `auditEventIds: [___]` |

**Pass / Fail:** ___

---

### E8. Audit Trail Verification

**Role:** Auditor

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Navigate to `/audit-log` | Full audit history visible | — |
| 2 | Filter by entity types from E1–E7 | Events for all stages present | — |
| 3 | Verify each event has: userId, email, roles, action, checksum | All fields populated | — |
| 4 | Verify `sourceReference` links across entity types | Cross-entity linkage present | — |
| 5 | `GET /api/audit/verify-integrity` | Integrity check passes | — |

**Pass / Fail:** ___

---

### E9. Report Snapshot

**Role:** Auditor

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Navigate to `/reports` | Report page loads | — |
| 2 | Export report | Report generated | — |
| 3 | `POST /api/reports/snapshots` | Snapshot created | `snapshotId: ___` |
| 4 | Verify snapshot has ID, checksum, timestamp | Metadata present | — |
| 5 | Verify governance disclaimer in export | Disclaimer present | — |

**Pass / Fail:** ___

---

### E10. AI Disabled Mode

**Role:** Technical Owner / Platform Admin

| Step | Action | Expected | Record |
|---|---|---|---|
| 1 | Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false` | — | — |
| 2 | Restart application | — | — |
| 3 | `POST /api/ai/citation-suggestions/generate` | 503 `FEATURE_DISABLED` | — |
| 4 | Navigate to all key pages | 7/7 return 200 OK | — |
| 5 | Re-enable feature flag | — | — |

**Pass / Fail:** ___

---

## I. Evidence Capture Requirements

### Required Record ID Chain

```
Source Intake Request ID:  SIR-___
Source Record ID:          SRC-___
Source File Metadata ID:   SF-___
AI Suggestion IDs:         AIS-___ (generated E1), AIS-___ (rejected E2), AIS-___ (expired E3)
Draft Change ID:           DC-___  (converted E4)
Validation Review ID:      VR-___  (created E5)
Approval Review ID:        AR-___  (created E6)
Publication Event ID:      PE-___  (created E7)
Version ID:                VER-___ (created E7)
Audit Event IDs:           AE-___ (one per action, E1–E7)
Report Snapshot ID:        RS-___  (created E9)
```

### Per-Scenario Evidence

| Field | Required |
|---|---|
| Scenario ID | Yes |
| Executed By (name) | Yes |
| Role | Yes |
| Timestamp (ISO 8601) | Yes |
| API Request (method + endpoint + body) | Yes |
| API Response (status + body) | Yes |
| Record IDs Created | Yes |
| Audit Event IDs | Yes |
| Screenshot Reference | Where applicable |
| Pass / Fail | Yes |
| Notes | If deviations |

---

## J. Issue / Deviation Log

| # | Scenario | Severity | Description | Impact | Remediation | Status |
|---|---|---|---|---|---|---|
| | | | | | | |

**Severity Key:** Critical (blocks pilot) · High (blocks production) · Medium (acceptable) · Low (documentation)

---

## K. Sign-Off Checklist

### Environment Sign-Offs

| Item | Signer | Date | Status |
|---|---|---|---|
| Environment deployed | Technical Owner | | [ ] |
| Database configured | Technical Owner | | [ ] |
| OIDC configured | Technical Owner | | [ ] |
| Azure OpenAI configured | Technical Owner | | [ ] |
| Predeploy passes | Technical Owner | | [ ] |
| IdP groups created | Compliance Owner | | [ ] |
| Participants assigned | Compliance Owner | | [ ] |
| Participants briefed (C5) | Compliance Owner | | [ ] |

### Scenario Sign-Offs

| Scenario | Executed By | Reviewed By | Date | Pass/Fail |
|---|---|---|---|---|
| Precondition: Source Setup | | | | |
| E1: AI Citation Generation | | | | |
| E2: AI Suggestion Rejection | | | | |
| E3: AI Suggestion Expiration | | | | |
| E4: Citation → Draft Conversion | | | | |
| E5: Draft Validation | | | | |
| E6: Review & Approval | | | | |
| E7: Controlled Publishing | | | | |
| E8: Audit Trail Verification | | | | |
| E9: Report Snapshot | | | | |
| E10: AI Disabled Mode | | | | |

### Final Production Authorization

| Role | Name | Decision | Date |
|---|---|---|---|
| Compliance Owner | ___ | | |
| Legal Reviewer | ___ | | |
| Compliance Approver | ___ | | |
| Auditor | ___ | | |
| Technical Owner | ___ | | |
| Business Sponsor | ___ | | |

---

## L. Rollback / Containment Steps

### Immediate (< 5 min)

1. Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`
2. Restart application
3. Verify `POST /api/ai/citation-suggestions/generate` → 503 `FEATURE_DISABLED`

### Full Containment (< 30 min)

4. Set `AI_PROVIDER=none`
5. Remove pilot users from `compliance-editors` IdP group
6. Verify all pages function normally
7. Document incident

### Data Preservation

- Audit events: **immutable** (assertAppendOnly — cannot delete)
- Report snapshots: **immutable** (cannot delete)
- Version history: **immutable** (cannot delete)
- Draft changes: individually rejectable via review workflow
- AI suggestions: persist for traceability

**Reference:** OPERATIONS_RUNBOOK.md — Section 18

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | Staging pilot runbook created | 3.12 |
