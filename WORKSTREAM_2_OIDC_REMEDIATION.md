# Workstream 2: OIDC / Authentication — Remediation Record

> **Phase 3.12 — Staging Environment Remediation**
>
> **Workstream:** OIDC / Authentication
> **Owner:** Technical Owner
> **Status:** ✅ COMPLETE WITH PENDING STAGING HTTPS
> **Date:** 2026-05-07
> **Depends On:** Workstream 1 (Database) ✅ Complete

---

## A. Provider Decision

| Field | Value |
|---|---|
| **Selected Provider** | Google (Generic OIDC) |
| **Rationale** | User has active Google Workspace; app uses generic OIDC provider (`type: 'oidc'` in `auth.config.ts`) compatible with any OIDC-compliant IdP |
| **Alternative Providers** | Microsoft Entra ID, Okta, Auth0 — any standard OIDC issuer will work |
| **Tenant / Organization** | User's Google Workspace domain |
| **App Registration Name** | `compliance-explorer-staging` |
| **Registration Console** | [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) |
| **Technical Owner** | Technical Owner |
| **Registration Date** | 2026-05-07 |

### Provider Requirements

The app's `auth.config.ts` (line 46–71) configures a generic OIDC provider requiring:
- `AUTH_OIDC_ISSUER` — OIDC discovery URL (e.g., `https://accounts.google.com`)
- `AUTH_OIDC_ID` — OAuth 2.0 Client ID
- `AUTH_OIDC_SECRET` — OAuth 2.0 Client Secret

The `group-mapping.ts` maps IdP groups → RBAC roles. For Google, the groups claim (`AUTH_GROUPS_CLAIM`) may need to be set to a custom claim or handled via Google Workspace Directory API.

> [!NOTE]
> Google OIDC does not include group membership in the standard ID token by default. For the staging pilot, the default role (`viewer`) plus `AUTH_GROUP_ROLE_MAP` environment variable override is sufficient. Full group-based RBAC requires either:
> - Google Workspace Admin SDK integration, or
> - `AUTH_GROUP_ROLE_MAP` JSON override mapping individual users to roles

---

## B. App Registration Steps

### Google Cloud Console Registration

1. Navigate to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Set Application Type: **Web application**
4. Set Name: `compliance-explorer-staging`
5. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/oidc` (local validation)
   - `https://<staging-domain>/api/auth/callback/oidc` (staging deployment — add later)
6. Click **Create**
7. Copy **Client ID** and **Client Secret**
8. Ensure the project has the **Google Identity** / **OpenID Connect** API enabled

### OIDC Discovery Endpoint

Google's OIDC discovery document:
```
https://accounts.google.com/.well-known/openid-configuration
```

This provides:
- `authorization_endpoint`
- `token_endpoint`
- `userinfo_endpoint`
- `jwks_uri`

Auth.js auto-discovers these from the `issuer` value.

---

## C. Environment Variables to Configure

### Required Variables

| Variable | Value | Scope | Purpose |
|---|---|---|---|
| `DEMO_AUTH_ENABLED` | `false` | Server | Disable demo cookie auth |
| `AUTH_SECRET` | `<generated 32+ byte base64>` | Server only | JWT encryption for Auth.js |
| `AUTH_URL` | `http://localhost:3000` | Server | Auth.js base URL (for callback resolution) |
| `AUTH_OIDC_ISSUER` | `https://accounts.google.com` | Server only | OIDC discovery issuer |
| `AUTH_OIDC_ID` | `<client ID from Google Console>` | Server only | OAuth 2.0 client ID |
| `AUTH_OIDC_SECRET` | `<client secret from Google Console>` | Server only | OAuth 2.0 client secret |

### Optional Variables

| Variable | Value | Scope | Purpose |
|---|---|---|---|
| `AUTH_GROUPS_CLAIM` | `groups` (default) | Server only | OIDC claim name for group membership |
| `AUTH_GROUP_ROLE_MAP` | JSON string | Server only | Override group→role mapping |

### Staging Role Override (Google workaround)

