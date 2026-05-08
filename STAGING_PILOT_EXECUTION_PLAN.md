# AI Citation Pilot — Staging Execution Plan

> **Phase 3.12 — Staging Deployment and E1–E10 Re-Execution**
>
> This plan defines the staging environment requirements, configuration checklists, and re-execution procedures required to satisfy conditions C1–C5 of the conditional approval.
>
> **Disclaimer:** AI citation suggestions are draft-only governance records. They do NOT represent legal advice, approved interpretations, or active regulatory reference data.

---

## A. Staging Environment Requirements

| Requirement | Value | Notes |
|---|---|---|
| **Infrastructure** | Azure App Service or equivalent | Must support server-side environment variables |
| **Database** | PostgreSQL (production-equivalent schema) | Migrations applied via `npm run db:migrate` |
| **DATA_SOURCE** | `database` | Required for all write operations |
| **NEXT_PUBLIC_DATA_SOURCE** | `database` | Client-side mode must match |
| **Node.js** | 18.x or 20.x LTS | Match production target |
| **Build** | `npm run build` passes (79 routes, 0 errors) | Verify before deployment |
| **Predeploy** | `npm run predeploy` passes | Secret exposure scan |
| **Network** | HTTPS with valid TLS certificate | Required for OIDC callback |
| **Isolation** | Separate from production database | Pilot data must not mix with production |

---

## B. Required Environment Variables

### Core Application

| Variable | Value | Type |
|---|---|---|
| `DATA_SOURCE` | `database` | Server |
| `NEXT_PUBLIC_DATA_SOURCE` | `database` | Client |
| `DATABASE_URL` | `postgresql://...` (staging) | Server |
| `DEMO_AUTH_ENABLED` | `false` | Server |

### OIDC Authentication (C2)

| Variable | Value | Type |
|---|---|---|
| `AUTH_SECRET` | Random 32+ character secret | Server |
| `AUTH_OIDC_ISSUER` | IdP issuer URL | Server |
| `AUTH_OIDC_ID` | OIDC client ID | Server |
| `AUTH_OIDC_SECRET` | OIDC client secret | Server |
| `AUTH_GROUP_ROLE_MAP` | JSON mapping IdP groups → app roles | Server |
| `NEXTAUTH_URL` | Staging app URL | Server |

### Azure OpenAI (C3)

| Variable | Value | Type |
|---|---|---|
| `AI_PROVIDER` | `azure_openai` | Server |
| `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` | `true` | Server |
| `AZURE_OPENAI_ENDPOINT` | Azure endpoint URL | Server |
| `AZURE_OPENAI_API_KEY` | Azure API key | Server |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name (e.g., `gpt-4o`) | Server |
| `AI_REQUIRE_SOURCE_RECORD_VALIDATED` | `true` | Server |
| `AI_MAX_SOURCE_CHARS` | `12000` | Server |
| `AI_REQUEST_TIMEOUT_MS` | `30000` | Server |

### Prohibited Variables (Must NOT Exist)

| Variable Pattern | Reason |
|---|---|
| `NEXT_PUBLIC_AI_*` | Client-side AI secret exposure |
| `NEXT_PUBLIC_AZURE_OPENAI_*` | Client-side provider secret exposure |
| `NEXT_PUBLIC_AUTH_SECRET` | Client-side auth secret exposure |

**Verification:** `npm run predeploy` will detect prohibited variables.

---

## C. OIDC Configuration Checklist (C2)

- [ ] Identity Provider selected (Azure AD, Okta, Auth0, etc.)
- [ ] OIDC application registered in IdP
- [ ] Client ID and Client Secret generated
- [ ] Issuer URL confirmed
- [ ] Callback URL registered: `{STAGING_URL}/api/auth/callback/oidc`
- [ ] `AUTH_SECRET` generated (32+ random characters)
- [ ] `AUTH_GROUP_ROLE_MAP` configured with pilot group mappings
- [ ] `DEMO_AUTH_ENABLED=false` set
- [ ] OIDC login tested — user can authenticate
- [ ] Demo login endpoint returns 403 or is inaccessible
- [ ] Session contains user identity (name, email, roles from IdP groups)

**Owner:** Technical Owner

**Sign-Off:** ___

---

## D. Azure OpenAI Configuration Checklist (C3)

