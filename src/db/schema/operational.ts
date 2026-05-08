/**
 * Tier 4: Operational Compliance Schema.
 *
 * compliance_controls — operational controls linked to obligations.
 * evidence_requirements — evidence artifacts required for compliance.
 * owner_actions — action items assigned to business owners.
 * impact_analyses — regulatory impact assessments (stored as JSONB for sub-entities).
 *
 * Operational data is editable by authorized users but does not
 * modify controlled regulatory reference data.
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './identity';

// ── Enums ───────────────────────────────────────────────────────

export const controlTypeEnum = pgEnum('control_type_enum', [
  'preventive',
  'detective',
  'corrective',
  'governance',
  'documentation',
  'monitoring',
  'reporting',
]);

export const controlStatusEnum = pgEnum('control_status_enum', [
  'not_started',
  'designed',
  'implemented',
  'operating',
  'needs_review',
  'deficient',
  'retired',
]);

export const riskLevelEnum = pgEnum('risk_level', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const evidenceTypeEnum = pgEnum('evidence_type_enum', [
  'policy',
  'procedure',
  'record',
  'report',
  'system_log',
  'training_record',
  'supplier_document',
  'audit_record',
  'attestation',
  'other',
]);

export const evidenceStatusEnum = pgEnum('evidence_status_enum', [
  'not_started',
  'requested',
  'collected',
  'under_review',
  'accepted',
  'rejected',
  'expired',
  'missing',
]);

export const actionStatusEnum = pgEnum('action_status', [
  'not_started',
  'in_progress',
  'blocked',
  'completed',
  'overdue',
]);

export const actionPriorityEnum = pgEnum('action_priority', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const governanceStatusEnum = pgEnum('governance_status', [
  'draft',
  'active',
  'under_review',
  'retired',
]);

export const impactStatusEnum = pgEnum('impact_status', [
  'not_started',
  'in_progress',
  'needs_review',
  'complete',
]);

export const impactSeverityEnum = pgEnum('impact_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

// ── Compliance Controls ─────────────────────────────────────────

export const complianceControls = pgTable('compliance_controls', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  controlName: text('control_name').notNull(),
  controlDescription: text('control_description').notNull(),
  controlType: controlTypeEnum('control_type').notNull(),
  controlStatus: controlStatusEnum('control_status').notNull().default('not_started'),
  controlOwnerId: uuid('control_owner_id').references(() => users.id),
  controlOwner: text('control_owner'), // Name fallback for seed data
  businessFunction: text('business_function').notNull(),
  relatedObligationIds: text('related_obligation_ids'), // JSON array as text
  relatedRegulationIds: text('related_regulation_ids'),
  relatedCrosswalkIds: text('related_crosswalk_ids'),
  relatedImpactAnalysisIds: text('related_impact_analysis_ids'),
  relatedEvidenceIds: text('related_evidence_ids'),
  riskLevel: riskLevelEnum('risk_level').notNull().default('medium'),
  frequency: text('frequency'),
  lastReviewedDate: date('last_reviewed_date'),
  nextReviewDate: date('next_review_date'),
  sourceReference: text('source_reference'),
  governanceStatus: governanceStatusEnum('governance_status').notNull().default('active'),
  confidenceLevel: text('confidence_level'),
  notes: text('notes'),
});

// ── Evidence Requirements ───────────────────────────────────────

export const evidenceRequirements = pgTable('evidence_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  evidenceName: text('evidence_name').notNull(),
  evidenceDescription: text('evidence_description').notNull(),
  evidenceType: evidenceTypeEnum('evidence_type').notNull(),
  evidenceStatus: evidenceStatusEnum('evidence_status').notNull().default('not_started'),
  evidenceOwnerId: uuid('evidence_owner_id').references(() => users.id),
  evidenceOwner: text('evidence_owner'), // Name fallback for seed data
  businessFunction: text('business_function').notNull(),
  relatedControlIds: text('related_control_ids'),
  relatedObligationIds: text('related_obligation_ids'),
  relatedRegulationIds: text('related_regulation_ids'),
  relatedImpactAnalysisIds: text('related_impact_analysis_ids'),
  requiredFrequency: text('required_frequency'),
  retentionRequirement: text('retention_requirement'),
  lastCollectedDate: date('last_collected_date'),
  nextDueDate: date('next_due_date'),
  sourceReference: text('source_reference'),
  governanceStatus: governanceStatusEnum('governance_status').notNull().default('active'),
  confidenceLevel: text('confidence_level'),
  notes: text('notes'),
});

// ── Owner Actions ───────────────────────────────────────────────

export const ownerActions = pgTable('owner_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  actionTitle: text('action_title').notNull(),
  actionDescription: text('action_description').notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  owner: text('owner'), // Name fallback for seed data
  businessFunction: text('business_function').notNull(),
  relatedControlIds: text('related_control_ids'),
  relatedEvidenceIds: text('related_evidence_ids'),
  relatedObligationIds: text('related_obligation_ids'),
  relatedImpactAnalysisIds: text('related_impact_analysis_ids'),
  actionStatus: actionStatusEnum('action_status').notNull().default('not_started'),
  priority: actionPriorityEnum('priority').notNull().default('medium'),
  dueDate: date('due_date'),
  dependency: text('dependency'),
  riskIfNotCompleted: text('risk_if_not_completed'),
  sourceReference: text('source_reference'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Impact Analyses ─────────────────────────────────────────────

export const impactAnalyses = pgTable('impact_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  relatedUpdateId: text('related_update_id'),
  updateTitle: text('update_title').notNull(),
  sourceName: text('source_name'),
  sourceType: text('source_type'),
  regulator: text('regulator'),
  jurisdiction: text('jurisdiction'),
  changeType: text('change_type').notNull(),
  publicationDate: date('publication_date'),
  effectiveDate: date('effective_date'),
  sourceReference: text('source_reference'),
  impactStatus: impactStatusEnum('impact_status').notNull().default('not_started'),
  impactSeverity: impactSeverityEnum('impact_severity').notNull().default('medium'),

  // Complex sub-entities stored as JSONB
  impactedObligationIds: text('impacted_obligation_ids'), // JSON array
  impactedCrosswalkIds: text('impacted_crosswalk_ids'), // JSON array
  impactedStandards: jsonb('impacted_standards'),
  impactedControls: jsonb('impacted_controls'),
  impactedEvidence: jsonb('impacted_evidence'),
  impactedBusinessFunctions: jsonb('impacted_business_functions'),
  impactedOwners: jsonb('impacted_owners'),
  impactedRisks: jsonb('impacted_risks'),
  requiredActions: jsonb('required_actions'),
  recommendedNextSteps: jsonb('recommended_next_steps'),
  governanceReview: jsonb('governance_review'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});
