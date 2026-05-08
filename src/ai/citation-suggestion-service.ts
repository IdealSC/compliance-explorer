/**
 * Citation Suggestion Service — Phase 3.8.
 *
 * Orchestrates AI-powered citation extraction from source records.
 * Citations are created as draft-only governance records in the
 * aiExtractionSuggestions table.
 *
 * GOVERNANCE:
 * - Only citation suggestions are generated (type: 'citation')
 * - No obligations, interpretations, or draft mappings
 * - Every generation is audited (requested, per-citation, completed/failed)
 * - Source record validation gate enforced by default
 * - Low-confidence citations are flagged for human review
 * - All citations marked legalReviewRequired: true (conservative)
 * - Accept-to-draft remains blocked
 *
 * Phase 3.8: Controlled AI Provider Integration — Citation Suggestions Only
 */
import { getDb } from '@/db';
import { eq } from 'drizzle-orm';
import { aiExtractionSuggestions } from '@/db/schema';
import { requirePermission, getSessionContext } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { insertAuditEvent } from '@/lib/services/audit-writer';
import { generateAiSuggestionId } from '@/lib/services/id-generator';
import { getAiConfig, isCitationSuggestionsEnabled, isProviderConfigured } from './ai-config';
import { getAiProvider } from './provider-router';
import { CITATION_PROMPT_VERSION } from './prompts/citation-prompt';
import type { CitationSuggestionInput } from './providers/types';
import type { z } from 'zod';
import type { GenerateCitationSuggestionsSchema } from '@/validation/ai-suggestions';

// ── Types ───────────────────────────────────────────────────────

export type GenerateCitationInput = z.infer<typeof GenerateCitationSuggestionsSchema>;

export interface CitationGenerationResult {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'FEATURE_DISABLED' | 'PROVIDER_ERROR' | 'SOURCE_NOT_VALIDATED' |
    'FORBIDDEN' | 'GENERATION_FAILED' | 'NO_CITATIONS_FOUND';
  suggestionIds?: string[];
  count?: number;
  auditEventId?: string;
}

// ── Service ─────────────────────────────────────────────────────

/**
 * Generate citation suggestions from a source record excerpt.
 *
 * Flow:
 * 1. Preflight: database mode, feature flag, provider configured
 * 2. RBAC: require AI_SUGGESTION_GENERATE
 * 3. Source readiness gate (if enabled)
 * 4. Audit: generation requested
 * 5. Provider call with governed prompt
 * 6. Record creation per citation
 * 7. Audit: per citation + completion
 */
