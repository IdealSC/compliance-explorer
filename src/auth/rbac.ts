/**
 * RBAC Authorization Helpers — Server-safe permission checks.
 *
 * These functions check permissions against the current demo session.
 * They are structured so future production auth (NextAuth, SSO) can
 * replace the session source without changing call sites.
 *
 * GOVERNANCE: Server-side helpers exist so future write operations
 * enforce permissions server-side, not only via client UI gating.
 */
import { type Permission, PERMISSIONS as P } from './permissions';
import { getPermissionsForRoles, type RoleId } from './roles';
import { getCurrentSession, type SessionUser } from './session';
import { getRouteAccess } from './route-access';

// ── Authorization Error ─────────────────────────────────────────

/**
 * Typed authorization error — API route handlers can distinguish this
 * from other errors to return a proper 403 response.
 */
export class AuthorizationError extends Error {
  public readonly permission: Permission;
  public readonly statusCode = 403;

  constructor(permission: Permission) {
    super(`Forbidden: requires ${permission}`);
    this.name = 'AuthorizationError';
    this.permission = permission;
  }
}

// ── Core Permission Checks ──────────────────────────────────────

/** Get the current user from the demo session (server-safe) */
export function getCurrentUser(): SessionUser | null {
  return getCurrentSession();
}

/** Get the current user's role IDs */
export function getCurrentRoles(): RoleId[] {
  const user = getCurrentUser();
  return user?.roles ?? [];
}

/** Get the current user's merged permission set */
export function getCurrentPermissions(): Permission[] {
  return getPermissionsForRoles(getCurrentRoles());
}

/** Check if the current user has a specific permission */
export function hasPermission(permission: Permission): boolean {
  return getCurrentPermissions().includes(permission);
}

/** Check if the current user has ANY of the specified permissions */
export function hasAnyPermission(permissions: Permission[]): boolean {
  const userPerms = getCurrentPermissions();
  return permissions.some((p) => userPerms.includes(p));
}

/** Check if the current user has ALL of the specified permissions */
export function hasAllPermissions(permissions: Permission[]): boolean {
  const userPerms = getCurrentPermissions();
  return permissions.every((p) => userPerms.includes(p));
}

/**
 * Assert permission — throws AuthorizationError if the current user
 * lacks the permission. Use in server actions / API routes.
 */
export function requirePermission(permission: Permission): void {
  if (!hasPermission(permission)) {
    throw new AuthorizationError(permission);
  }
}

// ── Route Access ────────────────────────────────────────────────

/** Can the current user view a given route? */
export function canViewRoute(path: string): boolean {
  const route = getRouteAccess(path);
  if (!route) return true; // Unknown routes default to accessible
  return hasAnyPermission(route.requiredPermissions);
}

// ── Domain-Specific Convenience Helpers ─────────────────────────

export function canExportReports(): boolean {
  return hasPermission(P.REPORTS_EXPORT);
}

export function canViewAuditLogs(): boolean {
  return hasPermission(P.AUDIT_VIEW);
}

export function canCreateDraftChange(): boolean {
  return hasPermission(P.REFERENCE_DRAFT_CREATE);
}

export function canEditDraftChange(): boolean {
  return hasPermission(P.REFERENCE_DRAFT_EDIT);
}

export function canReviewReferenceChange(): boolean {
  return hasPermission(P.REFERENCE_REVIEW);
}

export function canApproveReferenceChange(): boolean {
  return hasPermission(P.REFERENCE_APPROVE);
}

export function canPublishReferenceChange(): boolean {
  return hasPermission(P.REFERENCE_PUBLISH);
}

export function canEditOperationalData(): boolean {
  return hasPermission(P.OPERATIONAL_EDIT);
}

export function canManageUsers(): boolean {
  return hasPermission(P.USERS_MANAGE);
}

// ── Audit Context ───────────────────────────────────────────────

export interface SessionContext {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  roles: RoleId[];
  permissions: Permission[];
  demoUser: boolean;
}

export interface AuditEvent extends SessionContext {
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  reason?: string;
  approvalReference?: string;
}

/**
 * Get session-level identity context (who is acting).
 * Use this for request logging, analytics, and as input to buildAuditEvent.
 */
export function getSessionContext(): SessionContext {
  const user = getCurrentUser();
  return {
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    userName: user?.name ?? null,
    roles: user?.roles ?? [],
    permissions: getCurrentPermissions(),
    demoUser: user?.demoUser ?? false,
  };
}

/**
 * Return a FK-safe user ID for database writes.
 *
 * Demo users have synthetic IDs (e.g., 'demo-editor-001') that do NOT
 * exist in the `users` table. Writing these to UUID columns with
 * foreign key constraints causes PostgreSQL error 23503.
 *
 * Returns `null` for demo users so the FK column is left empty while
 * changedBy / changedByEmail / roles still preserve full attribution.
 */
export function safeUserId(ctx: SessionContext): string | null {
  return ctx.demoUser ? null : ctx.userId;
}

/**
 * Build a complete audit event record (who did what to which entity).
 * Combines session identity with action-level metadata.
 */
export function buildAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  options?: { reason?: string; approvalReference?: string },
): AuditEvent {
  return {
    ...getSessionContext(),
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    reason: options?.reason,
    approvalReference: options?.approvalReference,
  };
}

/**
 * @deprecated Use getSessionContext() instead. Kept for backward compatibility.
 */
export function getAuditContext() {
  return {
    ...getSessionContext(),
    timestamp: new Date().toISOString(),
  };
}

