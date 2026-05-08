# Staging Environment Validation Checklist

> **Phase 3.12 — Pre-Execution Environment Verification**
>
> Complete all checks before beginning E1–E10 staging execution.

---

## Core Application

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | `DATA_SOURCE` | `database` | | [ ] |
| 2 | `NEXT_PUBLIC_DATA_SOURCE` | `database` | | [ ] |
| 3 | `DEMO_AUTH_ENABLED` | `false` | | [ ] |
| 4 | `DATABASE_URL` | PostgreSQL connection string | | [ ] |
| 5 | Database migrations applied | No errors | | [ ] |
| 6 | Database is staging-isolated | Not shared with production | | [ ] |
| 7 | No seed data applied | `db:seed` NOT run | | [ ] |

## OIDC Authentication

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 8 | `AUTH_SECRET` | 32+ random characters | | [ ] |
| 9 | `NEXTAUTH_URL` / `AUTH_URL` | Staging HTTPS URL | | [ ] |
| 10 | `AUTH_OIDC_ISSUER` | IdP issuer URL | | [ ] |
| 11 | `AUTH_OIDC_ID` | OIDC client ID | | [ ] |
| 12 | `AUTH_OIDC_SECRET` | OIDC client secret (server-only) | | [ ] |
| 13 | OIDC callback registered | `{URL}/api/auth/callback/oidc` | | [ ] |
| 14 | `AUTH_GROUP_ROLE_MAP` | Valid JSON | | [ ] |
| 15 | OIDC login test | User authenticates via IdP | | [ ] |
| 16 | Demo login blocked | 403 or not found | | [ ] |
| 17 | Session identity | Name, email, roles from IdP | | [ ] |

## Azure OpenAI

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 18 | `AI_PROVIDER` | `azure_openai` | | [ ] |
| 19 | `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` | `true` | | [ ] |
| 20 | `AZURE_OPENAI_ENDPOINT` | Azure endpoint URL | | [ ] |
| 21 | `AZURE_OPENAI_API_KEY` | API key (server-only) | | [ ] |
| 22 | `AZURE_OPENAI_DEPLOYMENT` | Model deployment name | | [ ] |
| 23 | `AI_REQUIRE_SOURCE_RECORD_VALIDATED` | `true` | | [ ] |
| 24 | `AI_MAX_SOURCE_CHARS` | `12000` | | [ ] |
| 25 | `AI_REQUEST_TIMEOUT_MS` | `30000` | | [ ] |
| 26 | Azure endpoint reachable | Outbound HTTPS OK | | [ ] |

## Secret Exposure Prevention

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 27 | `NEXT_PUBLIC_AI_*` variables | **None** | | [ ] |
| 28 | `NEXT_PUBLIC_AZURE_OPENAI_*` variables | **None** | | [ ] |
| 29 | `NEXT_PUBLIC_AUTH_SECRET` | **Does not exist** | | [ ] |
| 30 | `npm run predeploy` | Pass (79 routes, 0 errors) | | [ ] |

## Application Health

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 31 | `npm run build` | 79 routes, 0 TS errors | | [ ] |
| 32 | Root URL | 200 OK | | [ ] |
| 33 | `/ai-suggestions` | 200 OK | | [ ] |
| 34 | `/draft-mapping` | 200 OK | | [ ] |
| 35 | `/review-approval` | 200 OK | | [ ] |
| 36 | `/validation-workbench` | 200 OK | | [ ] |
| 37 | `/source-registry` | 200 OK | | [ ] |
| 38 | `/version-history` | 200 OK | | [ ] |
| 39 | `/reports` | 200 OK | | [ ] |

## Smoke Tests

| # | Check | Expected | Actual | Status |
|---|---|---|---|---|
| 40 | Citation generation endpoint | 200 (not 503) | | [ ] |
| 41 | Generated suggestions type | `citation` | | [ ] |
| 42 | `legalReviewRequired` | `true` | | [ ] |
| 43 | AI disclaimer in responses | Present | | [ ] |
| 44 | Audit events created | Visible in API | | [ ] |

## Summary

| Category | Items | Passed | Failed |
|---|---|---|---|
| Core Application | 7 | | |
| OIDC Authentication | 10 | | |
| Azure OpenAI | 9 | | |
| Secret Prevention | 4 | | |
| Application Health | 9 | | |
| Smoke Tests | 5 | | |
| **Total** | **44** | | |

**Validated By:** ___ **Date:** ___ **Decision:** ___ PROCEED / BLOCK ___

---

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | Created | 3.12 |