- [ ] Azure OpenAI resource created
- [ ] Model deployment created (e.g., `gpt-4o`)
- [ ] API key generated
- [ ] Endpoint URL confirmed
- [ ] Environment variables set (server-only)
- [ ] `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=true` set
- [ ] `AI_PROVIDER=azure_openai` set
- [ ] `npm run predeploy` passes (no `NEXT_PUBLIC_AI_*` variables)
- [ ] Test citation generation succeeds (E1)
- [ ] Generated citations have `suggestionType: "citation"` and `legalReviewRequired: true`
- [ ] AI disclaimer present in API responses

**Owner:** Technical Owner

**Sign-Off:** ___

---

## E. IdP Group / Role Mapping Checklist (C4)

### Required Groups

| IdP Group Name | Application Role | Permissions |
|---|---|---|
| `compliance-editors` | `compliance_editor` | `ai.suggestion.generate`, `ai.suggestion.acceptToDraft`, `draft.edit`, `source.intake`, etc. |
| `legal-reviewers` | `legal_reviewer` | `validation.legalReview`, `ai.suggestion.review`, `ai.suggestion.reject`, etc. |
| `compliance-approvers` | `compliance_approver` | `reference.approve`, `review.approve`, `reference.publish`, etc. |
| `auditors` | `auditor` | `audit.view`, `reports.export`, `reports.snapshot`, etc. |

### SoD Verification

- [ ] No pilot user is a member of both `compliance-editors` AND `compliance-approvers`
- [ ] `legal-reviewers` group does NOT have `ai.suggestion.acceptToDraft` or `reference.publish`
- [ ] `auditors` group has read-only permissions only
- [ ] `AUTH_GROUP_ROLE_MAP` JSON matches the above table
- [ ] Group membership verified in IdP admin console

**Owner:** Compliance Owner + Technical Owner

**Sign-Off:** ___

---

## F. Named Participant Matrix

| Name | Email | IdP Group | Application Role | SoD Verified | Briefed (C5) |
|---|---|---|---|---|---|
| ___ | ___ | `compliance-editors` | Compliance Editor | [ ] | [ ] |
| ___ | ___ | `legal-reviewers` | Legal Reviewer | [ ] | [ ] |
| ___ | ___ | `compliance-approvers` | Compliance Approver | [ ] | [ ] |
| ___ | ___ | `auditors` | Auditor | [ ] | [ ] |

**Minimum participants:** 4 (one per role). No user may hold multiple write roles.

---

## G. E1–E10 Re-Execution Plan

### Execution Order

Execute scenarios sequentially. Each scenario builds on prior results.

| Order | Scenario | Role | Depends On | Evidence Required |
|---|---|---|---|---|
| 1 | **Precondition: Source Setup** | Compliance Editor | — | Source Intake Request ID, Source Record ID, Source File Metadata ID |
| 2 | **E1: AI Citation Generation** | Compliance Editor | Source validated | AI Suggestion IDs, Audit Event IDs, timestamps |
| 3 | **E2: AI Suggestion Rejection** | Legal Reviewer | E1 | Rejected Suggestion ID, Audit Event ID, reviewer identity |
| 4 | **E3: AI Suggestion Expiration** | Compliance Approver | E1 | Expired Suggestion ID, Audit Event ID |
| 5 | **E4: Citation → Draft Conversion** | Compliance Editor | E1 | Draft Change ID, Provenance stamp, AI-linked badge, duplicate block (409) |
| 6 | **E5: Draft Validation** | Approver + Legal Reviewer | E4 | Validation Review ID, 5-gate verification, "Ready for Review" badge |
| 7 | **E6: Review & Approval** | Editor (submit) + Approver (approve) | E4 | Approval Review ID, SoD block evidence, Audit Event ID |
| 8 | **E7: Controlled Publishing** | Compliance Approver | E6 | Publication Event ID, Version ID, prior version superseded |
| 9 | **E8: Audit Trail Verification** | Auditor | E1–E7 | Filtered audit events, checksums, sourceReference chain |
| 10 | **E9: Report Snapshot** | Auditor | E1–E7 | Snapshot ID, checksum, governance disclaimer in export |
| 11 | **E10: AI Disabled Mode** | Platform Admin | — | 503 FEATURE_DISABLED response, 7/7 pages render |

### Precondition: Source Data Setup

Before E1, create pilot source data through the governed chain:

1. **Source Intake Request:** `POST /api/sources/intake` — capture `intakeRequestId`
2. **Intake Triage:** `PATCH /api/sources/intake/{id}/status` — advance through triage
3. **Convert to Source Record:** `POST /api/sources/intake/{id}/convert-to-source-record` — capture `sourceRecordId`
4. **Register Source File:** `POST /api/sources/registry/{id}/files` — capture `sourceFileId`
5. **Validate Source:** `PATCH /api/sources/registry/{id}/validate` — set status to `validated`

