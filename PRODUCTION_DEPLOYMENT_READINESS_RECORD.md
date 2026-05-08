# Production Deployment Readiness Record

> **Phase 4.3 — Production Deployment Preparation**
>
> **Date:** 2026-05-07
> **Prepared By:** Brian Adams (Technical Owner)
> **Purpose:** Document production deployment readiness and environment verification

---

## A. Executive Summary

Phase 4.3 resolves all pre-rollout remediation items identified during the Phase 4.2 retrospective. The four required documentation items (OPS-01, OPS-02, GOV-02, GOV-03) have been addressed — OPS-01 and OPS-02 are delivered as `API_FIELD_GUIDE.md` and `ENDPOINT_REFERENCE.md`; GOV-02 and GOV-03 require deployment-time configuration changes that are documented and ready for execution.

The application has passed all pre-deployment verification checks in the current staging environment. Production deployment readiness is confirmed, subject to deployment-time resolution of launch conditions LC1 (demo auth disable) and LC2 (OIDC e2e verification).

**Production Deployment Decision: READY — Pending Deployment-Time Configuration**

---

## B. Graduation Conditions

| # | Condition | Owner | Evidence Required | Status | Blocking | Target |
|---|---|---|---|---|---|---|
| GC-1 | `DEMO_AUTH_ENABLED=false` | Technical Owner | Production env variable | ⏳ At deployment | Yes — for production | Deployment day |
| GC-2 | OIDC end-to-end verified | Technical Owner | Production login screenshot | ⏳ At deployment | Yes — for production | Deployment day |
| GC-3 | 4 stakeholder sign-offs | All stakeholders | Signed briefing package | ⏳ Pending briefing | Yes — for multi-user | Pre-multi-user |
| GC-4 | 1 additional publication (total 3) | Pilot operator | Publication event ID | ⏳ Pending | No — can complete post-deploy | Post-deploy |
| GC-5 | 1 multi-user session | Technical Owner + 1 | Session evidence | ⏳ Pending | No — required for graduation | Post-deploy |

**Graduation readiness: 0/5 complete — all in progress or pending deployment**

---

## C. Pre-Rollout Required Items

| ID | Item | Source | Status | Deliverable |
|---|---|---|---|---|
| OPS-01 | API field reference guide | LL-01 | ✅ **COMPLETE** | [API_FIELD_GUIDE.md](API_FIELD_GUIDE.md) |
| OPS-02 | API endpoint path documentation | LL-02 | ✅ **COMPLETE** | [ENDPOINT_REFERENCE.md](ENDPOINT_REFERENCE.md) |
| GOV-02 | `DEMO_AUTH_ENABLED=false` | LC1 | ⏳ **AT DEPLOYMENT** | Environment variable toggle |
| GOV-03 | OIDC end-to-end verification | LC2 | ⏳ **AT DEPLOYMENT** | Production callback + login test |

**Documentation remediation: 2/2 complete. Deployment-time items: 2 pending (by design).**

---

## D. Deployment Environment Requirements

| Requirement | Staging (Current) | Production (Required) | Status |
|---|---|---|---|
| Node.js | 18+ | 18+ | ✅ Same |
| Database | Neon PostgreSQL | Neon PostgreSQL | ✅ Same |
| AI Provider | Azure OpenAI | Azure OpenAI | ✅ Same |
| Auth | Demo + OIDC config | OIDC only | ⏳ Toggle at deploy |
| Domain | localhost:3000 | Production URL | ⏳ Configure at deploy |
| HTTPS | N/A (localhost) | Required (HSTS) | ⏳ Platform-provided |

---

## E. Environment Variable Checklist

### Server-Side Variables (Required)

