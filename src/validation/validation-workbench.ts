/**
 * Zod Validation Schemas — Draft Validation Workbench (Phase 3.10).
 *
 * Input validation for all validation workbench API operations.
 * Schemas enforce strict typing for status transitions, assessment
 * updates, and review metadata.
 *
 * GOVERNANCE: These schemas validate input for advisory validation
 * metadata only. No approval, publication, or active-data mutation.
 */
import { z } from 'zod';

// ── Shared enums ────────────────────────────────────────────────

const validationStatusValues = [
  'not_started',
  'in_validation',
  'validated_for_review',
  'returned_for_revision',
  'rejected',
  'legal_review_required',
] as const;

const validationTypeValues = [
  'legal',
  'compliance',
  'source_support',
  'ai_assisted_citation',
  'general',
] as const;

const sourceSupportStatusValues = [
  'not_checked',
  'supported',
  'partially_supported',
  'unsupported',
  'missing_source',
] as const;

const citationAccuracyStatusValues = [
  'not_checked',
  'accurate',
  'partially_accurate',
  'inaccurate',
  'not_applicable',
] as const;

// ── Create validation review ────────────────────────────────────

export const CreateValidationReviewSchema = z.object({
  draftChangeId: z.string().min(1, 'Draft change ID is required'),
  validationType: z.enum(validationTypeValues).optional().default('general'),
  aiSuggestionId: z.string().nullable().optional().default(null),
  sourceRecordId: z.string().nullable().optional().default(null),
  sourceFileId: z.string().nullable().optional().default(null),
  legalReviewRequired: z.boolean().optional().default(false),
});

export type CreateValidationReviewInput = z.infer<typeof CreateValidationReviewSchema>;

// ── Update validation status (transitions) ──────────────────────

export const UpdateValidationStatusSchema = z.object({
  newStatus: z.enum(validationStatusValues),
  reviewerNotes: z.string().max(4000).optional(),
  reviewerDecision: z.string().max(2000).optional(),
  requiredCorrections: z.string().max(4000).optional(),
});

export type UpdateValidationStatusInput = z.infer<typeof UpdateValidationStatusSchema>;

// ── Update source support assessment ────────────────────────────

export const UpdateSourceSupportSchema = z.object({
  sourceSupportStatus: z.enum(sourceSupportStatusValues),
  reviewerNotes: z.string().max(4000).optional(),
});

export type UpdateSourceSupportInput = z.infer<typeof UpdateSourceSupportSchema>;

// ── Update citation accuracy assessment ─────────────────────────

export const UpdateCitationAccuracySchema = z.object({
  citationAccuracyStatus: z.enum(citationAccuracyStatusValues),
  reviewerNotes: z.string().max(4000).optional(),
});

export type UpdateCitationAccuracyInput = z.infer<typeof UpdateCitationAccuracySchema>;

// ── Update validation notes/findings ────────────────────────────

export const UpdateValidationNotesSchema = z.object({
  reviewerNotes: z.string().max(4000).optional(),
  validationFindings: z.string().max(4000).optional(),
  requiredCorrections: z.string().max(4000).optional(),
  legalReviewRequired: z.boolean().optional(),
  complianceReviewCompleted: z.boolean().optional(),
  legalReviewCompleted: z.boolean().optional(),
});

export type UpdateValidationNotesInput = z.infer<typeof UpdateValidationNotesSchema>;
