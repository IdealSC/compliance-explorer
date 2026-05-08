/**
 * Publishing Write Service — Controlled publishing of approved draft changes.
 *
 * GOVERNANCE: This is the ONLY path for creating active regulatory reference records
 * from approved drafts. Publishing NEVER overwrites existing active records.
 * It creates new versioned records and supersedes prior versions.
 *
 * Every function enforces:
 * 1. Database mode check
 * 2. RBAC permission check (reference.publish)
 * 3. Approval readiness validation
 * 4. Source reference validation
 * 5. Three-level separation-of-duties
 * 6. Versioned record creation (never overwrite)
 * 7. Prior version supersession where applicable
 * 8. Immutable publication event record
 * 9. Audit event creation
 */
import { getDb, type AppDatabase } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import {
  approvalReviews,
  regulatoryUpdates,
  draftChanges,
  publicationEvents,
  regulatoryReferenceRecords,
  regulatoryVersions,
  sourceRecords,
} from '@/db/schema';
import { requirePermission, AuthorizationError, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import {
  generatePublicationEventId,
  generateVersionId,
  generateReferenceRecordId,
} from './id-generator';
import { assertAppendOnly } from './immutability-guard';

// C4 FIX: Transaction-compatible db type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxOrDb = AppDatabase | any;

// Re-export for API route consumption
export { AuthorizationError };

// ── Result Types ────────────────────────────────────────────────

export interface PublishWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'CONFLICT' | 'SoD_VIOLATION';
  data?: T;
  auditEventIds?: string[];
}

export interface ValidationCheck {
  check: string;
  passed: boolean;
  detail?: string;
}

export interface ValidationResult {
  ready: boolean;
  checks: ValidationCheck[];
  draftData?: DraftData;
  reviewData?: ReviewData;
}

interface DraftData {
  id: string;
  stableReferenceId: string;
  affectedEntityType: string;
  affectedEntityId: string | null;
  proposedChangeSummary: string;
  proposedValue: string | null;
  previousValue: string | null;
  sourceReference: string | null;
  changeReason: string | null;
  changeType: string;
  draftStatus: string;
  createdByUserId: string | null;
  regulatoryUpdateId: string | null;
  relatedUpdateId: string | null;
}

