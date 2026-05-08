/**
 * Role Definitions & Permission Matrix.
 *
 * Maps each role to its granted permissions. This is the single source
 * of truth for "what can role X do?"
 */
import { PERMISSIONS, ALL_PERMISSIONS, type Permission } from './permissions';

const P = PERMISSIONS;

// ── Role IDs ────────────────────────────────────────────────────

export const ROLES = {
  VIEWER: 'viewer',
  BUSINESS_OWNER: 'business_owner',
  COMPLIANCE_EDITOR: 'compliance_editor',
  COMPLIANCE_APPROVER: 'compliance_approver',
  LEGAL_REVIEWER: 'legal_reviewer',
  RISK_REVIEWER: 'risk_reviewer',
  AUDITOR: 'auditor',
  ADMIN: 'admin',
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export interface RoleDefinition {
  id: RoleId;
  label: string;
  description: string;
  permissions: Permission[];
}

// ── Permission Matrix ───────────────────────────────────────────

export const ROLE_DEFINITIONS: Record<RoleId, RoleDefinition> = {
  [ROLES.VIEWER]: {
    id: ROLES.VIEWER,
    label: 'Viewer',
    description: 'Read-only access to reference data, operational views, reports, and executive dashboard.',
    permissions: [
      P.REFERENCE_VIEW, P.OPERATIONAL_VIEW, P.REPORTS_VIEW, P.EXECUTIVE_VIEW,
    ],
  },

  [ROLES.BUSINESS_OWNER]: {
    id: ROLES.BUSINESS_OWNER,
    label: 'Business Owner',
    description: 'Operational ownership — can edit controls, evidence, and actions for assigned business functions.',
    permissions: [
      P.REFERENCE_VIEW, P.OPERATIONAL_VIEW, P.OPERATIONAL_EDIT,
      P.CONTROLS_VIEW, P.CONTROLS_EDIT, P.EVIDENCE_VIEW, P.EVIDENCE_EDIT,
      P.ACTIONS_VIEW, P.ACTIONS_EDIT,
      P.REPORTS_VIEW, P.EXECUTIVE_VIEW,
    ],
  },

  [ROLES.COMPLIANCE_EDITOR]: {
    id: ROLES.COMPLIANCE_EDITOR,
    label: 'Compliance Editor',
    description: 'Can draft regulatory changes, intake sources, and manage data quality findings.',
    permissions: [
      P.REFERENCE_VIEW, P.REFERENCE_DRAFT_CREATE, P.REFERENCE_DRAFT_EDIT,
      P.OPERATIONAL_VIEW, P.CONTROLS_VIEW, P.EVIDENCE_VIEW,
      P.SOURCE_VIEW, P.SOURCE_INTAKE,
      P.DRAFT_VIEW, P.DRAFT_EDIT,
      P.DATA_QUALITY_VIEW,
      P.REPORTS_VIEW, P.REPORTS_EXPORT,
      P.AI_SUGGESTION_VIEW, P.AI_SUGGESTION_GENERATE, P.AI_SUGGESTION_ACCEPT_TO_DRAFT,
      P.VALIDATION_VIEW,
    ],
  },

  [ROLES.COMPLIANCE_APPROVER]: {
    id: ROLES.COMPLIANCE_APPROVER,
    label: 'Compliance Approver',
    description: 'Reviews and approves regulatory changes, source validations, and draft publications.',
    permissions: [
      P.REFERENCE_VIEW, P.REFERENCE_REVIEW, P.REFERENCE_APPROVE, P.REFERENCE_PUBLISH,
      P.OPERATIONAL_VIEW,
      P.SOURCE_VIEW, P.SOURCE_VALIDATE,
      P.DRAFT_VIEW, P.REVIEW_VIEW, P.REVIEW_APPROVE,
      P.VERSION_VIEW, P.AUDIT_VIEW,
      P.DATA_QUALITY_VIEW,
      P.REPORTS_VIEW, P.REPORTS_EXPORT, P.EXECUTIVE_VIEW,
      P.AI_SUGGESTION_VIEW, P.AI_SUGGESTION_REVIEW, P.AI_SUGGESTION_REJECT, P.AI_AUDIT_VIEW,
      P.VALIDATION_VIEW, P.VALIDATION_REVIEW, P.VALIDATION_REJECT, P.VALIDATION_RETURN, P.VALIDATION_MARK_READY,
    ],
  },

  [ROLES.LEGAL_REVIEWER]: {
    id: ROLES.LEGAL_REVIEWER,
    label: 'Legal Reviewer',
    description: 'Reviews regulatory changes and source materials for legal accuracy. Can review and reject AI suggestions.',
    permissions: [
      P.REFERENCE_VIEW, P.REFERENCE_REVIEW,
      P.OPERATIONAL_VIEW,
      P.SOURCE_VIEW, P.DRAFT_VIEW,
      P.REVIEW_VIEW, P.VERSION_VIEW, P.AUDIT_VIEW,
      P.DATA_QUALITY_VIEW,
      P.REPORTS_VIEW, P.REPORTS_EXPORT, P.EXECUTIVE_VIEW,
      P.AI_SUGGESTION_VIEW, P.AI_SUGGESTION_REVIEW, P.AI_SUGGESTION_REJECT, P.AI_AUDIT_VIEW,
      P.VALIDATION_VIEW, P.VALIDATION_REVIEW, P.VALIDATION_LEGAL_REVIEW, P.VALIDATION_REJECT, P.VALIDATION_RETURN,
    ],
  },

  [ROLES.RISK_REVIEWER]: {
    id: ROLES.RISK_REVIEWER,
    label: 'Risk Reviewer',
    description: 'Reviews risk register, controls, evidence, and data quality for risk posture. View-only AI suggestion access.',
    permissions: [
      P.REFERENCE_VIEW, P.OPERATIONAL_VIEW,
      P.CONTROLS_VIEW, P.EVIDENCE_VIEW,
      P.SOURCE_VIEW, P.DRAFT_VIEW,
      P.DATA_QUALITY_VIEW,
      P.REPORTS_VIEW, P.REPORTS_EXPORT, P.EXECUTIVE_VIEW,
      P.AI_SUGGESTION_VIEW, P.AI_AUDIT_VIEW,
      P.VALIDATION_VIEW,
    ],
  },

  [ROLES.AUDITOR]: {
    id: ROLES.AUDITOR,
    label: 'Auditor',
    description: 'Read-only access with audit trail, version history, and snapshot export capabilities.',
    permissions: [
      P.REFERENCE_VIEW, P.OPERATIONAL_VIEW,
      P.SOURCE_VIEW, P.VERSION_VIEW, P.AUDIT_VIEW,
      P.DATA_QUALITY_VIEW,
      P.REPORTS_VIEW, P.REPORTS_EXPORT, P.REPORTS_SNAPSHOT,
      P.EXECUTIVE_VIEW,
      P.AI_SUGGESTION_VIEW, P.AI_AUDIT_VIEW,
      P.VALIDATION_VIEW,
    ],
  },

  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    label: 'Admin',
    // B3 FIX: Admin has all permissions but is NOT exempt from controlled publishing,
    // approval workflow, RBAC enforcement, or separation-of-duties requirements.
    // Admin cannot self-approve and self-publish — SoD checks apply equally to Admin.
    description: 'Full system access including user and role management. Admin is NOT exempt from separation-of-duties, approval workflow, or controlled publishing governance. Publishing requires a different user at each stage (creator, submitter, approver, publisher).',
    permissions: [...ALL_PERMISSIONS],
  },
};

/** Get merged permissions for a set of roles */
export function getPermissionsForRoles(roleIds: RoleId[]): Permission[] {
  const perms = new Set<Permission>();
  for (const rid of roleIds) {
    const def = ROLE_DEFINITIONS[rid];
    if (def) def.permissions.forEach((p) => perms.add(p));
  }
  return [...perms];
}

/** All role IDs as an array */
export const ALL_ROLE_IDS: RoleId[] = Object.values(ROLES);
