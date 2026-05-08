/**
 * Review Write Service — Server-side persistence for approval review workflow.
 *
 * Provides write functions for the review/approval lifecycle.
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Target entity existence validation
 * 4. Workflow transition validation
 * 5. Separation-of-duties check (where applicable)
 * 6. Explicit publish/activate/supersede blocking
 * 7. Audit event creation on success
 *
 * GOVERNANCE: These functions only manage REVIEW/APPROVAL records.
 * Active regulatory reference data (obligations, regulations,
 * citations, standards, crosswalk mappings) is NEVER modified.
 * "approved_for_publication" means approved for FUTURE publishing only.
 * NO publication, activation, supersession, or archiving occurs.
 */
import { getDb } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import {
  approvalReviews,
  regulatoryUpdates,
  draftChanges,
} from '@/db/schema';
import { requirePermission, AuthorizationError, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateApprovalReviewId } from './id-generator';

// Re-export for API route consumption
export { AuthorizationError };

// ── Result Types ────────────────────────────────────────────────

export interface ReviewWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'CONFLICT' | 'TRANSITION_ERROR';
  created?: T;
  updated?: T;
  auditEventId?: string;
  entityId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult(): ReviewWriteResult {
  return {
    success: false,
    error: 'Database mode required for review persistence. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

function notFoundResult(entity: string, id: string): ReviewWriteResult {
  return {
    success: false,
    error: `${entity} with ID "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// Allowed workflow transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_review', 'legal_review_required'],
  in_review: ['returned_for_revision', 'rejected', 'approved_for_publication', 'legal_review_required'],
  legal_review_required: ['in_review'],
  // Terminal states — no outbound transitions in Phase 2.5A
  returned_for_revision: [],
  rejected: [],
  approved_for_publication: [],
};

// These are NEVER allowed as transitions in Phase 2.5A
const BLOCKED_STATUSES = ['published', 'activated', 'superseded', 'archived'];

function validateTransition(currentStatus: string, newStatus: string): string | null {
  if (BLOCKED_STATUSES.includes(newStatus)) {
    return `Status "${newStatus}" requires the controlled publishing workflow (Phase 2.5B+). This phase only supports review decisions.`;
  }
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) {
    return `Current status "${currentStatus}" does not support transitions.`;
  }
  if (!allowed.includes(newStatus)) {
    return `Transition from "${currentStatus}" to "${newStatus}" is not allowed. Valid transitions: ${allowed.join(', ') || '(none — terminal status)'}`;
  }
  return null; // Valid
}

// ── Lookups ─────────────────────────────────────────────────────

/**
 * Resolve the target entity's createdByUserId for separation-of-duties.
 */
async function getTargetCreatorUserId(
  targetType: string,
  targetId: string,
): Promise<string | null> {
  const db = getDb();
  if (targetType === 'regulatory_update') {
    const [row] = await db
      .select({ createdByUserId: regulatoryUpdates.createdByUserId })
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.stableReferenceId, targetId));
    return row?.createdByUserId ?? null;
  }
  if (targetType === 'draft_change') {
    const [row] = await db
      .select({ createdByUserId: draftChanges.createdByUserId })
      .from(draftChanges)
      .where(eq(draftChanges.stableReferenceId, targetId));
    return row?.createdByUserId ?? null;
  }
  return null;
}

/**
 * Validate that the target entity exists.
 */
async function targetExists(targetType: string, targetId: string): Promise<boolean> {
  const db = getDb();
  if (targetType === 'regulatory_update') {
    const [row] = await db
      .select({ id: regulatoryUpdates.id })
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.stableReferenceId, targetId));
    return !!row;
  }
  if (targetType === 'draft_change') {
    const [row] = await db
      .select({ id: draftChanges.id })
      .from(draftChanges)
      .where(eq(draftChanges.stableReferenceId, targetId));
    return !!row;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new approval review record for a target entity.
 * Called when a draft is submitted for review.
 *
 * Requires: reference.review OR review.view
 */
export async function createApprovalReview(input: {
  reviewTargetType: 'regulatory_update' | 'draft_change';
  reviewTargetId: string;
  relatedUpdateId?: string | null;
  relatedDraftChangeId?: string | null;
  sourceReference?: string | null;
  legalReviewRequired?: boolean;
  requiredReviewerRole?: string | null;
}): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  // Allow either reviewers or editors who submit (the submit flow calls this)
  // The caller (staging-writes submitDraftForReview) checks its own permission
  // Direct API callers need review.view at minimum
  requirePermission(PERMISSIONS.REVIEW_VIEW);

  const exists = await targetExists(input.reviewTargetType, input.reviewTargetId);
  if (!exists) return notFoundResult(input.reviewTargetType, input.reviewTargetId);

  const ctx = getSessionContext();
  const stableRefId = generateApprovalReviewId();
  const db = getDb();

  await db.insert(approvalReviews).values({
    stableReferenceId: stableRefId,
    reviewTargetType: input.reviewTargetType,
    reviewTargetId: input.reviewTargetId,
    relatedUpdateId: input.relatedUpdateId ?? null,
    relatedDraftChangeId: input.relatedDraftChangeId ?? null,
    reviewStatus: 'pending',
    requiredReviewerRole: input.requiredReviewerRole ?? null,
    submittedByUserId: safeUserId(ctx),
    sourceReference: input.sourceReference ?? null,
    legalReviewRequired: input.legalReviewRequired ?? false,
  });

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: stableRefId,
    action: 'approval_review_created',
    previousValue: null,
    newValue: JSON.stringify({
      reviewTargetType: input.reviewTargetType,
      reviewTargetId: input.reviewTargetId,
      reviewStatus: 'pending',
    }),
  });

  return { success: true, entityId: stableRefId, auditEventId };
}

/**
 * Start an approval review (pending → in_review).
 *
 * Requires: reference.review
 */
export async function startApprovalReview(
  reviewId: string,
): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({
      reviewStatus: approvalReviews.reviewStatus,
      reviewTargetId: approvalReviews.reviewTargetId,
    })
    .from(approvalReviews)
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  if (!existing) return notFoundResult('ApprovalReview', reviewId);

  const transitionError = validateTransition(existing.reviewStatus, 'in_review');
  if (transitionError) {
    return { success: false, error: transitionError, code: 'TRANSITION_ERROR' };
  }

  const ctx = getSessionContext();

  await db
    .update(approvalReviews)
    .set({
      reviewStatus: 'in_review',
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedByName: ctx.userName,
      updatedAt: new Date(),
    })
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: reviewId,
    action: 'approval_review_started',
    previousValue: existing.reviewStatus,
    newValue: 'in_review',
  });

  return { success: true, entityId: reviewId, updated: { reviewStatus: 'in_review' }, auditEventId };
}

/**
 * Return a draft for revision (in_review → returned_for_revision).
 *
 * Requires: reference.review
 */
export async function returnDraftForRevision(
  reviewId: string,
  comments?: string,
  reason?: string,
): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({
      reviewStatus: approvalReviews.reviewStatus,
      reviewTargetType: approvalReviews.reviewTargetType,
      reviewTargetId: approvalReviews.reviewTargetId,
    })
    .from(approvalReviews)
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  if (!existing) return notFoundResult('ApprovalReview', reviewId);

  const transitionError = validateTransition(existing.reviewStatus, 'returned_for_revision');
  if (transitionError) {
    return { success: false, error: transitionError, code: 'TRANSITION_ERROR' };
  }

  const ctx = getSessionContext();

  await db
    .update(approvalReviews)
    .set({
      reviewStatus: 'returned_for_revision',
      reviewDecision: 'Returned for revision',
      reviewComments: comments ?? null,
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedByName: ctx.userName,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  // Also update the target draft status back to 'returned'
  await updateTargetDraftStatus(existing.reviewTargetType, existing.reviewTargetId, 'returned');

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: reviewId,
    action: 'approval_review_returned_for_revision',
    previousValue: existing.reviewStatus,
    newValue: 'returned_for_revision',
    reason: reason ?? comments ?? undefined,
  });

  return { success: true, entityId: reviewId, updated: { reviewStatus: 'returned_for_revision' }, auditEventId };
}

/**
 * Reject a draft review (in_review → rejected).
 *
 * Requires: reference.review
 */
export async function rejectDraftReview(
  reviewId: string,
  comments?: string,
  reason?: string,
): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({
      reviewStatus: approvalReviews.reviewStatus,
      reviewTargetType: approvalReviews.reviewTargetType,
      reviewTargetId: approvalReviews.reviewTargetId,
    })
    .from(approvalReviews)
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  if (!existing) return notFoundResult('ApprovalReview', reviewId);

  const transitionError = validateTransition(existing.reviewStatus, 'rejected');
  if (transitionError) {
    return { success: false, error: transitionError, code: 'TRANSITION_ERROR' };
  }

  const ctx = getSessionContext();

  await db
    .update(approvalReviews)
    .set({
      reviewStatus: 'rejected',
      reviewDecision: 'Rejected',
      reviewComments: comments ?? null,
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedByName: ctx.userName,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  // Also update the target draft status to 'rejected'
  await updateTargetDraftStatus(existing.reviewTargetType, existing.reviewTargetId, 'rejected');

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: reviewId,
    action: 'approval_review_rejected',
    previousValue: existing.reviewStatus,
    newValue: 'rejected',
    reason: reason ?? comments ?? undefined,
  });

  return { success: true, entityId: reviewId, updated: { reviewStatus: 'rejected' }, auditEventId };
}

/**
 * Mark legal review required (pending/in_review → legal_review_required).
 *
 * Requires: reference.review
 */
export async function markLegalReviewRequired(
  reviewId: string,
  comments?: string,
): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({ reviewStatus: approvalReviews.reviewStatus })
    .from(approvalReviews)
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  if (!existing) return notFoundResult('ApprovalReview', reviewId);

  const transitionError = validateTransition(existing.reviewStatus, 'legal_review_required');
  if (transitionError) {
    return { success: false, error: transitionError, code: 'TRANSITION_ERROR' };
  }

  const ctx = getSessionContext();

  await db
    .update(approvalReviews)
    .set({
      reviewStatus: 'legal_review_required',
      legalReviewRequired: true,
      reviewComments: comments ?? null,
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedByName: ctx.userName,
      updatedAt: new Date(),
    })
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: reviewId,
    action: 'approval_review_legal_review_required',
    previousValue: existing.reviewStatus,
    newValue: 'legal_review_required',
  });

  return { success: true, entityId: reviewId, updated: { reviewStatus: 'legal_review_required' }, auditEventId };
}

/**
 * Approve a draft for publication readiness.
 * This does NOT publish or modify active reference data.
 *
 * Requires: reference.approve
 * Enforces separation-of-duties: creator cannot approve their own draft.
 */
export async function approveDraftForPublicationReadiness(
  reviewId: string,
  comments?: string,
  approvalReference?: string,
): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_APPROVE);

  const db = getDb();
  const [existing] = await db
    .select({
      reviewStatus: approvalReviews.reviewStatus,
      reviewTargetType: approvalReviews.reviewTargetType,
      reviewTargetId: approvalReviews.reviewTargetId,
      submittedByUserId: approvalReviews.submittedByUserId,
    })
    .from(approvalReviews)
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  if (!existing) return notFoundResult('ApprovalReview', reviewId);

  const transitionError = validateTransition(existing.reviewStatus, 'approved_for_publication');
  if (transitionError) {
    return { success: false, error: transitionError, code: 'TRANSITION_ERROR' };
  }

  // ── Separation of Duties Check ────────────────────────────────
  const ctx = getSessionContext();

  // Check 1: Did the current user submit this review?
  if (existing.submittedByUserId && ctx.userId && existing.submittedByUserId === ctx.userId) {
    return {
      success: false,
      error: 'Separation of duties: You cannot approve a review you submitted. A different approver is required.',
      code: 'CONFLICT',
    };
  }

  // Check 2: Did the current user create the target draft?
  const creatorUserId = await getTargetCreatorUserId(existing.reviewTargetType, existing.reviewTargetId);
  if (creatorUserId && ctx.userId && creatorUserId === ctx.userId) {
    return {
      success: false,
      error: 'Separation of duties: You cannot approve a draft you created. A different approver is required.',
      code: 'CONFLICT',
    };
  }

  await db
    .update(approvalReviews)
    .set({
      reviewStatus: 'approved_for_publication',
      reviewDecision: 'Approved for publication readiness',
      reviewComments: comments ?? null,
      approvalReference: approvalReference ?? null,
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedByName: ctx.userName,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  // Update the target draft status to 'approved' (note: this is draft-level approved,
  // NOT active reference publication)
  await updateTargetDraftStatus(existing.reviewTargetType, existing.reviewTargetId, 'approved');

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: reviewId,
    action: 'approval_review_approved_for_publication',
    previousValue: existing.reviewStatus,
    newValue: 'approved_for_publication',
    approvalReference: approvalReference ?? undefined,
  });

  return { success: true, entityId: reviewId, updated: { reviewStatus: 'approved_for_publication' }, auditEventId };
}

/**
 * Update review comments on an existing review.
 *
 * Requires: reference.review
 */
export async function updateApprovalReviewComments(
  reviewId: string,
  comments: string,
): Promise<ReviewWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({ reviewStatus: approvalReviews.reviewStatus, reviewComments: approvalReviews.reviewComments })
    .from(approvalReviews)
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  if (!existing) return notFoundResult('ApprovalReview', reviewId);

  await db
    .update(approvalReviews)
    .set({
      reviewComments: comments,
      updatedAt: new Date(),
    })
    .where(eq(approvalReviews.stableReferenceId, reviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'approval_review',
    entityId: reviewId,
    action: 'approval_review_comments_updated',
    previousValue: existing.reviewComments,
    newValue: comments,
  });

  return { success: true, entityId: reviewId, updated: { reviewComments: comments }, auditEventId };
}

// ── Read Operations ─────────────────────────────────────────────

export interface ApprovalReviewRow {
  stableReferenceId: string;
  reviewTargetType: string;
  reviewTargetId: string;
  relatedUpdateId: string | null;
  relatedDraftChangeId: string | null;
  reviewStatus: string;
  reviewDecision: string | null;
  reviewComments: string | null;
  requiredReviewerRole: string | null;
  reviewedByName: string | null;
  reviewedByEmail: string | null;
  reviewedAt: Date | null;
  submittedByUserId: string | null;
  submittedAt: Date;
  sourceReference: string | null;
  legalReviewRequired: boolean;
  complianceReviewRequired: boolean;
  approvalReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all approval reviews, optionally filtered.
 *
 * Requires: review.view
 */
export async function getApprovalReviews(filters?: {
  reviewStatus?: string;
  reviewTargetType?: string;
}): Promise<ApprovalReviewRow[]> {
  if (!isDatabaseMode()) return [];
  requirePermission(PERMISSIONS.REVIEW_VIEW);

  const db = getDb();
  let query = db.select().from(approvalReviews).orderBy(desc(approvalReviews.createdAt));

  const rows = await query;

  let result = rows as unknown as ApprovalReviewRow[];

  if (filters?.reviewStatus) {
    result = result.filter((r) => r.reviewStatus === filters.reviewStatus);
  }
  if (filters?.reviewTargetType) {
    result = result.filter((r) => r.reviewTargetType === filters.reviewTargetType);
  }

  return result;
}

/**
 * Get the most recent approval review for a specific target entity.
 *
 * Requires: review.view
 */
export async function getApprovalReviewByTarget(
  targetType: string,
  targetId: string,
): Promise<ApprovalReviewRow | null> {
  if (!isDatabaseMode()) return null;
  requirePermission(PERMISSIONS.REVIEW_VIEW);

  const db = getDb();
  const [row] = await db
    .select()
    .from(approvalReviews)
    .where(
      and(
        eq(approvalReviews.reviewTargetType, targetType as 'regulatory_update' | 'draft_change'),
        eq(approvalReviews.reviewTargetId, targetId),
      ),
    )
    .orderBy(desc(approvalReviews.createdAt))
    .limit(1);

  return (row as unknown as ApprovalReviewRow) ?? null;
}

// ── Internal Helpers ────────────────────────────────────────────

/**
 * Update the draft status on the target entity when a review decision is made.
 * This does NOT modify active reference data — it only updates the draft-level status.
 */
async function updateTargetDraftStatus(
  targetType: string,
  targetId: string,
  newStatus: 'returned' | 'approved' | 'rejected',
): Promise<void> {
  const db = getDb();
  if (targetType === 'draft_change') {
    await db
      .update(draftChanges)
      .set({ draftStatus: newStatus })
      .where(eq(draftChanges.stableReferenceId, targetId));
  }
  if (targetType === 'regulatory_update') {
    const stageMap: Record<string, string> = {
      returned: 'draft_mapping',
      approved: 'approved',
      rejected: 'rejected',
    };
    await db
      .update(regulatoryUpdates)
      .set({ currentStage: stageMap[newStatus] as any })
      .where(eq(regulatoryUpdates.stableReferenceId, targetId));
  }
}
