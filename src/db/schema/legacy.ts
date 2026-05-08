/**
 * Legacy Data Tables — risks, evidence_register, function_impacts, gaps, source_inventory.
 *
 * These tables correspond to the original workbook sheets that predate
 * the governance-tier schema. They are read-only reference data imported
 * from static JSON during seed.
 *
 * They are separated from Tier 1 controlled reference data because they
 * represent analysis artifacts (risks, gaps) and inventory snapshots
 * (evidence register, source inventory) rather than authoritative
 * regulatory obligations.
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// ── Risks (from "Highest Risk" sheet) ───────────────────────────

export const risks = pgTable('risks', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(), // RISK-xxx
  linkedMatrixRowId: text('linked_matrix_row_id'),
  matrixRowId: text('matrix_row_id'),
  severityPriority: text('severity_priority'),
  riskTheme: text('risk_theme'),
  obligation: text('obligation'),
  whyHighRisk: text('why_high_risk'),
  owner: text('owner'),
  evidence: text('evidence'),
  source: text('source'),
  riskThemeCategory: text('risk_theme_category'),
  primaryFunction: text('primary_function'),
  primaryScorPhase: text('primary_scor_phase'),
  primaryJurisdiction: text('primary_jurisdiction'),
  reviewStatus: text('review_status'),
  mitigationStatus: text('mitigation_status'),
  appDashboardUse: text('app_dashboard_use'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Evidence Register (from "Evidence Register" sheet) ──────────

export const evidenceRegister = pgTable('evidence_register', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(), // EVD-xxx
  evidenceArtifact: text('evidence_artifact'),
  regulatoryDriver: text('regulatory_driver'),
  primaryProcess: text('primary_process'),
  evidenceOwner: text('evidence_owner'),
  systemRepository: text('system_repository'),
  minimumReviewCadence: text('minimum_review_cadence'),
  inspectionUse: text('inspection_use'),
  relatedMatrixRowsNotes: text('related_matrix_rows_notes'),
  evidenceCriticality: text('evidence_criticality'),
  appUse: text('app_use'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Function Impacts (from "Function Impact" sheet) ─────────────

export const functionImpacts = pgTable('function_impacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(), // FI-xxx
  businessFunction: text('business_function'),
  whatTheyNeedToUnderstand: text('what_they_need_to_understand'),
  whatTheyNeedToActOn: text('what_they_need_to_act_on'),
  primaryControlsEvidence: text('primary_controls_evidence'),
  highestRiskQuestions: text('highest_risk_questions'),
  primaryPersonaViewer: text('primary_persona_viewer'),
  primaryScorPhases: text('primary_scor_phases'),
  digitalSystemEvidenceDependencies: text('digital_system_evidence_dependencies'),
  linkedMatrixRowIdFilter: text('linked_matrix_row_id_filter'),
  sourceFile: text('source_file'),
  lastReviewedDate: text('last_reviewed_date'),
  confidenceLevel: text('confidence_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Gaps (from "Gaps & Questions" sheet) ─────────────────────────

export const gaps = pgTable('gaps', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(), // GAP-xxx
  gapQuestion: text('gap_question'),
  whyItMatters: text('why_it_matters'),
  suggestedOwner: text('suggested_owner'),
  sourceBasis: text('source_basis'),
  priority: text('priority'),
  gapCategory: text('gap_category'),
  status: text('status'),
  linkedMatrixRowIdFilter: text('linked_matrix_row_id_filter'),
  appTreatment: text('app_treatment'),
  sourceFile: text('source_file'),
  lastReviewedDate: text('last_reviewed_date'),
  confidenceLevel: text('confidence_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Source Inventory (from "Source Inventory" sheet) ─────────────

export const sourceInventory = pgTable('source_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(), // SRC-xxx
  sourceFileSourceName: text('source_file_source_name'),
  roleInMatrix: text('role_in_matrix'),
  jurisdiction: text('jurisdiction'),
  regulatorAuthority: text('regulator_authority'),
  sourceType: text('source_type'),
  documentDate: text('document_date'),
  versionRevision: text('version_revision'),
  primaryTopic: text('primary_topic'),
  reliabilityAuthorityLevel: text('reliability_authority_level'),
  keyExtractedContent: text('key_extracted_content'),
  rowsCreatedSupported: text('rows_created_supported'),
  notes: text('notes'),
  url: text('url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
