/**
 * Tier 2D: AI Suggestion & Prompt Version Schema.
 *
 * ai_extraction_suggestions — draft-only AI-generated candidate records.
 * ai_prompt_versions — governed prompt templates for AI extraction.
 *
 * GOVERNANCE:
 * AI suggestions are DRAFT-ONLY governance records. They are NOT active
 * reference data, legal advice, or compliance certifications.
 * AI suggestions must NOT automatically create obligations, draft mappings,
 * active citations, or published records.
 *
 * No AI model is integrated in Phase 3.6. These are structural foundations.
 *
 * Phase 3.6: Zod Validation & AI Suggestion Data Model Foundation
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  real,
  timestamp,
  pgEnum,
  serial,
} from 'drizzle-orm/pg-core';

// ── Enums ───────────────────────────────────────────────────────

export const suggestionTypeEnum = pgEnum('ai_suggestion_type', [
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

export const suggestionStatusEnum = pgEnum('ai_suggestion_status', [
  'generated',
  'human_review_required',
  'accepted_to_draft',
  'rejected',
  'superseded',
  'expired',
]);

export const reviewerDecisionEnum = pgEnum('ai_reviewer_decision', [
  'accepted',
  'rejected',
  'needs_revision',
]);

export const promptStatusEnum = pgEnum('ai_prompt_status', [
  'draft',
  'under_review',
  'approved',
  'retired',
]);

// ── AI Extraction Suggestions ───────────────────────────────────

export const aiExtractionSuggestions = pgTable('ai_extraction_suggestions', {
  id: serial('id').primaryKey(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),

  // Source linkage
  sourceRecordId: text('source_record_id').notNull(),
  sourceFileId: text('source_file_id'),
  intakeRequestId: text('intake_request_id'),

  // Suggestion classification
  suggestionType: suggestionTypeEnum('suggestion_type').notNull(),
  suggestionStatus: suggestionStatusEnum('suggestion_status').notNull().default('generated'),

  // Source evidence
  sourceExcerpt: text('source_excerpt').notNull(),
  sourceLocation: text('source_location'),

  // Suggested content (draft-only — NOT active reference data)
  suggestedCitation: text('suggested_citation'),
  suggestedObligationText: text('suggested_obligation_text'),
  suggestedPlainEnglishInterpretation: text('suggested_plain_english_interpretation'),
  suggestedBusinessFunctions: text('suggested_business_functions'), // JSON array as text
  suggestedControls: text('suggested_controls'), // JSON array as text
  suggestedEvidence: text('suggested_evidence'), // JSON array as text
  suggestedStandards: text('suggested_standards'), // JSON array as text

  // Confidence
  confidenceScore: real('confidence_score').notNull(),
  confidenceExplanation: text('confidence_explanation'),

  // Model provenance
  modelName: text('model_name').notNull(),
  modelVersion: text('model_version').notNull(),
  promptVersion: text('prompt_version').notNull(),

  // Generation identity (server-controlled)
  generatedBy: text('generated_by').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull(),

  // Review (server-controlled)
  reviewedByUserId: text('reviewed_by_user_id'),
  reviewedByEmail: text('reviewed_by_email'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewerDecision: reviewerDecisionEnum('reviewer_decision'),
  reviewerNotes: text('reviewer_notes'),

  // Linkage
  relatedDraftChangeId: text('related_draft_change_id'),

  // Flags
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),

  // Reference
  sourceReference: text('source_reference'),
  auditEventIds: text('audit_event_ids'), // JSON array as text

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── AI Prompt Versions ──────────────────────────────────────────

export const aiPromptVersions = pgTable('ai_prompt_versions', {
  id: serial('id').primaryKey(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),

  // Prompt identity
  promptName: text('prompt_name').notNull(),
  promptPurpose: text('prompt_purpose'),
  promptVersion: text('prompt_version').notNull(),
  promptText: text('prompt_text').notNull(),

  // Status
  promptStatus: promptStatusEnum('prompt_status').notNull().default('draft'),

  // Approval (server-controlled)
  approvedByUserId: text('approved_by_user_id'),
  approvedByEmail: text('approved_by_email'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),

  // Classification
  modelFamily: text('model_family'),
  riskLevel: text('risk_level'),
  governanceNotes: text('governance_notes'),

  // Authorship (server-controlled)
  createdByUserId: text('created_by_user_id'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