export async function generateCitationSuggestions(
  input: GenerateCitationInput,
): Promise<CitationGenerationResult> {
  // ── 1. Preflight ──────────────────────────────────────────────
  if (!isDatabaseMode()) {
    return { success: false, error: 'Database mode required.', code: 'JSON_MODE' };
  }

  if (!isCitationSuggestionsEnabled()) {
    return { success: false, error: 'Citation suggestion feature is not enabled.', code: 'FEATURE_DISABLED' };
  }

  if (!isProviderConfigured()) {
    return { success: false, error: 'AI provider is not fully configured.', code: 'FEATURE_DISABLED' };
  }

  // ── 2. RBAC ───────────────────────────────────────────────────
  requirePermission(PERMISSIONS.AI_SUGGESTION_GENERATE);

  const ctx = getSessionContext();
  const config = getAiConfig();

  // ── 3. Source Readiness Gate ───────────────────────────────────
  // When AI_REQUIRE_SOURCE_RECORD_VALIDATED=true, we verify the source record
  // exists and is in 'validated' status. In JSON mode this is skipped (handled above).
  // Note: In database mode, source records may be in the JSON data store if no
  // database migration for sources has been run. We check both paths.
  if (config.requireSourceRecordValidated) {
    const sourceCheck = await checkSourceRecordValidated(input.sourceRecordId);
    if (!sourceCheck.valid) {
      return {
        success: false,
        error: sourceCheck.error,
        code: 'SOURCE_NOT_VALIDATED',
      };
    }
  }

  // ── 4. Audit: Generation Requested ────────────────────────────
  const requestAuditId = await insertAuditEvent({
    entityType: 'ai_citation_generation',
    entityId: input.sourceRecordId,
    action: 'ai_citation_generation.requested',
    previousValue: null,
    newValue: JSON.stringify({
      sourceRecordId: input.sourceRecordId,
      sourceReference: input.sourceReference,
      excerptLength: input.sourceExcerpt.length,
      maxSuggestions: input.maxSuggestions ?? 10,
      provider: config.provider,
      promptVersion: CITATION_PROMPT_VERSION,
    }),
    reason: 'Citation suggestion generation requested',
    sourceReference: input.sourceReference,
  });

  // ── 5. Provider Call ──────────────────────────────────────────
  const provider = getAiProvider();

  const providerInput: CitationSuggestionInput = {
    sourceRecordId: input.sourceRecordId,
    sourceExcerpt: input.sourceExcerpt.slice(0, config.maxSourceChars),
    sourceReference: input.sourceReference,
    sourceFileId: input.sourceFileId,
    intakeRequestId: input.intakeRequestId,
    sourceLocation: input.sourceLocation,
    regulator: input.regulator,
    jurisdiction: input.jurisdiction,
    sourceTitle: input.sourceTitle,
    maxSuggestions: input.maxSuggestions,
  };

  const result = await provider.generateCitationSuggestions(providerInput);

  if (!result.success) {
    // Determine audit action based on failure category
    const outputRejectionCodes = ['OUTPUT_VALIDATION_FAILED', 'INVALID_JSON', 'OBLIGATION_LANGUAGE_DETECTED'];
    const auditAction = result.errorCode && outputRejectionCodes.includes(result.errorCode)
      ? 'ai_provider.output_rejected'
      : 'ai_citation_generation.failed';

    await insertAuditEvent({
      entityType: 'ai_citation_generation',
      entityId: input.sourceRecordId,
      action: auditAction,
      previousValue: null,
      newValue: JSON.stringify({
        error: result.error,
        errorCode: result.errorCode ?? 'UNKNOWN',
        provider: config.provider,
        modelName: result.modelName,
        modelVersion: result.modelVersion,
      }),
      reason: result.error,
      sourceReference: input.sourceReference,
    });

    return {
      success: false,
      error: result.error ?? 'AI provider returned an error.',
      code: 'GENERATION_FAILED',
      auditEventId: requestAuditId,
    };
  }

  if (result.citations.length === 0) {
    // Audit: no citations found (not a failure)
    await insertAuditEvent({
      entityType: 'ai_citation_generation',
      entityId: input.sourceRecordId,
      action: 'ai_citation_generation.completed',
      previousValue: null,
      newValue: JSON.stringify({ citationCount: 0, provider: config.provider }),
      reason: 'No citations found in source text',
      sourceReference: input.sourceReference,
    });

    return {
      success: true,
      suggestionIds: [],
      count: 0,
      code: 'NO_CITATIONS_FOUND',
      auditEventId: requestAuditId,
    };
  }

  // ── 6. Record Creation ────────────────────────────────────────
  const db = getDb();
  const now = new Date();
  const suggestionIds: string[] = [];
  const generatedBy = ctx.userName ?? ctx.userEmail ?? 'system';

  for (const citation of result.citations) {
    const suggestionId = generateAiSuggestionId();

    // Low confidence → human review required
    const status = citation.confidenceScore < 0.7 ? 'human_review_required' : 'generated';

    await db.insert(aiExtractionSuggestions).values({
      stableReferenceId: suggestionId,
      sourceRecordId: input.sourceRecordId,
      sourceFileId: input.sourceFileId ?? null,
      intakeRequestId: input.intakeRequestId ?? null,

      // Classification
      suggestionType: 'citation',
      suggestionStatus: status,

      // Source evidence
      sourceExcerpt: citation.sourceExcerpt,
      sourceLocation: citation.sourceLocation ?? input.sourceLocation ?? null,

      // Citation content (draft-only)
      suggestedCitation: citation.suggestedCitation,
      // GOVERNANCE: obligation/interpretation fields are explicitly null
      suggestedObligationText: null,
      suggestedPlainEnglishInterpretation: null,
      suggestedBusinessFunctions: null,
      suggestedControls: null,
      suggestedEvidence: null,
      suggestedStandards: null,

      // Confidence
      confidenceScore: citation.confidenceScore,
      confidenceExplanation: citation.confidenceExplanation ?? null,

      // Provenance
      modelName: result.modelName,
      modelVersion: result.modelVersion,
      promptVersion: result.promptVersion,
      generatedBy,
      generatedAt: now,

      // Conservative defaults
      legalReviewRequired: true,
      sourceReference: input.sourceReference,

      // No draft linkage
      relatedDraftChangeId: null,

      // Timestamps
      createdAt: now,
      updatedAt: now,
    });

    // ── 7. Audit per citation ─────────────────────────────────────
    const citationAuditId = await insertAuditEvent({
      entityType: 'ai_extraction_suggestion',
      entityId: suggestionId,
      action: 'ai_suggestion.citation_created',
      previousValue: null,
      newValue: JSON.stringify({
        suggestionType: 'citation',
        suggestedCitation: citation.suggestedCitation,
        confidenceScore: citation.confidenceScore,
        status,
        modelName: result.modelName,
        promptVersion: result.promptVersion,
      }),
      reason: 'AI-generated citation suggestion',
      sourceReference: input.sourceReference,
    });

    // Store audit event reference
    await db.update(aiExtractionSuggestions)
      .set({ auditEventIds: JSON.stringify([citationAuditId]) })
      .where(eq(aiExtractionSuggestions.stableReferenceId, suggestionId));

    suggestionIds.push(suggestionId);
  }

  // ── Audit: Completion ───────────────────────────────────────────
  await insertAuditEvent({
    entityType: 'ai_citation_generation',
    entityId: input.sourceRecordId,
    action: 'ai_citation_generation.completed',
    previousValue: null,
    newValue: JSON.stringify({
      citationCount: suggestionIds.length,
      suggestionIds,
      provider: config.provider,
      modelName: result.modelName,
      promptVersion: result.promptVersion,
    }),
    reason: `Generated ${suggestionIds.length} citation suggestion(s)`,
    sourceReference: input.sourceReference,
  });

  return {
    success: true,
    suggestionIds,
    count: suggestionIds.length,
    auditEventId: requestAuditId,
  };
}