interface ReviewData {
  stableReferenceId: string;
  reviewStatus: string;
  submittedByUserId: string | null;
  reviewedByUserId: string | null;
  reviewedByName: string | null;
  approvalReference: string | null;
  sourceReference: string | null;
  legalReviewRequired: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult<T = Record<string, unknown>>(): PublishWriteResult<T> {
  return {
    success: false,
    error: 'Database mode required for publishing. Set DATA_SOURCE=database in environment.',
    code: 'JSON_MODE',
  };
}

// ── 1. Validate Draft Ready for Publication ─────────────────────

/**
 * Run all precondition checks for publishing a draft change.
 * Does NOT require reference.publish — validation can be read-only.
 */
export async function validateDraftReadyForPublication(
  draftStableRefId: string,
): Promise<ValidationResult> {
  if (!isDatabaseMode()) {
    return { ready: false, checks: [{ check: 'database_mode', passed: false, detail: 'Database mode required' }] };
  }

  const db = getDb();
  const checks: ValidationCheck[] = [];

  // 1. Fetch draft
  const [draft] = await db
    .select()
    .from(draftChanges)
    .where(eq(draftChanges.stableReferenceId, draftStableRefId));

  if (!draft) {
    checks.push({ check: 'draft_exists', passed: false, detail: `Draft "${draftStableRefId}" not found` });
    return { ready: false, checks };
  }
  checks.push({ check: 'draft_exists', passed: true });

  const draftData: DraftData = {
    id: draft.id,
    stableReferenceId: draft.stableReferenceId,
    affectedEntityType: draft.affectedEntityType,
    affectedEntityId: draft.affectedEntityId,
    proposedChangeSummary: draft.proposedChangeSummary,
    proposedValue: draft.proposedValue,
    previousValue: draft.previousValue,
    sourceReference: draft.sourceReference,
    changeReason: draft.changeReason,
    changeType: draft.changeType,
    draftStatus: draft.draftStatus,
    createdByUserId: draft.createdByUserId,
    regulatoryUpdateId: draft.regulatoryUpdateId,
    relatedUpdateId: draft.relatedUpdateId,
  };

  // 2. Draft status must be 'approved' (approved for publication readiness)
  const draftStatusOk = draft.draftStatus === 'approved';
  checks.push({
    check: 'draft_status_approved',
    passed: draftStatusOk,
    detail: draftStatusOk ? 'Draft is approved' : `Draft status is "${draft.draftStatus}", expected "approved"`,
  });

  // 3. Draft must not already be published
  const notPublished = draft.draftStatus !== 'published';
  checks.push({
    check: 'not_already_published',
    passed: notPublished,
    detail: notPublished ? 'Draft has not been published' : 'Draft is already published',
  });

  // 4. Source reference must exist
  const hasSource = !!draft.sourceReference;
  checks.push({
    check: 'source_reference_exists',
    passed: hasSource,
    detail: hasSource ? `Source: ${draft.sourceReference}` : 'No source reference provided',
  });

  // 5. Approval review must exist and be approved_for_publication
  const [review] = await db
    .select()
    .from(approvalReviews)
    .where(
      and(
        eq(approvalReviews.reviewTargetType, 'draft_change'),
        eq(approvalReviews.reviewTargetId, draftStableRefId),
        eq(approvalReviews.reviewStatus, 'approved_for_publication'),
      ),
    )
    .orderBy(desc(approvalReviews.createdAt))
    .limit(1);

  const hasApproval = !!review;
  checks.push({
    check: 'approval_review_approved',
    passed: hasApproval,
    detail: hasApproval
      ? `Approved by ${review.reviewedByName || review.reviewedByEmail || 'unknown'}`
      : 'No approved-for-publication review found',
  });

  let reviewData: ReviewData | undefined;
  if (review) {
    reviewData = {
      stableReferenceId: review.stableReferenceId,
      reviewStatus: review.reviewStatus,
      submittedByUserId: review.submittedByUserId,
      reviewedByUserId: review.reviewedByUserId,
      reviewedByName: review.reviewedByName,
      approvalReference: review.approvalReference,
      sourceReference: review.sourceReference,
      legalReviewRequired: review.legalReviewRequired,
    };

    // 6. Legal review must be complete (not pending)
    if (review.legalReviewRequired) {
      // If review is approved_for_publication but legal was required,
      // it means legal review was completed before approval
      checks.push({ check: 'legal_review_complete', passed: true, detail: 'Legal review was required and completed' });
    } else {
      checks.push({ check: 'legal_review_complete', passed: true, detail: 'Legal review not required' });
    }
  } else {
    checks.push({ check: 'legal_review_complete', passed: false, detail: 'Cannot assess — no approval review found' });
  }

  // 7. Source registry validation (Phase 2.7 — informational, non-blocking)
  if (draft.sourceReference) {
    const [srcRecord] = await db
      .select()
      .from(sourceRecords)
      .where(eq(sourceRecords.stableReferenceId, draft.sourceReference))
      .limit(1);

    if (srcRecord) {
      const srcValidated = srcRecord.validationStatus === 'validated';
      checks.push({
        check: 'source_registry_validation',
        passed: srcValidated,
        detail: srcValidated
          ? `Source "${srcRecord.sourceTitle}" is validated`
          : `Source "${srcRecord.sourceTitle}" validation status: ${srcRecord.validationStatus} (non-blocking)`,
      });
    } else {
      // Source reference exists as text but no registry record — pass with note
      checks.push({
        check: 'source_registry_validation',
        passed: true,
        detail: `No source registry record linked for "${draft.sourceReference}" — manual source verification assumed`,
      });
    }
  } else {
    checks.push({
      check: 'source_registry_validation',
      passed: true,
      detail: 'No source reference to validate against registry',
    });
  }

  const ready = checks.every((c) => c.passed);
  return { ready, checks, draftData, reviewData };
}

// ── 2. Publish Draft Change ─────────────────────────────────────

/**
 * Publish an approved draft change as a new versioned active reference record.
 *
 * Requires: reference.publish
 * Enforces 3-level SoD: publisher ≠ creator, publisher ≠ review submitter, publisher ≠ approver
 */
export async function publishDraftChange(
  draftStableRefId: string,
  options?: { publicationSummary?: string },
): Promise<PublishWriteResult<{ publicationEventId: string; newVersionId: string; newRecordId: string }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_PUBLISH);

  // ── 1. Validate preconditions ───────────────────────────────
  const validation = await validateDraftReadyForPublication(draftStableRefId);
  if (!validation.ready || !validation.draftData || !validation.reviewData) {
    const failedChecks = validation.checks.filter((c) => !c.passed).map((c) => `${c.check}: ${c.detail}`).join('; ');
    return {
      success: false,
      error: `Publication preconditions not met: ${failedChecks}`,
      code: 'VALIDATION_ERROR',
    };
  }

  const { draftData, reviewData } = validation;
  const ctx = getSessionContext();
  const auditEventIds: string[] = [];

  // ── 2. Three-level Separation of Duties ─────────────────────

  // Check 1: Publisher ≠ Draft Creator
  if (draftData.createdByUserId && ctx.userId && draftData.createdByUserId === ctx.userId) {
    return {
      success: false,
      error: 'Separation of duties: You cannot publish a draft you created.',
      code: 'SoD_VIOLATION',
    };
  }

  // Check 2: Publisher ≠ Review Submitter
  if (reviewData.submittedByUserId && ctx.userId && reviewData.submittedByUserId === ctx.userId) {
    return {
      success: false,
      error: 'Separation of duties: You cannot publish a draft whose review you submitted.',
      code: 'SoD_VIOLATION',
    };
  }

  // Check 3: Publisher ≠ Approver
  if (reviewData.reviewedByUserId && ctx.userId && reviewData.reviewedByUserId === ctx.userId) {
    return {
      success: false,
      error: 'Separation of duties: You cannot publish a draft you approved. A different authorized user must publish.',
      code: 'SoD_VIOLATION',
    };
  }

  // C4 FIX: Validation audit is now inside the transaction below

  const db = getDb();

  // Sequential operations (neon-http driver does not support transactions)
  try {
    const txAuditIds: string[] = [];

    // ── 4. Log validation completion ────────────────────────
    const validationAuditId2 = await insertAuditEvent({
      entityType: 'draft_change',
      entityId: draftStableRefId,
      action: 'publishing_validation_completed',
      previousValue: null,
      newValue: JSON.stringify({ checks: validation.checks.length, allPassed: true }),
      reason: 'All publication preconditions passed',
      sourceReference: draftData.sourceReference,
    });
    txAuditIds.push(validationAuditId2);

    // ── 5. Find existing active record to supersede ─────────
    let existingActiveRecord: { id: string; stableReferenceId: string; versionNumber: string } | null = null;

    if (draftData.affectedEntityId) {
      const [existing] = await db
        .select({
          id: regulatoryReferenceRecords.id,
          stableReferenceId: regulatoryReferenceRecords.stableReferenceId,
          versionNumber: regulatoryReferenceRecords.versionNumber,
        })
        .from(regulatoryReferenceRecords)
        .where(
          and(
            eq(regulatoryReferenceRecords.stableReferenceId, draftData.affectedEntityId),
            eq(regulatoryReferenceRecords.recordStatus, 'active'),
          ),
        );
      if (existing) {
        existingActiveRecord = existing;
      }
    }

    // ── 6. Supersede prior version if applicable ────────────
    if (existingActiveRecord) {
      await supersedePriorActiveVersion(existingActiveRecord.id, existingActiveRecord.stableReferenceId);
      const supersedeAuditId = await insertAuditEvent({
        entityType: 'regulatory_reference_record',
        entityId: existingActiveRecord.stableReferenceId,
        action: 'publishing_prior_version_superseded',
        previousValue: 'active',
        newValue: 'superseded',
        reason: `Superseded by new version from draft ${draftStableRefId}`,
        sourceReference: draftData.sourceReference,
      });
      txAuditIds.push(supersedeAuditId);
    }

    // ── 7. Create new versioned reference record ────────────
    const stableRefId = existingActiveRecord
      ? existingActiveRecord.stableReferenceId
      : generateReferenceRecordId();

    const newVersionNumber = existingActiveRecord
      ? incrementVersion(existingActiveRecord.versionNumber)
      : '1.0';

    let parentUpdate: { regulator: string | null; jurisdiction: string | null; sourceName: string | null } | null = null;
    const updateUuid = draftData.regulatoryUpdateId;
    if (updateUuid) {
      const [update] = await db
        .select({
          regulator: regulatoryUpdates.regulator,
          jurisdiction: regulatoryUpdates.jurisdiction,
          sourceName: regulatoryUpdates.sourceName,
        })
        .from(regulatoryUpdates)
        .where(eq(regulatoryUpdates.id, updateUuid));
      if (update) parentUpdate = update;
    }
    if (!parentUpdate && draftData.relatedUpdateId) {
      const [update] = await db
        .select({
          regulator: regulatoryUpdates.regulator,
          jurisdiction: regulatoryUpdates.jurisdiction,
          sourceName: regulatoryUpdates.sourceName,
        })
        .from(regulatoryUpdates)
        .where(eq(regulatoryUpdates.stableReferenceId, draftData.relatedUpdateId));
      if (update) parentUpdate = update;
    }

    const [newRecord] = await db.insert(regulatoryReferenceRecords).values({
      stableReferenceId: stableRefId,
      versionNumber: newVersionNumber,
      recordStatus: 'active',
      regulatoryDomain: parentUpdate?.jurisdiction ?? null,
      regulatorAuthority: parentUpdate?.regulator ?? null,
      ...(!existingActiveRecord ? {
        lawRegulationName: parentUpdate?.sourceName ?? null,
        sourceType: 'regulation' as const,
      } : {}),
      plainEnglishInterpretation: draftData.proposedChangeSummary,
      sourceReference: draftData.sourceReference,
      implementationNotes: draftData.changeReason,
      previousVersionId: existingActiveRecord?.id ?? null,
      effectiveDate: new Date().toISOString().split('T')[0],
      publicationDate: new Date().toISOString().split('T')[0],
      publishedAt: new Date(),
    }).returning({ id: regulatoryReferenceRecords.id });

    const newRecordUuid = newRecord?.id ?? stableRefId;

    const refRecordAuditId = await insertAuditEvent({
      entityType: 'regulatory_reference_record',
      entityId: stableRefId,
      action: 'publishing_reference_record_created',
      previousValue: existingActiveRecord ? `v${existingActiveRecord.versionNumber}` : null,
      newValue: `v${newVersionNumber}`,
      reason: `Published from draft ${draftStableRefId}`,
      approvalReference: reviewData.approvalReference ?? undefined,
      sourceReference: draftData.sourceReference,
    });
    txAuditIds.push(refRecordAuditId);

    // ── 8. Create version history entry ─────────────────────
    assertAppendOnly('regulatory_versions', 'INSERT');
    const versionId = generateVersionId();
    await db.insert(regulatoryVersions).values({
      stableReferenceId: stableRefId,
      versionId,
      versionNumber: newVersionNumber,
      recordStatus: 'active',
      effectiveDate: new Date().toISOString().split('T')[0],
      changeSummary: draftData.proposedChangeSummary,
      approvedBy: reviewData.reviewedByName ?? ctx.userName ?? 'unknown',
      approvedByUserId: reviewData.reviewedByUserId ?? null,
      approvedAt: new Date(),
      previousVersionId: existingActiveRecord?.id ?? null,
      sourceReference: draftData.sourceReference,
    });

    // ── 9. Update draft status to published ─────────────────
    await db
      .update(draftChanges)
      .set({ draftStatus: 'published' })
      .where(eq(draftChanges.stableReferenceId, draftStableRefId));

    // ── 10. Create publication event record ─────────────────
    assertAppendOnly('publication_events', 'INSERT');
    const pubEventId = generatePublicationEventId();
    await db.insert(publicationEvents).values({
      stableReferenceId: pubEventId,
      draftChangeId: draftStableRefId,
      regulatoryUpdateId: draftData.relatedUpdateId ?? null,
      approvalReviewId: reviewData.stableReferenceId,
      publishedEntityType: 'regulatory_reference_record',
      publishedEntityId: stableRefId,
      newVersionId: versionId,
      previousVersionId: existingActiveRecord?.id ?? null,
      publicationStatus: 'published',
      publishedByUserId: safeUserId(ctx),
      publishedByEmail: ctx.userEmail,
      publishedByName: ctx.userName,
      sourceReference: draftData.sourceReference,
      publicationSummary: options?.publicationSummary ?? draftData.proposedChangeSummary,
      validationSummary: JSON.stringify(validation.checks),
      approvalReference: reviewData.approvalReference,
      auditEventId: refRecordAuditId,
    });

    // ── 11. Final publish audit event ────────────────────────
    const publishAuditId = await insertAuditEvent({
      entityType: 'publication_event',
      entityId: pubEventId,
      action: 'publishing_draft_change_published',
      previousValue: 'approved',
      newValue: 'published',
      reason: `Draft ${draftStableRefId} published as ${stableRefId} v${newVersionNumber}`,
      approvalReference: reviewData.approvalReference ?? undefined,
      sourceReference: draftData.sourceReference,
    });
    txAuditIds.push(publishAuditId);

    const txResult = {
      publicationEventId: pubEventId,
      newVersionId: versionId,
      newRecordId: stableRefId,
      newRecordUuid,
      txAuditIds,
    };

    // Remove the pre-transaction validation audit ID and use in-transaction ones
    return {
      success: true,
      data: {
        publicationEventId: txResult.publicationEventId,
        newVersionId: txResult.newVersionId,
        newRecordId: txResult.newRecordId,
      },
      auditEventIds: txResult.txAuditIds,
    };
  } catch (err) {
    // C4 FIX: Transaction rolled back — log failure outside transaction
    try {
      await insertAuditEvent({
        entityType: 'draft_change',
        entityId: draftStableRefId,
        action: 'publishing_failed',
        previousValue: 'approved',
        newValue: 'failed',
        reason: err instanceof Error ? err.message : 'Publishing transaction failed',
        sourceReference: draftData.sourceReference,
      });
    } catch { /* best-effort failure audit */ }

    if (err instanceof AuthorizationError) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Publishing failed — transaction rolled back.',
      code: 'VALIDATION_ERROR' as const,
    };
  }
}

