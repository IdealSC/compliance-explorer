/**
 * Database-backed data service layer.
 *
 * Provides the same function signatures as lib/data.ts but reads
 * from the database instead of static JSON files.
 *
 * Used when DATA_SOURCE=database in environment.
 *
 * Phase 2.1: Read-only queries only. No writes.
 */
import { getDb } from '@/db';
import { eq, desc } from 'drizzle-orm';
import {
  regulatoryReferenceRecords,
  crosswalkMappings,
  sourceRecords as sourceRecordsTable,
  regulatoryUpdates as regulatoryUpdatesTable,
  draftChanges as draftChangesTable,
  regulatoryVersions,
  auditEvents as auditEventsTable,
  impactAnalyses as impactAnalysesTable,
  complianceControls as complianceControlsTable,
  evidenceRequirements as evidenceRequirementsTable,
  ownerActions as ownerActionsTable,
  dataQualityIssues as dataQualityIssuesTable,
} from '@/db/schema';
import type {
  Requirement,
  Risk,
  Evidence,
  Crosswalk,
  FunctionImpact,
  Gap,
  Source,
  RegulatoryUpdate,
  DraftRegulatoryChange,
  RegulatoryVersion,
  AuditEvent,
  RegulatoryImpactAnalysis,
  ComplianceControl,
  EvidenceRequirement,
  OwnerActionItem,
  SourceRecord,
  DataQualityIssue,
} from '@/types';

// ── Helpers ─────────────────────────────────────────────────────

/** Parse a text column containing a JSON array back to string[] */
function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

/** Parse a JSONB column (already parsed by Drizzle) */
function parseJsonb<T>(val: unknown): T {
  return val as T;
}

// ── Regulatory Reference Records → Requirement[] ────────────────

function rowToRequirement(row: typeof regulatoryReferenceRecords.$inferSelect): Requirement {
  return {
    matrixRowId: row.stableReferenceId,
    rowType: row.rowType,
    regulatoryDomain: row.regulatoryDomain,
    jurisdictionRegion: row.jurisdictionRegion,
    regulatorAuthority: row.regulatorAuthority,
    lawRegulationFrameworkStandardName: row.lawRegulationName,
    specificCitationSectionClause: row.specificCitation,
    sourceType: row.sourceType,
    regulatoryTier: row.regulatoryTier,
    scorPhase: row.scorPhase,
    level1Category: row.level1Category,
    level2Subcategory: row.level2Subcategory,
    level3RequirementArea: row.level3RequirementArea,
    level4DetailedRequirement: row.level4DetailedRequirement,
    level5GranularObligation: row.level5GranularObligation,
    exactRequirementOrSourceLanguage: row.exactSourceLanguage,
    plainEnglishInterpretation: row.plainEnglishInterpretation,
    whoMustComply: row.whoMustComply,
    businessFunctionImpacted: row.businessFunctionsImpacted,
    exampleBusinessOwner: row.exampleBusinessOwner,
    operationalProcessImpacted: row.operationalProcessImpacted,
    requiredAction: row.requiredAction,
    requiredControl: row.requiredControl,
    requiredEvidenceDocumentation: row.requiredEvidence,
    reportingRequirement: row.reportingRequirement,
    monitoringRequirement: row.monitoringRequirement,
    frequencyTiming: row.frequencyTiming,
    triggeringEvent: row.triggeringEvent,
    applicabilityConditions: row.applicabilityConditions,
    exceptionsExemptions: row.exceptionsExemptions,
    relatedStandards: row.relatedStandards,
    relatedLawsRegulations: row.relatedLawsRegulations,
    relatedInternalPoliciesOrProcedures: row.relatedInternalPolicies,
    dependencies: row.dependencies,
    potentialConflictsOrAmbiguities: row.potentialConflicts,
    riskOfNonCompliance: row.riskOfNonCompliance,
    severityPriority: row.severityPriority,
    implementationNotes: row.implementationNotes,
    practicalExampleForBusinessLeader: row.practicalExample,
    sourceNoteSourceReference: row.sourceReference,
    sourceFile: row.sourceFile,
    confidenceLevel: row.confidenceLevel,
    openQuestionsMissingInformation: row.openQuestions,
    versionNumber: row.versionNumber,
    recordStatus: row.recordStatus,
    publicationDate: row.publicationDate,
    effectiveDate: row.effectiveDate,
    supersededDate: row.supersededDate,
    previousVersionId: row.previousVersionId,
    changeSummary: null,
    changeReason: null,
    reviewStatus: row.reviewStatus,
    accuracyEnhancementNote: row.accuracyEnhancementNote,
    externalVerificationUrl: row.externalVerificationUrl,
    recommendedEnhancementControlGap: row.recommendedEnhancement,
    targetRemediationOwner: row.targetRemediationOwner,
    actionRequired: row.actionRequired,
    validationDate: row.validationDate,
    primaryPersonaViewer: row.primaryPersonaViewer,
    lifecycleStage: row.lifecycleStage,
    processType: row.processType,
    status: row.status,
    actionability: row.actionability,
    digitalSystemOwner: row.digitalSystemOwner,
    controlType: row.controlType,
    evidenceCriticality: row.evidenceCriticality,
    uiDisplaySummary: row.uiDisplaySummary,
    needsReviewFlag: row.needsReviewFlag === 'TRUE' || row.needsReviewFlag === 'true',
    launchCriticalFlag: row.launchCriticalFlag === 'TRUE' || row.launchCriticalFlag === 'true',
  };
}

