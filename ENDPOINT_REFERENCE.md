# Endpoint Reference

> **Phase 4.3 — Operator Reference (OPS-02)**
>
> **Created:** 2026-05-07
> **Source:** Phase 4.1 Pilot Lessons Learned (LL-02)
> **Purpose:** Complete API endpoint path reference for pilot operators

---

## Quick Reference: Governance Workflow Path

```
POST /api/ai/citation-suggestions/generate          → AI suggestion created
POST /api/ai/suggestions/[id]/accept-to-draft        → Draft change created
POST /api/validation/drafts/[draftId]/reviews         → Validation review created
PATCH /api/validation/reviews/[id]                    → Assessment updated
PATCH /api/validation/reviews/[id]/status             → Status transition
POST /api/review/approval-reviews                     → Approval review created
PATCH /api/review/approval-reviews/[id]/decision      → Decision recorded
GET /api/publishing/draft-changes/[id]/publish/validate → Pre-publish check
POST /api/publishing/draft-changes/[id]/publish       → Published
```

---

## 1. AI Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| POST | `/api/ai/citation-suggestions/generate` | `ai.suggestion.generate` | 200 | 400, 403, 409, 502, 503 | Generates citation suggestions from source text |
| GET | `/api/ai/suggestions` | `ai.suggestion.read` | 200 | 403 | List all suggestions |
| GET | `/api/ai/suggestions/[id]` | `ai.suggestion.read` | 200 | 403, 404 | Get suggestion by ID |
| PATCH | `/api/ai/suggestions/[id]/review` | `ai.suggestion.review` | 200 | 400, 403, 404 | Reject, expire, mark for review |
| POST | `/api/ai/suggestions/[id]/accept-to-draft` | `ai.suggestion.accept` | 200 | 400, 403, 404, 409 | Convert suggestion → draft |
| GET | `/api/ai/suggestions/metrics` | `ai.suggestion.read` | 200 | 403 | Suggestion metrics |
| GET | `/api/ai/prompts` | `ai.prompt.read` | 200 | 403 | Prompt template management |

> [!IMPORTANT]
> Generation requires `ai.suggestion.generate` permission. Viewer role does NOT have this permission (returns 403).

---

## 2. Source Registry Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/sources/registry` | `source.read` | 200 | 403 | List registered sources |
| GET | `/api/sources/registry/[id]` | `source.read` | 200 | 403, 404 | Get source by ID |
| POST | `/api/sources/registry` | `source.create` | 201 | 400, 403 | Register new source |
| PATCH | `/api/sources/registry/[id]/status` | `source.update` | 200 | 400, 403, 404 | Update source status |
| POST | `/api/sources/registry/[id]/validate` | `source.validate` | 200 | 400, 403, 404 | Trigger validation |
| GET | `/api/sources/registry/[id]/files` | `source.read` | 200 | 403, 404 | List source files |
| POST | `/api/sources/registry/[id]/files` | `source.update` | 201 | 400, 403 | Upload source file |
| GET | `/api/sources/registry/[id]/checklist` | `source.read` | 200 | 403, 404 | Source validation checklist |

---

## 3. Source Intake Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/sources/intake` | `intake.read` | 200 | 403 | List intake requests |
| GET | `/api/sources/intake/[id]` | `intake.read` | 200 | 403, 404 | Get intake by ID |
| POST | `/api/sources/intake` | `intake.create` | 201 | 400, 403 | Create intake request |
| PATCH | `/api/sources/intake/[id]/status` | `intake.update` | 200 | 400, 403, 404 | Update intake status |
| POST | `/api/sources/intake/[id]/convert-to-source-record` | `intake.convert` | 200 | 400, 403, 409 | Convert intake → source |

---

