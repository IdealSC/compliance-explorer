/**
 * ComplianceControl — Operational control linked to obligations,
 * regulations, standards, and impact analyses.
 *
 * Controls are OPERATIONAL compliance data. They reference controlled
 * regulatory data (obligations, regulations, standards) but do not
 * modify, approve, or publish regulatory reference data.
 */

export type ControlType =
  | 'preventive'
  | 'detective'
  | 'corrective'
  | 'governance'
  | 'documentation'
  | 'monitoring'
  | 'reporting';

export type ControlStatus =
  | 'not_started'
  | 'designed'
  | 'implemented'
  | 'operating'
  | 'needs_review'
  | 'deficient'
  | 'retired';

export interface ComplianceControl {
  /** Unique identifier, e.g. "CTRL-001" */
  id: string;
  controlName: string;
  controlDescription: string;
  controlType: ControlType;
  controlStatus: ControlStatus;
  controlOwner: string;
  businessFunction: string;

  // ── Regulatory Linkage (read-only references) ────────────────
  relatedObligationIds: string[];
  relatedRegulationIds: string[];
  relatedCrosswalkIds: string[];
  relatedImpactAnalysisIds: string[];
  relatedEvidenceIds: string[];

  // ── Risk & Frequency ─────────────────────────────────────────
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  frequency: string;
  lastReviewedDate: string | null;
  nextReviewDate: string | null;

  // ── Quality Indicators ───────────────────────────────────────
  sourceReference: string | null;
  governanceStatus: 'draft' | 'active' | 'under_review' | 'retired';
  confidenceLevel: 'High' | 'Medium' | 'Low' | null;
  notes: string | null;
}
