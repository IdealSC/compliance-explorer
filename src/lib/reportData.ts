/**
 * Report data generators — build row arrays for each report type.
 *
 * All generators are READ-ONLY. They consume data from existing
 * accessors and produce flat row objects for export/display.
 * No mutations.
 */

import {
  getRequirements,
  getRisks,
  getComplianceControls,
  getEvidenceRequirements,
  getOwnerActions,
  getImpactAnalyses,
  getVersionHistory,
  getAuditEvents,
  getSourceRecords,
  getDataQualityIssues,
  getSourceIntakeRequests,
} from '@/lib/data';
import { computeExecutiveMetrics, scoreLabel } from '@/lib/executiveMetrics';
import { splitMultiValue } from '@/lib/filters';

type Row = Record<string, unknown>;

// ── Helpers ──────────────────────────────────────────────────────

function arrJoin(arr: string[]): string {
  return arr.length > 0 ? arr.join(', ') : '—';
}

function nextStepText(status: string): string {
  switch (status) {
    case 'not_started': return 'Assign to owner and set start date';
    case 'in_progress': return 'Continue execution, verify evidence on track';
    case 'blocked': return 'Resolve blocking dependency, escalate if needed';
    case 'overdue': return 'Escalate immediately, assess delay impact';
    case 'completed': return 'Verify completion evidence and close out';
    default: return 'Review and determine next step';
  }
}

// ── A. Owner Actions ─────────────────────────────────────────────

export function buildOwnerActionRows(fnFilter?: string): Row[] {
  let actions = getOwnerActions();
  if (fnFilter && fnFilter !== 'All') {
    actions = actions.filter(a => a.businessFunction === fnFilter);
  }
  return actions.map(a => ({
    ...a,
    relatedControlIds: arrJoin(a.relatedControlIds),
    relatedEvidenceIds: arrJoin(a.relatedEvidenceIds),
    relatedObligationIds: arrJoin(a.relatedObligationIds),
    relatedImpactAnalysisIds: arrJoin(a.relatedImpactAnalysisIds),
    recommendedNextStep: nextStepText(a.actionStatus),
  }));
}

// ── B. Evidence Gaps ─────────────────────────────────────────────

export function buildEvidenceGapRows(fnFilter?: string): Row[] {
  let evidence = getEvidenceRequirements();
  // Only include items that need attention
  const gapStatuses = ['missing', 'expired', 'rejected', 'under_review', 'requested'];
  evidence = evidence.filter(e => {
    const isGap = gapStatuses.includes(e.evidenceStatus);
    const isDueSoon = e.nextDueDate && (new Date(e.nextDueDate).getTime() - Date.now()) / 864e5 <= 30 && (new Date(e.nextDueDate).getTime() - Date.now()) >= 0;
    return isGap || isDueSoon;
  });
  if (fnFilter && fnFilter !== 'All') {
    evidence = evidence.filter(e => e.businessFunction === fnFilter);
  }
  return evidence.map(e => ({
    ...e,
    relatedControlIds: arrJoin(e.relatedControlIds),
    relatedObligationIds: arrJoin(e.relatedObligationIds),
    riskIfMissing: e.evidenceStatus === 'missing' || e.evidenceStatus === 'expired' || e.evidenceStatus === 'rejected'
      ? 'Inability to demonstrate compliance with linked obligations and controls'
      : '—',
  }));
}

// ── C. Deficient Controls ────────────────────────────────────────

export function buildDeficientControlRows(fnFilter?: string): Row[] {
  let controls = getComplianceControls();
  // Include deficient, needs_review, not_started, or high/critical risk
  controls = controls.filter(c =>
    c.controlStatus === 'deficient' ||
    c.controlStatus === 'needs_review' ||
    c.controlStatus === 'not_started' ||
    c.riskLevel === 'critical' ||
    c.riskLevel === 'high'
  );
  if (fnFilter && fnFilter !== 'All') {
    controls = controls.filter(c => c.businessFunction === fnFilter);
  }
  return controls.map(c => ({
    ...c,
    relatedObligationIds: arrJoin(c.relatedObligationIds),
    relatedEvidenceIds: arrJoin(c.relatedEvidenceIds),
  }));
}

