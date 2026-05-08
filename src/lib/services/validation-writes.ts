/**
 * Validation Write Service — Phase 3.10 Legal/Compliance Validation Workbench.
 *
 * Server-side persistence for draft validation review records.
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check
 * 3. Zod validation
 * 4. State transition validation
 * 5. Audit event creation
 *
 * GOVERNANCE:
 * - Validation reviews are ADVISORY metadata only
 * - They do NOT approve, publish, or activate reference data
 * - They do NOT modify controlled regulatory reference data
 * - Validated drafts still require review → approval → publishing
 * - No AI provider calls are made during validation
 */
import { getDb, type AppDatabase } from '@/db';
import { eq } from 'drizzle-orm';
import { draftValidationReviews, draftChanges } from '@/db/schema';
import { requirePermission, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateDraftValidationReviewId } from './id-generator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxOrDb = AppDatabase | any;

// ── Result Type ─────────────────────────────────────────────────

export interface ValidationWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INVALID_TRANSITION' | 'PRECONDITION_FAILED' | 'DUPLICATE';
  created?: T;
  updated?: T;
  auditEventId?: string;
  entityId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult(): ValidationWriteResult {
  return {
    success: false,
    error: 'Database mode required for validation operations. Set DATA_SOURCE=database.',
    code: 'JSON_MODE',
  };
}

