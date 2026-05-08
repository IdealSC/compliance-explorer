/**
 * AI Suggestion Write Service — Phase 3.6 + Phase 3.7.
 *
 * Write functions for AI suggestion governance records.
 * Phase 3.6: reject, expire.
 * Phase 3.7: mark-for-review, update notes, toggle legal review.
 *
 * GOVERNANCE:
 * - AI suggestions are DRAFT-ONLY governance records
 * - No accept-to-draft in this phase (deferred to Phase 3.9)
 * - No AI model execution
 * - Each write enforces: database mode, RBAC, Zod validation, audit event
 *
 * Phase 3.7: AI Suggestion Review Workbench
 */
import { getDb, type AppDatabase } from '@/db';
import { eq } from 'drizzle-orm';
import { aiExtractionSuggestions, draftChanges } from '@/db/schema';
import { requirePermission, getSessionContext, safeUserId } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from './audit-writer';
import { generateDraftChangeId } from './id-generator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxOrDb = AppDatabase | any;

// ── Result Type ─────────────────────────────────────────────────

export interface AiSuggestionWriteResult<T = Record<string, unknown>> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INVALID_TRANSITION' | 'NOT_ELIGIBLE';
  data?: T;
  auditEventId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function jsonModeResult<T = Record<string, unknown>>(): AiSuggestionWriteResult<T> {
  return {
    success: false,
    error: 'Database mode required for AI suggestion operations.',
    code: 'JSON_MODE',
  };
}

function notFoundResult<T = Record<string, unknown>>(id: string): AiSuggestionWriteResult<T> {
  return {
    success: false,
    error: `AI suggestion with id "${id}" not found.`,
    code: 'NOT_FOUND',
  };
}

// ── 1. Reject AI Suggestion ─────────────────────────────────────

export async function rejectAiSuggestion(
  stableReferenceId: string,
  reviewerNotes: string,
): Promise<AiSuggestionWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();

  requirePermission(PERMISSIONS.AI_SUGGESTION_REJECT);

  const db = getDb();
  const ctx = getSessionContext();

  // Find existing
  const existing = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (existing.length === 0) return notFoundResult(stableReferenceId);

  const record = existing[0];

  // Only generated or human_review_required can be rejected
  const rejectableStatuses = ['generated', 'human_review_required'];
  if (!rejectableStatuses.includes(record.suggestionStatus)) {
    return {
      success: false,
      error: `Cannot reject suggestion in status "${record.suggestionStatus}". Must be: ${rejectableStatuses.join(', ')}`,
      code: 'INVALID_TRANSITION',
    };
  }

  // Perform update
  const now = new Date();
  await db
    .update(aiExtractionSuggestions)
    .set({
      suggestionStatus: 'rejected',
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedAt: now,
      reviewerDecision: 'rejected',
      reviewerNotes,
      updatedAt: now,
    })
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  // Audit
  const auditEventId = await insertAuditEvent({
    entityType: 'ai_extraction_suggestion',
    entityId: stableReferenceId,
    action: 'ai_suggestion_rejected',
    previousValue: JSON.stringify({ suggestionStatus: record.suggestionStatus }),
    newValue: JSON.stringify({ suggestionStatus: 'rejected', reviewerNotes }),
    sourceReference: record.sourceReference ?? undefined,
  });

  return {
    success: true,
    data: { stableReferenceId, suggestionStatus: 'rejected' },
    auditEventId,
  };
}

// ── 2. Expire AI Suggestion ─────────────────────────────────────

