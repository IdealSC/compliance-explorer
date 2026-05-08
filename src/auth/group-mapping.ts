/**
 * OIDC Group-to-Role Mapping — Maps IdP group names to RBAC RoleId values.
 *
 * When a user authenticates via OIDC, the IdP includes group membership
 * in the token claims. This module maps those group names to the app's
 * RoleId enum values so the existing RBAC system works unchanged.
 *
 * Mapping priority:
 * 1. AUTH_GROUP_ROLE_MAP env var (JSON string) — runtime override
 * 2. DEFAULT_GROUP_MAP (hardcoded below) — development/testing default
 *
 * Safety:
 * - Unmapped groups are logged as warnings but do not cause errors
 * - If no groups match, the user defaults to ["viewer"] (least privilege)
 * - Invalid RoleId values in custom mappings are rejected
 *
 * Phase 3.1: Production Identity Provider Integration
 */
import { ALL_ROLE_IDS, type RoleId } from './roles';

// ── Default Mapping ─────────────────────────────────────────────

const DEFAULT_GROUP_MAP: Record<string, RoleId> = {
  'Compliance-Viewers':    'viewer',
  'Business-Owners':       'business_owner',
  'Compliance-Editors':    'compliance_editor',
  'Compliance-Approvers':  'compliance_approver',
  'Legal-Reviewers':       'legal_reviewer',
  'Risk-Reviewers':        'risk_reviewer',
  'Compliance-Auditors':   'auditor',
  'Platform-Admins':       'admin',
};

const VALID_ROLE_SET = new Set<string>(ALL_ROLE_IDS);

// ── Custom Mapping Loader ───────────────────────────────────────

let _customMap: Record<string, RoleId> | null = null;
let _customMapLoaded = false;

function loadCustomGroupMap(): Record<string, RoleId> | null {
  if (_customMapLoaded) return _customMap;
  _customMapLoaded = true;

  const envMap = process.env.AUTH_GROUP_ROLE_MAP;
  if (!envMap) return null;

  try {
    const parsed = JSON.parse(envMap) as Record<string, string>;

    // Validate that all mapped values are valid RoleId values
    const validated: Record<string, RoleId> = {};
    for (const [group, role] of Object.entries(parsed)) {
      if (VALID_ROLE_SET.has(role)) {
        validated[group] = role as RoleId;
      } else {
        console.warn(
          `[AUTH] AUTH_GROUP_ROLE_MAP: group "${group}" maps to invalid role "${role}". ` +
          `Valid roles: ${ALL_ROLE_IDS.join(', ')}. Skipping.`,
        );
      }
    }

    _customMap = Object.keys(validated).length > 0 ? validated : null;
    return _customMap;
  } catch (e) {
    console.warn(
      `[AUTH] AUTH_GROUP_ROLE_MAP is not valid JSON. Using default group mapping. ` +
      `Error: ${e instanceof Error ? e.message : String(e)}`,
    );
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Map OIDC group names to RBAC RoleId values.
 *
 * Returns at least ["viewer"] if no groups match (safe default).
 */
export function mapGroupsToRoles(groups: string[]): RoleId[] {
  const mapping = loadCustomGroupMap() ?? DEFAULT_GROUP_MAP;
  const roles = new Set<RoleId>();

  for (const group of groups) {
    const role = mapping[group];
    if (role) {
      roles.add(role);
    } else {
      // Log unmapped groups at debug level — not an error
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[AUTH] Unmapped OIDC group: "${group}"`);
      }
    }
  }

  // Safety: if no groups mapped, default to viewer (least privilege)
  if (roles.size === 0) {
    console.warn(
      `[AUTH] No OIDC groups matched a role mapping. ` +
      `User groups: [${groups.join(', ')}]. Defaulting to viewer.`,
    );
    roles.add('viewer');
  }

  return [...roles];
}

/**
 * Get the OIDC claim name used for group membership.
 * Default: "groups". Override via AUTH_GROUPS_CLAIM env var.
 */
export function getGroupClaimName(): string {
  return process.env.AUTH_GROUPS_CLAIM ?? 'groups';
}

/**
 * Get the current group-to-role mapping (for diagnostics/admin UI).
 */
export function getActiveGroupMap(): Record<string, RoleId> {
  return loadCustomGroupMap() ?? { ...DEFAULT_GROUP_MAP };
}