This establishes Traceability Stages 1–3 before E1 begins at Stage 4.

---

## H. Evidence Capture Plan

### Per-Scenario Evidence Template

For each E1–E10 scenario, capture:

| Field | Description |
|---|---|
| **Scenario ID** | E1–E10 |
| **Executed By** | Named participant |
| **Role** | Application role used |
| **Timestamp** | ISO 8601 timestamp |
| **API Request** | HTTP method + endpoint + request body |
| **API Response** | HTTP status + response body |
| **Record IDs Created** | All database record IDs generated |
| **Audit Event IDs** | Audit events created by the action |
| **Screenshots** | UI screenshots of key states |
| **Pass / Fail** | Scenario result |
| **Notes** | Deviations or observations |

### Required Record ID Chain

The complete evidence chain requires these IDs from a single E1–E7 run:

```
Source Intake Request ID: SIR-___
Source Record ID:         SRC-___
Source File Metadata ID:  SF-___
AI Suggestion ID:         AIS-___ (generated in E1)
AI Suggestion ID:         AIS-___ (rejected in E2)
AI Suggestion ID:         AIS-___ (expired in E3)
Draft Change ID:          DC-___  (converted in E4)
Validation Review ID:     VR-___  (created in E5)
Approval Review ID:       AR-___  (created in E6)
Publication Event ID:     PE-___  (created in E7)
Version ID:               VER-___ (created in E7)
Audit Event IDs:          AE-___ (one per action, E1–E7)
Report Snapshot ID:       RS-___  (created in E9)
```

---

## I. Sign-Off Plan

### Staging Execution Sign-Offs

| Milestone | Signer | Role | Date | Status |
|---|---|---|---|---|
| C1: Database-mode deployment | ___ | Technical Owner | | [ ] |
| C2: OIDC configuration | ___ | Technical Owner | | [ ] |
| C3: Azure OpenAI configuration | ___ | Technical Owner | | [ ] |
| C4: IdP group assignment | ___ | Compliance Owner | | [ ] |
| C5: Participant briefing | ___ | Compliance Owner | | [ ] |
| E1–E10 re-execution complete | ___ | Technical Owner | | [ ] |
| Evidence package complete | ___ | Auditor | | [ ] |

### Final Production Pilot Sign-Offs

After staging execution:

| Role | Name | Decision | Date | Comments |
|---|---|---|---|---|
| Compliance Owner | ___ | ___ | | |
| Legal Reviewer | ___ | ___ | | |
| Compliance Approver | ___ | ___ | | |
| Auditor | ___ | ___ | | |
| Technical Owner | ___ | ___ | | |
| Business Sponsor | ___ | ___ | | |

---

## J. Rollback / Containment Plan

### Immediate Rollback (< 5 minutes)

| Step | Action | Owner |
|---|---|---|
| 1 | Set `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false` | Platform Admin |
| 2 | Restart application | Platform Admin |
| 3 | Verify POST to `/api/ai/citation-suggestions/generate` returns 503 `FEATURE_DISABLED` | Platform Admin |

### Full Containment (< 30 minutes)

| Step | Action | Owner |
|---|---|---|
| 1 | Set `AI_PROVIDER=none` | Platform Admin |
| 2 | Remove pilot users from `compliance-editors` IdP group | Compliance Owner |
| 3 | Verify existing pages function normally | Platform Admin |
| 4 | Document incident in Issues/Deviations log | Technical Owner |

### Data Preservation

- Audit events are **immutable** — cannot be deleted (`assertAppendOnly`)
- Report snapshots are **immutable** — cannot be deleted
- Version history records are **immutable** — cannot be deleted
- Existing draft changes can be **individually rejected** via the review workflow
- AI suggestion records persist for traceability — no bulk deletion mechanism

### Escalation Path

| Severity | Contact | Response Time |
|---|---|---|
| Critical (data integrity, unauthorized access) | Technical Owner + Compliance Owner | Immediate |
| High (AI quality, RBAC issue) | Technical Owner | < 1 hour |
| Medium (UI issue, non-blocking) | Technical Owner | < 4 hours |
| Low (documentation, cosmetic) | Technical Owner | Next business day |

**Reference:** [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) — Section 18: AI Feature Flag / Rollback Procedure

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | Staging pilot execution plan created | 3.12 |

---

> **Governance Notice:** This staging plan does not authorize production deployment. Production pilot requires successful staging execution, complete evidence package, and all sign-offs. Any expansion of AI capabilities beyond citation suggestions requires formal amendment to PROJECT_CONTROL_BASELINE.md.
