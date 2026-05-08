/**
 * Tier 1: Controlled Regulatory Reference Data Schema.
 *
 * regulatory_reference_records — production evolution of the Requirement type.
 * standards — standards and frameworks referenced by obligations.
 * crosswalk_mappings — cross-standard mapping records.
 *
 * All records are version-tracked. Active records are read-only.
 * Changes create new versions via supersede workflow.
 */
import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { sourceRecords } from './sources';

// ── Enums ───────────────────────────────────────────────────────

export const recordStatusEnum = pgEnum('record_status', [
  'active',
  'draft',
  'pending_review',
  'superseded',
  'archived',
]);

export const sourceTypeEnum = pgEnum('ref_source_type', [
  'law',
  'regulation',
  'guidance',
  'standard',
  'framework',
]);

export const severityPriorityEnum = pgEnum('severity_priority', [
  'critical',
  'high',
  'medium',
]);

export const confidenceLevelEnum = pgEnum('confidence_level', [
  'high',
  'medium',
  'low',
]);

// ── Regulatory Reference Records ────────────────────────────────
// B1 FIX: stableReferenceId is stable across all versions.
// The composite unique (stableReferenceId + versionNumber) allows
// multiple version rows to share the same logical reference ID.

export const regulatoryReferenceRecords = pgTable('regulatory_reference_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull(), // No single-column unique — composite below
  versionNumber: text('version_number').notNull().default('1.0'),
  recordStatus: recordStatusEnum('record_status').notNull().default('active'),

  // Regulatory classification
  regulatoryDomain: text('regulatory_domain'),
  jurisdictionRegion: text('jurisdiction_region'),
  regulatorAuthority: text('regulator_authority'),
  lawRegulationName: text('law_regulation_name'),
  specificCitation: text('specific_citation'),
  sourceType: sourceTypeEnum('source_type'),
  regulatoryTier: text('regulatory_tier'),

  // SCOR hierarchy
  scorPhase: text('scor_phase'),
  level1Category: text('level1_category'),
  level2Subcategory: text('level2_subcategory'),
  level3RequirementArea: text('level3_requirement_area'),
  level4DetailedRequirement: text('level4_detailed_requirement'),
  level5GranularObligation: text('level5_granular_obligation'),

  // Content
  exactSourceLanguage: text('exact_source_language'),
  plainEnglishInterpretation: text('plain_english_interpretation'),

  // Applicability
  whoMustComply: text('who_must_comply'),
  businessFunctionsImpacted: text('business_functions_impacted'), // semicolon-delimited (matches current data)
  exampleBusinessOwner: text('example_business_owner'),
  operationalProcessImpacted: text('operational_process_impacted'),

  // Actions & controls (source-derived)
  requiredAction: text('required_action'),
  requiredControl: text('required_control'),
  requiredEvidence: text('required_evidence'),
  reportingRequirement: text('reporting_requirement'),
  monitoringRequirement: text('monitoring_requirement'),
  frequencyTiming: text('frequency_timing'),
  triggeringEvent: text('triggering_event'),
  applicabilityConditions: text('applicability_conditions'),
  exceptionsExemptions: text('exceptions_exemptions'),

  // Cross-references
  relatedStandards: text('related_standards'),
  relatedLawsRegulations: text('related_laws_regulations'),
  relatedInternalPolicies: text('related_internal_policies'),
  dependencies: text('dependencies'),
  potentialConflicts: text('potential_conflicts'),

  // Risk & severity
  riskOfNonCompliance: text('risk_of_non_compliance'),
  severityPriority: text('severity_priority_text'), // kept as text to match current data shape

  // Implementation guidance
  implementationNotes: text('implementation_notes'),
  practicalExample: text('practical_example'),

  // Provenance
  sourceReference: text('source_reference'),
  sourceFile: text('source_file'),
  confidenceLevel: text('confidence_level_text'), // kept as text
  openQuestions: text('open_questions'),
  sourceRecordId: uuid('source_record_id').references(() => sourceRecords.id),

  // Version lifecycle
  publicationDate: date('publication_date'),
  effectiveDate: date('effective_date'),
  supersededDate: date('superseded_date'),
  previousVersionId: uuid('previous_version_id'),

  // Operational fields (editable tier)
  reviewStatus: text('review_status'),
  accuracyEnhancementNote: text('accuracy_enhancement_note'),
  externalVerificationUrl: text('external_verification_url'),
  recommendedEnhancement: text('recommended_enhancement'),
  targetRemediationOwner: text('target_remediation_owner'),
  actionRequired: text('action_required'),
  validationDate: text('validation_date'),

  // UI/display fields
  rowType: text('row_type'),
  primaryPersonaViewer: text('primary_persona_viewer'),
  lifecycleStage: text('lifecycle_stage'),
  processType: text('process_type'),
  status: text('status'),
  actionability: text('actionability'),
  digitalSystemOwner: text('digital_system_owner'),
  controlType: text('control_type'),
  evidenceCriticality: text('evidence_criticality'),
  uiDisplaySummary: text('ui_display_summary'),
  needsReviewFlag: text('needs_review_flag'),
  launchCriticalFlag: text('launch_critical_flag'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (table) => ({
  // B1 FIX: Composite unique — same stableReferenceId can have multiple version rows
  stableRefVersionUnique: unique('reg_ref_stable_ref_version_unq')
    .on(table.stableReferenceId, table.versionNumber),
}));

// ── Standards ───────────────────────────────────────────────────

export const standards = pgTable('standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  standardName: text('standard_name').notNull(),
  issuingBody: text('issuing_body'),
  version: text('version'),
  publicationDate: date('publication_date'),
  sourceRecordId: uuid('source_record_id').references(() => sourceRecords.id),
  recordStatus: recordStatusEnum('record_status').notNull().default('active'),
});

// ── Crosswalk Mappings ──────────────────────────────────────────

export const crosswalkMappings = pgTable('crosswalk_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  crosswalkArea: text('crosswalk_area'),
  linkedLawsStandardsGuidance: text('linked_laws_standards_guidance'),
  businessMeaning: text('business_meaning'),
  primaryEvidenceControl: text('primary_evidence_control'),
  sourceCoverage: text('source_coverage'),
  primaryScorPhase: text('primary_scor_phase'),
  primaryPersonaViewer: text('primary_persona_viewer'),
  relatedAppView: text('related_app_view'),
  linkedMatrixRowIds: text('linked_matrix_row_ids'),
  sourceFile: text('source_file'),
  lastReviewedDate: text('last_reviewed_date'),
  confidenceLevel: text('confidence_level'),
  recordStatus: recordStatusEnum('record_status').notNull().default('active'),
  versionNumber: text('version_number').notNull().default('1.0'),
});
