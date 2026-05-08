/**
 * Session Management — Dual-mode session resolution.
 *
 * Supports two authentication modes:
 * 1. Demo Auth (DEMO_AUTH_ENABLED=true) — Cookie-based demo identities
 * 2. Production Auth (DEMO_AUTH_ENABLED=false) — Auth.js JWT sessions via OIDC
 *
 * The SessionUser interface is the SINGLE ABSTRACTION POINT for identity.
 * All downstream RBAC, audit, and governance code consumes SessionUser
 * without knowing which auth mode is active.
 *
 * Phase 3.1 QA: Session store integration.
 * - In OIDC mode, `getCurrentSession()` reads from AsyncLocalStorage
 *   (populated by `resolveSession()` at the top of each API route).
 * - This allows all synchronous RBAC/audit code to resolve identity
 *   without an async refactor.
 *
 * GOVERNANCE:
 * - Demo auth is NOT production identity security.
 * - Production auth uses encrypted JWTs via Auth.js.
 * - In production, demo auth requires explicit DEMO_AUTH_ENABLED=true
 *   (which triggers DemoAuthWarningBanner and console warnings).
 * - This module is server-only.
 *
 * Phase 3.1: Production Identity Provider Integration
 * (Replaces Phase 2.x demo-only session management)
 */
import { cookies } from 'next/headers';
import { getDemoUserByEmail, DEFAULT_DEMO_USER, type DemoUser } from './demo-users';
import { type RoleId } from './roles';
import { getStoredSession, runWithSessionAsync } from './session-store';

export const DEMO_SESSION_COOKIE = 'compliance-demo-user';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: RoleId[];
  demoUser: boolean;
  /** Auth provider that resolved this session: 'demo' | 'oidc' */
  provider: 'demo' | 'oidc';
  /** OIDC subject claim (sub) — only set for OIDC sessions */
  providerSubject?: string;
}

// ── Auth Mode Detection ─────────────────────────────────────────

/**
 * Determine whether demo auth is active.
 *
 * Rules:
 * - In production: demo auth requires explicit DEMO_AUTH_ENABLED=true
 * - In development: demo auth is enabled unless DEMO_AUTH_ENABLED=false
 */
function isDemoAuthActive(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // Production: only if explicitly set to 'true'
    return process.env.DEMO_AUTH_ENABLED === 'true';
  }
  // Development/test: enabled unless explicitly disabled
  return process.env.DEMO_AUTH_ENABLED !== 'false';
}

// ── Demo Session (existing behavior, extracted) ─────────────────

async function getDemoSessionAsync(): Promise<SessionUser | null> {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // cookies() throws outside of a server component/action context
    // Fall back to default demo user
    return demoUserToSession(DEFAULT_DEMO_USER);
  }

  const email = cookieStore?.get?.(DEMO_SESSION_COOKIE)?.value;
  if (email) {
    const user = getDemoUserByEmail(email);
    if (user) return demoUserToSession(user);
  }

  // Default: use default demo user
  return demoUserToSession(DEFAULT_DEMO_USER);
}

function demoUserToSession(user: DemoUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    demoUser: user.demoUser,
    provider: 'demo',
  };
}

// ── Auth.js Session (OIDC flow) ─────────────────────────────────

/**
 * Resolve session from Auth.js via AsyncLocalStorage.
 *
 * In OIDC mode, the session is resolved asynchronously by
 * `resolveSession()` (called at the top of API route handlers)
 * and stored in AsyncLocalStorage. This function reads it back
 * synchronously, allowing all RBAC and audit code to work unchanged.
 */
