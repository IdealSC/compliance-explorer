/**
 * Data Quality Issues Schema.
 *
 * Diagnostic records identifying weak, incomplete, stale, or
 * high-risk records across the compliance map.
 *
 * Issues are READ-ONLY diagnostic findings. In production,
 * these would be computed by scheduled jobs.
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

// ── Enums ───────────────────────────────────────────────────────

export const dqSeverityEnum = pgEnum('dq_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const dqStatusEnum = pgEnum('dq_status', [
  'open',
  'in_review',
  'planned',
  'resolved',
  'deferred',
]);

// ── Data Quality Issues ─────────────────────────────────────────

export const dataQualityIssues = pgTable('data_quality_issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  issueTitle: text('issue_title').notNull(),
  issueDescription: text('issue_description').notNull(),
  issueType: text('issue_type').notNull(),
  category: text('category').notNull(),
  severity: dqSeverityEnum('severity').notNull(),
  status: dqStatusEnum('status').notNull().default('open'),
  affectedEntityType: text('affected_entity_type').notNull(),
  affectedEntityId: text('affected_entity_id').notNull(),
  affectedEntityLabel: text('affected_entity_label').notNull(),
  businessFunction: text('business_function'),
  owner: text('owner'),
  relatedObligationIds: text('related_obligation_ids'),
  relatedControlIds: text('related_control_ids'),
  relatedEvidenceIds: text('related_evidence_ids'),
  relatedSourceIds: text('related_source_ids'),
  relatedImpactAnalysisIds: text('related_impact_analysis_ids'),
  relatedDraftChangeIds: text('related_draft_change_ids'),
  relatedReportIds: text('related_report_ids'),
  sourceReference: text('source_reference'),
  confidenceLevel: text('confidence_level'),
  legalReviewRequired: boolean('legal_review_required').notNull().default(false),
  recommendedAction: text('recommended_action'),
  riskIfUnresolved: text('risk_if_unresolved'),
  detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  dueDate: date('due_date'),
  notes: text('notes'),
});
