/**
 * Request-Scoped Session Store — AsyncLocalStorage for OIDC session resolution.
 *
 * Phase 3.1 QA Fix (B1): Auth.js `auth()` is async, but the RBAC module
 * and all service functions call `getCurrentSession()` synchronously.
 * This module bridges the gap using Node.js AsyncLocalStorage:
 *
 * 1. API routes call `resolveSession()` once at the top of each handler
 * 2. `resolveSession()` calls `getCurrentSessionAsync()` and stores the result
 * 3. `getCurrentSession()` reads from the store in OIDC mode (synchronous)
 *
 * This avoids refactoring every RBAC helper, service function, and API route
 * to accept an async session parameter.
 *
 * GOVERNANCE: This is an infrastructure module only. It does not change
 * RBAC logic, audit attribution, or permission enforcement — it only
 * provides the session identity that those modules already expect.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import type { SessionUser } from './session';

// ── AsyncLocalStorage Instance ──────────────────────────────────

const sessionStore = new AsyncLocalStorage<SessionUser | null>();

// ── Public API ──────────────────────────────────────────────────

/**
 * Get the pre-resolved session for the current request.
 * Returns `undefined` if no session has been resolved for this request
 * (i.e., outside a `runWithSession()` context), or `null` if the session
 * was resolved but no user is authenticated.
 */
export function getStoredSession(): SessionUser | null | undefined {
  return sessionStore.getStore();
}

/**
 * Execute a function within a request-scoped session context.
 * All synchronous calls to `getCurrentSession()` within `fn` will
 * return the provided session.
 *
 * @param session - The resolved SessionUser (or null for unauthenticated)
 * @param fn - The function to execute within the session context
 */
export function runWithSession<T>(session: SessionUser | null, fn: () => T): T {
  return sessionStore.run(session, fn);
}

/**
 * Execute an async function within a request-scoped session context.
 * Same as `runWithSession` but for async handlers.
 */
export async function runWithSessionAsync<T>(
  session: SessionUser | null,
  fn: () => Promise<T>,
): Promise<T> {
  return sessionStore.run(session, fn);
}
