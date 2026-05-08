/**
 * Staging Write Service — Server-side persistence for draft regulatory data.
 *
 * Provides write functions for regulatory update drafts and draft changes.
 * Each function enforces:
 * 1. Database mode check (no-op in JSON mode)
 * 2. RBAC permission check (throws AuthorizationError if denied)
 * 3. Entity existence validation (for updates)
 * 4. Whitelisted field update only (never touches active reference data)
 * 5. Audit event creation on success
 *
 * GOVERNANCE: These functions only create/update DRAFT/STAGING records.
 * Active regulatory reference data (obligations, regulations,
 * citations, standards, crosswalk mappings) is never modified.
 * Approval and publication are NOT implemented in this phase.
 */
import { getDb } from '@/db';
import { eq } from 'drizzle-orm';
import { regulatoryUpdates, draftChanges } from '@/db/schema';
import { requirePermission, AuthorizationError, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateRegulatoryUpdateId, generateDraftChangeId } from './id-generator';
import { createApprovalReview } from './review-writes';

// Re-export for API route consumption
export { AuthorizationError };

// ── Result Types ────────────────────────────────────────────────

export interface StagingWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR';
  created?: T;
  updated?: T;
  auditEventId?: string;
  entityId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult(): StagingWriteResult {
  return {
    success: false,
    error: 'Database mode required for persistence. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

function notFoundResult(entityType: string, id: string): StagingWriteResult {
  return {
    success: false,
    error: `${entityType} with stableReferenceId "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// ── Whitelisted Fields ──────────────────────────────────────────

/** Fields allowed for regulatory update draft creation and editing */
const REGULATORY_UPDATE_ALLOWED_FIELDS = new Set([
  'updateTitle', 'sourceName', 'sourceType', 'regulator', 'jurisdiction',
  'publicationDate', 'effectiveDate', 'changeType', 'changeSummary',
  'sourceReference', 'impactedDomains', 'impactedBusinessFunctions',
  'confidenceLevel', 'legalReviewRequired', 'assignedReviewer',
  'relatedObligationIds', 'relatedCrosswalkIds',
]);

/** Fields allowed for draft change creation and editing */
const DRAFT_CHANGE_ALLOWED_FIELDS = new Set([
  'relatedUpdateId', 'affectedEntityType', 'affectedEntityId',
  'changeType', 'proposedChangeSummary', 'previousValue', 'proposedValue',
  'sourceReference', 'changeReason', 'requiredApprover',
]);

/** Filter an object to only whitelisted keys */
function pickAllowed(obj: Record<string, unknown>, allowed: Set<string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (allowed.has(key)) {
      result[key] = value;
    }
  }
  return result;
}

// ── Regulatory Update Draft Writes ──────────────────────────────

/**
 * Create a new draft regulatory update.
 * Requires: reference.draft.create
 */
export async function createRegulatoryUpdateDraft(
  input: {
    updateTitle: string;
    changeType: string;
    changeSummary: string;
    sourceName?: string | null;
    sourceType?: string | null;
    regulator?: string | null;
    jurisdiction?: string | null;
    publicationDate?: string | null;
    effectiveDate?: string | null;
    sourceReference?: string | null;
    impactedDomains?: string[];
    impactedBusinessFunctions?: string[];
    confidenceLevel?: string | null;
    legalReviewRequired?: boolean;
    assignedReviewer?: string | null;
    relatedObligationIds?: string[];
    relatedCrosswalkIds?: string[];
  },
): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_DRAFT_CREATE);

  // Validate required fields
  if (!input.updateTitle?.trim()) {
    return { success: false, error: 'updateTitle is required.', code: 'VALIDATION_ERROR' };
  }
  if (!input.changeType?.trim()) {
    return { success: false, error: 'changeType is required.', code: 'VALIDATION_ERROR' };
  }
  if (!input.changeSummary?.trim()) {
    return { success: false, error: 'changeSummary is required.', code: 'VALIDATION_ERROR' };
  }

  const db = getDb();
  const ctx = getSessionContext();
  const stableRefId = generateRegulatoryUpdateId();

  const insertValues: Record<string, unknown> = {
    stableReferenceId: stableRefId,
    updateTitle: input.updateTitle.trim(),
    changeType: input.changeType,
    changeSummary: input.changeSummary.trim(),
    currentStage: 'intake' as const,
    intakeDate: new Date(),
    // Phase 2.5A: Creator attribution for separation-of-duties
    createdByUserId: safeUserId(ctx),
  };

  // Optional fields
  if (input.sourceName !== undefined) insertValues.sourceName = input.sourceName;
  if (input.sourceType !== undefined) insertValues.sourceType = input.sourceType;
  if (input.regulator !== undefined) insertValues.regulator = input.regulator;
  if (input.jurisdiction !== undefined) insertValues.jurisdiction = input.jurisdiction;
  if (input.publicationDate !== undefined) insertValues.publicationDate = input.publicationDate;
  if (input.effectiveDate !== undefined) insertValues.effectiveDate = input.effectiveDate;
  if (input.sourceReference !== undefined) insertValues.sourceReference = input.sourceReference;
  if (input.confidenceLevel !== undefined) insertValues.confidenceLevel = input.confidenceLevel;
  if (input.legalReviewRequired !== undefined) insertValues.legalReviewRequired = input.legalReviewRequired;
  if (input.assignedReviewer !== undefined) insertValues.assignedReviewer = input.assignedReviewer;
  if (input.impactedDomains !== undefined) insertValues.impactedDomains = JSON.stringify(input.impactedDomains);
  if (input.impactedBusinessFunctions !== undefined) insertValues.impactedBusinessFunctions = JSON.stringify(input.impactedBusinessFunctions);
  if (input.relatedObligationIds !== undefined) insertValues.relatedObligationIds = JSON.stringify(input.relatedObligationIds);
  if (input.relatedCrosswalkIds !== undefined) insertValues.relatedCrosswalkIds = JSON.stringify(input.relatedCrosswalkIds);

  await db.insert(regulatoryUpdates).values(insertValues as typeof regulatoryUpdates.$inferInsert);

  const auditEventId = await insertAuditEvent({
    entityType: 'regulatory_update',
    entityId: stableRefId,
    action: 'regulatory_update_draft_created',
    previousValue: null,
    newValue: JSON.stringify({ updateTitle: input.updateTitle, changeType: input.changeType }),
  });

  return { success: true, entityId: stableRefId, created: insertValues, auditEventId };
}

/**
 * Update metadata fields on a draft regulatory update.
 * Requires: reference.draft.edit
 */
export async function updateRegulatoryUpdateDraft(
  stableRefId: string,
  fields: Record<string, unknown>,
): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_DRAFT_EDIT);

  const allowedUpdates = pickAllowed(fields, REGULATORY_UPDATE_ALLOWED_FIELDS);
  if (Object.keys(allowedUpdates).length === 0) {
    return { success: false, error: 'No updateable fields provided.', code: 'VALIDATION_ERROR' };
  }

  const db = getDb();
  const [existing] = await db
    .select({ stableReferenceId: regulatoryUpdates.stableReferenceId, currentStage: regulatoryUpdates.currentStage })
    .from(regulatoryUpdates)
    .where(eq(regulatoryUpdates.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('RegulatoryUpdate', stableRefId);

  // Serialize array fields as JSON text if present
  const dbUpdates = { ...allowedUpdates };
  for (const arrayField of ['impactedDomains', 'impactedBusinessFunctions', 'relatedObligationIds', 'relatedCrosswalkIds']) {
    if (Array.isArray(dbUpdates[arrayField])) {
      dbUpdates[arrayField] = JSON.stringify(dbUpdates[arrayField]);
    }
  }

  await db
    .update(regulatoryUpdates)
    .set(dbUpdates)
    .where(eq(regulatoryUpdates.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'regulatory_update',
    entityId: stableRefId,
    action: 'regulatory_update_draft_updated',
    previousValue: JSON.stringify({ currentStage: existing.currentStage }),
    newValue: JSON.stringify(allowedUpdates),
  });

  return { success: true, entityId: stableRefId, updated: allowedUpdates, auditEventId };
}

/**
 * Change the workflow stage of a regulatory update.
 * Requires: reference.draft.edit
 *
 * Valid stages: intake, triage, draft_mapping, review
 * Stages 'approved' and 'published' are blocked in Phase 2.4.
 */
export async function updateRegulatoryUpdateStage(
  stableRefId: string,
  newStage: string,
): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_DRAFT_EDIT);

  // Rejecting requires elevated reviewer permission
  if (newStage === 'rejected') {
    requirePermission(PERMISSIONS.REFERENCE_REVIEW);
  }

  const ALLOWED_STAGES = ['intake', 'triage', 'draft_mapping', 'review', 'rejected'] as const;
  const BLOCKED_STAGES = ['approved', 'published'];

  if (BLOCKED_STAGES.includes(newStage)) {
    return {
      success: false,
      error: `Stage "${newStage}" requires the approval workflow (Phase 2.5). Draft stage changes are limited to: ${ALLOWED_STAGES.join(', ')}.`,
      code: 'VALIDATION_ERROR',
    };
  }
  if (!ALLOWED_STAGES.includes(newStage as typeof ALLOWED_STAGES[number])) {
    return {
      success: false,
      error: `Invalid stage. Allowed: ${ALLOWED_STAGES.join(', ')}`,
      code: 'VALIDATION_ERROR',
    };
  }

  const db = getDb();
  const [existing] = await db
    .select({ currentStage: regulatoryUpdates.currentStage })
    .from(regulatoryUpdates)
    .where(eq(regulatoryUpdates.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('RegulatoryUpdate', stableRefId);

  await db
    .update(regulatoryUpdates)
    .set({ currentStage: newStage as typeof ALLOWED_STAGES[number] })
    .where(eq(regulatoryUpdates.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'regulatory_update',
    entityId: stableRefId,
    action: 'regulatory_update_stage_changed',
    previousValue: existing.currentStage,
    newValue: newStage,
  });

  return { success: true, entityId: stableRefId, updated: { currentStage: newStage }, auditEventId };
}

// ── Draft Change Writes ─────────────────────────────────────────

/**
 * Create a new draft regulatory change.
 * Requires: draft.edit
 */
export async function createDraftChange(
  input: {
    relatedUpdateId: string;
    affectedEntityType: string;
    changeType: string;
    proposedChangeSummary: string;
    affectedEntityId?: string | null;
    previousValue?: string | null;
    proposedValue?: string | null;
    sourceReference?: string | null;
    changeReason?: string | null;
    requiredApprover?: string | null;
  },
): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.DRAFT_EDIT);

  // Validate required fields
  if (!input.relatedUpdateId?.trim()) {
    return { success: false, error: 'relatedUpdateId is required.', code: 'VALIDATION_ERROR' };
  }
  if (!input.affectedEntityType?.trim()) {
    return { success: false, error: 'affectedEntityType is required.', code: 'VALIDATION_ERROR' };
  }
  if (!input.changeType?.trim()) {
    return { success: false, error: 'changeType is required.', code: 'VALIDATION_ERROR' };
  }
  if (!input.proposedChangeSummary?.trim()) {
    return { success: false, error: 'proposedChangeSummary is required.', code: 'VALIDATION_ERROR' };
  }

  const db = getDb();
  const stableRefId = generateDraftChangeId();
  const ctx = getSessionContext();

  const insertValues: Record<string, unknown> = {
    stableReferenceId: stableRefId,
    relatedUpdateId: input.relatedUpdateId,
    affectedEntityType: input.affectedEntityType,
    changeType: input.changeType,
    proposedChangeSummary: input.proposedChangeSummary.trim(),
    draftStatus: 'draft' as const,
    submittedBy: ctx.userName ?? ctx.userEmail ?? 'unknown',
    submittedDate: new Date().toISOString().split('T')[0],
    // Phase 2.5A: Creator attribution for separation-of-duties
    createdByUserId: safeUserId(ctx),
  };

  // Optional fields
  if (input.affectedEntityId !== undefined) insertValues.affectedEntityId = input.affectedEntityId;
  if (input.previousValue !== undefined) insertValues.previousValue = input.previousValue;
  if (input.proposedValue !== undefined) insertValues.proposedValue = input.proposedValue;
  if (input.sourceReference !== undefined) insertValues.sourceReference = input.sourceReference;
  if (input.changeReason !== undefined) insertValues.changeReason = input.changeReason;
  if (input.requiredApprover !== undefined) insertValues.requiredApprover = input.requiredApprover;

  await db.insert(draftChanges).values(insertValues as typeof draftChanges.$inferInsert);

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_change',
    entityId: stableRefId,
    action: 'draft_change_created',
    previousValue: null,
    newValue: JSON.stringify({ proposedChangeSummary: input.proposedChangeSummary, changeType: input.changeType }),
  });

  return { success: true, entityId: stableRefId, created: insertValues, auditEventId };
}

/**
 * Update fields on a draft change.
 * Requires: draft.edit
 * Only allowed when draftStatus is 'draft' or 'returned'.
 */
export async function updateDraftChange(
  stableRefId: string,
  fields: Record<string, unknown>,
): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.DRAFT_EDIT);

  const allowedUpdates = pickAllowed(fields, DRAFT_CHANGE_ALLOWED_FIELDS);
  if (Object.keys(allowedUpdates).length === 0) {
    return { success: false, error: 'No updateable fields provided.', code: 'VALIDATION_ERROR' };
  }

  const db = getDb();
  const [existing] = await db
    .select({ stableReferenceId: draftChanges.stableReferenceId, draftStatus: draftChanges.draftStatus })
    .from(draftChanges)
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('DraftChange', stableRefId);

  // Only allow edits when in draft or returned status
  if (!['draft', 'returned'].includes(existing.draftStatus)) {
    return {
      success: false,
      error: `Cannot edit a draft change in "${existing.draftStatus}" status. Only "draft" or "returned" drafts are editable.`,
      code: 'VALIDATION_ERROR',
    };
  }

  await db
    .update(draftChanges)
    .set(allowedUpdates)
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_change',
    entityId: stableRefId,
    action: 'draft_change_updated',
    previousValue: JSON.stringify({ draftStatus: existing.draftStatus }),
    newValue: JSON.stringify(allowedUpdates),
  });

  return { success: true, entityId: stableRefId, updated: allowedUpdates, auditEventId };
}

/**
 * Mark a draft change as ready for review.
 * Requires: draft.edit
 */
export async function markDraftReadyForReview(stableRefId: string): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.DRAFT_EDIT);

  const db = getDb();
  const [existing] = await db
    .select({ draftStatus: draftChanges.draftStatus })
    .from(draftChanges)
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('DraftChange', stableRefId);

  if (!['draft', 'returned'].includes(existing.draftStatus)) {
    return {
      success: false,
      error: `Cannot mark as ready — current status is "${existing.draftStatus}".`,
      code: 'VALIDATION_ERROR',
    };
  }

  await db
    .update(draftChanges)
    .set({ draftStatus: 'ready_for_review' })
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_change',
    entityId: stableRefId,
    action: 'draft_change_ready_for_review',
    previousValue: existing.draftStatus,
    newValue: 'ready_for_review',
  });

  return { success: true, entityId: stableRefId, updated: { draftStatus: 'ready_for_review' }, auditEventId };
}

/**
 * Submit a draft change for review (sets status + records submitter info).
 * Requires: draft.edit
 */
export async function submitDraftForReview(stableRefId: string): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.DRAFT_EDIT);

  const db = getDb();
  const ctx = getSessionContext();
  const [existing] = await db
    .select({ draftStatus: draftChanges.draftStatus })
    .from(draftChanges)
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('DraftChange', stableRefId);

  if (!['draft', 'returned'].includes(existing.draftStatus)) {
    return {
      success: false,
      error: `Cannot submit — current status is "${existing.draftStatus}".`,
      code: 'VALIDATION_ERROR',
    };
  }

  const updates = {
    draftStatus: 'ready_for_review' as const,
    submittedBy: ctx.userName ?? ctx.userEmail ?? 'unknown',
    submittedDate: new Date().toISOString().split('T')[0],
  };

  await db
    .update(draftChanges)
    .set(updates)
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_change',
    entityId: stableRefId,
    action: 'draft_change_submitted',
    previousValue: existing.draftStatus,
    newValue: JSON.stringify(updates),
  });

  // Phase 2.5A: Auto-create an approval review record when a draft is submitted
  try {
    // Look up the relatedUpdateId for linking
    const [draft] = await db
      .select({ relatedUpdateId: draftChanges.relatedUpdateId })
      .from(draftChanges)
      .where(eq(draftChanges.stableReferenceId, stableRefId));

    await createApprovalReview({
      reviewTargetType: 'draft_change',
      reviewTargetId: stableRefId,
      relatedUpdateId: draft?.relatedUpdateId ?? null,
      relatedDraftChangeId: stableRefId,
    });
  } catch {
    // Non-fatal: review creation failure shouldn't block the submit.
    // The review can be created manually from the review queue.
  }

  return { success: true, entityId: stableRefId, updated: updates, auditEventId };
}

/**
 * Return a draft change to "draft" status (from ready_for_review).
 * Requires: reference.review (reviewer permission)
 */
export async function returnDraftToDraft(
  stableRefId: string,
  reason?: string,
): Promise<StagingWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_REVIEW);

  const db = getDb();
  const [existing] = await db
    .select({ draftStatus: draftChanges.draftStatus })
    .from(draftChanges)
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  if (!existing) return notFoundResult('DraftChange', stableRefId);

  if (existing.draftStatus !== 'ready_for_review') {
    return {
      success: false,
      error: `Cannot return — current status is "${existing.draftStatus}". Only "ready_for_review" drafts can be returned.`,
      code: 'VALIDATION_ERROR',
    };
  }

  await db
    .update(draftChanges)
    .set({ draftStatus: 'returned' })
    .where(eq(draftChanges.stableReferenceId, stableRefId));

  const auditEventId = await insertAuditEvent({
    entityType: 'draft_change',
    entityId: stableRefId,
    action: 'draft_change_returned',
    previousValue: 'ready_for_review',
    newValue: 'returned',
    reason: reason ?? undefined,
  });

  return { success: true, entityId: stableRefId, updated: { draftStatus: 'returned' }, auditEventId };
}