// ── D. Regulatory Impact Summary ─────────────────────────────────

export function buildRegulatoryImpactRows(fnFilter?: string): Row[] {
  let impacts = getImpactAnalyses();
  if (fnFilter && fnFilter !== 'All') {
    impacts = impacts.filter(i =>
      i.impactedBusinessFunctions.some(f => f.functionName.toLowerCase() === fnFilter.toLowerCase())
    );
  }
  return impacts.map(i => ({
    id: i.id,
    updateTitle: i.updateTitle,
    sourceName: i.sourceName,
    regulator: i.regulator ?? '—',
    jurisdiction: i.jurisdiction ?? '—',
    changeType: i.changeType,
    effectiveDate: i.effectiveDate ?? '—',
    impactSeverity: i.impactSeverity,
    impactStatus: i.impactStatus,
    impactedObligationCount: i.impactedObligationIds.length,
    impactedControlCount: i.impactedControls.length,
    impactedEvidenceCount: i.impactedEvidence.length,
    impactedFunctionCount: i.impactedBusinessFunctions.length,
    requiredActionCount: i.requiredActions.length,
    legalReviewRequired: i.governanceReview.legalReviewRequired ? 'Yes' : 'No',
    confidenceLevel: i.governanceReview.confidenceLevel ?? '—',
    sourceReference: i.sourceReference ?? '—',
  }));
}

// ── E. Obligation Matrix ─────────────────────────────────────────

export function buildObligationMatrixRows(fnFilter?: string): Row[] {
  let reqs = getRequirements();
  if (fnFilter && fnFilter !== 'All') {
    reqs = reqs.filter(r => {
      if (!r.businessFunctionImpacted) return false;
      return splitMultiValue(r.businessFunctionImpacted).some(
        fn => fn.toLowerCase() === fnFilter.toLowerCase()
      );
    });
  }
  return reqs.map(r => ({
    ...r,
  }));
}

// ── F. Supply Chain Snapshot ─────────────────────────────────────

