/**
 * EvidenceRequirement — Evidence artifact required to demonstrate
 * compliance control effectiveness.
 *
 * Evidence is OPERATIONAL tracking data. It references controlled
 * regulatory data (obligations, controls) but does not modify
 * regulatory reference data.
 */

export type EvidenceType =
  | 'policy'
  | 'procedure'
  | 'record'
  | 'report'
  | 'system_log'
  | 'training_record'
  | 'supplier_document'
  | 'audit_record'
  | 'attestation'
  | 'other';

export type EvidenceStatus =
  | 'not_started'
  | 'requested'
  | 'collected'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'missing';

export interface EvidenceRequirement {
  /** Unique identifier, e.g. "EVD-001" */
  id: string;
  evidenceName: string;
  evidenceDescription: string;
  evidenceType: EvidenceType;
  evidenceStatus: EvidenceStatus;
  evidenceOwner: string;
  businessFunction: string;

  // ── Regulatory Linkage (read-only references) ────────────────
  relatedControlIds: string[];
  relatedObligationIds: string[];
  relatedRegulationIds: string[];
  relatedImpactAnalysisIds: string[];

  // ── Collection & Retention ───────────────────────────────────
  requiredFrequency: string;
  retentionRequirement: string;
  lastCollectedDate: string | null;
  nextDueDate: string | null;

  // ── Quality Indicators ───────────────────────────────────────
  sourceReference: string | null;
  governanceStatus: 'draft' | 'active' | 'under_review' | 'retired';
  confidenceLevel: 'High' | 'Medium' | 'Low' | null;
  notes: string | null;
}