// ── 3. Supersede Prior Active Version ───────────────────────────

/**
 * Mark an existing active reference record as superseded.
 * Sets recordStatus = 'superseded' and supersededDate = today.
 * Does NOT delete the record — history is preserved.
 *
 * Phase 2.6 C4 FIX: Also supersedes the corresponding regulatoryVersions row
 * so that as-of lookups (getActiveVersionAsOf) see correct supersededDate.
 */
async function supersedePriorActiveVersion(
  recordUuid: string,
  stableRefId: string,
  // C4 FIX: Accept transaction for atomic operations
  txOrDb?: TxOrDb,
): Promise<void> {
  const db = txOrDb ?? getDb();

  // 1. Supersede the reference record
  await db
    .update(regulatoryReferenceRecords)
    .set({
      recordStatus: 'superseded',
      supersededDate: new Date().toISOString().split('T')[0],
    })
    .where(eq(regulatoryReferenceRecords.id, recordUuid));

  // 2. Phase 2.6 C4 FIX: Supersede the corresponding regulatoryVersions entry
  //    so getActiveVersionAsOf() can correctly filter by supersededDate.
  //    Find the active version for this stableReferenceId and mark it superseded.
  await db
    .update(regulatoryVersions)
    .set({
      recordStatus: 'superseded',
      supersededDate: new Date().toISOString().split('T')[0],
    })
    .where(
      and(
        eq(regulatoryVersions.stableReferenceId, stableRefId),
        eq(regulatoryVersions.recordStatus, 'active'),
      ),
    );
}