| Variable | Value | Status |
|---|---|---|
| `DATA_SOURCE` | `database` | ✅ Set |
| `DATABASE_URL` | `[Neon connection string]` | ✅ Set (server-only) |
| `AUTH_SECRET` | `[random secret]` | ✅ Set (server-only) |
| `AUTH_URL` | `https://[production-domain]` | ⏳ Update at deploy |
| `AUTH_OIDC_ISSUER` | `https://accounts.google.com` | ✅ Set |
| `AUTH_OIDC_ID` | `[Google OAuth client ID]` | ✅ Set (server-only) |
| `AUTH_OIDC_SECRET` | `[Google OAuth secret]` | ✅ Set (server-only) |
| `AI_PROVIDER` | `azure_openai` | ✅ Set |
| `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` | `true` | ✅ Set |
| `AZURE_OPENAI_API_KEY` | `[Azure key]` | ✅ Set (server-only) |
| `AZURE_OPENAI_ENDPOINT` | `[Azure endpoint]` | ✅ Set (server-only) |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4.1-mini` | ✅ Set |
| `DEMO_AUTH_ENABLED` | `false` | ⏳ **Must change from `true` to `false`** |

### Client-Side Variables (Safe to Expose)

| Variable | Value | Status |
|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `database` | ✅ Set |

### Prohibited Client-Side Variables (Must NOT Exist)

| Variable | Status |
|---|---|
| `NEXT_PUBLIC_DATABASE_URL` | ✅ Not present |
| `NEXT_PUBLIC_AUTH_SECRET` | ✅ Not present |
| `NEXT_PUBLIC_AUTH_OIDC_SECRET` | ✅ Not present |
| `NEXT_PUBLIC_AZURE_OPENAI_API_KEY` | ✅ Not present |
| `NEXT_PUBLIC_AI_PROVIDER` | ✅ Not present |

---

## F. OIDC End-to-End Verification

| Check | Staging Status | Production Requirement |
|---|---|---|
| OIDC issuer configured | ✅ `https://accounts.google.com` | Same |
| OIDC client ID configured | ✅ Set | Same |
| OIDC client secret configured | ✅ Set | Same |
| `AUTH_URL` matches domain | ⚠ `http://localhost:3000` | ⏳ Must update to production URL |
| Google OAuth redirect URI | ⚠ localhost only | ⏳ Must add production callback |
| End-to-end login test | ⚠ Not possible on localhost without redirect | ⏳ Verify at deployment |

**OIDC Action Items:**
1. Update `AUTH_URL` to production domain (e.g., `https://compliance.example.com`)
2. Add production callback URL to Google OAuth console
3. Verify end-to-end login with real Google account
4. Confirm session persistence and role assignment

---

## G. Demo Auth Disable Verification

| Check | Current | Required | Action |
|---|---|---|---|
| `DEMO_AUTH_ENABLED` | `true` | `false` | Set to `false` in production env |
| Demo login endpoint | Active | Must return 503 | Verified by env flag |
| OIDC-only login | Bypassed by demo | Must be sole auth path | Verified by env flag |

**Verification steps at deployment:**
1. Set `DEMO_AUTH_ENABLED=false` in production environment
2. Attempt `POST /api/auth/demo-login` — expect 403 or 503
3. Verify OIDC login is the only available authentication path
4. Document with screenshot evidence

---

## H. Azure OpenAI Runtime Verification

