/**
 * Executive Dashboard Metrics — Derived from existing data accessors.
 *
 * GOVERNANCE TIER: Read-only aggregation / summary layer.
 * - All metrics are computed from existing mock datasets.
 * - No data is created, modified, approved, or published.
 * - Health scores are directional indicators, not legal determinations.
 */

import {
  getRequirements,
  getRisks,
  getComplianceControls,
  getEvidenceRequirements,
  getOwnerActions,
  getImpactAnalyses,
  getSourceRecords,
  getDataQualityIssues,
  getDraftChanges,
  getVersionHistory,
  getAuditEvents,
} from '@/lib/data';
import type { ExposureLevel } from '@/components/badges/ExposureLevelBadge';
import type { ReadinessStatus } from '@/components/badges/ReadinessStatusBadge';

// ── Helper ──────────────────────────────────────────────────────

function pct(num: number, den: number): number {
  return den === 0 ? 100 : Math.round((num / den) * 100);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Shared label derivation for health scores — reuse across dashboard and reports. */
export function scoreLabel(score: number): string {
  return score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : score >= 40 ? 'Needs Attention' : 'Critical';
}

// ── Types ───────────────────────────────────────────────────────

export interface HealthScore {
  label: string;
  score: number;
  description: string;
}

export interface RiskIndicators {
  criticalRisks: number;
  highRiskObligations: number;
  deficientControls: number;
  controlsNeedingReview: number;
  missingEvidence: number;
  expiredEvidence: number;
  rejectedEvidence: number;
  overdueActions: number;
  pendingImpacts: number;
  legalReviewRequired: number;
  sourceValidationGaps: number;
  openDqIssues: number;
}

export interface FunctionExposure {
  name: string;
  exposureLevel: ExposureLevel;
  openActions: number;
  overdueActions: number;
  missingEvidence: number;
  expiredEvidence: number;
  deficientControls: number;
  highRiskObligations: number;
  regulatoryImpacts: number;
  dqIssues: number;
  recommendedFocus: string;
}

export interface ImpactSummaryItem {
  id: string;
  title: string;
  severity: string;
  status: string;
  effectiveDate: string | null;
  impactedFunctions: string[];
  obligationCount: number;
  controlCount: number;
  evidenceCount: number;
  legalReviewRequired: boolean;
  attention: string;
}

export interface ControlEvidenceSummary {
  totalControls: number;
  deficientControls: number;
  controlsNeedingReview: number;
  highRiskControls: number;
  totalEvidence: number;
  missingEvidence: number;
  expiredEvidence: number;
  rejectedEvidence: number;
  evidenceDueSoon: number;
}

export interface ActionSummary {
  totalOpen: number;
  critical: number;
  high: number;
  overdue: number;
  blocked: number;
  dueSoon: number;
  topBurden: { name: string; count: number }[];
}

export interface SourceDqSummary {
  pendingValidation: number;
  legalReviewNeeded: number;
  incompleteMetadata: number;
  lowConfidence: number;
  staleReviews: number;
  missingSourceRefs: number;
  missingControls: number;
  missingEvidence: number;
  versionGaps: number;
  auditGaps: number;
}

export interface ReadinessArea {
  area: string;
  status: ReadinessStatus;
  explanation: string;
  nextStep: string;
  href: string;
}

export interface RecommendedAction {
  title: string;
  whyItMatters: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  businessFunction: string;
  owner: string;
  relatedRisk: string;
  relatedPage: string;
  relatedHref: string;
  nextStep: string;
}

export interface ExecutiveMetrics {
  healthScores: HealthScore[];
  overallHealth: number;
  healthLevel: 'healthy' | 'moderate' | 'at_risk' | 'exposed';
  riskIndicators: RiskIndicators;
  functionExposures: FunctionExposure[];
  impactSummary: ImpactSummaryItem[];
  controlEvidence: ControlEvidenceSummary;
  actionSummary: ActionSummary;
  sourceDq: SourceDqSummary;
  readinessAreas: ReadinessArea[];
  recommendedActions: RecommendedAction[];
}

// ── Computation ─────────────────────────────────────────────────

export function computeExecutiveMetrics(): ExecutiveMetrics {
  const reqs = getRequirements();
  const risks = getRisks();
  const controls = getComplianceControls();
  const evidence = getEvidenceRequirements();
  const actions = getOwnerActions();
  const impacts = getImpactAnalyses();
  const sources = getSourceRecords();
  const dqIssues = getDataQualityIssues();
  const drafts = getDraftChanges();
  const versions = getVersionHistory();
  const auditEvents = getAuditEvents();

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // ── Risk Indicators ──────────────────────────────────────────

  const criticalRisks = risks.filter(r => r.severityPriority === 'Critical' || r.severityPriority === 'High').length;
  const highRiskObligations = reqs.filter(r => r.severityPriority === 'Critical' || r.severityPriority === 'High').length;
  const deficientControls = controls.filter(c => c.controlStatus === 'deficient').length;
  const controlsNeedingReview = controls.filter(c => c.controlStatus === 'needs_review').length;
  const missingEvidence = evidence.filter(e => e.evidenceStatus === 'missing' || e.evidenceStatus === 'not_started').length;
  const expiredEvidence = evidence.filter(e => e.evidenceStatus === 'expired').length;
  const rejectedEvidence = evidence.filter(e => e.evidenceStatus === 'rejected').length;
  const overdueActions = actions.filter(a => a.actionStatus === 'overdue').length;
  const pendingImpacts = impacts.filter(i => i.impactStatus !== 'complete').length;
  const legalReviewRequired = dqIssues.filter(i => i.legalReviewRequired && i.status !== 'resolved').length;
  const sourceValidationGaps = sources.filter(s => s.validationStatus !== 'validated').length;
  const openDqIssues = dqIssues.filter(i => i.status === 'open' || i.status === 'in_review').length;

  const riskIndicators: RiskIndicators = {
    criticalRisks, highRiskObligations, deficientControls, controlsNeedingReview,
    missingEvidence, expiredEvidence, rejectedEvidence, overdueActions,
    pendingImpacts, legalReviewRequired, sourceValidationGaps, openDqIssues,
  };

  // ── Health Scores ────────────────────────────────────────────

  const riskExposure = clamp(100 - (criticalRisks * 5 + highRiskObligations * 2), 0, 100);
  const evidenceReadiness = pct(
    evidence.filter(e => e.evidenceStatus === 'collected' || e.evidenceStatus === 'accepted').length,
    evidence.length,
  );
  const controlEffectiveness = pct(
    controls.filter(c => c.controlStatus === 'operating' || c.controlStatus === 'implemented').length,
    controls.length,
  );
  const regChangeReadiness = pct(
    impacts.filter(i => i.impactStatus === 'complete').length,
    impacts.length,
  );
  const sourceValidation = pct(
    sources.filter(s => s.validationStatus === 'validated').length,
    sources.length,
  );
  const dataQuality = clamp(100 - openDqIssues * 3, 0, 100);
  const govReadiness = clamp(
    100 - (deficientControls * 8 + overdueActions * 4 + pendingImpacts * 3),
    0,
    100,
  );
  const overallHealth = Math.round(
    (riskExposure + evidenceReadiness + controlEffectiveness + regChangeReadiness + sourceValidation + dataQuality + govReadiness) / 7,
  );

  const healthLevel: ExecutiveMetrics['healthLevel'] =
    overallHealth >= 80 ? 'healthy' :
    overallHealth >= 60 ? 'moderate' :
    overallHealth >= 40 ? 'at_risk' : 'exposed';

  const healthScores: HealthScore[] = [
    { label: 'Overall Health', score: overallHealth, description: 'Composite indicator across all dimensions' },
    { label: 'Risk Exposure', score: riskExposure, description: 'Inversely weighted by critical and high-risk items' },
    { label: 'Evidence Readiness', score: evidenceReadiness, description: 'Evidence items with collected or accepted status' },
    { label: 'Control Effectiveness', score: controlEffectiveness, description: 'Controls in operating or implemented status' },
    { label: 'Regulatory Change Readiness', score: regChangeReadiness, description: 'Impact analyses fully completed' },
    { label: 'Source Validation', score: sourceValidation, description: 'Source records with validated status' },
    { label: 'Data Quality', score: dataQuality, description: 'Based on open data quality issue count' },
    { label: 'Governance Readiness', score: govReadiness, description: 'Weighted by deficient controls, overdue actions, pending impacts' },
  ];

  // ── Business Function Exposure ───────────────────────────────

  const FUNCTIONS = [
    'Supply Chain', 'Procurement', 'Operations', 'Quality',
    'Legal', 'Compliance', 'Risk', 'Executive Leadership',
  ];

  const functionExposures: FunctionExposure[] = FUNCTIONS.map(fn => {
    const fnActions = actions.filter(a => a.businessFunction === fn);
    const fnControls = controls.filter(c => c.businessFunction === fn);
    const fnEvidence = evidence.filter(e => e.businessFunction === fn);
    const fnDq = dqIssues.filter(d => d.businessFunction === fn && d.status !== 'resolved');
    const fnImpacts = impacts.filter(i =>
      i.impactedBusinessFunctions.some(bf => bf.functionName === fn),
    );
    const fnReqs = reqs.filter(r =>
      r.businessFunctionImpacted?.includes(fn),
    );

    const openActs = fnActions.filter(a => a.actionStatus !== 'completed').length;
    const overdueActs = fnActions.filter(a => a.actionStatus === 'overdue').length;
    const missEvd = fnEvidence.filter(e => e.evidenceStatus === 'missing' || e.evidenceStatus === 'not_started').length;
    const expEvd = fnEvidence.filter(e => e.evidenceStatus === 'expired').length;
    const defCtrl = fnControls.filter(c => c.controlStatus === 'deficient').length;
    const highReqs = fnReqs.filter(r => r.severityPriority === 'Critical' || r.severityPriority === 'High').length;
    const regImpacts = fnImpacts.length;
    const dqCount = fnDq.length;

    // Compute exposure score
    const exposureScore = defCtrl * 10 + overdueActs * 5 + missEvd * 4 + expEvd * 3 + highReqs * 2 + dqCount;
    const exposureLevel: ExposureLevel =
      exposureScore >= 20 ? 'critical' :
      exposureScore >= 10 ? 'high' :
      exposureScore >= 3 ? 'medium' : 'low';

    // Dynamic recommended focus
    let recommendedFocus = 'No immediate action required.';
    if (defCtrl > 0) recommendedFocus = `Address ${defCtrl} deficient control${defCtrl > 1 ? 's' : ''} linked to this function.`;
    else if (overdueActs > 0) recommendedFocus = `Resolve ${overdueActs} overdue action${overdueActs > 1 ? 's' : ''}.`;
    else if (missEvd > 0) recommendedFocus = `Collect ${missEvd} missing evidence item${missEvd > 1 ? 's' : ''}.`;
    else if (dqCount > 0) recommendedFocus = `Review ${dqCount} data quality issue${dqCount > 1 ? 's' : ''}.`;

    return {
      name: fn,
      exposureLevel,
      openActions: openActs,
      overdueActions: overdueActs,
      missingEvidence: missEvd,
      expiredEvidence: expEvd,
      deficientControls: defCtrl,
      highRiskObligations: highReqs,
      regulatoryImpacts: regImpacts,
      dqIssues: dqCount,
      recommendedFocus,
    };
  });

  // ── Impact Summary ───────────────────────────────────────────

  const impactSummary: ImpactSummaryItem[] = impacts.map(i => ({
    id: i.id,
    title: i.updateTitle,
    severity: i.impactSeverity,
    status: i.impactStatus.replace(/_/g, ' '),
    effectiveDate: i.effectiveDate,
    impactedFunctions: i.impactedBusinessFunctions.map(bf => bf.functionName),
    obligationCount: i.impactedObligationIds.length,
    controlCount: i.impactedControls.length,
    evidenceCount: i.impactedEvidence.length,
    legalReviewRequired: i.governanceReview.legalReviewRequired,
    attention: i.impactSeverity === 'critical' || i.impactSeverity === 'high'
      ? 'Requires immediate executive attention'
      : 'Monitor — review before effective date',
  }));

  // ── Controls & Evidence Summary ──────────────────────────────

  const evidenceDueSoon = evidence.filter(e => {
    if (!e.nextDueDate) return false;
    const due = new Date(e.nextDueDate);
    return due <= in30Days && due >= now && e.evidenceStatus !== 'accepted' && e.evidenceStatus !== 'collected';
  }).length;

  const controlEvidence: ControlEvidenceSummary = {
    totalControls: controls.length,
    deficientControls,
    controlsNeedingReview,
    highRiskControls: controls.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length,
    totalEvidence: evidence.length,
    missingEvidence,
    expiredEvidence,
    rejectedEvidence,
    evidenceDueSoon,
  };

  // ── Owner Action Summary ─────────────────────────────────────

  const openActions = actions.filter(a => a.actionStatus !== 'completed');
  const blockedActions = actions.filter(a => a.actionStatus === 'blocked').length;
  const dueSoonActions = actions.filter(a => {
    if (!a.dueDate || a.actionStatus === 'completed') return false;
    const due = new Date(a.dueDate);
    return due <= in30Days && due >= now;
  }).length;

  // Top burden owners
  const ownerCounts = new Map<string, number>();
  for (const a of openActions) {
    ownerCounts.set(a.owner, (ownerCounts.get(a.owner) ?? 0) + 1);
  }
  const topBurden = Array.from(ownerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const actionSummary: ActionSummary = {
    totalOpen: openActions.length,
    critical: actions.filter(a => a.priority === 'critical' && a.actionStatus !== 'completed').length,
    high: actions.filter(a => a.priority === 'high' && a.actionStatus !== 'completed').length,
    overdue: overdueActions,
    blocked: blockedActions,
    dueSoon: dueSoonActions,
    topBurden,
  };

  // ── Source & Data Quality Summary ─────────────────────────────

  const sourceDq: SourceDqSummary = {
    pendingValidation: sources.filter(s => s.validationStatus === 'not_started' || s.validationStatus === 'incomplete_metadata' || s.validationStatus === 'citation_review_needed' || s.validationStatus === 'legal_review_needed').length,
    legalReviewNeeded: dqIssues.filter(i => i.issueType === 'legal_review_needed' && i.status !== 'resolved').length,
    incompleteMetadata: dqIssues.filter(i => i.issueType === 'missing_metadata' && i.status !== 'resolved').length,
    lowConfidence: dqIssues.filter(i => i.issueType === 'low_confidence' && i.status !== 'resolved').length,
    staleReviews: dqIssues.filter(i => i.issueType === 'stale_review' && i.status !== 'resolved').length,
    missingSourceRefs: dqIssues.filter(i => i.issueType === 'missing_source_reference' && i.status !== 'resolved').length,
    missingControls: dqIssues.filter(i => i.issueType === 'missing_control' && i.status !== 'resolved').length,
    missingEvidence: dqIssues.filter(i => i.issueType === 'missing_evidence' && i.status !== 'resolved').length,
    versionGaps: dqIssues.filter(i => i.issueType === 'version_gap' && i.status !== 'resolved').length,
    auditGaps: dqIssues.filter(i => i.issueType === 'audit_gap' && i.status !== 'resolved').length,
  };

  // ── Governance Readiness ─────────────────────────────────────

  function readiness(good: number, total: number, thresholds = [80, 60, 40]): ReadinessStatus {
    const p = pct(good, total);
    return p >= thresholds[0] ? 'strong' : p >= thresholds[1] ? 'moderate' : p >= thresholds[2] ? 'needs_attention' : 'not_ready';
  }

  const readinessAreas: ReadinessArea[] = [
    {
      area: 'Controlled Reference Data',
      status: readiness(reqs.filter(r => r.confidenceLevel === 'High').length, reqs.length),
      explanation: `${reqs.length} obligations mapped. ${reqs.filter(r => r.confidenceLevel === 'High').length} have high confidence.`,
      nextStep: 'Review low-confidence obligations for SME validation.',
      href: '/obligations',
    },
    {
      area: 'Draft Update Workflow',
      status: drafts.length > 0 ? (drafts.filter(d => d.draftStatus === 'approved').length > 0 ? 'strong' : 'moderate') : 'needs_attention',
      explanation: `${drafts.length} draft changes. ${drafts.filter(d => d.draftStatus === 'approved').length} approved.`,
      nextStep: 'Clear stalled drafts and advance pending reviews.',
      href: '/draft-mapping',
    },
    {
      area: 'Review & Approval',
      status: impacts.filter(i => i.impactStatus === 'complete').length === impacts.length ? 'strong' : pendingImpacts > 2 ? 'needs_attention' : 'moderate',
      explanation: `${impacts.filter(i => i.impactStatus === 'complete').length}/${impacts.length} impact analyses completed.`,
      nextStep: 'Complete pending impact analysis reviews.',
      href: '/review-approval',
    },
    {
      area: 'Version History',
      status: versions.length >= 3 ? 'strong' : versions.length >= 1 ? 'moderate' : 'not_ready',
      explanation: `${versions.length} version history entries recorded.`,
      nextStep: versions.length === 0 ? 'Create initial version history entries.' : 'Continue tracking obligation lifecycle changes.',
      href: '/version-history',
    },
    {
      area: 'Audit Log',
      status: auditEvents.length >= 10 ? 'strong' : auditEvents.length >= 3 ? 'moderate' : 'needs_attention',
      explanation: `${auditEvents.length} audit events captured.`,
      nextStep: 'Ensure all governance actions generate audit trail entries.',
      href: '/audit-log',
    },
    {
      area: 'Source Registry',
      status: readiness(sources.filter(s => s.validationStatus === 'validated').length, sources.length),
      explanation: `${sources.filter(s => s.validationStatus === 'validated').length}/${sources.length} sources validated.`,
      nextStep: 'Validate pending source records and complete metadata.',
      href: '/source-registry',
    },
    {
      area: 'Reporting',
      status: 'strong',
      explanation: '11 report types available with CSV, JSON, and print export.',
      nextStep: 'Use reports for audit preparation and stakeholder communication.',
      href: '/reports',
    },
    {
      area: 'Data Quality',
      status: openDqIssues > 10 ? 'needs_attention' : openDqIssues > 5 ? 'moderate' : openDqIssues > 0 ? 'moderate' : 'strong',
      explanation: `${openDqIssues} open data quality issues. ${dqIssues.filter(i => i.severity === 'critical').length} critical.`,
      nextStep: 'Address critical and high-severity data quality findings.',
      href: '/data-quality',
    },
  ];

  // ── Executive Recommended Actions ────────────────────────────

  const recommendedActions: RecommendedAction[] = [];

  // Dynamic — only add if relevant
  const criticalImpacts = impacts.filter(i => i.impactSeverity === 'critical' || i.impactSeverity === 'high');
  if (criticalImpacts.length > 0) {
    recommendedActions.push({
      title: `Review ${criticalImpacts.length} high-severity regulatory impact${criticalImpacts.length > 1 ? 's' : ''} before effective date`,
      whyItMatters: 'Unresolved regulatory changes create compliance exposure and potential enforcement risk.',
      priority: 'critical',
      businessFunction: 'Compliance',
      owner: 'Compliance Director',
      relatedRisk: 'Regulatory non-compliance, enforcement action',
      relatedPage: 'Impact Analysis',
      relatedHref: '/impact-analysis',
      nextStep: 'Complete impact analysis review and route through governance approval.',
    });
  }

  if (missingEvidence > 0) {
    recommendedActions.push({
      title: `Resolve ${missingEvidence} missing evidence item${missingEvidence > 1 ? 's' : ''} for high-risk obligations`,
      whyItMatters: 'Missing evidence means compliance controls cannot demonstrate effectiveness in an audit.',
      priority: 'high',
      businessFunction: 'Multiple',
      owner: 'Evidence Owners',
      relatedRisk: 'Audit finding, inability to demonstrate compliance',
      relatedPage: 'Controls & Evidence',
      relatedHref: '/controls-evidence',
      nextStep: 'Assign collection tasks to evidence owners via Action Center.',
    });
  }

  if (deficientControls > 0) {
    recommendedActions.push({
      title: `Remediate ${deficientControls} deficient control${deficientControls > 1 ? 's' : ''} linked to critical obligations`,
      whyItMatters: 'Deficient controls represent active compliance gaps that could be flagged in any inspection.',
      priority: 'critical',
      businessFunction: 'Quality',
      owner: 'Control Owners',
      relatedRisk: 'Inspection finding, operational non-compliance',
      relatedPage: 'Controls & Evidence',
      relatedHref: '/controls-evidence',
      nextStep: 'Initiate remediation plan and assign to control owners.',
    });
  }

  if (sourceValidationGaps > 0) {
    recommendedActions.push({
      title: `Validate ${sourceValidationGaps} source record${sourceValidationGaps > 1 ? 's' : ''} with incomplete validation`,
      whyItMatters: 'Unvalidated sources weaken the traceability chain from law to obligation to control.',
      priority: 'medium',
      businessFunction: 'Compliance',
      owner: 'Compliance Director',
      relatedRisk: 'Source traceability gap, audit trail weakness',
      relatedPage: 'Source Registry',
      relatedHref: '/source-registry',
      nextStep: 'Complete source validation and metadata fields.',
    });
  }

  if (overdueActions > 0) {
    recommendedActions.push({
      title: `Clear ${overdueActions} overdue owner action${overdueActions > 1 ? 's' : ''}`,
      whyItMatters: 'Overdue actions indicate operational bottlenecks and increase compliance exposure.',
      priority: 'high',
      businessFunction: 'Multiple',
      owner: 'Business Owners',
      relatedRisk: 'Accumulating compliance debt, control gaps',
      relatedPage: 'Action Center',
      relatedHref: '/action-center',
      nextStep: 'Escalate overdue items and reassign if blocked.',
    });
  }

  if (legalReviewRequired > 0) {
    recommendedActions.push({
      title: `Address ${legalReviewRequired} item${legalReviewRequired > 1 ? 's' : ''} requiring legal review`,
      whyItMatters: 'Unreviewed legal items may contain interpretation errors affecting compliance posture.',
      priority: 'high',
      businessFunction: 'Legal',
      owner: 'General Counsel',
      relatedRisk: 'Misinterpreted obligations, incorrect control design',
      relatedPage: 'Data Quality',
      relatedHref: '/data-quality',
      nextStep: 'Schedule legal review sessions for flagged items.',
    });
  }

  const stalledDrafts = drafts.filter(d => d.draftStatus === 'ready_for_review' || d.draftStatus === 'draft');
  if (stalledDrafts.length > 0) {
    recommendedActions.push({
      title: `Advance ${stalledDrafts.length} stalled draft regulatory update${stalledDrafts.length > 1 ? 's' : ''}`,
      whyItMatters: 'Stalled drafts delay incorporation of regulatory changes into the compliance operating model.',
      priority: 'medium',
      businessFunction: 'Compliance',
      owner: 'Compliance Director',
      relatedRisk: 'Regulatory change not reflected in active controls',
      relatedPage: 'Draft Workspace',
      relatedHref: '/draft-mapping',
      nextStep: 'Assign reviewers and set deadlines for pending drafts.',
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendedActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    healthScores,
    overallHealth,
    healthLevel,
    riskIndicators,
    functionExposures,
    impactSummary,
    controlEvidence,
    actionSummary,
    sourceDq,
    readinessAreas,
    recommendedActions,
  };
}
