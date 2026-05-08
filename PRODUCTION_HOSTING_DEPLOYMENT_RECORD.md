# Production Hosting Deployment Record

**Phase:** 4.5.2 — Production Hosting Provisioning and Deployment Verification  
**Date:** 2026-05-07  
**Classification:** Operational — Deployment Evidence  
**Status:** HOSTING VERIFIED WITH CONDITIONS

---

## A. Executive Hosting Summary

The Compliance Explorer has been successfully deployed to Vercel production hosting. The application is live at `https://compliance-explorer.vercel.app` with HTTPS enabled, all security headers verified, OIDC login working end-to-end, and demo authentication disabled. The deployment required 4 iterations to resolve environment variable piping issues (PowerShell stdin → Vercel CLI incompatibility) and an OIDC client secret rotation (Google Cloud Console no longer displays existing secrets). All issues were resolved without code changes.

**Hosting Decision:** HOSTING VERIFIED WITH CONDITIONS  
**Remaining Conditions:** Stakeholder sign-off and additional participant onboarding (personnel only)

---

## B. Hosting Platform

| Field | Value |
|---|---|
| Platform | **Vercel** |
| Account | idealsc |
| Project | idealscs-projects/compliance-explorer |
| Project ID | prj_Ylg9HtJCLvjuGcjiDVAXNcbL3iZt |
| Team ID | team_tq0zJNb2mjD4HrOsrrk1TVFP |
| Region | Washington, D.C., USA (East) — iad1 |
| Framework | Next.js 16.2.4 (Turbopack) |
| Build Configuration | 2 cores, 8 GB |
| Deployment Target | Production |

---

## C. Production Domain

| Field | Value |
|---|---|
| Production URL | **https://compliance-explorer.vercel.app** |
| Deployment URL | https://compliance-explorer-n6cbvwm3n-idealscs-projects.vercel.app |
| Deployment ID | dpl_9UUN2SE8njzMnEsJHemUpgUpfVHb |
| Inspector URL | https://vercel.com/idealscs-projects/compliance-explorer/9UUN2SE8njzMnEsJHemUpgUpfVHb |
| HTTPS | ✅ Enabled (Vercel-managed TLS) |
| HTTP → HTTPS Redirect | ✅ Automatic |
| Ready State | READY |
| Deployment Owner | idealsc |

---

## D. Deployment Timestamp

| Event | Timestamp |
|---|---|
| First deployment | 2026-05-07 18:18 EDT |
| Env var correction | 2026-05-07 18:50 EDT |
| OIDC secret rotation | 2026-05-07 19:09 EDT |
| **Final production deployment** | **2026-05-07 19:10 EDT** |
| OIDC login verified | 2026-05-07 19:11 EDT |

---

## E. Environment Variable Verification

### Production Variables (15 SET)

| Variable | Value / Status | Category |
|---|---|---|
| DATA_SOURCE | `database` | ✅ Data |
| NEXT_PUBLIC_DATA_SOURCE | `database` | ✅ Data |
| DATABASE_URL | `[148 chars, configured]` | ✅ Database |
| AI_PROVIDER | `azure_openai` | ✅ AI |
| AI_FEATURE_CITATION_SUGGESTIONS_ENABLED | `true` | ✅ AI |
| AZURE_OPENAI_ENDPOINT | `https://compliance-citation-ai.openai.azure.com/` | ✅ AI |
| AZURE_OPENAI_API_KEY | `[84 chars, configured]` | ✅ AI |
| AZURE_OPENAI_DEPLOYMENT | `gpt-4.1-mini` | ✅ AI |
| AZURE_OPENAI_API_VERSION | `2024-02-01` | ✅ AI |
| DEMO_AUTH_ENABLED | **`false`** | ✅ Auth |
| AUTH_SECRET | `[44 chars, configured]` | ✅ Auth |
| AUTH_URL | **`https://compliance-explorer.vercel.app`** | ✅ Auth |
| AUTH_OIDC_ISSUER | `https://accounts.google.com` | ✅ Auth |
| AUTH_OIDC_ID | `742929496052-itpc...apps.googleusercontent.com` | ✅ Auth |
| AUTH_OIDC_SECRET | `[35 chars, rotated 2026-05-07]` | ✅ Auth |

### Prohibited Variables (0 PRESENT — Verified)

| Variable | Status |
|---|---|
| NEXT_PUBLIC_DATABASE_URL | ✅ ABSENT |
| NEXT_PUBLIC_AUTH_SECRET | ✅ ABSENT |
| NEXT_PUBLIC_AUTH_OIDC_SECRET | ✅ ABSENT |
| NEXT_PUBLIC_AUTH_OIDC_ID | ✅ ABSENT |
| NEXT_PUBLIC_AZURE_OPENAI_API_KEY | ✅ ABSENT |
| NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT | ✅ ABSENT |
| NEXT_PUBLIC_AI_PROVIDER | ✅ ABSENT |
| NEXT_PUBLIC_AI_* (any) | ✅ ABSENT |

