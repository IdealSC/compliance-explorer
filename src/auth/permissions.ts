/**
 * Permission Constants — Central permission registry.
 *
 * Every permissioned action in the system maps to one of these constants.
 * Organized by domain for readability. Used in the role → permission matrix,
 * route access map, and server-side authorization helpers.
 *
 * GOVERNANCE NOTE: These define capability boundaries. Admin having all
 * permissions does NOT bypass controlled publishing workflows — those
 * require explicit reference.approve + reference.publish permissions
 * exercised through the formal approval workflow.
 */

export const PERMISSIONS = {
  // ── Reference Data ─────────────────────────────────────────────
  REFERENCE_VIEW: 'reference.view',
  REFERENCE_DRAFT_CREATE: 'reference.draft.create',
  REFERENCE_DRAFT_EDIT: 'reference.draft.edit',
  REFERENCE_REVIEW: 'reference.review',
  REFERENCE_APPROVE: 'reference.approve',
  REFERENCE_PUBLISH: 'reference.publish',

  // ── Operational Data ───────────────────────────────────────────
  OPERATIONAL_VIEW: 'operational.view',
  OPERATIONAL_EDIT: 'operational.edit',
  CONTROLS_VIEW: 'controls.view',
  CONTROLS_EDIT: 'controls.edit',
  EVIDENCE_VIEW: 'evidence.view',
  EVIDENCE_EDIT: 'evidence.edit',
  ACTIONS_VIEW: 'actions.view',
  ACTIONS_EDIT: 'actions.edit',

  // ── Governance ─────────────────────────────────────────────────
  SOURCE_VIEW: 'source.view',
  SOURCE_INTAKE: 'source.intake',
  SOURCE_VALIDATE: 'source.validate',
  DRAFT_VIEW: 'draft.view',
  DRAFT_EDIT: 'draft.edit',
  REVIEW_VIEW: 'review.view',
  REVIEW_APPROVE: 'review.approve',
  VERSION_VIEW: 'version.view',
  AUDIT_VIEW: 'audit.view',
  DATA_QUALITY_VIEW: 'dataQuality.view',
  DATA_QUALITY_MANAGE: 'dataQuality.manage',

  // ── Reports ────────────────────────────────────────────────────
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_SNAPSHOT: 'reports.snapshot',

  // ── Administration ─────────────────────────────────────────────
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  ADMIN_MANAGE: 'admin.manage',

  // ── Executive ──────────────────────────────────────────────────
  EXECUTIVE_VIEW: 'executive.view',

  // ── AI Suggestions (Phase 3.6) ────────────────────────────────
  // GOVERNANCE: These permissions control access to AI suggestion
  // governance records. No AI model is integrated in this phase.
  // AI suggestions are draft-only and do NOT represent legal advice.
  AI_SUGGESTION_VIEW: 'ai.suggestion.view',
  AI_SUGGESTION_GENERATE: 'ai.suggestion.generate',
  AI_SUGGESTION_REVIEW: 'ai.suggestion.review',
  AI_SUGGESTION_ACCEPT_TO_DRAFT: 'ai.suggestion.acceptToDraft',
  AI_SUGGESTION_REJECT: 'ai.suggestion.reject',
  AI_PROMPT_MANAGE: 'ai.prompt.manage',
  AI_AUDIT_VIEW: 'ai.audit.view',

  // ── Validation Workbench (Phase 3.10) ──────────────────────
  // GOVERNANCE: These permissions control access to draft validation
  // review metadata. Validation does NOT approve, publish, or
  // activate reference data. It is advisory review metadata only.
  VALIDATION_VIEW: 'validation.view',
  VALIDATION_REVIEW: 'validation.review',
  VALIDATION_LEGAL_REVIEW: 'validation.legalReview',
  VALIDATION_REJECT: 'validation.reject',
  VALIDATION_RETURN: 'validation.return',
  VALIDATION_MARK_READY: 'validation.markReadyForReview',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** All permission values as an array (useful for Admin "grant all") */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);