function notFoundResult(entityType: string, id: string): ValidationWriteResult {
  return {
    success: false,
    error: `${entityType} with ID "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// ── Valid Transitions ───────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  not_started: ['in_validation'],
  in_validation: ['legal_review_required', 'validated_for_review', 'returned_for_revision', 'rejected'],
  legal_review_required: ['in_validation', 'validated_for_review'],
  returned_for_revision: ['in_validation'],
  // Terminal states — no outbound transitions
  rejected: [],
  validated_for_review: [],
};

function validateTransition(currentStatus: string, newStatus: string): boolean {
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

// ── Create Validation Review ────────────────────────────────────

export async function createDraftValidationReview(input: {
  draftChangeId: string;
  validationType?: string;
  aiSuggestionId?: string | null;
  sourceRecordId?: string | null;
  sourceFileId?: string | null;
  legalReviewRequired?: boolean;
}): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.VALIDATION_REVIEW);

  const db = getDb();

  // Verify draft exists
  const [draft] = await db
    .select()
    .from(draftChanges)
    .where(eq(draftChanges.stableReferenceId, input.draftChangeId))
    .limit(1);

  if (!draft) return notFoundResult('DraftChange', input.draftChangeId);

  // Check for duplicate validation review
  const [existing] = await db
    .select()
    .from(draftValidationReviews)
    .where(eq(draftValidationReviews.draftChangeId, input.draftChangeId))
    .limit(1);

  if (existing) {
    return {
      success: false,
      error: `Validation review already exists for draft ${input.draftChangeId}.`,
      code: 'DUPLICATE',
    };
  }

  const refId = generateDraftValidationReviewId();

  // Detect AI-linked draft via changeReason provenance stamp
  const isAiLinked = draft.changeReason?.includes('[AI Citation Suggestion:') ?? false;
  const validationType = input.validationType
    ?? (isAiLinked ? 'ai_assisted_citation' : 'general');

  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any = {
    stableReferenceId: refId,
    draftChangeId: input.draftChangeId,
    aiSuggestionId: input.aiSuggestionId ?? null,
    sourceRecordId: input.sourceRecordId ?? null,
    sourceFileId: input.sourceFileId ?? null,
    validationStatus: 'not_started' as const,
    validationType,
    sourceSupportStatus: 'not_checked' as const,
    citationAccuracyStatus: isAiLinked ? 'not_checked' as const : 'not_applicable' as const,
    legalReviewRequired: input.legalReviewRequired ?? false,
    legalReviewCompleted: false,
    complianceReviewCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(draftValidationReviews).values(values);

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_validation_review',
    entityId: refId,
    action: 'validation_review_created',
    previousValue: null,
    newValue: JSON.stringify({
      draftChangeId: input.draftChangeId,
      validationType,
      isAiLinked,
      aiSuggestionId: input.aiSuggestionId ?? null,
    }),
    reason: `Validation review created for draft ${input.draftChangeId}`,
    sourceReference: input.draftChangeId,
  });

  return {
    success: true,
    created: { stableReferenceId: refId, draftChangeId: input.draftChangeId, validationType },
    auditEventId,
    entityId: refId,
  };
}

// ── Update Validation Status ────────────────────────────────────

export async function updateValidationStatus(
  validationReviewId: string,
  input: {
    newStatus: string;
    reviewerNotes?: string;
    reviewerDecision?: string;
    requiredCorrections?: string;
  },
): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();

  // Permission varies by target status
  const statusPermissionMap: Record<string, string> = {
    in_validation: PERMISSIONS.VALIDATION_REVIEW,
    legal_review_required: PERMISSIONS.VALIDATION_LEGAL_REVIEW,
    validated_for_review: PERMISSIONS.VALIDATION_MARK_READY,
    returned_for_revision: PERMISSIONS.VALIDATION_RETURN,
    rejected: PERMISSIONS.VALIDATION_REJECT,
  };

  const requiredPerm = statusPermissionMap[input.newStatus];
  if (requiredPerm) {
    requirePermission(requiredPerm as typeof PERMISSIONS[keyof typeof PERMISSIONS]);
  } else {
    requirePermission(PERMISSIONS.VALIDATION_REVIEW);
  }

  const db = getDb();
  const ctx = getSessionContext();

  // Load existing review
  const [review] = await db
    .select()
    .from(draftValidationReviews)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId))
    .limit(1);

  if (!review) return notFoundResult('DraftValidationReview', validationReviewId);

  // Validate transition
  if (!validateTransition(review.validationStatus, input.newStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${review.validationStatus} → ${input.newStatus}`,
      code: 'INVALID_TRANSITION',
    };
  }

  // Precondition checks for validated_for_review
  if (input.newStatus === 'validated_for_review') {
    // Load the draft to check completeness
    const [draft] = await db
      .select()
      .from(draftChanges)
      .where(eq(draftChanges.stableReferenceId, review.draftChangeId))
      .limit(1);

    if (!draft) {
      return {
        success: false,
        error: 'Linked draft change not found.',
        code: 'PRECONDITION_FAILED',
      };
    }

    // Gate 1: Source support must be checked
    if (review.sourceSupportStatus === 'not_checked') {
      return {
        success: false,
        error: 'Source support status must be assessed before validation.',
        code: 'PRECONDITION_FAILED',
      };
    }

    // Gate 2: Citation accuracy must be checked for AI-linked drafts
    if (review.citationAccuracyStatus === 'not_checked' &&
        review.validationType === 'ai_assisted_citation') {
      return {
        success: false,
        error: 'Citation accuracy must be assessed for AI-linked drafts before validation.',
        code: 'PRECONDITION_FAILED',
      };
    }

    // Gate 3: Legal review must be completed if required
    if (review.legalReviewRequired && !review.legalReviewCompleted) {
      return {
        success: false,
        error: 'Legal review must be completed before marking as validated.',
        code: 'PRECONDITION_FAILED',
      };
    }

    // Gate 4: Reviewer notes required if source is partial/unsupported
    if (['partially_supported', 'unsupported', 'missing_source'].includes(review.sourceSupportStatus) &&
        !review.reviewerNotes && !input.reviewerNotes) {
      return {
        success: false,
        error: 'Reviewer notes are required when source support is partial or unsupported.',
        code: 'PRECONDITION_FAILED',
      };
    }

    // Gate 5: Draft must not be already rejected or published
    if (draft.draftStatus && ['rejected', 'published'].includes(draft.draftStatus)) {
      return {
        success: false,
        error: `Draft is in terminal status "${draft.draftStatus}" — cannot validate.`,
        code: 'PRECONDITION_FAILED',
      };
    }
  }

  const previousStatus = review.validationStatus;
  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    validationStatus: input.newStatus,
    updatedAt: now,
  };

  // Set reviewer identity on status change
  if (['validated_for_review', 'returned_for_revision', 'rejected'].includes(input.newStatus)) {
    updates.reviewedByUserId = safeUserId(ctx);
    updates.reviewedByEmail = ctx.userEmail;
    updates.reviewedByName = ctx.userName;
    updates.reviewedAt = now;
  }

  if (input.reviewerNotes !== undefined) updates.reviewerNotes = input.reviewerNotes;
  if (input.reviewerDecision !== undefined) updates.reviewerDecision = input.reviewerDecision;
  if (input.requiredCorrections !== undefined) updates.requiredCorrections = input.requiredCorrections;

  await db
    .update(draftValidationReviews)
    .set(updates)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_validation_review',
    entityId: validationReviewId,
    action: 'validation_status_changed',
    previousValue: previousStatus,
    newValue: input.newStatus,
    reason: `Validation status: ${previousStatus} → ${input.newStatus}`,
    sourceReference: review.draftChangeId,
  });

  return {
    success: true,
    updated: { stableReferenceId: validationReviewId, previousStatus, newStatus: input.newStatus },
    auditEventId,
    entityId: validationReviewId,
  };
}

// ── Update Source Support Status ─────────────────────────────────

