/**
 * Tier 5: Audit / Historical Schema.
 *
 * audit_events — append-only audit trail.
 * regulatory_versions — version history for controlled records.
 * report_snapshots — point-in-time report captures.
 *
 * All tables are INSERT-only in production. No UPDATE or DELETE.
 */
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './identity';

// ── Enums ───────────────────────────────────────────────────────

export const auditActionEnum = pgEnum('audit_action', [
  'record_created',
  'field_updated',
  'status_changed',
  'draft_submitted',
  'draft_approved',
  'draft_rejected',
  'draft_returned',
  'version_published',
  'version_superseded',
  'source_intake_created',
  'source_validated',
  'report_exported',
  'owner_action_created',
  'impact_analysis_created',
  // Phase 2.3: Operational write actions
  'control_status_updated',
  'control_notes_updated',
  'evidence_status_updated',
  'evidence_notes_updated',
  'action_status_updated',
  'action_notes_updated',
  'action_due_date_updated',
  // Phase 2.4: Draft/staging write actions
  'regulatory_update_draft_created',
  'regulatory_update_draft_updated',
  'regulatory_update_stage_changed',
  'draft_change_created',
  'draft_change_updated',
  'draft_change_ready_for_review',
  'draft_change_submitted',
  'draft_change_returned',
  // Phase 2.5A: Review/approval workflow actions
  'approval_review_created',
  'approval_review_started',
  'approval_review_returned_for_revision',
  'approval_review_rejected',
  'approval_review_legal_review_required',
  'approval_review_approved_for_publication',
  'approval_review_comments_updated',
  // Phase 2.5B: Controlled publishing actions
  'publishing_validation_completed',
  'publishing_draft_change_published',
  'publishing_reference_record_created',
  'publishing_prior_version_superseded',
  'publishing_regulatory_update_operationalized',
  'publishing_failed',
  // Phase 2.6: Immutability verification actions
  'immutability_check_passed',
  'immutability_check_failed',
  // Phase 2.7: Source registry lifecycle actions
  'source_record_created',
  'source_record_metadata_updated',
  'source_record_status_changed',
  'source_record_validation_status_changed',
  'source_record_legal_review_required',
  'source_record_validated',
  'source_record_rejected',
  'source_checklist_item_updated',
  // Phase 2.8: Report snapshot / export governance actions
  'report_snapshot_created',
  'report_export_csv',
  'report_export_json',
  'report_export_print',
  'report_export_failed',
  'report_snapshot_viewed',
  // Phase 3.3: Source file metadata governance actions
  'source_file_registered',
  'source_file_metadata_updated',
  'source_file_status_changed',
  'source_file_verified',
  'source_file_archived',
]);

export const versionRecordStatusEnum = pgEnum('version_record_status', [
  'active',
  'draft',
  'pending_review',
  'superseded',
  'archived',
]);

// ── Audit Events ────────────────────────────────────────────────

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  changedBy: text('changed_by').notNull(),
  changedByUserId: uuid('changed_by_user_id').references(() => users.id),
  changedByEmail: text('changed_by_email'),
  roles: text('roles'), // JSON array of role IDs at time of action
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  reason: text('reason'),
  approvalReference: text('approval_reference'),
  sourceReference: text('source_reference'), // B2 FIX: Publishing provenance traceability
  checksum: text('checksum'),
  sessionId: text('session_id'),
});

// ── Regulatory Versions ─────────────────────────────────────────

export const regulatoryVersions = pgTable('regulatory_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull(),
  versionId: text('version_id').notNull().unique(), // e.g., "VER-001"
  versionNumber: text('version_number').notNull(),
  recordStatus: versionRecordStatusEnum('record_status').notNull().default('active'),
  effectiveDate: text('effective_date'),
  supersededDate: text('superseded_date'),
  changeSummary: text('change_summary').notNull(),
  approvedBy: text('approved_by'),
  approvedByUserId: uuid('approved_by_user_id').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  previousVersionId: text('previous_version_id'),
  sourceReference: text('source_reference'),
});

// ── Report Snapshots ────────────────────────────────────────────
// Phase 2.8: Fully governed, append-only report output records.
// INSERT-only — no UPDATE or DELETE. Checksummed for integrity.

export const reportSnapshots = pgTable('report_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  reportDefinitionId: text('report_definition_id').notNull(),
  reportName: text('report_name').notNull(),
  reportType: text('report_type').notNull(), // category
  generatedByUserId: uuid('generated_by_user_id').references(() => users.id),
  generatedBy: text('generated_by').notNull(),
  generatedByEmail: text('generated_by_email'),
  generatedByName: text('generated_by_name'),
  generatedByRoles: text('generated_by_roles'), // JSON array
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  dataScope: text('data_scope'),
  filtersApplied: jsonb('filters_applied'),
  sourceDatasets: jsonb('source_datasets'), // string[]
  sourceReferences: jsonb('source_references'), // string[]
  stableReferenceIds: jsonb('stable_reference_ids'), // string[]
  versionIds: jsonb('version_ids'), // string[]
  publicationEventIds: jsonb('publication_event_ids'), // string[]
  auditEventIds: jsonb('audit_event_ids'), // string[]
  includesSampleData: boolean('includes_sample_data').notNull().default(true),
  recordCount: integer('record_count').notNull(),
  exportFormat: text('export_format').notNull(), // csv, json, print, preview
  snapshotStatus: text('snapshot_status').notNull().default('generated'), // generated, exported, failed, archived
  governanceDisclaimer: text('governance_disclaimer'),
  sampleDataDisclaimer: text('sample_data_disclaimer'),
  checksum: text('checksum'),
  checksumAlgorithm: text('checksum_algorithm').default('sha256'),
  relatedAuditEventId: text('related_audit_event_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
