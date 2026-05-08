/**
 * Tier 2C: Source Intake Workflow Schema.
 *
 * source_intake_requests — workflow tracking for incoming source materials.
 * source_intake_checklist_items — validation checklist items per intake.
 *
 * GOVERNANCE:
 * Intake requests are WORKFLOW DATA only. They track the process of
 * evaluating, triaging, and routing source materials for review.
 * They do NOT automatically create obligations, draft mappings,
 * active reference data, or published records.
 *
 * Phase 3.4: Controlled Source Intake Workflow
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
import { checklistItemStatusEnum } from './sources';

// ── Enums ───────────────────────────────────────────────────────

export const intakeTypeEnum = pgEnum('intake_type', [
  'new_source',
  'updated_source',
  'new_guidance',
  'updated_guidance',
  'standard_update',
  'regulator_notice',
  'internal_note',
  'source_file_metadata',
  'other',
]);

export const intakeStatusEnum = pgEnum('intake_status', [
  'submitted',
  'triage',
  'metadata_review',
  'assigned',
  'validation_pending',
  'legal_review_required',
  'ready_for_source_record',
  'converted_to_source_record',
  'rejected',
  'closed',
]);

export const intakePriorityEnum = pgEnum('intake_priority', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const metadataCompletenessEnum = pgEnum('metadata_completeness_status', [
  'not_started',
  'incomplete',
  'complete',
  'needs_review',
]);

// ── Source Intake Requests ───────────────────────────────────────

export const sourceIntakeRequests = pgTable('source_intake_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),

  // Core intake fields
  intakeTitle: text('intake_title').notNull(),
  intakeDescription: text('intake_description'),
  intakeType: intakeTypeEnum('intake_type').notNull(),
  intakeStatus: intakeStatusEnum('intake_status').notNull().default('submitted'),
  priority: intakePriorityEnum('priority').notNull().default('medium'),

  // Source classification
  sourceType: text('source_type'),
  regulator: text('regulator'),
  jurisdiction: text('jurisdiction'),
  issuingAuthority: text('issuing_authority'),
  publicationDate: date('publication_date'),
  effectiveDate: date('effective_date'),
  sourceUrl: text('source_url'),
  sourceFileName: text('source_file_name'),

  // Linkage (stored as comma-separated IDs for compatibility)
  relatedSourceRecordId: text('related_source_record_id'),
  relatedSourceFileIds: text('related_source_file_ids'),
  relatedRegulatoryUpdateIds: text('related_regulatory_update_ids'),
  relatedDraftChangeIds: text('related_draft_change_ids'),
  businessFunctionsImpacted: text('business_functions_impacted'),
  domainsImpacted: text('domains_impacted'),

  // Submitter identity (server-controlled)
  submittedByUserId: uuid('submitted_by_user_id').references(() => users.id),
  submittedByEmail: text('submitted_by_email'),
  submittedByName: text('submitted_by_name'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),

  // Assignment
  assignedToUserId: uuid('assigned_to_user_id').references(() => users.id),
  assignedToEmail: text('assigned_to_email'),
  assignedToName: text('assigned_to_name'),

  // Triage (server-controlled)
  triagedByUserId: uuid('triaged_by_user_id').references(() => users.id),
  triagedAt: timestamp('triaged_at', { withTimezone: true }),

  // Review flags
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),
  complianceReviewRequired: boolean('compliance_review_required').notNull().default(false),
  metadataCompletenessStatus: metadataCompletenessEnum('metadata_completeness_status').notNull().default('not_started'),

  // Notes & content
  intakeSummary: text('intake_summary'),
  triageNotes: text('triage_notes'),
  rejectionReason: text('rejection_reason'),
  sourceReference: text('source_reference'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Source Intake Checklist Items ────────────────────────────────

export const sourceIntakeChecklistItems = pgTable('source_intake_checklist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  intakeRequestId: uuid('intake_request_id').notNull().references(() => sourceIntakeRequests.id),

  itemLabel: text('item_label').notNull(),
  itemDescription: text('item_description'),
  status: checklistItemStatusEnum('status').notNull().default('not_started'),

  requiredForTriage: boolean('required_for_triage').notNull().default(false),
  requiredForSourceRecordCreation: boolean('required_for_source_record_creation').notNull().default(false),

  completedByUserId: uuid('completed_by_user_id').references(() => users.id),
  completedByEmail: text('completed_by_email'),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
