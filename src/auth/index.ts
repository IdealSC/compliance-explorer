/**
 * Auth Module — Barrel export.
 *
 * Phase 3.1: Added group-mapping exports and getCurrentSessionAsync.
 */
export { PERMISSIONS, ALL_PERMISSIONS, type Permission } from './permissions';
export { ROLES, ROLE_DEFINITIONS, ALL_ROLE_IDS, getPermissionsForRoles, type RoleId, type RoleDefinition } from './roles';
export { DEMO_USERS, DEFAULT_DEMO_USER, getDemoUserByEmail, getDemoUserById, type DemoUser } from './demo-users';
export { ROUTE_ACCESS_MAP, getRouteAccess, type RouteAccess } from './route-access';
export { DEMO_SESSION_COOKIE, getCurrentSession, getCurrentSessionAsync, resolveSession, toClientSession, type SessionUser } from './session';
export { getStoredSession, runWithSession, runWithSessionAsync } from './session-store';
export {
  AuthorizationError,
  getCurrentUser, getCurrentRoles, getCurrentPermissions,
  hasPermission, hasAnyPermission, hasAllPermissions, requirePermission,
  canViewRoute, canExportReports, canViewAuditLogs,
  canCreateDraftChange, canEditDraftChange,
  canReviewReferenceChange, canApproveReferenceChange, canPublishReferenceChange,
  canEditOperationalData, canManageUsers,
  getSessionContext, buildAuditEvent, getAuditContext,
  type SessionContext, type AuditEvent,
} from './rbac';
export { mapGroupsToRoles, getGroupClaimName, getActiveGroupMap } from './group-mapping';