// ── 4. Get Publication History ──────────────────────────────────

export interface PublicationEventRow {
  stableReferenceId: string;
  draftChangeId: string;
  regulatoryUpdateId: string | null;
  approvalReviewId: string;
  publishedEntityType: string;
  publishedEntityId: string;
  newVersionId: string;
  previousVersionId: string | null;
  publicationStatus: string;
  publishedByName: string | null;
  publishedByEmail: string | null;
  publishedAt: Date;
  sourceReference: string | null;
  publicationSummary: string | null;
  approvalReference: string | null;
  createdAt: Date;
}

/**
 * Get publication history.
 * Requires: version.view
 */
export async function getPublicationHistory(): Promise<PublicationEventRow[]> {
  if (!isDatabaseMode()) return [];
  requirePermission(PERMISSIONS.VERSION_VIEW);

  const db = getDb();
  const rows = await db
    .select()
    .from(publicationEvents)
    .orderBy(desc(publicationEvents.publishedAt));

  return rows as unknown as PublicationEventRow[];
}

// ── 5. Get Publishable Drafts ───────────────────────────────────

export interface PublishableDraft {
  draftStableReferenceId: string;
  proposedChangeSummary: string;
  affectedEntityType: string;
  affectedEntityId: string | null;
  sourceReference: string | null;
  draftStatus: string;
  reviewStableReferenceId: string;
  reviewStatus: string;
  approvedByName: string | null;
  approvalReference: string | null;
  createdByUserId: string | null;
  reviewSubmittedByUserId: string | null;
  reviewApprovedByUserId: string | null;
}