| Check | Status | Evidence |
|---|---|---|
| `AI_PROVIDER` | `azure_openai` | ✅ Verified |
| `AZURE_OPENAI_ENDPOINT` | Set | ✅ Server-side only |
| `AZURE_OPENAI_API_KEY` | Set | ✅ Server-side only |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4.1-mini` | ✅ Verified |
| Runtime generation test | Passed (Day-1) | ✅ `AIS-movyw6mv-mc4u` generated |
| Provider error handling | 502 handled (Day-4) | ✅ Non-blocking |
| AI disclaimer on output | Present | ✅ Verified |

---

## I. Database Backup Verification

| Check | Status |
|---|---|
| Neon continuous snapshots | ✅ Platform-managed |
| Point-in-time recovery | ✅ Available |
| Pre-deployment backup | ⏳ Take before production deploy |
| Backup restoration tested | ⏳ Verify at deployment |

---

## J. Predeploy Result

```
✓ All predeploy checks passed.
Passed with 2 warning(s).
✓ Smoke test
Exit code: 0
```

**Predeploy: ✅ PASS**

---

## K. Secret Exposure Result

| Secret | Exposed? | Status |
|---|---|---|
| `NEXT_PUBLIC_DATABASE_URL` | No | ✅ |
| `NEXT_PUBLIC_AUTH_SECRET` | No | ✅ |
| `NEXT_PUBLIC_AUTH_OIDC_SECRET` | No | ✅ |
| `NEXT_PUBLIC_AZURE_OPENAI_API_KEY` | No | ✅ |
| `NEXT_PUBLIC_AI_PROVIDER` | No | ✅ |

**Secret exposure: 0/5 — ✅ PASS**

---

## L. Audit Integrity Result

| Metric | Value |
|---|---|
| Total events | 100 |
| Verified | 100 |
| Failed | 0 |
| Integrity | **PASS** |

---

## M. Production Deployment Decision

| Field | Value |
|---|---|
| **Decision** | **READY — Pending Deployment-Time Configuration** |
| **Decision Date** | 2026-05-07 |
| **Decision Authority** | Brian Adams (Technical Owner) |
| **Predeploy** | ✅ PASS |
| **Secret exposure** | ✅ 0/5 |
| **Audit integrity** | ✅ 100/100 |
| **Documentation remediation** | ✅ 2/2 complete (OPS-01, OPS-02) |
| **Deployment-time items** | ⏳ 2 pending (GOV-02, GOV-03) |
| **Graduation conditions** | ⏳ 0/5 — all pending deployment or post-deployment |

### Deployment Day Checklist

1. ☐ Set `DEMO_AUTH_ENABLED=false` in production environment
2. ☐ Set `AUTH_URL` to production domain URL
3. ☐ Add production callback URL to Google OAuth console
4. ☐ Deploy application
5. ☐ Verify OIDC end-to-end login
6. ☐ Verify demo login is disabled (expect 403/503)
7. ☐ Verify AI generation works
8. ☐ Verify audit integrity
9. ☐ Take database backup snapshot
10. ☐ Document all results in deployment evidence record

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Production deployment readiness record created | System |
| 2026-05-07 | Phase 4.4: OIDC variable names corrected to `AUTH_OIDC_ID`/`AUTH_OIDC_SECRET` (per `auth.config.ts`). Deployment execution record created: [PRODUCTION_DEPLOYMENT_EXECUTION_RECORD.md](PRODUCTION_DEPLOYMENT_EXECUTION_RECORD.md). Decision: READY WITH CONDITIONS. | System |
| 2026-05-07 | Phase 4.5: Deployment day record created: [PRODUCTION_DEPLOYMENT_DAY_RECORD.md](PRODUCTION_DEPLOYMENT_DAY_RECORD.md). 4th consecutive predeploy PASS. Decision: ACTIVATE WITH CONDITIONS. 11 activation conditions documented. | System |
| 2026-05-07 | Phase 4.5.1: Condition closure. 5th predeploy PASS. 2/11 closed (config). 9 open (operational). All dev work complete. See [PRODUCTION_ACTIVATION_CONDITION_CLOSURE_RECORD.md](PRODUCTION_ACTIVATION_CONDITION_CLOSURE_RECORD.md). | System |
| 2026-05-07 | Phase 4.5.2: Production hosting deployed to Vercel. 6th predeploy PASS. OIDC e2e verified. 9/11 conditions closed. Decision: HOSTING VERIFIED WITH CONDITIONS. See [PRODUCTION_HOSTING_DEPLOYMENT_RECORD.md](PRODUCTION_HOSTING_DEPLOYMENT_RECORD.md). | System |

---

> **Governance Notice:** This record documents production deployment readiness. It does not authorize scope expansion, feature additions, or AI capability broadening. Deployment must follow the checklist in Section M.
