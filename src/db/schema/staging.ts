/**
 * Tier 3: Draft / Staging Schema.
 *
 * regulatory_updates — incoming regulatory change signals.
 * draft_changes — proposed modifications to controlled data.
 * approval_reviews — review/approval lifecycle records for drafts.
 * publication_events — immutable publication records (Phase 2.5B).
 *
 * All records are isolated from active reference data.
 * Publication creates new versioned reference records — never overwrites.
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './identity';

// ── Enums ───────────────────────────────────────────────────────

export const changeTypeEnum = pgEnum('change_type', [
  'new',
  'amendment',
  'repeal',
  'guidance',
  'standard_update',
  'interpretation_update',
]);

export const workflowStageEnum = pgEnum('workflow_stage', [
  'intake',
  'triage',
  'draft_mapping',
  'review',
  'approved',
  'published',
  'rejected',
]);

export const draftStatusEnum = pgEnum('draft_status', [
  'draft',
  'ready_for_review',
  'returned',
  'approved',
  'rejected',
  'published', // Phase 2.5B: Draft has been published as active reference
]);

export const affectedEntityTypeEnum = pgEnum('affected_entity_type', [
  'obligation',
  'crosswalk',
  'citation',
  'interpretation',
  'control',
  'evidence',
  'function_impact',
]);

export const reviewStatusEnum = pgEnum('review_status', [
  'pending',
  'in_review',
  'approved_for_publication',
  'returned_for_revision',
  'rejected',
  'legal_review_required',
]);

export const reviewTargetTypeEnum = pgEnum('review_target_type', [
  'regulatory_update',
  'draft_change',
]);

// ── Regulatory Updates ──────────────────────────────────────────

export const regulatoryUpdates = pgTable('regulatory_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  updateTitle: text('update_title').notNull(),
  sourceName: text('source_name'),
  sourceType: text('source_type'),
  regulator: text('regulator'),
  jurisdiction: text('jurisdiction'),
  changeType: changeTypeEnum('change_type').notNull(),
  changeSummary: text('change_summary').notNull(),
  sourceReference: text('source_reference'),
  currentStage: workflowStageEnum('current_stage').notNull().default('intake'),
  assignedReviewerId: uuid('assigned_reviewer_id').references(() => users.id),
  assignedReviewer: text('assigned_reviewer'), // Name fallback for seed data
  confidenceLevel: text('confidence_level'),
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),
  impactedDomains: text('impacted_domains'), // JSON array as text
  impactedBusinessFunctions: text('impacted_business_functions'), // JSON array as text
  relatedObligationIds: text('related_obligation_ids'), // JSON array as text
  relatedCrosswalkIds: text('related_crosswalk_ids'), // JSON array as text
  intakeDate: timestamp('intake_date', { withTimezone: true }).notNull().defaultNow(),
  publicationDate: date('publication_date'),
  effectiveDate: date('effective_date'),
  // Phase 2.5A: Creator attribution for separation-of-duties
  createdByUserId: uuid('created_by_user_id').references(() => users.id),
});

// ── Draft Changes ───────────────────────────────────────────────

export const draftChanges = pgTable('draft_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  regulatoryUpdateId: uuid('regulatory_update_id').references(() => regulatoryUpdates.id),
  relatedUpdateId: text('related_update_id'), // Text FK for seed compatibility
  affectedEntityType: text('affected_entity_type').notNull(),
  affectedEntityId: text('affected_entity_id'),
  changeType: text('change_type_text').notNull(),
  proposedChangeSummary: text('proposed_change_summary').notNull(),
  previousValue: text('previous_value'),
  proposedValue: text('proposed_value'),
  sourceReference: text('source_reference'),
  changeReason: text('change_reason'),
  requiredApprover: text('required_approver'),
  draftStatus: draftStatusEnum('draft_status').notNull().default('draft'),
  submittedBy: text('submitted_by'),
  submittedDate: date('submitted_date'),
  // Phase 2.5A: Creator attribution for separation-of-duties
  createdByUserId: uuid('created_by_user_id').references(() => users.id),
});

// ── Approval Reviews ────────────────────────────────────────────
// Phase 2.5A: Full review lifecycle records.
// Each review tracks a single review decision workflow for one target entity.
// approved_for_publication means approved for future publishing, NOT active publication.

export const approvalReviews = pgTable('approval_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  // Target identification
  reviewTargetType: reviewTargetTypeEnum('review_target_type').notNull(),
  reviewTargetId: text('review_target_id').notNull(), // stableReferenceId of the target
  relatedUpdateId: text('related_update_id'), // Parent regulatory update if applicable
  relatedDraftChangeId: text('related_draft_change_id'), // Draft change if applicable
  // Review status
  reviewStatus: reviewStatusEnum('review_status').notNull().default('pending'),
  reviewDecision: text('review_decision'), // Free-text decision summary
  reviewComments: text('review_comments'),
  // Reviewer assignment
  requiredReviewerRole: text('required_reviewer_role'),
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id),
  reviewedByEmail: text('reviewed_by_email'),
  reviewedByName: text('reviewed_by_name'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  // Submitter tracking
  submittedByUserId: uuid('submitted_by_user_id').references(() => users.id),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  // Metadata
  sourceReference: text('source_reference'),
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),
  complianceReviewRequired: boolean('compliance_review_required').notNull().default(true),
  approvalReference: text('approval_reference'),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Publication Events ──────────────────────────────────────────
// Phase 2.5B: Immutable publication records.
// Each record captures a single publishing action — who published what,
// what version was created, what was superseded, and the full authorization chain.
// These records are INSERT-only. No UPDATE or DELETE in production.

export const publicationStatusEnum = pgEnum('publication_status', [
  'published',
  'failed',
  'rolled_back',
]);

export const publicationEvents = pgTable('publication_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  // Source identifiers
  draftChangeId: text('draft_change_id').notNull(), // stableReferenceId of the draft
  regulatoryUpdateId: text('regulatory_update_id'), // parent update stableReferenceId
  approvalReviewId: text('approval_review_id').notNull(), // authorizing review
  // Published target
  publishedEntityType: text('published_entity_type').notNull(), // e.g., 'regulatory_reference_record'
  publishedEntityId: text('published_entity_id').notNull(), // stableReferenceId of new active record
  newVersionId: text('new_version_id').notNull(), // version record stableReferenceId
  previousVersionId: text('previous_version_id'), // superseded version if applicable
  // Status
  publicationStatus: publicationStatusEnum('publication_status').notNull().default('published'),
  // Publisher identity
  publishedByUserId: uuid('published_by_user_id').references(() => users.id),
  publishedByEmail: text('published_by_email'),
  publishedByName: text('published_by_name'),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  // Provenance
  sourceReference: text('source_reference'),
  publicationSummary: text('publication_summary'),
  validationSummary: text('validation_summary'), // JSON string of precondition check results
  approvalReference: text('approval_reference'),
  auditEventId: text('audit_event_id'), // linked audit event stableReferenceId
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