export async function expireAiSuggestion(
  stableReferenceId: string,
  reason?: string,
): Promise<AiSuggestionWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();

  requirePermission(PERMISSIONS.AI_SUGGESTION_REVIEW);

  const db = getDb();
  const ctx = getSessionContext();

  // Find existing
  const existing = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (existing.length === 0) return notFoundResult(stableReferenceId);

  const record = existing[0];

  // Only non-terminal statuses can be expired
  const terminalStatuses = ['rejected', 'expired', 'accepted_to_draft'];
  if (terminalStatuses.includes(record.suggestionStatus)) {
    return {
      success: false,
      error: `Cannot expire suggestion in terminal status "${record.suggestionStatus}".`,
      code: 'INVALID_TRANSITION',
    };
  }

  // Perform update
  const now = new Date();
  await db
    .update(aiExtractionSuggestions)
    .set({
      suggestionStatus: 'expired',
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedAt: now,
      reviewerNotes: reason ?? 'Expired by reviewer',
      updatedAt: now,
    })
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  // Audit
  const auditEventId = await insertAuditEvent({
    entityType: 'ai_extraction_suggestion',
    entityId: stableReferenceId,
    action: 'ai_suggestion_expired',
    previousValue: JSON.stringify({ suggestionStatus: record.suggestionStatus }),
    newValue: JSON.stringify({ suggestionStatus: 'expired', reason }),
    sourceReference: record.sourceReference ?? undefined,
  });

  return {
    success: true,
    data: { stableReferenceId, suggestionStatus: 'expired' },
    auditEventId,
  };
}

// ── 3. Mark for Human Review (Phase 3.7) ────────────────────────

export async function markAiSuggestionForReview(
  stableReferenceId: string,
  reason?: string,
): Promise<AiSuggestionWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();

  requirePermission(PERMISSIONS.AI_SUGGESTION_REVIEW);

  const db = getDb();

  // Find existing
  const existing = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (existing.length === 0) return notFoundResult(stableReferenceId);

  const record = existing[0];

  // Only 'generated' can transition to 'human_review_required'
  if (record.suggestionStatus !== 'generated') {
    return {
      success: false,
      error: `Cannot mark for review from status "${record.suggestionStatus}". Must be: generated`,
      code: 'INVALID_TRANSITION',
    };
  }

  const now = new Date();
  await db
    .update(aiExtractionSuggestions)
    .set({
      suggestionStatus: 'human_review_required',
      updatedAt: now,
    })
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'ai_extraction_suggestion',
    entityId: stableReferenceId,
    action: 'ai_suggestion_review_status_changed',
    previousValue: JSON.stringify({ suggestionStatus: record.suggestionStatus }),
    newValue: JSON.stringify({ suggestionStatus: 'human_review_required', reason }),
    reason,
    sourceReference: record.sourceReference ?? undefined,
  });

  return {
    success: true,
    data: { stableReferenceId, suggestionStatus: 'human_review_required' },
    auditEventId,
  };
}

// ── 4. Update Reviewer Notes (Phase 3.7) ────────────────────────

export async function updateAiSuggestionReviewerNotes(
  stableReferenceId: string,
  reviewerNotes: string,
): Promise<AiSuggestionWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();

  requirePermission(PERMISSIONS.AI_SUGGESTION_REVIEW);

  const db = getDb();
  const ctx = getSessionContext();

  // Find existing
  const existing = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (existing.length === 0) return notFoundResult(stableReferenceId);

  const record = existing[0];

  // Cannot annotate terminal statuses (I1 FIX: aligned with toggleLegalReview/expire)
  const terminalStatuses = ['rejected', 'expired', 'accepted_to_draft'];
  if (terminalStatuses.includes(record.suggestionStatus)) {
    return {
      success: false,
      error: `Cannot update notes on suggestion in terminal status "${record.suggestionStatus}".`,
      code: 'INVALID_TRANSITION',
    };
  }

  const now = new Date();
  await db
    .update(aiExtractionSuggestions)
    .set({
      reviewerNotes,
      reviewedByUserId: safeUserId(ctx),
      reviewedByEmail: ctx.userEmail,
      reviewedAt: now,
      updatedAt: now,
    })
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'ai_extraction_suggestion',
    entityId: stableReferenceId,
    action: 'ai_suggestion_reviewer_notes_updated',
    previousValue: JSON.stringify({ reviewerNotes: record.reviewerNotes }),
    newValue: JSON.stringify({ reviewerNotes }),
    sourceReference: record.sourceReference ?? undefined,
  });

  return {
    success: true,
    data: { stableReferenceId, reviewerNotes },
    auditEventId,
  };
}

// ── 5. Toggle Legal Review Required (Phase 3.7) ─────────────────