Since Google OIDC does not emit a `groups` claim by default, use `AUTH_GROUP_ROLE_MAP` to assign pilot roles by email domain or configure a manual mapping:

```env
AUTH_GROUP_ROLE_MAP={"Compliance-Editors":"compliance_editor","Legal-Reviewers":"legal_reviewer","Compliance-Approvers":"compliance_approver","Compliance-Auditors":"auditor"}
```

Or for the staging pilot, the user authenticating will default to `viewer` role unless group claims are present. Roles can be assigned post-login via the NAMED_PARTICIPANT_ACCESS_MATRIX in Workstream 4.

---

## D. Secret Exposure Checks

The `env.ts` validation (lines 105–122) enforces these guards:

| Check | Guard | Status |
|---|---|---|
| `NEXT_PUBLIC_AUTH_SECRET` | Error if set (line 105–109) | Code-verified ✅ |
| `NEXT_PUBLIC_AUTH_OIDC_SECRET` | Error if set (line 111–115) | Code-verified ✅ |
| `NEXT_PUBLIC_AUTH_OIDC_ID` | Error if set (line 117–121) | Code-verified ✅ |
| `AUTH_SECRET` required when `DEMO_AUTH_ENABLED=false` | Error if missing (line 153–159) | Code-verified ✅ |
| `AUTH_OIDC_*` required when `DEMO_AUTH_ENABLED=false` | Error if missing (line 161–168) | Code-verified ✅ |

**All five client-exposure guards are present in source code. No secrets can leak to client bundle.**

---

## E. Callback URL Configuration

| Environment | Callback URL | Status |
|---|---|---|
| Local validation | `http://localhost:3000/api/auth/callback/oidc` | ✅ Verified |
| Staging deployment | `https://<staging-domain>/api/auth/callback/oidc` | ⚠ Pending domain |

The callback route is handled by the Auth.js catch-all at `src/app/api/auth/[...nextauth]/route.ts`.

---

## F. Auth Architecture Summary

### How Auth Mode Switching Works

```
DEMO_AUTH_ENABLED=false  →  Auth.js OIDC mode
  ├── isDemoAuthActive() returns false
  ├── getCurrentSession() reads from AsyncLocalStorage (OIDC JWT)
  ├── resolveSession() calls Auth.js auth() → stores in ALS
  ├── Demo role switcher hidden (demoAuthEnabled=false)
  └── Demo login endpoint returns 403/error

DEMO_AUTH_ENABLED=true   →  Demo cookie mode (current)
  ├── isDemoAuthActive() returns true (dev default)
  ├── getCurrentSession() reads demo cookie → DemoUser
  ├── resolveSession() is a no-op (sync cookie always available)
  ├── Demo role switcher visible
  └── Demo login endpoint accepts POST with role
```

### SessionUser Interface (session.ts:35–45)

```typescript
interface SessionUser {
  id: string;          // OIDC sub claim or demo user ID
  name: string;        // User display name
  email: string;       // User email
  roles: RoleId[];     // Mapped from OIDC groups or demo user config
  demoUser: boolean;   // false for OIDC, true for demo
  provider: 'demo' | 'oidc';
  providerSubject?: string;  // OIDC sub (audit traceability)
}
```

---

## G. `.env.local` Update Template

After Google OIDC app registration, update `.env.local`:

```env
# Core Application (Workstream 1 — complete)
DATA_SOURCE=database
NEXT_PUBLIC_DATA_SOURCE=database
DATABASE_URL=<already configured>

# Authentication (Workstream 2 — OIDC mode)
DEMO_AUTH_ENABLED=false
AUTH_SECRET=<generated value — do not commit>
AUTH_URL=http://localhost:3000
AUTH_OIDC_ISSUER=https://accounts.google.com
AUTH_OIDC_ID=<client ID from Google Console>
AUTH_OIDC_SECRET=<client secret from Google Console>

# AI — staging (Workstream 3 — pending)
AI_PROVIDER=none
AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false
```

---

## H. Verification Steps

### Step 1: Pre-flight Checks

```bash
npm run predeploy
```

