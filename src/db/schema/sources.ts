/**
 * Tier 2: Source Registry Schema.
 *
 * source_records — registered source materials (laws, standards, guidance).
 * source_validation_checklists — validation checklist items per source.
 *
 * Source records track provenance and validation state.
 * They do NOT automatically create active regulatory reference data.
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

export const srcTypeEnum = pgEnum('src_type', [
  'law',
  'regulation',
  'standard',
  'guidance',
  'framework',
  'regulator_notice',
  'internal_note',
  'pdf',
  'spreadsheet',
  'website',
  'other',
]);

export const srcStatusEnum = pgEnum('src_status', [
  'intake',
  'metadata_review',
  'validation_pending',
  'validated',
  'staged',
  'active',
  'superseded',
  'archived',
  'rejected',
]);

export const validationStatusEnum = pgEnum('validation_status', [
  'not_started',
  'incomplete_metadata',
  'source_verified',
  'citation_review_needed',
  'legal_review_needed',
  'validated',
  'rejected',
]);

export const checklistItemStatusEnum = pgEnum('checklist_item_status', [
  'not_started',
  'complete',
  'incomplete',
  'needs_review',
  'not_applicable',
]);

// ── Source Records ──────────────────────────────────────────────

export const sourceRecords = pgTable('source_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  sourceTitle: text('source_title').notNull(),
  sourceType: srcTypeEnum('source_type').notNull(),
  sourceStatus: srcStatusEnum('source_status').notNull().default('intake'),
  validationStatus: validationStatusEnum('validation_status').notNull().default('not_started'),

  regulator: text('regulator'),
  jurisdiction: text('jurisdiction'),
  issuingAuthority: text('issuing_authority'),
  publicationDate: date('publication_date'),
  effectiveDate: date('effective_date'),
  lastRetrievedDate: date('last_retrieved_date'),
  sourceUrl: text('source_url'),
  sourceFileName: text('source_file_name'),
  sourceVersion: text('source_version'),

  confidenceLevel: text('confidence_level'),
  ownerId: uuid('owner_id').references(() => users.id),
  reviewerId: uuid('reviewer_id').references(() => users.id),
  approverId: uuid('approver_id').references(() => users.id),
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),

  // Content & quality
  summary: text('summary'),
  keyChanges: text('key_changes'),
  knownLimitations: text('known_limitations'),
  missingMetadata: text('missing_metadata'), // JSON array stored as text
  sourceReference: text('source_reference'),

  // Linkage (stored as comma-separated IDs for seed compatibility)
  relatedObligationIds: text('related_obligation_ids'),
  relatedRegulatoryUpdateIds: text('related_regulatory_update_ids'),
  relatedDraftChangeIds: text('related_draft_change_ids'),
  relatedCrosswalkIds: text('related_crosswalk_ids'),
  relatedControlIds: text('related_control_ids'),
  relatedEvidenceIds: text('related_evidence_ids'),
  relatedReportIds: text('related_report_ids'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  notes: text('notes'),
});

// ── Source Validation Checklists ────────────────────────────────

export const sourceValidationChecklists = pgTable('source_validation_checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceRecordId: uuid('source_record_id').notNull().references(() => sourceRecords.id),
  itemLabel: text('item_label').notNull(),
  itemDescription: text('item_description').notNull(),
  status: checklistItemStatusEnum('status').notNull().default('not_started'),
  requiredForValidation: boolean('required_for_validation').notNull().default(true),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  notes: text('notes'),
});