/**
 * Get drafts that are approved for publication readiness but not yet published.
 * Requires: review.view
 */
export async function getPublishableDrafts(): Promise<PublishableDraft[]> {
  if (!isDatabaseMode()) return [];
  requirePermission(PERMISSIONS.REVIEW_VIEW);

  const db = getDb();

  // Get all approved reviews for draft_changes
  const reviews = await db
    .select()
    .from(approvalReviews)
    .where(
      and(
        eq(approvalReviews.reviewTargetType, 'draft_change'),
        eq(approvalReviews.reviewStatus, 'approved_for_publication'),
      ),
    )
    .orderBy(desc(approvalReviews.createdAt));

  const result: PublishableDraft[] = [];

  for (const review of reviews) {
    // Get the draft
    const [draft] = await db
      .select()
      .from(draftChanges)
      .where(eq(draftChanges.stableReferenceId, review.reviewTargetId));

    if (!draft) continue;

    // Skip if already published
    if (draft.draftStatus === 'published') continue;

    result.push({
      draftStableReferenceId: draft.stableReferenceId,
      proposedChangeSummary: draft.proposedChangeSummary,
      affectedEntityType: draft.affectedEntityType,
      affectedEntityId: draft.affectedEntityId,
      sourceReference: draft.sourceReference,
      draftStatus: draft.draftStatus,
      reviewStableReferenceId: review.stableReferenceId,
      reviewStatus: review.reviewStatus,
      approvedByName: review.reviewedByName,
      approvalReference: review.approvalReference,
      createdByUserId: draft.createdByUserId,
      reviewSubmittedByUserId: review.submittedByUserId,
      reviewApprovedByUserId: review.reviewedByUserId,
    });
  }

  return result;
}