Expected output changes:
- ~~"Demo auth active"~~ → "Auth provider: oidc"
- ~~"OIDC credentials not configured"~~ → OIDC credential check passes
- `AUTH_SECRET` check passes

### Step 2: Build Verification

```bash
npm run build
```

Must complete with 0 errors. OIDC provider is only instantiated when credentials are set.

### Step 3: Login Flow Test

```bash
npm run dev
# Navigate to http://localhost:3000
# Click Sign In
# Google OAuth consent screen appears
# Authenticate with Google account
# Redirected back to app with session
```

### Step 4: Session Verification

After login, verify session contains:
- `email` — from Google profile
- `name` — from Google profile
- `demoUser: false` — OIDC session
- `provider: 'oidc'` — not demo
- `roles: ['viewer']` — default role (no groups claim from Google)
- `providerSubject` — Google sub claim

### Step 5: Demo Auth Disabled

- Demo role switcher component not visible
- `POST /api/auth/demo-login` returns error (demo auth not active)
- `DemoAuthWarningBanner` not visible

---

## I. Validation Items Covered

| ID | Description | Evidence Required | Status |
|---|---|---|---|
| ENV-03 | `DEMO_AUTH_ENABLED=false` | Predeploy confirms | ✅ Pass |
| ENV-05 | `AUTH_SECRET` configured | Predeploy check passes | ✅ Pass |
| ENV-06 | `AUTH_URL` configured | Auth.js resolves correctly | ✅ Pass |
| ENV-07 | `AUTH_OIDC_ISSUER` configured | OIDC discovery works | ✅ Pass |
| ENV-08 | `AUTH_OIDC_ID` configured | OAuth consent screen loads | ✅ Pass |
| ENV-09 | `AUTH_OIDC_SECRET` (server-only) | No client-side leak | ✅ Pass |
| OIDC-01 | OIDC app registered in IdP | Google Console shows app | ✅ Pass |
| OIDC-02 | Callback URL registered | `localhost:3000/api/auth/callback/oidc` | ✅ Pass (staging HTTPS pending) |
| OIDC-03 | OIDC login test | User redirects to Google and returns | ✅ Pass (local) |
| OIDC-04 | Demo login blocked | Demo auth no longer the active auth path | ✅ Pass |
| OIDC-05 | SessionUser maps email/name/sub | Session verified after login | ✅ Pass |

---

## J. Exit Criteria

| # | Criterion | Status |
|---|---|---|
| 1 | OIDC app registered in Google Console | ✅ Pass — registered 2026-05-07 |
| 2 | `DEMO_AUTH_ENABLED=false` verified | ✅ Pass — predeploy confirmed |
| 3 | `AUTH_SECRET` configured (32+ bytes) | ✅ Pass — rotated and configured |
| 4 | `AUTH_URL` configured | ✅ Pass — `http://localhost:3000` |
| 5 | `AUTH_OIDC_ISSUER` configured | ✅ Pass — `https://accounts.google.com` |
| 6 | `AUTH_OIDC_ID` configured | ✅ Pass — configured without `http://` prefix |
| 7 | `AUTH_OIDC_SECRET` configured (server-only) | ✅ Pass — server-side only |
| 8 | OIDC login flow works | ✅ Pass — local Google login verified |
| 9 | SessionUser contains email/name/sub/roles | ✅ Pass — session resolved after login |
| 10 | Demo role switcher disabled | ✅ Pass — no longer the active auth path |
| 11 | No OIDC secrets exposed client-side | ✅ Pass — code guards + runtime verified |
| 12 | `npm run predeploy` passes in OIDC mode | ✅ Pass |
| 13 | Staging HTTPS callback URL | ⚠ Pending — no staging domain yet |
| 14 | Technical Owner sign-off | Pending |

---

## K. Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| Technical Owner | ___ | ___ | Pending |

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| 2026-05-07 | OIDC remediation record created. Provider: Google OIDC. | 3.12 |
| 2026-05-07 | OIDC app registered in Google Console. All env vars configured. Local login verified. Status: COMPLETE WITH PENDING STAGING HTTPS. | 3.12 |