export function buildSupplyChainSnapshotRows(): Row[] {
  const rows: Row[] = [];
  const SC = 'Supply Chain';

  // 1. High-risk obligations
  const reqs = getRequirements().filter(r => {
    if (!r.businessFunctionImpacted) return false;
    return splitMultiValue(r.businessFunctionImpacted).some(fn => fn === SC) &&
      (r.severityPriority === 'Critical' || r.severityPriority === 'High');
  });
  for (const r of reqs) {
    rows.push({
      section: 'High-Risk Obligations',
      id: r.matrixRowId,
      title: r.plainEnglishInterpretation?.slice(0, 120) ?? '—',
      status: r.recordStatus ?? '—',
      priority: r.severityPriority ?? '—',
      dueDate: r.effectiveDate ?? '—',
      owner: r.exampleBusinessOwner ?? '—',
      detail: r.requiredAction ?? '—',
    });
  }

  // 2. Active regulatory impacts
  const impacts = getImpactAnalyses().filter(i =>
    i.impactedBusinessFunctions.some(f => f.functionName === SC) &&
    i.impactStatus !== 'complete'
  );
  for (const i of impacts) {
    rows.push({
      section: 'Active Regulatory Impacts',
      id: i.id,
      title: i.updateTitle,
      status: i.impactStatus,
      priority: i.impactSeverity,
      dueDate: i.effectiveDate ?? '—',
      owner: '—',
      detail: i.requiredActions.join('; ') || '—',
    });
  }

  // 3. Deficient controls
  const controls = getComplianceControls().filter(c =>
    c.businessFunction === SC &&
    (c.controlStatus === 'deficient' || c.controlStatus === 'needs_review')
  );
  for (const c of controls) {
    rows.push({
      section: 'Control Issues',
      id: c.id,
      title: c.controlName,
      status: c.controlStatus,
      priority: c.riskLevel,
      dueDate: c.nextReviewDate ?? '—',
      owner: c.controlOwner,
      detail: c.controlDescription?.slice(0, 120) ?? '—',
    });
  }

  // 4. Evidence gaps
  const evidence = getEvidenceRequirements().filter(e =>
    e.businessFunction === SC &&
    (e.evidenceStatus === 'missing' || e.evidenceStatus === 'expired' || e.evidenceStatus === 'rejected')
  );
  for (const e of evidence) {
    rows.push({
      section: 'Evidence Gaps',
      id: e.id,
      title: e.evidenceName,
      status: e.evidenceStatus,
      priority: '—',
      dueDate: e.nextDueDate ?? '—',
      owner: e.evidenceOwner,
      detail: e.evidenceDescription?.slice(0, 120) ?? '—',
    });
  }

  // 5. Owner actions
  const actions = getOwnerActions().filter(a =>
    a.businessFunction === SC && a.actionStatus !== 'completed'
  );
  for (const a of actions) {
    rows.push({
      section: 'Owner Actions',
      id: a.id,
      title: a.actionTitle,
      status: a.actionStatus,
      priority: a.priority,
      dueDate: a.dueDate ?? '—',
      owner: a.owner,
      detail: a.riskIfNotCompleted?.slice(0, 120) ?? '—',
    });
  }

  // 6. Top risks
  const risks = getRisks().filter(r =>
    r.primaryFunction?.includes(SC) &&
    (r.severityPriority === 'Critical' || r.severityPriority === 'High')
  );
  for (const r of risks.slice(0, 10)) {
    rows.push({
      section: 'Top Risks',
      id: r.riskId,
      title: r.obligation?.slice(0, 120) ?? '—',
      status: r.mitigationStatus ?? '—',
      priority: r.severityPriority ?? '—',
      dueDate: '—',
      owner: r.owner ?? '—',
      detail: r.whyHighRisk?.slice(0, 120) ?? '—',
    });
  }

  // 7. Recommended next steps — top 5 most urgent items
  const urgentActions = getOwnerActions()
    .filter(a => a.businessFunction === SC && a.actionStatus !== 'completed')
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    })
    .slice(0, 5);
  for (const a of urgentActions) {
    rows.push({
      section: 'Recommended Next Steps',
      id: a.id,
      title: a.actionTitle,
      status: a.actionStatus,
      priority: a.priority,
      dueDate: a.dueDate ?? '—',
      owner: a.owner,
      detail: nextStepText(a.actionStatus),
    });
  }

  return rows;
}

// ── G. Executive Risk Summary ────────────────────────────────────

