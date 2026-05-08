/**
 * Tier 3B: Draft Validation Schema (Phase 3.10).
 *
 * draft_validation_reviews — pre-review validation records for draft changes.
 *
 * Validation is a controlled review metadata layer that sits BEFORE
 * the formal review/approval workflow. It does NOT:
 * - Approve drafts
 * - Publish records
 * - Create active reference data
 * - Modify controlled reference data
 *
 * Validation helps Legal and Compliance users assess:
 * - Source support quality
 * - Citation accuracy (for AI-linked drafts)
 * - Legal review requirements
 * - Draft readiness for formal review
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './identity';

// ── Enums ───────────────────────────────────────────────────────

export const draftValidationStatusEnum = pgEnum('draft_validation_status', [
  'not_started',
  'in_validation',
  'validated_for_review',
  'returned_for_revision',
  'rejected',
  'legal_review_required',
]);

export const validationTypeEnum = pgEnum('validation_type', [
  'legal',
  'compliance',
  'source_support',
  'ai_assisted_citation',
  'general',
]);

export const sourceSupportStatusEnum = pgEnum('source_support_status', [
  'not_checked',
  'supported',
  'partially_supported',
  'unsupported',
  'missing_source',
]);

export const citationAccuracyStatusEnum = pgEnum('citation_accuracy_status', [
  'not_checked',
  'accurate',
  'partially_accurate',
  'inaccurate',
  'not_applicable',
]);

// ── Draft Validation Reviews ────────────────────────────────────

export const draftValidationReviews = pgTable('draft_validation_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),

  // ── Target identification ───────────────────────────────────
  draftChangeId: text('draft_change_id').notNull(), // stableReferenceId of the draft
  aiSuggestionId: text('ai_suggestion_id'),         // if AI-linked
  sourceRecordId: text('source_record_id'),          // linked source record
  sourceFileId: text('source_file_id'),              // linked source file

  // ── Validation status ───────────────────────────────────────
  validationStatus: draftValidationStatusEnum('validation_status').notNull().default('not_started'),
  validationType: validationTypeEnum('validation_type').notNull().default('general'),

  // ── Source & citation assessment ────────────────────────────
  sourceSupportStatus: sourceSupportStatusEnum('source_support_status').notNull().default('not_checked'),
  citationAccuracyStatus: citationAccuracyStatusEnum('citation_accuracy_status').notNull().default('not_checked'),

  // ── Legal / compliance flags ────────────────────────────────
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),
  legalReviewCompleted: boolean('legal_review_completed').notNull().default(false),
  complianceReviewCompleted: boolean('compliance_review_completed').notNull().default(false),

  // ── Reviewer assessment ─────────────────────────────────────
  reviewerDecision: text('reviewer_decision'),       // free-text decision summary
  reviewerNotes: text('reviewer_notes'),
  validationFindings: text('validation_findings'),   // structured findings
  requiredCorrections: text('required_corrections'), // corrections before review

  // ── Reviewer identity ───────────────────────────────────────
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id),
  reviewedByEmail: text('reviewed_by_email'),
  reviewedByName: text('reviewed_by_name'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),

  // ── Timestamps ──────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
