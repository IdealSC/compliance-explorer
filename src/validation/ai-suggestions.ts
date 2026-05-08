/**
 * AI Suggestion Validation Schemas — Phase 3.6.
 *
 * Zod schemas for AI suggestion API routes.
 * Used for review status changes only (reject, expire).
 *
 * GOVERNANCE:
 * - AI suggestions are draft-only governance records
 * - No accept-to-draft schema in this phase
 * - No AI model execution schemas
 * - AI output is NOT legal advice, compliance certification, or active reference data
 *
 * Phase 3.6: AI Suggestion Data Model Foundation
 */
import { z } from 'zod';
import { nonEmptyString, optionalString, confidenceScore } from './common';

// ── Enums ───────────────────────────────────────────────────────

export const suggestionTypeEnum = z.enum([
  'citation',
  'obligation',
  'interpretation',
  'crosswalk',
  'control',
  'evidence',
  'business_function',
  'risk',
  'other',
]);

export const suggestionStatusEnum = z.enum([
  'generated',
  'human_review_required',
  'accepted_to_draft',
  'rejected',
  'superseded',
  'expired',
]);

export const reviewerDecisionEnum = z.enum([
  'accepted',
  'rejected',
  'needs_revision',
]);

export const promptStatusEnum = z.enum([
  'draft',
  'under_review',
  'approved',
  'retired',
]);

// ── Update Suggestion Review Status ─────────────────────────────

export const UpdateSuggestionReviewSchema = z.object({
  reviewerDecision: z.enum(['rejected', 'needs_revision']),
  reviewerNotes: nonEmptyString.pipe(z.string().max(2000)),
}).strict();

// NOTE: 'accepted' decision is deliberately excluded from the review schema.
// Accept-to-draft uses a separate endpoint and schema (Phase 3.9).
// This prevents any path from AI suggestion to active reference data
// without the full governance pipeline.

// ── Accept to Draft — Citation Only (Phase 3.9) ────────────────
// Human-initiated conversion of a reviewed AI citation suggestion
// into a DraftRegulatoryChange record. Only citation suggestions
// may be converted. The resulting draft enters the standard
// review → approval → publish pipeline. No active reference data
// is modified.

export const AcceptToDraftSchema = z.object({
  relatedUpdateId: nonEmptyString,
  changeReason: optionalString,
}).strict();

// ── Expire Suggestion ───────────────────────────────────────────

export const ExpireSuggestionSchema = z.object({
  reason: optionalString,
}).strict();

// ── Mark for Human Review (Phase 3.7) ───────────────────────────

export const MarkForReviewSchema = z.object({
  reason: optionalString,
}).strict();

// ── Update Reviewer Notes (Phase 3.7) ───────────────────────────

export const UpdateReviewerNotesSchema = z.object({
  reviewerNotes: nonEmptyString.pipe(z.string().max(2000)),
}).strict();

// ── Toggle Legal Review Required (Phase 3.7) ────────────────────

export const ToggleLegalReviewSchema = z.object({
  legalReviewRequired: z.boolean(),
  reason: optionalString,
}).strict();

// ── Manual Governance Suggestion Record ─────────────────────────
// Used for creating governance-tracking records, NOT AI-generated content.

export const CreateGovernanceSuggestionSchema = z.object({
  sourceRecordId: nonEmptyString,
  sourceFileId: optionalString,
  intakeRequestId: optionalString,
  suggestionType: suggestionTypeEnum,
  sourceExcerpt: nonEmptyString,
  sourceLocation: optionalString,
  suggestedCitation: optionalString,
  suggestedObligationText: optionalString,
  suggestedPlainEnglishInterpretation: optionalString,
  suggestedBusinessFunctions: z.array(z.string()).optional(),
  suggestedControls: z.array(z.string()).optional(),
  suggestedEvidence: z.array(z.string()).optional(),
  suggestedStandards: z.array(z.string()).optional(),
  confidenceScore: confidenceScore,
  confidenceExplanation: optionalString,
  modelName: nonEmptyString,
  modelVersion: nonEmptyString,
  promptVersion: nonEmptyString,
  legalReviewRequired: z.boolean().optional(),
  sourceReference: optionalString,
}).strict();

// ── Generate Citation Suggestions (Phase 3.8) ──────────────────
// Request schema for POST /api/ai/citation-suggestions/generate.
// GOVERNANCE: Only citation extraction is supported. No obligation fields.

export const GenerateCitationSuggestionsSchema = z.object({
  sourceRecordId: nonEmptyString,
  sourceExcerpt: nonEmptyString.pipe(z.string().max(12000)),
  sourceReference: nonEmptyString,
  sourceFileId: optionalString,
  intakeRequestId: optionalString,
  sourceLocation: optionalString,
  regulator: optionalString,
  jurisdiction: optionalString,
  sourceTitle: optionalString,
  maxSuggestions: z.number().int().min(1).max(20).optional(),
}).strict();

// ── AI Model Output Validation (Phase 3.8) ─────────────────────
// Validates structured JSON returned by the AI model.
// Rejects malformed or non-conformant output before record creation.

export const AiCitationOutputSchema = z.object({
  citations: z.array(z.object({
    suggestedCitation: z.string().min(1),
    sourceExcerpt: z.string().min(1),
    sourceLocation: z.string().nullable().optional(),
    confidenceScore: confidenceScore,
    confidenceExplanation: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })).max(20),
}).strict();