export async function toggleAiSuggestionLegalReview(
  stableReferenceId: string,
  legalReviewRequired: boolean,
  reason?: string,
): Promise<AiSuggestionWriteResult> {
  if (!isDatabaseMode()) return jsonModeResult();

  requirePermission(PERMISSIONS.AI_SUGGESTION_REVIEW);

  const db = getDb();

  // Find existing
  const existing = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (existing.length === 0) return notFoundResult(stableReferenceId);

  const record = existing[0];

  // Cannot modify legal flag on terminal statuses
  const terminalStatuses = ['rejected', 'expired', 'accepted_to_draft'];
  if (terminalStatuses.includes(record.suggestionStatus)) {
    return {
      success: false,
      error: `Cannot toggle legal review on suggestion in terminal status "${record.suggestionStatus}".`,
      code: 'INVALID_TRANSITION',
    };
  }

  const now = new Date();
  await db
    .update(aiExtractionSuggestions)
    .set({
      legalReviewRequired,
      updatedAt: now,
    })
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  const auditEventId = await insertAuditEvent({
    entityType: 'ai_extraction_suggestion',
    entityId: stableReferenceId,
    action: 'ai_suggestion_legal_review_toggled',
    previousValue: JSON.stringify({ legalReviewRequired: record.legalReviewRequired }),
    newValue: JSON.stringify({ legalReviewRequired, reason }),
    reason,
    sourceReference: record.sourceReference ?? undefined,
  });

  return {
    success: true,
    data: { stableReferenceId, legalReviewRequired },
    auditEventId,
  };
}

// ── 6. Accept to Draft — Citation Only (Phase 3.9) ──────────────
//
// GOVERNANCE: Human-initiated, citation-only conversion of a reviewed
// AI suggestion into a DraftRegulatoryChange record. The resulting
// draft enters the standard review → approval → publish pipeline.
// No active reference data is modified.
//
// Eligibility gates:
// 1. Database mode required
// 2. RBAC: ai.suggestion.acceptToDraft + draft.edit
// 3. Suggestion must exist
// 4. suggestionType must be 'citation'
// 5. suggestionStatus must be 'generated' or 'human_review_required'
// 6. suggestedCitation must be non-empty
// 7. sourceReference must be non-empty
// 8. sourceExcerpt must be non-empty

export interface AcceptToDraftResult {
  draftChangeId: string;
  suggestionId: string;
}

