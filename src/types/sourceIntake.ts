/**
 * Source Intake Workflow Types — Phase 3.4.
 *
 * GOVERNANCE: Intake requests are WORKFLOW DATA only.
 * They do NOT become active regulatory reference data.
 * They must NOT automatically create obligations, draft mappings,
 * or publish data.
 */

// ── Enums ───────────────────────────────────────────────────────

export type IntakeType =
  | 'new_source'
  | 'updated_source'
  | 'new_guidance'
  | 'updated_guidance'
  | 'standard_update'
  | 'regulator_notice'
  | 'internal_note'
  | 'source_file_metadata'
  | 'other';

export type IntakeStatus =
  | 'submitted'
  | 'triage'
  | 'metadata_review'
  | 'assigned'
  | 'validation_pending'
  | 'legal_review_required'
  | 'ready_for_source_record'
  | 'converted_to_source_record'
  | 'rejected'
  | 'closed';

export type IntakePriority = 'low' | 'medium' | 'high' | 'critical';

export type MetadataCompletenessStatus =
  | 'not_started'
  | 'incomplete'
  | 'complete'
  | 'needs_review';

export type IntakeChecklistItemStatus =
  | 'not_started'
  | 'complete'
  | 'incomplete'
  | 'needs_review'
  | 'not_applicable';

// ── Source Intake Request ────────────────────────────────────────

export interface SourceIntakeRequest {
  id: string;
  stableReferenceId: string;
  intakeTitle: string;
  intakeDescription: string | null;
  intakeType: IntakeType;
  intakeStatus: IntakeStatus;
  priority: IntakePriority;

  // Source classification
  sourceType: string | null;
  regulator: string | null;
  jurisdiction: string | null;
  issuingAuthority: string | null;
  publicationDate: string | null;
  effectiveDate: string | null;
  sourceUrl: string | null;
  sourceFileName: string | null;

  // Linkage
  relatedSourceRecordId: string | null;
  relatedSourceFileIds: string | null;
  relatedRegulatoryUpdateIds: string | null;
  relatedDraftChangeIds: string | null;
  businessFunctionsImpacted: string | null;
  domainsImpacted: string | null;

  // Submitter
  submittedByUserId: string | null;
  submittedByEmail: string | null;
  submittedByName: string | null;
  submittedAt: string | null;

  // Assignment
  assignedToUserId: string | null;
  assignedToEmail: string | null;
  assignedToName: string | null;

  // Triage
  triagedByUserId: string | null;
  triagedAt: string | null;

  // Review flags
  legalReviewRequired: boolean;
  complianceReviewRequired: boolean;
  metadataCompletenessStatus: MetadataCompletenessStatus;

  // Notes & content
  intakeSummary: string | null;
  triageNotes: string | null;
  rejectionReason: string | null;
  sourceReference: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Nested data (populated by API)
  checklistItems?: SourceIntakeChecklistItem[];
}

// ── Source Intake Checklist Item ─────────────────────────────────

export interface SourceIntakeChecklistItem {
  id: string;
  intakeRequestId: string;
  itemLabel: string;
  itemDescription: string | null;
  status: IntakeChecklistItemStatus;
  requiredForTriage: boolean;
  requiredForSourceRecordCreation: boolean;
  completedByUserId: string | null;
  completedByEmail: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
