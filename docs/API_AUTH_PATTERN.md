# API Authentication Pattern — Developer Guide

> How API routes handle authentication in the Compliance Operating Map.

---

## Overview

The app supports two authentication modes:

| Mode | Trigger | Identity Source | Session Type |
|---|---|---|---|
| **Demo** | `DEMO_AUTH_ENABLED=true` (default) | Cookie (`compliance-demo-user`) | Synchronous, plain-text |
| **OIDC** | `DEMO_AUTH_ENABLED=false` | Auth.js JWT (encrypted) | Async → sync bridge |

All API routes, RBAC helpers, and service functions use a **synchronous** `getCurrentSession()` function to access the current user's identity. This was a design decision made early in Phase 2.2 to keep the service layer simple and avoid threading async session resolution through every RBAC check.

---

## The Problem (Phase 3.1)

Auth.js v5 (`next-auth@5`) resolves sessions asynchronously via `auth()`. But the entire RBAC and service layer relies on synchronous `getCurrentSession()`. Without a bridge, all API routes in OIDC mode returned `null` sessions — meaning:

- All API calls returned **403 Forbidden**
- Audit logs recorded **anonymous sessions**
- RBAC was bypassed (no identity context)

---

## The Solution: `resolveSession()`

Phase 3.1 introduced `AsyncLocalStorage` to bridge async Auth.js sessions into the synchronous service layer.

### Architecture

```
Request
  ↓
resolveSession(handler)
  ↓
  ├── Demo mode: calls handler() directly (no-op wrapper)
  └── OIDC mode:
        ↓
      auth()  ← async Auth.js session resolution
        ↓
      Map JWT claims → SessionUser { id, name, email, role, provider, providerSubject }
        ↓
      AsyncLocalStorage.run(session, handler)
        ↓
      handler()
        ↓
        ├── requirePermission() → getCurrentSession() → getStoredSession() → ✓ session
        ├── getAuditContext() → getCurrentSession() → getStoredSession() → ✓ identity
        └── Service functions → getCurrentSession() → getStoredSession() → ✓ session
```

### Key Files

| File | Purpose |
|---|---|
| `src/auth/session-store.ts` | AsyncLocalStorage instance, `getStoredSession()`, `runWithSession()` |
| `src/auth/session.ts` | `getCurrentSession()`, `resolveSession()`, `SessionUser` type |
| `src/auth/group-mapping.ts` | OIDC group → system role mapping |
| `src/auth.config.ts` | Auth.js v5 OIDC provider configuration |

---

## How to Wrap a New API Route

Every API route that requires authentication **must** be wrapped with `resolveSession()`.

### Before (broken in OIDC mode)

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/auth/rbac';

export async function GET(request: NextRequest) {
  requirePermission('example.read');  // ← getCurrentSession() returns null in OIDC mode!
  // ... handler logic
  return NextResponse.json({ data: 'example' });
}
```

### After (works in both modes)

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/auth/rbac';
import { resolveSession } from '@/auth';

export async function GET(request: NextRequest) {
  return resolveSession(async () => {
    requirePermission('example.read');  // ← getCurrentSession() now has identity context
    // ... handler logic
    return NextResponse.json({ data: 'example' });
  });
}
```

### Rules

1. **Wrap the entire handler body** inside `resolveSession()`.
2. **Return the result** of `resolveSession()` from the handler.
3. **Import from `@/auth`** — not from `session.ts` directly.
4. **Do not nest** `resolveSession()` calls.
5. **Every new API route** must follow this pattern.

---

## What Happens in Each Mode

### Demo Mode (`DEMO_AUTH_ENABLED=true`)

- `resolveSession()` is a **no-op wrapper** — it calls the handler directly.
- `getCurrentSession()` reads the `compliance-demo-user` cookie synchronously.
- No async resolution needed.
- Role switcher works normally.

### OIDC Mode (`DEMO_AUTH_ENABLED=false`)

- `resolveSession()` calls `auth()` (Auth.js) to resolve the JWT session.
- JWT claims are mapped to a `SessionUser` object:
  - `email` → from OIDC `email` claim
  - `name` → from OIDC `name` claim
  - `role` → mapped from OIDC `groups` claim via `resolveRoleFromGroups()`
  - `provider` → `'oidc'`
  - `providerSubject` → from OIDC `sub` claim
- The `SessionUser` is stored in `AsyncLocalStorage`.
- For the duration of the request, `getCurrentSession()` returns this stored session.

---

## SessionUser Shape

```typescript
interface SessionUser {
  id: string;           // User identifier
  name: string;         // Display name
  email: string;        // Email address
  role: RoleId;         // System role (mapped from OIDC groups or demo selection)
  provider: 'demo' | 'oidc';      // Auth origin (for audit distinction)
  providerSubject?: string;         // OIDC 'sub' claim (server-only, not sent to client)
}
```

---

## Currently Wrapped Routes

All 29 non-auth API routes are wrapped with `resolveSession()` as of Phase 3.1. The only unwrapped route is `/api/auth/[...nextauth]` — which is the Auth.js internal handler.

### Verification

If you add a new API route, verify:

1. It uses `resolveSession()` around the handler body
2. It calls `requirePermission()` for access control
3. Audit events include user identity (not anonymous)
4. It works in both demo and OIDC mode

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Forgetting `resolveSession()` | 403 in OIDC mode, works in demo | Wrap with `resolveSession()` |
| Importing from `session.ts` directly | May miss barrel exports | Import from `@/auth` |
| Calling `auth()` manually in routes | Duplicate session resolution | Use `resolveSession()` instead |
| Not returning from `resolveSession()` | Route returns `undefined` | `return resolveSession(...)` |