## 4. Validation Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/validation/drafts` | `validation.read` | 200 | 403 | List drafts with validation status |
| GET | `/api/validation/drafts/[id]` | `validation.read` | 200 | 403, 404 | Get draft with validation detail |
| POST | `/api/validation/drafts/[draftId]/reviews` | `validation.review` | 201 | 403, 404 | **Create** validation review for a draft |
| GET | `/api/validation/reviews/[id]` | `validation.read` | 200 | 403, 404 | Get validation review |
| PATCH | `/api/validation/reviews/[id]` | `validation.review` | 200 | 400, 403, 404 | Update assessment fields |
| PATCH | `/api/validation/reviews/[id]/status` | `validation.review` | 200 | 400, 403, 404, 422 | Change validation status |

> [!WARNING]
> **Validation review creation is at `/api/validation/drafts/[draftId]/reviews`** (nested under the draft), NOT at `/api/validation/reviews` (which does not accept POST). This was a source of confusion during the pilot (LL-02).

---

## 5. Review / Approval Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/review/approval-reviews` | `reference.read` | 200 | 403 | List approval reviews |
| POST | `/api/review/approval-reviews` | `reference.approve` | 201 | 400, 403 | Create approval review |
| GET | `/api/review/approval-reviews/[id]` | `reference.read` | 200 | 403, 404 | Get approval review |
| PATCH | `/api/review/approval-reviews/[id]/decision` | `reference.approve` | 200 | 400, 403, 404 | Record approval decision |

---

## 6. Publishing Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/publishing/publishable-drafts` | `reference.publish` | 200 | 403 | List drafts ready to publish |
| GET | `/api/publishing/draft-changes/[id]/publish/validate` | `reference.publish` | 200 | 403, 404 | Pre-publish precondition check (7 gates) |
| POST | `/api/publishing/draft-changes/[id]/publish` | `reference.publish` | 200 | 400, 403, 404, 422 | Execute controlled publish |
| GET | `/api/publishing/history` | `reference.read` | 200 | 403 | Publication event history |

> [!IMPORTANT]
> Always call `/publish/validate` before `/publish` to verify all 7 preconditions are met.

---

## 7. Version History Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/version-history` | `reference.read` | 200 | 403 | Version history listing |
| GET | `/api/version-history/as-of` | `reference.read` | 200 | 403 | As-of date query |

---

## 8. Audit / Report Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| GET | `/api/audit/verify-integrity` | `audit.read` | 200 | 403 | Verify audit trail integrity |
| GET | `/api/reports/snapshots` | `report.read` | 200 | 403 | List report snapshots |
| POST | `/api/reports/snapshots` | `report.create` | 201 | 400, 403 | Create report snapshot |
| GET | `/api/reports/compliance-map` | `report.read` | 200 | 403 | Compliance map report |

---

## 9. Authentication Endpoints

| Method | Path | Permission | Success | Errors | Notes |
|---|---|---|---|---|---|
| POST | `/api/auth/demo-login` | None | 200 | 400 | Demo auth only (staging) |
| GET | `/api/auth/session` | None | 200 | — | Get current session |
| GET | `/api/auth/[...nextauth]` | None | 200 | — | NextAuth OIDC handlers |

> [!CAUTION]
> `demo-login` must be disabled in production (`DEMO_AUTH_ENABLED=false`). In production, only OIDC login via `/api/auth/[...nextauth]` is permitted.

---

## Governance Boundary Notes

| Boundary | Enforcement |
|---|---|
| No direct active reference mutation | No PUT/PATCH endpoint exists for published references (404) |
| Controlled publishing only | All new references created through `/publish` workflow |
| RBAC on every endpoint | 403 for unauthorized roles |
| Source validation gate | Generation blocked for unregistered/invalid sources (409) |
| Terminal state enforcement | Accept-to-draft blocked for rejected/expired suggestions (409) |
| Precondition gates | Validation status blocked without assessments (422) |
| Duplicate prevention | Re-accept and re-publish blocked (409/422) |

---

> **Governance Notice:** This document provides endpoint path reference only. It does not authorize scope expansion or new endpoints. All operations remain within PROJECT_CONTROL_BASELINE.md boundaries.
