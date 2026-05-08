/**
 * Data Quality Issue — diagnostic record identifying weak, incomplete,
 * stale, unsupported, or high-risk records across the compliance map.
 *
 * GOVERNANCE TIER: Diagnostic / Assessment
 * - Issues are READ-ONLY diagnostic findings.
 * - They do NOT modify controlled reference data.
 * - A data quality score is NOT a legal compliance determination.
 */

export type DataQualityIssueType =
  | 'missing_source_reference'
  | 'missing_metadata'
  | 'low_confidence'
  | 'stale_review'
  | 'missing_control'
  | 'missing_evidence'
  | 'expired_evidence'
  | 'rejected_evidence'
  | 'deficient_control'
  | 'stalled_draft'
  | 'legal_review_needed'
  | 'broken_crosswalk'
  | 'unmapped_business_function'
  | 'version_gap'
  | 'audit_gap'
  | 'duplicate_or_legacy_route_confusion'
  | 'empty_business_function_mapping'
  | 'other';

export type DataQualitySeverity = 'low' | 'medium' | 'high' | 'critical';
export type DataQualityStatus = 'open' | 'in_review' | 'planned' | 'resolved' | 'deferred';

export type AffectedEntityType =
  | 'obligation' | 'source' | 'control' | 'evidence'
  | 'regulatory_update' | 'draft_change' | 'impact_analysis'
  | 'crosswalk' | 'report' | 'version_record' | 'audit_event'
  | 'business_function' | 'route' | 'page' | 'other';

export type DataQualityCategory =
  | 'source' | 'obligation' | 'control_evidence'
  | 'governance' | 'business_function' | 'ux_navigation';

export interface DataQualityIssue {
  id: string;
  issueTitle: string;
  issueDescription: string;
  issueType: DataQualityIssueType;
  category: DataQualityCategory;
  severity: DataQualitySeverity;
  status: DataQualityStatus;
  affectedEntityType: AffectedEntityType;
  affectedEntityId: string;
  affectedEntityLabel: string;
  businessFunction: string;
  owner: string;
  relatedObligationIds: string[];
  relatedControlIds: string[];
  relatedEvidenceIds: string[];
  relatedSourceIds: string[];
  relatedImpactAnalysisIds: string[];
  relatedDraftChangeIds: string[];
  relatedReportIds: string[];
  sourceReference: string | null;
  confidenceLevel: string | null;
  legalReviewRequired: boolean;
  recommendedAction: string;
  riskIfUnresolved: string;
  detectedAt: string;
  lastReviewedAt: string | null;
  dueDate: string | null;
  notes: string | null;
}