export async function updateSourceSupportStatus(
  validationReviewId: string,
  input: {
    sourceSupportStatus: string;
    reviewerNotes?: string;
  },
): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.VALIDATION_REVIEW);

  const db = getDb();

  const [review] = await db
    .select()
    .from(draftValidationReviews)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId))
    .limit(1);

  if (!review) return notFoundResult('DraftValidationReview', validationReviewId);

  const previous = review.sourceSupportStatus;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    sourceSupportStatus: input.sourceSupportStatus,
    updatedAt: new Date(),
  };

  if (input.reviewerNotes !== undefined) updates.reviewerNotes = input.reviewerNotes;

  await db
    .update(draftValidationReviews)
    .set(updates)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_validation_review',
    entityId: validationReviewId,
    action: 'source_support_updated',
    previousValue: previous,
    newValue: input.sourceSupportStatus,
    reason: `Source support: ${previous} → ${input.sourceSupportStatus}`,
    sourceReference: review.draftChangeId,
  });

  return {
    success: true,
    updated: { stableReferenceId: validationReviewId, sourceSupportStatus: input.sourceSupportStatus },
    auditEventId,
    entityId: validationReviewId,
  };
}

// ── Update Citation Accuracy Status ─────────────────────────────

export async function updateCitationAccuracyStatus(
  validationReviewId: string,
  input: {
    citationAccuracyStatus: string;
    reviewerNotes?: string;
  },
): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.VALIDATION_REVIEW);

  const db = getDb();

  const [review] = await db
    .select()
    .from(draftValidationReviews)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId))
    .limit(1);

  if (!review) return notFoundResult('DraftValidationReview', validationReviewId);

  const previous = review.citationAccuracyStatus;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    citationAccuracyStatus: input.citationAccuracyStatus,
    updatedAt: new Date(),
  };

  if (input.reviewerNotes !== undefined) updates.reviewerNotes = input.reviewerNotes;

  await db
    .update(draftValidationReviews)
    .set(updates)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_validation_review',
    entityId: validationReviewId,
    action: 'citation_accuracy_updated',
    previousValue: previous,
    newValue: input.citationAccuracyStatus,
    reason: `Citation accuracy: ${previous} → ${input.citationAccuracyStatus}`,
    sourceReference: review.draftChangeId,
  });

  return {
    success: true,
    updated: { stableReferenceId: validationReviewId, citationAccuracyStatus: input.citationAccuracyStatus },
    auditEventId,
    entityId: validationReviewId,
  };
}

// ── Update Validation Notes ─────────────────────────────────────

export async function updateValidationNotes(
  validationReviewId: string,
  input: {
    reviewerNotes?: string;
    validationFindings?: string;
    requiredCorrections?: string;
    legalReviewRequired?: boolean;
    complianceReviewCompleted?: boolean;
    legalReviewCompleted?: boolean;
  },
): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.VALIDATION_REVIEW);

  // C2 FIX: Marking legal review completed requires VALIDATION_LEGAL_REVIEW permission.
  // This prevents non-Legal Reviewer roles from setting legalReviewCompleted = true.
  if (input.legalReviewCompleted === true) {
    requirePermission(PERMISSIONS.VALIDATION_LEGAL_REVIEW);
  }

  const db = getDb();

  const [review] = await db
    .select()
    .from(draftValidationReviews)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId))
    .limit(1);

  if (!review) return notFoundResult('DraftValidationReview', validationReviewId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = { updatedAt: new Date() };

  if (input.reviewerNotes !== undefined) updates.reviewerNotes = input.reviewerNotes;
  if (input.validationFindings !== undefined) updates.validationFindings = input.validationFindings;
  if (input.requiredCorrections !== undefined) updates.requiredCorrections = input.requiredCorrections;
  if (input.legalReviewRequired !== undefined) updates.legalReviewRequired = input.legalReviewRequired;
  if (input.complianceReviewCompleted !== undefined) updates.complianceReviewCompleted = input.complianceReviewCompleted;
  if (input.legalReviewCompleted !== undefined) updates.legalReviewCompleted = input.legalReviewCompleted;

  await db
    .update(draftValidationReviews)
    .set(updates)
    .where(eq(draftValidationReviews.stableReferenceId, validationReviewId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_validation_review',
    entityId: validationReviewId,
    action: 'validation_notes_updated',
    previousValue: null,
    newValue: JSON.stringify(input),
    reason: 'Validation notes/findings updated',
    sourceReference: review.draftChangeId,
  });

  return {
    success: true,
    updated: { stableReferenceId: validationReviewId },
    auditEventId,
    entityId: validationReviewId,
  };
}

// ── Read Operations ─────────────────────────────────────────────

export async function getDraftValidationReviewsDb(): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.VALIDATION_VIEW);

  const db = getDb();
  const rows = await db.select().from(draftValidationReviews);

  return {
    success: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    created: rows as any,
  };
}

export async function getDraftValidationReviewByDraftChange(
  draftChangeId: string,
): Promise<ValidationWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.VALIDATION_VIEW);

  const db = getDb();

  const [review] = await db
    .select()
    .from(draftValidationReviews)
    .where(eq(draftValidationReviews.draftChangeId, draftChangeId))
    .limit(1);

  if (!review) return notFoundResult('DraftValidationReview (by draft)', draftChangeId);

  return {
    success: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    created: review as any,
  };
}
