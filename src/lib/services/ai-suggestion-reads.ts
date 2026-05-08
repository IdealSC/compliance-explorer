/**
 * AI Suggestion Read Service — Phase 3.6.
 *
 * Read-only query functions for AI extraction suggestions and prompt versions.
 * Used by API routes and report generators.
 *
 * GOVERNANCE:
 * - Read-only — no mutations in this module
 * - AI suggestions are draft-only governance records
 * - No AI model is integrated in this phase
 */
import { getDb } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { aiExtractionSuggestions, aiPromptVersions } from '@/db/schema';
import { isDatabaseMode } from '@/lib/data-source';

export interface AiSuggestionReadResult<T = unknown> {
  success: boolean;
  error?: string;
  code?: 'JSON_MODE' | 'NOT_FOUND';
  data?: T;
}

// ── Suggestions ─────────────────────────────────────────────────

/**
 * Get all AI extraction suggestions from database.
 */
export async function getAiSuggestionsFromDb(): Promise<AiSuggestionReadResult<{ records: unknown[] }>> {
  if (!isDatabaseMode()) {
    return { success: false, error: 'Database mode required.', code: 'JSON_MODE' };
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(aiExtractionSuggestions)
    .orderBy(desc(aiExtractionSuggestions.createdAt));

  // Parse JSON array fields stored as text
  const records = rows.map(parseJsonArrayFields);
  return { success: true, data: { records } };
}

/**
 * Get a single AI suggestion by stable reference ID.
 */
export async function getAiSuggestionByIdFromDb(
  stableReferenceId: string,
): Promise<AiSuggestionReadResult<{ record: unknown }>> {
  if (!isDatabaseMode()) {
    return { success: false, error: 'Database mode required.', code: 'JSON_MODE' };
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.stableReferenceId, stableReferenceId));

  if (rows.length === 0) {
    return { success: false, error: `AI suggestion "${stableReferenceId}" not found.`, code: 'NOT_FOUND' };
  }

  return { success: true, data: { record: parseJsonArrayFields(rows[0]) } };
}

/**
 * Get suggestions by source record ID.
 */
export async function getAiSuggestionsBySourceRecord(
  sourceRecordId: string,
): Promise<AiSuggestionReadResult<{ records: unknown[] }>> {
  if (!isDatabaseMode()) {
    return { success: false, error: 'Database mode required.', code: 'JSON_MODE' };
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(aiExtractionSuggestions)
    .where(eq(aiExtractionSuggestions.sourceRecordId, sourceRecordId))
    .orderBy(desc(aiExtractionSuggestions.createdAt));

  const records = rows.map(parseJsonArrayFields);
  return { success: true, data: { records } };
}

// ── Prompt Versions ─────────────────────────────────────────────

/**
 * Get all AI prompt versions from database.
 */
export async function getAiPromptVersionsFromDb(): Promise<AiSuggestionReadResult<{ records: unknown[] }>> {
  if (!isDatabaseMode()) {
    return { success: false, error: 'Database mode required.', code: 'JSON_MODE' };
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(aiPromptVersions)
    .orderBy(desc(aiPromptVersions.createdAt));

  return { success: true, data: { records: rows } };
}

/**
 * Parse JSON-encoded text fields into arrays.
 */
function parseJsonArrayFields(row: Record<string, unknown>): Record<string, unknown> {
  const jsonFields = [
    'suggestedBusinessFunctions',
    'suggestedControls',
    'suggestedEvidence',
    'suggestedStandards',
    'auditEventIds',
  ];

  const result = { ...row };
  for (const field of jsonFields) {
    if (typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field] as string);
      } catch {
        result[field] = null;
      }
    }
  }
  return result;
}

// ── Workbench Metrics (Phase 3.7) ───────────────────────────────

export interface AiSuggestionWorkbenchMetrics {
  total: number;
  reviewRequired: number;
  legalReviewRequired: number;
  lowConfidence: number;
  rejected: number;
  expired: number;
  generated: number;
  linkedToSource: number;
  linkedToFile: number;
  linkedToIntake: number;
  missingExcerpt: number;
  missingLocation: number;
  blockedFromDraft: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

/**
 * Compute workbench summary metrics from a set of suggestion records.
 * Works with both JSON and database record shapes.
 */
export function computeWorkbenchMetrics(
  records: Record<string, unknown>[],
): AiSuggestionWorkbenchMetrics {
  const metrics: AiSuggestionWorkbenchMetrics = {
    total: records.length,
    reviewRequired: 0,
    legalReviewRequired: 0,
    lowConfidence: 0,
    rejected: 0,
    expired: 0,
    generated: 0,
    linkedToSource: 0,
    linkedToFile: 0,
    linkedToIntake: 0,
    missingExcerpt: 0,
    missingLocation: 0,
    blockedFromDraft: records.length, // ALL are blocked — accept-to-draft not implemented
    byType: {},
    byStatus: {},
  };

  for (const r of records) {
    const status = r.suggestionStatus as string;
    const type = r.suggestionType as string;
    const confidence = typeof r.confidenceScore === 'number' ? r.confidenceScore : 0;

    // Status counts
    metrics.byStatus[status] = (metrics.byStatus[status] ?? 0) + 1;
    if (status === 'human_review_required') metrics.reviewRequired++;
    if (status === 'rejected') metrics.rejected++;
    if (status === 'expired') metrics.expired++;
    if (status === 'generated') metrics.generated++;

    // Type counts
    metrics.byType[type] = (metrics.byType[type] ?? 0) + 1;

    // Legal review flag
    if (r.legalReviewRequired) metrics.legalReviewRequired++;

    // Low confidence (below 0.80)
    if (confidence > 0 && confidence < 0.80) metrics.lowConfidence++;

    // Linkage
    if (r.sourceRecordId) metrics.linkedToSource++;
    if (r.sourceFileId) metrics.linkedToFile++;
    if (r.intakeRequestId) metrics.linkedToIntake++;

    // Data quality
    if (!r.sourceExcerpt) metrics.missingExcerpt++;
    if (!r.sourceLocation) metrics.missingLocation++;
  }

  return metrics;
}