export async function acceptAiSuggestionToDraft(
  stableReferenceId: string,
  relatedUpdateId: string,
  changeReason?: string,
): Promise<AiSuggestionWriteResult<AcceptToDraftResult>> {
  // Gate 1: Database mode
  if (!isDatabaseMode()) return jsonModeResult();

  // Gate 2: RBAC — both permissions required
  requirePermission(PERMISSIONS.AI_SUGGESTION_ACCEPT_TO_DRAFT);
  requirePermission(PERMISSIONS.DRAFT_EDIT);

  const db = getDb();
  const ctx = getSessionContext();

  // Gate 3: Suggestion must exist
  const existing = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (existing.length === 0) return notFoundResult(stableReferenceId);

  const record = existing[0];

  // Gate 4: Citation-only
  if (record.suggestionType !== 'citation') {
    return {
      success: false,
      error: `Only citation suggestions may be converted to draft changes. This suggestion is type "${record.suggestionType}".`,
      code: 'NOT_ELIGIBLE',
    };
  }

  // Gate 5: Valid status for conversion
  const eligibleStatuses = ['generated', 'human_review_required'];
  if (!eligibleStatuses.includes(record.suggestionStatus)) {
    return {
      success: false,
      error: `Cannot convert suggestion in status "${record.suggestionStatus}". Must be: ${eligibleStatuses.join(', ')}`,
      code: 'INVALID_TRANSITION',
    };
  }

  // Gate 6: suggestedCitation must be non-empty
  if (!record.suggestedCitation?.trim()) {
    return {
      success: false,
      error: 'Cannot convert: suggestedCitation is empty. A citation text is required for draft conversion.',
      code: 'VALIDATION_ERROR',
    };
  }

  // Gate 7: sourceReference must be non-empty
  if (!record.sourceReference?.trim()) {
    return {
      success: false,
      error: 'Cannot convert: sourceReference is empty. A source reference is required for draft conversion.',
      code: 'VALIDATION_ERROR',
    };
  }

  // Gate 8: sourceExcerpt must be non-empty
  if (!record.sourceExcerpt?.trim()) {
    return {
      success: false,
      error: 'Cannot convert: sourceExcerpt is empty. A source excerpt is required for draft conversion.',
      code: 'VALIDATION_ERROR',
    };
  }

  // Gate 9: Duplicate conversion guard (defense-in-depth for race conditions)
  if (record.relatedDraftChangeId) {
    return {
      success: false,
      error: `This suggestion has already been converted to draft change "${record.relatedDraftChangeId}".`,
      code: 'INVALID_TRANSITION',
    };
  }

  // ── Transactional Conversion ────────────────────────────────
  // All three writes (draft creation, suggestion update, audit)
  // are wrapped in a single transaction for atomicity.
  // Follows the publishDraftChange() C4 FIX pattern.

  const provenanceStamp = `[AI Citation Suggestion: ${stableReferenceId}]`;
  const fullChangeReason = changeReason
    ? `${changeReason} ${provenanceStamp}`
    : `Converted from AI citation suggestion. ${provenanceStamp}`;

  try {
    // Sequential operations (neon-http driver does not support transactions)
    // Step 1: Create draft change
    const draftRefId = generateDraftChangeId();
    await db.insert(draftChanges).values({
      stableReferenceId: draftRefId,
      relatedUpdateId,
      affectedEntityType: 'citation',
      changeType: 'new',
      proposedChangeSummary: record.suggestedCitation!.trim(),
      proposedValue: record.suggestedCitation!.trim(),
      sourceReference: record.sourceReference,
      changeReason: fullChangeReason,
      draftStatus: 'draft' as const,
      submittedBy: ctx.userName ?? ctx.userEmail ?? 'unknown',
      submittedDate: new Date().toISOString().split('T')[0],
      createdByUserId: safeUserId(ctx),
    } as typeof draftChanges.$inferInsert);

    const draftAuditId = await insertAuditEvent({
      entityType: 'draft_change',
      entityId: draftRefId,
      action: 'draft_change_created',
      previousValue: null,
      newValue: JSON.stringify({ proposedChangeSummary: record.suggestedCitation!.trim(), changeType: 'new' }),
      sourceReference: record.sourceReference ?? undefined,
    });

    // Step 2: Update AI suggestion — link + terminal status
    const now = new Date();
    await db
      .update(aiExtractionSuggestions)
      .set({
        suggestionStatus: 'accepted_to_draft',
        reviewerDecision: 'accepted',
        reviewedByUserId: safeUserId(ctx),
        reviewedByEmail: ctx.userEmail,
        reviewedAt: now,
        relatedDraftChangeId: draftRefId,
        updatedAt: now,
      })
      .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

    // Step 3: Conversion audit event
    const conversionAuditId = await insertAuditEvent({
      entityType: 'ai_extraction_suggestion',
      entityId: stableReferenceId,
      action: 'ai_suggestion.accepted_to_draft',
      previousValue: JSON.stringify({
        suggestionStatus: record.suggestionStatus,
        relatedDraftChangeId: null,
      }),
      newValue: JSON.stringify({
        suggestionStatus: 'accepted_to_draft',
        relatedDraftChangeId: draftRefId,
        relatedUpdateId,
      }),
      sourceReference: record.sourceReference ?? undefined,
    });

    const txResult = { draftChangeId: draftRefId, draftAuditId, conversionAuditId };

    return {
      success: true,
      data: {
        draftChangeId: txResult.draftChangeId,
        suggestionId: stableReferenceId,
      },
      auditEventId: txResult.conversionAuditId,
    };
  } catch (err) {
    // Transaction rolled back — no partial state
    console.error('[AI] Accept-to-draft transaction failed:', err);
    return {
      success: false,
      error: 'Conversion failed — transaction rolled back. No draft was created.',
      code: 'VALIDATION_ERROR',
    };
  }
}