export function buildExecutiveRiskRows(): Row[] {
  const reqs = getRequirements();
  const impacts = getImpactAnalyses();
  const controls = getComplianceControls();
  const evidence = getEvidenceRequirements();
  const actions = getOwnerActions();

  const highRiskObligations = reqs.filter(r => r.severityPriority === 'Critical' || r.severityPriority === 'High').length;
  const criticalImpacts = impacts.filter(i => i.impactSeverity === 'critical' || i.impactSeverity === 'high').length;
  const deficientControls = controls.filter(c => c.controlStatus === 'deficient').length;
  const missingEvidence = evidence.filter(e => e.evidenceStatus === 'missing' || e.evidenceStatus === 'expired').length;
  const overdueActions = actions.filter(a => a.actionStatus === 'overdue').length;

  // Top risk functions — count actions by function
  const fnCounts: Record<string, number> = {};
  for (const a of actions.filter(x => x.actionStatus !== 'completed')) {
    fnCounts[a.businessFunction] = (fnCounts[a.businessFunction] ?? 0) + 1;
  }
  const topFunctions = Object.entries(fnCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Top recommended actions
  const topActions = actions
    .filter(a => a.actionStatus !== 'completed' && (a.priority === 'critical' || a.priority === 'high'))
    .slice(0, 5);

  const rows: Row[] = [
    { metric: 'High-Risk Obligations', value: highRiskObligations, detail: 'Obligations rated Critical or High severity' },
    { metric: 'Critical Regulatory Impacts', value: criticalImpacts, detail: 'Impact analyses rated Critical or High severity' },
    { metric: 'Deficient Controls', value: deficientControls, detail: 'Controls currently in deficient status' },
    { metric: 'Missing or Expired Evidence', value: missingEvidence, detail: 'Evidence items in missing or expired status' },
    { metric: 'Overdue Owner Actions', value: overdueActions, detail: 'Actions past their due date' },
    { metric: 'Highest-Risk Functions', value: topFunctions.length, detail: topFunctions.map(([fn, cnt]) => `${fn} (${cnt} actions)`).join(', ') || 'None' },
  ];

  for (const a of topActions) {
    rows.push({
      metric: `Top Action: ${a.actionTitle.slice(0, 60)}`,
      value: '',
      detail: `${a.priority} | ${a.businessFunction} | Due: ${a.dueDate ?? 'TBD'} | ${a.riskIfNotCompleted.slice(0, 80)}`,
    });
  }

  rows.push({
    metric: 'Governance Caveat',
    value: '',
    detail: 'This summary is generated from sample/demonstration data. Not validated for regulatory decisions.',
  });

  return rows;
}

// ── H. Audit-Ready Reference Snapshot ────────────────────────────

export function buildAuditReferenceRows(): Row[] {
  const reqs = getRequirements();
  const versions = getVersionHistory();
  const auditEvents = getAuditEvents();

  return reqs.map(r => ({
    matrixRowId: r.matrixRowId,
    lawRegulationFrameworkStandardName: r.lawRegulationFrameworkStandardName ?? '—',
    versionNumber: r.versionNumber ?? '—',
    recordStatus: r.recordStatus ?? '—',
    effectiveDate: r.effectiveDate ?? '—',
    sourceNoteSourceReference: r.sourceNoteSourceReference ?? '—',
    confidenceLevel: r.confidenceLevel ?? '—',
    validationDate: r.validationDate ?? '—',
    relatedVersionHistory: versions.filter(v => v.stableReferenceId === r.matrixRowId).length > 0
      ? versions.filter(v => v.stableReferenceId === r.matrixRowId).map(v => v.versionId).join(', ')
      : '—',
    relatedAuditEvents: auditEvents.filter(e => e.entityId === r.matrixRowId).length > 0
      ? auditEvents.filter(e => e.entityId === r.matrixRowId).map(e => e.auditId).join(', ')
      : '—',
    reviewStatus: r.reviewStatus ?? '—',
    // Phase 2.6: Publication traceability — not available in JSON mode
    publishedAt: '—',
    publishedBy: '—',
    publicationEventId: '—',
  }));
}
// ── I. Source Registry Validation Report ─────────────────────────

export function buildSourceRegistryRows(): Row[] {
  const sources = getSourceRecords();
  return sources.map(s => ({
    id: s.id,
    sourceTitle: s.sourceTitle,
    sourceType: s.sourceType.replace(/_/g, ' '),
    regulator: s.regulator ?? '—',
    jurisdiction: s.jurisdiction ?? '—',
    sourceStatus: s.sourceStatus.replace(/_/g, ' '),
    validationStatus: s.validationStatus.replace(/_/g, ' '),
    missingMetadata: s.missingMetadata.length > 0 ? s.missingMetadata.join(', ') : '—',
    legalReviewRequired: s.legalReviewRequired ? 'Yes' : 'No',
    relatedObligationIds: arrJoin(s.relatedObligationIds),
    relatedDraftChangeIds: arrJoin(s.relatedDraftChangeIds),
    confidenceLevel: s.confidenceLevel ?? '—',
    reviewedAt: s.reviewedAt ?? '—',
    sourceReference: s.sourceReference ?? '—',
  }));
}

// ── J. Data Quality & Validation ─────────────────────────────────

export function buildDataQualityRows(fnFilter?: string): Row[] {
  let issues = getDataQualityIssues();
  if (fnFilter) issues = issues.filter(i => i.businessFunction === fnFilter);
  return issues.map(i => ({
    id: i.id,
    issueTitle: i.issueTitle,
    issueType: i.issueType.replace(/_/g, ' '),
    category: i.category.replace(/_/g, ' '),
    severity: i.severity,
    status: i.status.replace(/_/g, ' '),
    affectedEntityType: i.affectedEntityType.replace(/_/g, ' '),
    affectedEntityId: i.affectedEntityId,
    businessFunction: i.businessFunction,
    owner: i.owner,
    confidenceLevel: i.confidenceLevel ?? '—',
    legalReviewRequired: i.legalReviewRequired ? 'Yes' : 'No',
    recommendedAction: i.recommendedAction,
    riskIfUnresolved: i.riskIfUnresolved,
    dueDate: i.dueDate ?? '—',
    detectedAt: i.detectedAt,
    sourceReference: i.sourceReference ?? '—',
  }));
}

// ── K. Executive Compliance Health Summary ───────────────────────

export function buildExecutiveHealthRows(): Row[] {
  const m = computeExecutiveMetrics();
  const rows: Row[] = [];

  // Disclaimer row — ensures exported CSV/JSON carries governance context
  rows.push({ section: 'DISCLAIMER', metric: 'This report is based on sample/demo data only. It is not a legal compliance determination, certification, or audit opinion.', value: '—', status: '—', businessFunction: '—', priority: '—', description: 'Health scores are directional indicators derived from operational sample data.', nextStep: '—' });

  // Health scores
  for (const s of m.healthScores) {
    rows.push({ section: 'Health Score', metric: s.label, value: `${s.score}%`, status: scoreLabel(s.score), businessFunction: '—', priority: '—', description: s.description, nextStep: '—' });
  }

  // Risk indicators
  const ri = m.riskIndicators;
  const riItems: [string, number][] = [
    ['Critical / High Risks', ri.criticalRisks], ['High-Risk Obligations', ri.highRiskObligations],
    ['Deficient Controls', ri.deficientControls], ['Controls Needing Review', ri.controlsNeedingReview],
    ['Missing Evidence', ri.missingEvidence], ['Expired Evidence', ri.expiredEvidence],
    ['Rejected Evidence', ri.rejectedEvidence], ['Overdue Actions', ri.overdueActions],
    ['Pending Impacts', ri.pendingImpacts], ['Legal Review Required', ri.legalReviewRequired],
    ['Source Validation Gaps', ri.sourceValidationGaps], ['Open DQ Issues', ri.openDqIssues],
  ];
  for (const [label, val] of riItems) {
    rows.push({ section: 'Risk Indicator', metric: label, value: String(val), status: val > 0 ? 'Action Needed' : 'Clear', businessFunction: '—', priority: val > 3 ? 'High' : val > 0 ? 'Medium' : 'Low', description: '', nextStep: '—' });
  }

  // Function exposure
  for (const fn of m.functionExposures) {
    rows.push({ section: 'Function Exposure', metric: fn.name, value: fn.exposureLevel, status: fn.exposureLevel, businessFunction: fn.name, priority: fn.exposureLevel === 'critical' ? 'Critical' : fn.exposureLevel === 'high' ? 'High' : 'Medium', description: fn.recommendedFocus, nextStep: fn.recommendedFocus });
  }

  // Readiness
  for (const ra of m.readinessAreas) {
    rows.push({ section: 'Governance Readiness', metric: ra.area, value: ra.status.replace(/_/g, ' '), status: ra.status.replace(/_/g, ' '), businessFunction: '—', priority: '—', description: ra.explanation, nextStep: ra.nextStep });
  }

  // Recommended actions
  for (const a of m.recommendedActions) {
    rows.push({ section: 'Recommended Action', metric: a.title, value: '—', status: '—', businessFunction: a.businessFunction, priority: a.priority, description: a.whyItMatters, nextStep: a.nextStep });
  }

  return rows;
}

// ── L. Source Validation & Publishing Readiness ──────────────────

export function buildSourceValidationReadinessRows(): Row[] {
  const sources = getSourceRecords();
  return sources.map(s => {
    const complete = s.validationChecklist.filter(c => c.status === 'complete').length;
    const incomplete = s.validationChecklist.filter(c => c.status !== 'complete' && c.status !== 'not_applicable').length;
    let recommendedAction = '—';
    if (s.validationStatus === 'not_started') recommendedAction = 'Begin validation checklist';
    else if (s.validationStatus === 'incomplete_metadata') recommendedAction = 'Complete missing metadata fields';
    else if (s.validationStatus === 'source_verified') recommendedAction = 'Proceed to citation review';
    else if (s.validationStatus === 'citation_review_needed') recommendedAction = 'Complete citation review';
    else if (s.validationStatus === 'legal_review_needed') recommendedAction = 'Assign legal reviewer';
    else if (s.validationStatus === 'rejected') recommendedAction = 'Address rejection issues and re-submit';
    else if (s.validationStatus === 'validated') recommendedAction = 'Ready for publishing consideration';
    return {
      id: s.id,
      sourceTitle: s.sourceTitle,
      sourceType: s.sourceType.replace(/_/g, ' '),
      regulator: s.regulator ?? '—',
      jurisdiction: s.jurisdiction ?? '—',
      sourceStatus: s.sourceStatus.replace(/_/g, ' '),
      validationStatus: s.validationStatus.replace(/_/g, ' '),
      checklistComplete: String(complete),
      checklistIncomplete: String(incomplete),
      legalReviewRequired: s.legalReviewRequired ? 'Yes' : 'No',
      confidenceLevel: s.confidenceLevel ?? '—',
      // C5 FIX: 4 missing columns added for full spec coverage
      missingMetadata: s.missingMetadata.length > 0 ? s.missingMetadata.join(', ') : '—',
      relatedDraftChanges: s.relatedDraftChangeIds.length > 0 ? s.relatedDraftChangeIds.join(', ') : '—',
      relatedRegulatoryUpdates: s.relatedRegulatoryUpdateIds.length > 0 ? s.relatedRegulatoryUpdateIds.join(', ') : '—',
      sourceReference: s.sourceReference ?? '—',
      recommendedAction,
    };
  });
}

// ── Source Intake Workflow ────────────────────────────────────────

function buildSourceIntakeWorkflowRows(): Row[] {
  const intakes = getSourceIntakeRequests();
  return intakes.map(r => {
    const items = r.checklistItems ?? [];
    const complete = items.filter((i: { status: string }) => i.status === 'complete').length;
    const total = items.length;
    return {
      id: r.stableReferenceId ?? r.id,
      intakeTitle: r.intakeTitle,
      intakeType: r.intakeType.replace(/_/g, ' '),
      intakeStatus: r.intakeStatus.replace(/_/g, ' '),
      priority: r.priority,
      sourceType: r.sourceType ? r.sourceType.replace(/_/g, ' ') : '—',
      regulator: r.regulator ?? '—',
      jurisdiction: r.jurisdiction ?? '—',
      assignedToName: r.assignedToName ?? '—',
      submittedByName: r.submittedByName ?? '—',
      legalReviewRequired: r.legalReviewRequired ? 'Yes' : 'No',
      checklistComplete: String(complete),
      checklistTotal: String(total),
      relatedSourceRecordId: r.relatedSourceRecordId ?? '—',
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—',
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—',
    };
  });
}

// ── Dispatcher ───────────────────────────────────────────────────

export function buildReportRows(reportId: string, fnFilter?: string): Row[] {
  switch (reportId) {
    case 'owner-actions': return buildOwnerActionRows(fnFilter);
    case 'evidence-gaps': return buildEvidenceGapRows(fnFilter);
    case 'deficient-controls': return buildDeficientControlRows(fnFilter);
    case 'regulatory-impact': return buildRegulatoryImpactRows(fnFilter);
    case 'obligation-matrix': return buildObligationMatrixRows(fnFilter);
    case 'supply-chain-snapshot': return buildSupplyChainSnapshotRows();
    case 'executive-risk': return buildExecutiveRiskRows();
    case 'audit-reference': return buildAuditReferenceRows();
    case 'source-registry': return buildSourceRegistryRows();
    case 'data-quality': return buildDataQualityRows(fnFilter);
    case 'executive-health': return buildExecutiveHealthRows();
    case 'source-validation-readiness': return buildSourceValidationReadinessRows();
    case 'source-intake-workflow': return buildSourceIntakeWorkflowRows();
    default: return [];
  }
}