export async function dbGetRequirements(): Promise<Requirement[]> {
  const db = getDb();
  const rows = await db.select().from(regulatoryReferenceRecords);
  return rows.map(rowToRequirement);
}

// ── Crosswalks ──────────────────────────────────────────────────

function rowToCrosswalk(row: typeof crosswalkMappings.$inferSelect): Crosswalk {
  return {
    crosswalkId: row.stableReferenceId,
    crosswalkArea: row.crosswalkArea,
    linkedLawsStandardsGuidance: row.linkedLawsStandardsGuidance,
    businessMeaning: row.businessMeaning,
    primaryEvidenceControl: row.primaryEvidenceControl,
    sourceCoverage: row.sourceCoverage,
    primaryScorPhase: row.primaryScorPhase,
    primaryPersonaViewer: row.primaryPersonaViewer,
    relatedAppView: row.relatedAppView,
    linkedMatrixRowIdsFilterLogic: row.linkedMatrixRowIds,
    sourceFile: row.sourceFile,
    lastReviewedDate: row.lastReviewedDate,
    confidenceLevel: row.confidenceLevel,
  };
}

export async function dbGetCrosswalks(): Promise<Crosswalk[]> {
  const db = getDb();
  const rows = await db.select().from(crosswalkMappings);
  return rows.map(rowToCrosswalk);
}

// ── Regulatory Updates ──────────────────────────────────────────

function rowToRegulatoryUpdate(row: typeof regulatoryUpdatesTable.$inferSelect): RegulatoryUpdate {
  return {
    id: row.stableReferenceId,
    updateTitle: row.updateTitle,
    sourceName: row.sourceName,
    sourceType: row.sourceType as RegulatoryUpdate['sourceType'],
    regulator: row.regulator,
    jurisdiction: row.jurisdiction,
    publicationDate: row.publicationDate,
    effectiveDate: row.effectiveDate,
    intakeDate: row.intakeDate.toISOString(),
    changeType: row.changeType as RegulatoryUpdate['changeType'],
    changeSummary: row.changeSummary,
    sourceReference: row.sourceReference,
    impactedDomains: parseJsonArray(row.impactedDomains),
    impactedBusinessFunctions: parseJsonArray(row.impactedBusinessFunctions),
    currentStage: row.currentStage as RegulatoryUpdate['currentStage'],
    assignedReviewer: row.assignedReviewer,
    confidenceLevel: row.confidenceLevel as RegulatoryUpdate['confidenceLevel'],
    legalReviewRequired: row.legalReviewRequired,
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedCrosswalkIds: parseJsonArray(row.relatedCrosswalkIds),
  };
}

export async function dbGetRegulatoryUpdates(): Promise<RegulatoryUpdate[]> {
  const db = getDb();
  const rows = await db.select().from(regulatoryUpdatesTable);
  return rows.map(rowToRegulatoryUpdate);
}

// ── Draft Changes ───────────────────────────────────────────────

function rowToDraftChange(row: typeof draftChangesTable.$inferSelect): DraftRegulatoryChange {
  return {
    draftId: row.stableReferenceId,
    relatedUpdateId: row.relatedUpdateId ?? '',
    affectedEntityType: row.affectedEntityType as DraftRegulatoryChange['affectedEntityType'],
    affectedEntityId: row.affectedEntityId,
    changeType: row.changeType as DraftRegulatoryChange['changeType'],
    proposedChangeSummary: row.proposedChangeSummary,
    previousValue: row.previousValue,
    proposedValue: row.proposedValue,
    sourceReference: row.sourceReference,
    changeReason: row.changeReason,
    requiredApprover: row.requiredApprover,
    draftStatus: row.draftStatus as DraftRegulatoryChange['draftStatus'],
    submittedBy: row.submittedBy,
    submittedDate: row.submittedDate,
  };
}