---

## F. OAuth Callback Registration

| Field | Value |
|---|---|
| OAuth Provider | Google Cloud (OIDC) |
| Client Name | compliance-explorer-staging |
| Client ID | 742929496052-itpcqrcces66tv4kl6bhns7osr611ttt.apps.googleusercontent.com |
| Production Callback | **https://compliance-explorer.vercel.app/api/auth/callback/oidc** |
| Development Callback | http://localhost:3000/api/auth/callback/oidc |
| Callback matches AUTH_URL | ✅ YES |
| Trailing slash mismatch | ✅ NO |
| Registration timestamp | 2026-05-07 18:23 EDT |
| Confirmation | Google Console — "OAuth client saved" toast confirmed |
| Secret Rotation | New client secret generated (Google no longer shows existing secrets) |
| Secret Rotation Time | 2026-05-07 19:08 EDT |
| Old Secret Status | Should be deleted after confirming new secret works |

---

## G. OIDC Login Verification

| Field | Value |
|---|---|
| Login Result | **✅ SUCCESS** |
| User Name | Brian Adams |
| User Email | keukajeep@gmail.com |
| User ID | da07723a-043f-4bd0-8404-719a31783a91 |
| demoUser | **false** |
| Roles | `["viewer"]` (default fallback — correct for no group claims) |
| Session Expiry | 2026-05-08T07:11:42.443Z (8-hour window) |
| Provider | Google OIDC |
| Callback URL Used | https://compliance-explorer.vercel.app/api/auth/callback/oidc |

### OIDC Session JSON (Production)
```json
{
  "user": {
    "name": "Brian Adams",
    "email": "keukajeep@gmail.com",
    "id": "da07723a-043f-4bd0-8404-719a31783a91",
    "roles": ["viewer"],
    "demoUser": false
  },
  "expires": "2026-05-08T07:11:42.443Z"
}
```

---

## H. Demo Auth Disabled Verification

| Check | Result |
|---|---|
| DEMO_AUTH_ENABLED env var | **`false`** |
| POST /api/auth/demo-login | **HTTP 403 — BLOCKED** |
| Demo user panel visible | **NO** |
| Demo role switcher visible | **NO** |
| demoUser in session | **false** |
| Demo-auth warning banner | **NOT PRESENT** |

---

## I. HTTPS / Security Header Verification

**Command:** `curl -I https://compliance-explorer.vercel.app`  
**Verification timestamp:** 2026-05-07 18:52 EDT

| Header | Value | Status |
|---|---|---|
| HTTPS | TLS 1.3 (Vercel-managed) | ✅ |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | ✅ |
| X-Content-Type-Options | `nosniff` | ✅ |
| X-Frame-Options | `DENY` | ✅ |
| Referrer-Policy | `strict-origin-when-cross-origin` | ✅ |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | ✅ |
| X-DNS-Prefetch-Control | `off` | ✅ |
| X-Powered-By | **SUPPRESSED** | ✅ |
| Content-Security-Policy | Not present (Vercel default) | ℹ Info |
| X-XSS-Protection | Not present (deprecated header) | ℹ Info |

**Security Header Score:** 7/7 critical headers verified, 0 defects

---

## J. Smoke / Predeploy Verification

### Predeploy (6th Consecutive PASS)

| Check | Result |
|---|---|
| Environment Validation | ✅ PASS |
| Secret Exposure (7 checks) | ✅ 0/7 leaks |
| OIDC Credential Check | ✅ PASS |
| TypeScript Type Check | ✅ PASS |
| Next.js Build | ✅ PASS (48 static, dynamic routes) |
| Smoke Test | ✅ PASS (2 warnings, non-blocking) |
| Overall | **✅ ALL PREDEPLOY CHECKS PASSED** |

### Vercel Build Verification

| Check | Result |
|---|---|
| npm install | ✅ 728 packages |
| Next.js compile | ✅ Compiled successfully (23.2s) |
| TypeScript | ✅ Passed (18.9s) |
| Static generation | ✅ 48/48 pages |
| Build time | ~55 seconds |

---

## K. Secret Exposure Verification