// ── Source Readiness Check ───────────────────────────────────────

async function checkSourceRecordValidated(
  sourceRecordId: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Try JSON data first (source records may not be in DB yet)
    const { getSourceRecords } = await import('@/lib/data');
    const jsonRecords = getSourceRecords();
    const record = jsonRecords.find(r => r.id === sourceRecordId);

    if (record) {
      if (record.validationStatus !== 'validated') {
        return {
          valid: false,
          error: `Source record "${sourceRecordId}" is not validated (status: ${record.validationStatus}). ` +
            'AI citation generation requires a validated source record.',
        };
      }
      return { valid: true };
    }

    // Not found in JSON — check database (source records created via intake pipeline)
    console.log(`[checkSourceRecordValidated] Not in JSON, checking DB for ${sourceRecordId}, isDatabaseMode=${isDatabaseMode()}`);
    if (isDatabaseMode()) {
      try {
        const { sourceRecords } = await import('@/db/schema');
        const db = getDb();
        const dbRecord = await db
          .select({ validationStatus: sourceRecords.validationStatus, stableReferenceId: sourceRecords.stableReferenceId })
          .from(sourceRecords)
          .where(eq(sourceRecords.stableReferenceId, sourceRecordId))
          .limit(1);

        if (dbRecord.length > 0) {
          if (dbRecord[0].validationStatus !== 'validated') {
            return {
              valid: false,
              error: `Source record "${sourceRecordId}" is not validated (status: ${dbRecord[0].validationStatus}). ` +
                'AI citation generation requires a validated source record.',
            };
          }
          return { valid: true };
        }
      } catch (dbErr) {
        console.error('[checkSourceRecordValidated] DB lookup error:', dbErr);
      }
    }

    // Not found in JSON or database
    return {
      valid: false,
      error: `Source record "${sourceRecordId}" not found. Cannot verify validation status.`,
    };
  } catch {
    // If data loading fails, reject conservatively
    return {
      valid: false,
      error: `Unable to verify source record "${sourceRecordId}" validation status.`,
    };
  }
}
