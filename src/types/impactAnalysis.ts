/**
 * RegulatoryImpactAnalysis — Assessment of how a regulatory change
 * affects the compliance operating model.
 *
 * Impact analysis is an ASSESSMENT LAYER. It does not modify active
 * regulatory reference data, publish changes, or substitute for
 * the governance approval workflow.
 */

// ── Sub-Types ───────────────────────────────────────────────────

export interface ImpactedStandard {
  standardName: string;
  mappingImpact: string;
  reviewStatus: 'not_reviewed' | 'under_review' | 'reviewed' | 'no_impact';
}

export interface ImpactedControl {
  controlName: string;
  controlImpact: string;
  owner: string;
  requiredAction: string;
  riskIfNotUpdated: string;
}

export interface ImpactedEvidence {
  evidenceItem: string;
  evidenceImpact: string;
  businessOwner: string;
  requiredUpdate: string;
  timing: string;
}

export interface BusinessFunctionImpact {
  functionName: string;
  impactSummary: string;
  requiredActions: string[];
  owner: string;
  riskIfNotCompleted: string;
  dependencies: string[];
}

export interface OwnerAction {
  action: string;
  owner: string;
  businessFunction: string;
  dueDate: string | null;
  dependency: string | null;
  riskIfNotCompleted: string;
  status: 'not_started' | 'in_progress' | 'complete' | 'blocked';
}

export interface ImpactedRisk {
  riskDescription: string;
  previousLevel: string | null;
  proposedLevel: string;
  mitigationRequired: string;
}

export interface GovernanceReview {
  legalReviewRequired: boolean;
  confidenceLevel: 'High' | 'Medium' | 'Low' | null;
  openQuestions: string[];
  requiredApprover: string | null;
  reviewStatus: 'not_started' | 'in_progress' | 'complete';
  relatedDraftChangeIds: string[];
  relatedVersionIds: string[];
  relatedAuditEventIds: string[];
}

// ── Main Type ───────────────────────────────────────────────────

export interface RegulatoryImpactAnalysis {
  /** Unique identifier, e.g. "RIA-001" */
  id: string;

  // ── Regulatory Change Reference ──────────────────────────────
  /** ID of the parent RegulatoryUpdate (e.g. "RU-001") */
  relatedUpdateId: string;
  /** Title of the regulatory change */
  updateTitle: string;
  /** Source document name */
  sourceName: string;
  /** Type of regulatory source */
  sourceType: 'law' | 'regulation' | 'guidance' | 'standard' | 'framework' | 'interpretation' | null;
  /** Issuing regulator or authority */
  regulator: string | null;
  /** Jurisdiction or region */
  jurisdiction: string | null;
  /** Type of change */
  changeType: 'new' | 'amendment' | 'repeal' | 'guidance' | 'standard_update' | 'interpretation_update';
  /** Date the source was published (ISO date) */
  publicationDate: string | null;
  /** Date the change becomes effective (ISO date) */
  effectiveDate: string | null;
  /** URL or citation to primary source */
  sourceReference: string | null;

  // ── Impact Assessment ────────────────────────────────────────
  /** Current status of this impact analysis */
  impactStatus: 'not_started' | 'in_progress' | 'needs_review' | 'complete';
  /** Overall severity of the regulatory change impact */
  impactSeverity: 'low' | 'medium' | 'high' | 'critical';

  // ── Affected Entities ────────────────────────────────────────
  /** Matrix row IDs of obligations affected */
  impactedObligationIds: string[];
  /** Crosswalk IDs affected */
  impactedCrosswalkIds: string[];
  /** Standards and framework mappings affected */
  impactedStandards: ImpactedStandard[];
  /** Controls affected */
  impactedControls: ImpactedControl[];
  /** Evidence expectations affected */
  impactedEvidence: ImpactedEvidence[];
  /** Business functions impacted */
  impactedBusinessFunctions: BusinessFunctionImpact[];
  /** Owner action items */
  impactedOwners: OwnerAction[];
  /** Risk changes */
  impactedRisks: ImpactedRisk[];

  // ── Actions & Next Steps ─────────────────────────────────────
  /** Required actions summary list */
  requiredActions: string[];
  /** Recommended next steps */
  recommendedNextSteps: string[];

  // ── Governance Review ────────────────────────────────────────
  /** Governance review details */
  governanceReview: GovernanceReview;

  // ── Metadata ─────────────────────────────────────────────────
  /** When this impact analysis was created (ISO datetime) */
  createdAt: string;
  /** Who reviewed this analysis */
  reviewedBy: string | null;
  /** When the review was completed (ISO datetime) */
  reviewedAt: string | null;
}