| Check | Result |
|---|---|
| NEXT_PUBLIC_DATABASE_URL in source | ✅ NOT FOUND |
| NEXT_PUBLIC_AUTH_SECRET in source | ✅ NOT FOUND |
| NEXT_PUBLIC_AUTH_OIDC_SECRET in source | ✅ NOT FOUND |
| NEXT_PUBLIC_AUTH_OIDC_ID in source | ✅ NOT FOUND |
| NEXT_PUBLIC_AZURE_OPENAI_API_KEY in source | ✅ NOT FOUND |
| NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT in source | ✅ NOT FOUND |
| NEXT_PUBLIC_AI_PROVIDER in source | ✅ NOT FOUND |
| **Total Secret Leaks** | **0/7** |

---

## L. Open Issues / Deviations

### Resolved During Deployment

| Issue | Resolution | Impact |
|---|---|---|
| PowerShell stdin piping incompatibility with `vercel env add` | Used Vercel REST API directly | No impact — env vars set correctly |
| Initial deployment used `.env.local` placeholder values | Re-set via REST API with correct values | 2 extra deployments required |
| Google Console no longer displays existing client secrets | Generated new OIDC client secret | Secret rotated — no impact |
| `.env.production` file created during troubleshooting | File exists in project root | Should be gitignored (non-sensitive values only) |

### Open (Non-Blocking)

| # | Issue | Severity | Notes |
|---|---|---|---|
| 1 | `.env.production` file in project root | Info | Contains non-secret production overrides only; add to `.gitignore` |
| 2 | Content-Security-Policy header not set | Info | Vercel default; can be added via `vercel.json` if needed |
| 3 | Old Google OAuth secret should be deleted | Info | After confirming new secret works in production |
| 4 | Vercel "middleware" deprecation warning | Info | Cosmetic; middleware functions correctly |

---

## M. Hosting Deployment Decision

### Decision: **HOSTING VERIFIED WITH CONDITIONS**

**Rationale:**
- ✅ Application deployed and reachable at production URL
- ✅ HTTPS enabled with HSTS preload
- ✅ 7/7 critical security headers verified
- ✅ OIDC end-to-end login verified (Brian Adams, demoUser=false)
- ✅ Demo authentication DISABLED (HTTP 403)
- ✅ 15/15 production env vars SET with correct values
- ✅ 0/7 prohibited NEXT_PUBLIC_* variables present
- ✅ 6th consecutive predeploy PASS
- ✅ OAuth production callback registered and verified
- ✅ Database connectivity verified via production deployment

**Remaining Conditions (Personnel Only):**
1. At least 1 additional stakeholder sign-off
2. At least 1 additional participant onboarded

**Code Changes Required:** 0

### Activation Condition Status

| # | Condition | Status | Phase Closed |
|---|---|---|---|
| AC-1 | Production domain | ✅ **CLOSED** | 4.5.2 |
| AC-2 | HTTPS | ✅ **CLOSED** | 4.5.2 |
| AC-3 | OAuth production callback | ✅ **CLOSED** | 4.5.2 |
| AC-4 | Production deployment | ✅ **CLOSED** | 4.5.2 |
| AC-5 | DEMO_AUTH_ENABLED=false | ✅ **CLOSED** | 4.5.1 (verified 4.5.2) |
| AC-6 | AUTH_URL production value | ✅ **CLOSED** | 4.5.1 (verified 4.5.2) |
| AC-7 | OIDC end-to-end login | ✅ **CLOSED** | 4.5.2 |
| AC-8 | Demo login disabled | ✅ **CLOSED** | 4.5.2 |
| AC-9 | Security headers verified | ✅ **CLOSED** | 4.5.2 |
| AC-10 | Stakeholder sign-off | ✅ **CLOSED** | 4.5.3 |
| AC-11 | Participant onboarding | ✅ **CLOSED** | 4.5.3 |

**Conditions Closed:** 11/11 (7 in Phase 4.5.2, 2 in Phase 4.5.1, 2 in Phase 4.5.3)  
**Conditions Open:** 0/11

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-05-07 | Production hosting deployment record created — HOSTING VERIFIED WITH CONDITIONS. 4 deployments. OIDC secret rotated. 9/11 conditions closed. | System |
| 2026-05-07 | Phase 4.5.3: AC-10 and AC-11 CLOSED. 11/11 conditions closed. Decision: ACTIVATE LIMITED MULTI-USER PILOT. See [MULTI_USER_PILOT_ACTIVATION_RECORD.md](MULTI_USER_PILOT_ACTIVATION_RECORD.md). | System |

---

> **Governance Notice:** This deployment record documents the production hosting verification performed under the governance boundaries defined in [PROJECT_CONTROL_BASELINE.md](PROJECT_CONTROL_BASELINE.md). All environment variables, security headers, and authentication configurations have been verified in production. No application code was modified during deployment.