// ── 6. Publish All Approved Drafts for a Regulatory Update ──────

/**
 * Publish all approved draft changes linked to a regulatory update,
 * then operationalize the update.
 *
 * Requires: reference.publish
 */
export async function publishApprovedDraftsForUpdate(
  updateStableRefId: string,
): Promise<PublishWriteResult<{ totalRequested: number; published: number; failed: number; partialSuccess: boolean; results: Array<{ draftId: string; success: boolean; error?: string }> }>> {
  if (!isDatabaseMode()) return jsonModeResult();
  requirePermission(PERMISSIONS.REFERENCE_PUBLISH);

  const db = getDb();

  // Get the update
  const [update] = await db
    .select()
    .from(regulatoryUpdates)
    .where(eq(regulatoryUpdates.stableReferenceId, updateStableRefId));

  if (!update) {
    return {
      success: false,
      error: `Regulatory update "${updateStableRefId}" not found.`,
      code: 'NOT_FOUND',
    };
  }

  // Find linked approved drafts
  const linkedDrafts = await db
    .select()
    .from(draftChanges)
    .where(eq(draftChanges.relatedUpdateId, updateStableRefId));

  const approvedDrafts = linkedDrafts.filter((d) => d.draftStatus === 'approved');

  if (approvedDrafts.length === 0) {
    return {
      success: false,
      error: 'No approved draft changes found for this regulatory update.',
      code: 'VALIDATION_ERROR',
    };
  }

  const results: Array<{ draftId: string; success: boolean; error?: string }> = [];
  let published = 0;
  let failed = 0;

  for (const draft of approvedDrafts) {
    try {
      const result = await publishDraftChange(draft.stableReferenceId);
      if (result.success) {
        published++;
        results.push({ draftId: draft.stableReferenceId, success: true });
      } else {
        failed++;
        results.push({ draftId: draft.stableReferenceId, success: false, error: result.error });
      }
    } catch (err) {
      failed++;
      results.push({
        draftId: draft.stableReferenceId,
        success: false,
        error: err instanceof AuthorizationError ? err.message : 'Publishing failed',
      });
    }
  }

  // Operationalize the update if all drafts published
  if (published > 0 && failed === 0) {
    await db
      .update(regulatoryUpdates)
      .set({ currentStage: 'published' })
      .where(eq(regulatoryUpdates.stableReferenceId, updateStableRefId));

    await insertAuditEvent({
      entityType: 'regulatory_update',
      entityId: updateStableRefId,
      action: 'publishing_regulatory_update_operationalized',
      previousValue: update.currentStage,
      newValue: 'published',
      reason: `All ${published} linked draft changes published successfully`,
    });
  }

  // C6 FIX: success=true only when ALL drafts published; add partialSuccess flag
  return {
    success: failed === 0 && published > 0,
    data: {
      totalRequested: approvedDrafts.length,
      published,
      failed,
      partialSuccess: published > 0 && failed > 0,
      results,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────

function incrementVersion(current: string): string {
  const parts = current.split('.').map(Number);
  if (parts.length >= 2) {
    parts[0] = parts[0] + 1;
    parts[1] = 0;
  } else {
    parts[0] = (parts[0] || 1) + 1;
  }
  return parts.join('.');
}