export async function dbGetDraftChanges(): Promise<DraftRegulatoryChange[]> {
  const db = getDb();
  const rows = await db.select().from(draftChangesTable);
  return rows.map(rowToDraftChange);
}

// ── Version History ─────────────────────────────────────────────

function rowToVersion(row: typeof regulatoryVersions.$inferSelect): RegulatoryVersion {
  return {
    versionId: row.versionId,
    stableReferenceId: row.stableReferenceId,
    versionNumber: row.versionNumber,
    recordStatus: row.recordStatus as RegulatoryVersion['recordStatus'],
    effectiveDate: row.effectiveDate,
    supersededDate: row.supersededDate,
    changeSummary: row.changeSummary,
    approvedBy: row.approvedBy,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    previousVersionId: row.previousVersionId,
    sourceReference: row.sourceReference,
  };
}

export async function dbGetVersionHistory(): Promise<RegulatoryVersion[]> {
  const db = getDb();
  const rows = await db.select().from(regulatoryVersions);
  return rows.map(rowToVersion);
}

// ── Audit Events ────────────────────────────────────────────────

function rowToAuditEvent(row: typeof auditEventsTable.$inferSelect): AuditEvent {
  return {
    auditId: row.stableReferenceId,
    entityType: row.entityType as AuditEvent['entityType'],
    entityId: row.entityId,
    action: row.action as AuditEvent['action'],
    previousValue: row.previousValue,
    newValue: row.newValue,
    changedBy: row.changedBy,
    changedAt: row.changedAt.toISOString(),
    reason: row.reason,
    approvalReference: row.approvalReference,
  };
}

export async function dbGetAuditEvents(): Promise<AuditEvent[]> {
  const db = getDb();
  const rows = await db.select().from(auditEventsTable).orderBy(desc(auditEventsTable.changedAt));
  return rows.map(rowToAuditEvent);
}

// ── Impact Analyses ─────────────────────────────────────────────