function getAuthJsSessionSync(): SessionUser | null {
  const stored = getStoredSession();
  if (stored !== undefined) {
    return stored;
  }
  // No session has been resolved for this request.
  // This happens when getCurrentSession() is called outside a
  // resolveSession() context. Return null (unauthenticated).
  return null;
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Get the current session user (server-side only, synchronous).
 *
 * Resolves identity from the active auth mode:
 * - Demo mode: reads demo cookie → DemoUser → SessionUser
 * - Production mode: reads from AsyncLocalStorage (set by resolveSession)
 *
 * This function is the single entry point consumed by all RBAC,
 * audit, and governance code.
 */
export function getCurrentSession(): SessionUser | null {
  // Always check the session store first — resolveSession() populates it
  // in both demo and OIDC modes (as of Next.js 15+ cookies() async fix).
  const stored = getStoredSession();
  if (stored !== undefined) {
    return stored;
  }

  // Fallback: outside resolveSession() context
  if (isDemoAuthActive()) {
    // Cannot read cookies synchronously in Next.js 15+ — return default
    return demoUserToSession(DEFAULT_DEMO_USER);
  }
  return null;
}

/**
 * Get the current session user asynchronously (Auth.js-aware).
 *
 * In demo mode: delegates to getCurrentSession() (synchronous).
 * In production mode: calls Auth.js auth() to resolve the JWT session.
 *
 * Use this in server components and API routes where async is available.
 */
export async function getCurrentSessionAsync(): Promise<SessionUser | null> {
  if (isDemoAuthActive()) {
    return getDemoSessionAsync();
  }

  try {
    // Dynamic import to avoid loading Auth.js when in demo mode
    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user) return null;

    // The OIDC subject claim is persisted in the JWT callback as `id`.
    // Preserve it separately as providerSubject for audit traceability.
    const sub = session.user.id ?? session.user.email ?? 'unknown';

    return {
      id: sub,
      name: session.user.name ?? 'Unknown User',
      email: session.user.email ?? '',
      roles: session.user.roles ?? ['viewer'],
      demoUser: false,
      provider: 'oidc',
      providerSubject: sub,
    };
  } catch {
    // Auth.js not configured or session resolution failed
    return null;
  }
}

/**
 * Resolve and store the Auth.js session for the current request.
 *
 * Call this once at the top of every API route handler.
 * It resolves the async Auth.js session and stores it in
 * AsyncLocalStorage so all downstream synchronous code
 * (RBAC, audit, service functions) can access it via getCurrentSession().
 *
 * In demo mode: no-op (synchronous demo session is always available).
 *
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     return resolveSession(async () => {
 *       // ... your handler code, getCurrentSession() works here
 *     });
 *   }
 *
 * @param handler - The async handler function to execute within the session context
 * @returns The result of the handler function
 */
export async function resolveSession<T>(handler: () => Promise<T>): Promise<T> {
  if (isDemoAuthActive()) {
    // Demo mode: resolve demo session asynchronously (cookies() is async in Next.js 15+)
    // and store in AsyncLocalStorage for synchronous access downstream
    const session = await getDemoSessionAsync();
    return runWithSessionAsync(session, handler);
  }

  // OIDC mode: resolve session and store for synchronous access
  const session = await getCurrentSessionAsync();
  return runWithSessionAsync(session, handler);
}

/**
 * Serialize a session user to a client-safe object.
 * Strips server-only fields (providerSubject) from client payloads.
 */
export function toClientSession(user: SessionUser | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    demoUser: user.demoUser,
  };
}

// ── Phase 2.9: Production Safety Guard ──────────────────────────
// Logs a warning on first module evaluation if demo auth is enabled in production.
// This does not prevent the app from running — it is a diagnostic warning only.

if (
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  process.env.DEMO_AUTH_ENABLED === 'true'
) {
  console.warn(
    '\n' +
    '╔══════════════════════════════════════════════════════════════════╗\n' +
    '║  ⚠️  DEMO AUTHENTICATION IS ENABLED IN PRODUCTION              ║\n' +
    '║                                                                ║\n' +
    '║  Demo auth uses plain-text cookies and is NOT secure.          ║\n' +
    '║  Do not use for real compliance or regulatory data.            ║\n' +
    '║                                                                ║\n' +
    '║  To disable: set DEMO_AUTH_ENABLED=false in your environment   ║\n' +
    '║  and configure Auth.js with an OIDC identity provider.         ║\n' +
    '╚══════════════════════════════════════════════════════════════════╝\n',
  );
}