function rowToImpactAnalysis(row: typeof impactAnalysesTable.$inferSelect): RegulatoryImpactAnalysis {
  return {
    id: row.stableReferenceId,
    relatedUpdateId: row.relatedUpdateId ?? '',
    updateTitle: row.updateTitle,
    sourceName: row.sourceName ?? '',
    sourceType: row.sourceType as RegulatoryImpactAnalysis['sourceType'],
    regulator: row.regulator,
    jurisdiction: row.jurisdiction,
    changeType: row.changeType as RegulatoryImpactAnalysis['changeType'],
    publicationDate: row.publicationDate,
    effectiveDate: row.effectiveDate,
    sourceReference: row.sourceReference,
    impactStatus: row.impactStatus as RegulatoryImpactAnalysis['impactStatus'],
    impactSeverity: row.impactSeverity as RegulatoryImpactAnalysis['impactSeverity'],
    impactedObligationIds: parseJsonArray(row.impactedObligationIds),
    impactedCrosswalkIds: parseJsonArray(row.impactedCrosswalkIds),
    impactedStandards: parseJsonb(row.impactedStandards) ?? [],
    impactedControls: parseJsonb(row.impactedControls) ?? [],
    impactedEvidence: parseJsonb(row.impactedEvidence) ?? [],
    impactedBusinessFunctions: parseJsonb(row.impactedBusinessFunctions) ?? [],
    impactedOwners: parseJsonb(row.impactedOwners) ?? [],
    impactedRisks: parseJsonb(row.impactedRisks) ?? [],
    requiredActions: parseJsonb(row.requiredActions) ?? [],
    recommendedNextSteps: parseJsonb(row.recommendedNextSteps) ?? [],
    governanceReview: parseJsonb(row.governanceReview) ?? {
      legalReviewRequired: false,
      confidenceLevel: null,
      openQuestions: [],
      requiredApprover: null,
      reviewStatus: 'not_started',
      relatedDraftChangeIds: [],
      relatedVersionIds: [],
      relatedAuditEventIds: [],
    },
    createdAt: row.createdAt.toISOString(),
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

export async function dbGetImpactAnalyses(): Promise<RegulatoryImpactAnalysis[]> {
  const db = getDb();
  const rows = await db.select().from(impactAnalysesTable);
  return rows.map(rowToImpactAnalysis);
}

// ── Compliance Controls ─────────────────────────────────────────

function rowToControl(row: typeof complianceControlsTable.$inferSelect): ComplianceControl {
  return {
    id: row.stableReferenceId,
    controlName: row.controlName,
    controlDescription: row.controlDescription,
    controlType: row.controlType as ComplianceControl['controlType'],
    controlStatus: row.controlStatus as ComplianceControl['controlStatus'],
    controlOwner: row.controlOwner ?? '',
    businessFunction: row.businessFunction,
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedRegulationIds: parseJsonArray(row.relatedRegulationIds),
    relatedCrosswalkIds: parseJsonArray(row.relatedCrosswalkIds),
    relatedImpactAnalysisIds: parseJsonArray(row.relatedImpactAnalysisIds),
    relatedEvidenceIds: parseJsonArray(row.relatedEvidenceIds),
    riskLevel: row.riskLevel as ComplianceControl['riskLevel'],
    frequency: row.frequency ?? '',
    lastReviewedDate: row.lastReviewedDate,
    nextReviewDate: row.nextReviewDate,
    sourceReference: row.sourceReference,
    governanceStatus: row.governanceStatus as ComplianceControl['governanceStatus'],
    confidenceLevel: row.confidenceLevel as ComplianceControl['confidenceLevel'],
    notes: row.notes,
  };
}

export async function dbGetComplianceControls(): Promise<ComplianceControl[]> {
  const db = getDb();
  const rows = await db.select().from(complianceControlsTable);
  return rows.map(rowToControl);
}

// ── Evidence Requirements ───────────────────────────────────────

function rowToEvidenceRequirement(row: typeof evidenceRequirementsTable.$inferSelect): EvidenceRequirement {
  return {
    id: row.stableReferenceId,
    evidenceName: row.evidenceName,
    evidenceDescription: row.evidenceDescription,
    evidenceType: row.evidenceType as EvidenceRequirement['evidenceType'],
    evidenceStatus: row.evidenceStatus as EvidenceRequirement['evidenceStatus'],
    evidenceOwner: row.evidenceOwner ?? '',
    businessFunction: row.businessFunction,
    relatedControlIds: parseJsonArray(row.relatedControlIds),
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedRegulationIds: parseJsonArray(row.relatedRegulationIds),
    relatedImpactAnalysisIds: parseJsonArray(row.relatedImpactAnalysisIds),
    requiredFrequency: row.requiredFrequency ?? '',
    retentionRequirement: row.retentionRequirement ?? '',
    lastCollectedDate: row.lastCollectedDate,
    nextDueDate: row.nextDueDate,
    sourceReference: row.sourceReference,
    governanceStatus: row.governanceStatus as EvidenceRequirement['governanceStatus'],
    confidenceLevel: row.confidenceLevel as EvidenceRequirement['confidenceLevel'],
    notes: row.notes,
  };
}

export async function dbGetEvidenceRequirements(): Promise<EvidenceRequirement[]> {
  const db = getDb();
  const rows = await db.select().from(evidenceRequirementsTable);
  return rows.map(rowToEvidenceRequirement);
}

// ── Owner Actions ───────────────────────────────────────────────

function rowToOwnerAction(row: typeof ownerActionsTable.$inferSelect): OwnerActionItem {
  return {
    id: row.stableReferenceId,
    actionTitle: row.actionTitle,
    actionDescription: row.actionDescription,
    owner: row.owner ?? '',
    businessFunction: row.businessFunction,
    relatedControlIds: parseJsonArray(row.relatedControlIds),
    relatedEvidenceIds: parseJsonArray(row.relatedEvidenceIds),
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedImpactAnalysisIds: parseJsonArray(row.relatedImpactAnalysisIds),
    actionStatus: row.actionStatus as OwnerActionItem['actionStatus'],
    priority: row.priority as OwnerActionItem['priority'],
    dueDate: row.dueDate,
    dependency: row.dependency,
    riskIfNotCompleted: row.riskIfNotCompleted ?? '',
    sourceReference: row.sourceReference,
    notes: row.notes ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function dbGetOwnerActions(): Promise<OwnerActionItem[]> {
  const db = getDb();
  const rows = await db.select().from(ownerActionsTable);
  return rows.map(rowToOwnerAction);
}

// ── Source Registry ─────────────────────────────────────────────

function rowToSourceRecord(row: typeof sourceRecordsTable.$inferSelect): SourceRecord {
  return {
    id: row.stableReferenceId,
    sourceTitle: row.sourceTitle,
    sourceType: row.sourceType as SourceRecord['sourceType'],
    regulator: row.regulator,
    jurisdiction: row.jurisdiction,
    issuingAuthority: row.issuingAuthority,
    publicationDate: row.publicationDate,
    effectiveDate: row.effectiveDate,
    lastRetrievedDate: row.lastRetrievedDate,
    sourceUrl: row.sourceUrl,
    sourceFileName: row.sourceFileName,
    sourceVersion: row.sourceVersion,
    sourceStatus: row.sourceStatus as SourceRecord['sourceStatus'],
    validationStatus: row.validationStatus as SourceRecord['validationStatus'],
    confidenceLevel: row.confidenceLevel as SourceRecord['confidenceLevel'],
    owner: null,
    reviewer: null,
    approver: null,
    legalReviewRequired: row.legalReviewRequired,
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedRegulatoryUpdateIds: parseJsonArray(row.relatedRegulatoryUpdateIds),
    relatedDraftChangeIds: parseJsonArray(row.relatedDraftChangeIds),
    relatedCrosswalkIds: parseJsonArray(row.relatedCrosswalkIds),
    relatedControlIds: parseJsonArray(row.relatedControlIds),
    relatedEvidenceIds: parseJsonArray(row.relatedEvidenceIds),
    relatedReportIds: parseJsonArray(row.relatedReportIds),
    summary: row.summary,
    keyChanges: row.keyChanges,
    knownLimitations: row.knownLimitations,
    missingMetadata: parseJsonArray(row.missingMetadata),
    sourceReference: row.sourceReference,
    validationChecklist: [], // Loaded separately if needed
    sourceFiles: [], // Phase 3.3: populated separately via source-file-writes
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    notes: row.notes,
  };
}

export async function dbGetSourceRecords(): Promise<SourceRecord[]> {
  const db = getDb();
  const rows = await db.select().from(sourceRecordsTable);
  return rows.map(rowToSourceRecord);
}

// ── Data Quality Issues ─────────────────────────────────────────

function rowToDataQualityIssue(row: typeof dataQualityIssuesTable.$inferSelect): DataQualityIssue {
  return {
    id: row.stableReferenceId,
    issueTitle: row.issueTitle,
    issueDescription: row.issueDescription,
    issueType: row.issueType as DataQualityIssue['issueType'],
    category: row.category as DataQualityIssue['category'],
    severity: row.severity as DataQualityIssue['severity'],
    status: row.status as DataQualityIssue['status'],
    affectedEntityType: row.affectedEntityType as DataQualityIssue['affectedEntityType'],
    affectedEntityId: row.affectedEntityId,
    affectedEntityLabel: row.affectedEntityLabel,
    businessFunction: row.businessFunction ?? '',
    owner: row.owner ?? '',
    relatedObligationIds: parseJsonArray(row.relatedObligationIds),
    relatedControlIds: parseJsonArray(row.relatedControlIds),
    relatedEvidenceIds: parseJsonArray(row.relatedEvidenceIds),
    relatedSourceIds: parseJsonArray(row.relatedSourceIds),
    relatedImpactAnalysisIds: parseJsonArray(row.relatedImpactAnalysisIds),
    relatedDraftChangeIds: parseJsonArray(row.relatedDraftChangeIds),
    relatedReportIds: parseJsonArray(row.relatedReportIds),
    sourceReference: row.sourceReference,
    confidenceLevel: row.confidenceLevel,
    legalReviewRequired: row.legalReviewRequired,
    recommendedAction: row.recommendedAction ?? '',
    riskIfUnresolved: row.riskIfUnresolved ?? '',
    detectedAt: row.detectedAt.toISOString(),
    lastReviewedAt: row.lastReviewedAt?.toISOString() ?? null,
    dueDate: row.dueDate,
    notes: row.notes,
  };
}

export async function dbGetDataQualityIssues(): Promise<DataQualityIssue[]> {
  const db = getDb();
  const rows = await db.select().from(dataQualityIssuesTable);
  return rows.map(rowToDataQualityIssue);
}

// ── Legacy Tables ───────────────────────────────────────────────

import {
  risks as risksTable,
  evidenceRegister as evidenceRegisterTable,
  functionImpacts as functionImpactsTable,
  gaps as gapsTable,
  sourceInventory as sourceInventoryTable,
} from '@/db/schema';

export async function dbGetRisks(): Promise<Risk[]> {
  const db = getDb();
  const rows = await db.select().from(risksTable);
  return rows.map((r) => ({
    riskId: r.stableReferenceId,
    linkedMatrixRowId: r.linkedMatrixRowId ?? '',
    matrixRowId: r.matrixRowId ?? '',
    severityPriority: r.severityPriority,
    riskTheme: r.riskTheme,
    obligation: r.obligation,
    whyHighRisk: r.whyHighRisk,
    owner: r.owner,
    evidence: r.evidence,
    source: r.source,
    riskThemeCategory: r.riskThemeCategory,
    primaryFunction: r.primaryFunction,
    primaryScorPhase: r.primaryScorPhase,
    primaryJurisdiction: r.primaryJurisdiction,
    reviewStatus: r.reviewStatus,
    mitigationStatus: r.mitigationStatus,
    appDashboardUse: r.appDashboardUse,
  }));
}

export async function dbGetEvidence(): Promise<Evidence[]> {
  const db = getDb();
  const rows = await db.select().from(evidenceRegisterTable);
  return rows.map((e) => ({
    evidenceId: e.stableReferenceId,
    evidenceArtifact: e.evidenceArtifact,
    regulatoryDriver: e.regulatoryDriver,
    primaryProcess: e.primaryProcess,
    evidenceOwner: e.evidenceOwner,
    systemRepository: e.systemRepository,
    minimumReviewCadence: e.minimumReviewCadence,
    inspectionUse: e.inspectionUse,
    relatedMatrixRowsNotes: e.relatedMatrixRowsNotes,
    evidenceCriticality: e.evidenceCriticality,
    appUse: e.appUse,
  }));
}

export async function dbGetFunctionImpacts(): Promise<FunctionImpact[]> {
  const db = getDb();
  const rows = await db.select().from(functionImpactsTable);
  return rows.map((fi) => ({
    functionImpactId: fi.stableReferenceId,
    businessFunction: fi.businessFunction,
    whatTheyNeedToUnderstand: fi.whatTheyNeedToUnderstand,
    whatTheyNeedToActOn: fi.whatTheyNeedToActOn,
    primaryControlsEvidence: fi.primaryControlsEvidence,
    highestRiskQuestions: fi.highestRiskQuestions,
    primaryPersonaViewer: fi.primaryPersonaViewer,
    primaryScorPhases: fi.primaryScorPhases,
    digitalSystemEvidenceDependencies: fi.digitalSystemEvidenceDependencies,
    linkedMatrixRowIdFilter: fi.linkedMatrixRowIdFilter,
    sourceFile: fi.sourceFile,
    lastReviewedDate: fi.lastReviewedDate,
    confidenceLevel: fi.confidenceLevel,
  }));
}

export async function dbGetGaps(): Promise<Gap[]> {
  const db = getDb();
  const rows = await db.select().from(gapsTable);
  return rows.map((g) => ({
    gapId: g.stableReferenceId,
    gapQuestion: g.gapQuestion,
    whyItMatters: g.whyItMatters,
    suggestedOwner: g.suggestedOwner,
    sourceBasis: g.sourceBasis,
    priority: g.priority,
    gapCategory: g.gapCategory,
    status: g.status,
    linkedMatrixRowIdFilter: g.linkedMatrixRowIdFilter,
    appTreatment: g.appTreatment,
    sourceFile: g.sourceFile,
    lastReviewedDate: g.lastReviewedDate,
    confidenceLevel: g.confidenceLevel,
  }));
}

export async function dbGetSources(): Promise<Source[]> {
  const db = getDb();
  const rows = await db.select().from(sourceInventoryTable);
  return rows.map((s) => ({
    sourceId: s.stableReferenceId,
    sourceFileSourceName: s.sourceFileSourceName,
    roleInMatrix: s.roleInMatrix,
    jurisdiction: s.jurisdiction,
    regulatorAuthority: s.regulatorAuthority,
    sourceType: s.sourceType,
    documentDate: s.documentDate,
    versionRevision: s.versionRevision,
    primaryTopic: s.primaryTopic,
    reliabilityAuthorityLevel: s.reliabilityAuthorityLevel,
    keyExtractedContent: s.keyExtractedContent,
    rowsCreatedSupported: s.rowsCreatedSupported,
    notes: s.notes,
    url: s.url,
  }));
}

