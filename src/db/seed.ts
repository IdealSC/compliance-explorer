/**
 * Database Seed Script — Phase 2.1
 *
 * Reads existing JSON files and inserts into PostgreSQL via Drizzle.
 *
 * Usage:
 *   npx tsx src/db/seed.ts          # Additive insert (idempotent)
 *   npx tsx src/db/seed.ts --reset   # Truncate all tables first, then re-seed
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env.local
 *   - Schema pushed via: npx drizzle-kit push
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import { createHash } from 'crypto';

// ── JSON imports ────────────────────────────────────────────────
import requirementsData from '../data/requirements.json';
import crosswalkData from '../data/crosswalks.json';
import regulatoryUpdatesData from '../data/governance/regulatoryUpdates.json';
import draftChangesData from '../data/governance/draftChanges.json';
import versionHistoryData from '../data/governance/versionHistory.json';
import auditEventsData from '../data/governance/auditEvents.json';
import impactAnalysesData from '../data/governance/impactAnalyses.json';
import controlsData from '../data/governance/controls.json';
import evidenceRequirementsData from '../data/governance/evidenceRequirements.json';
import ownerActionsData from '../data/governance/ownerActions.json';
import sourceRegistryData from '../data/governance/sourceRegistry.json';
import dataQualityIssuesData from '../data/governance/dataQualityIssues.json';

// Legacy workbook data
import risksData from '../data/risks.json';
import evidenceData from '../data/evidence.json';
import functionImpactData from '../data/functionImpact.json';
import gapsData from '../data/gaps.json';
import sourcesData from '../data/sources.json';

// ── Helpers ─────────────────────────────────────────────────────
function toJsonText(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return JSON.stringify(val);
  return String(val);
}

/** Deterministic UUID v5-style from a namespace + key */
function deterministicId(key: string): string {
  const hash = createHash('sha256').update(`compliance-seed:${key}`).digest('hex');
  return [
    hash.slice(0, 8), hash.slice(8, 12), '4' + hash.slice(13, 16),
    '8' + hash.slice(17, 20), hash.slice(20, 32),
  ].join('-');
}

/** Map free-text source type to the ref_source_type enum */
function normalizeSourceType(val: string | null | undefined): 'law' | 'regulation' | 'guidance' | 'standard' | 'framework' | null {
  if (!val) return null;
  const v = val.toLowerCase().trim();
  if (v.includes('law') || v.includes('statute')) return 'law';
  if (v.includes('regulation') || v.includes('cfr') || v.includes('rule')) return 'regulation';
  if (v.includes('guidance') || v.includes('guide')) return 'guidance';
  if (v.includes('standard') || v.includes('iso') || v.includes('ich')) return 'standard';
  if (v.includes('framework')) return 'framework';
  return null;
}

const RESET = process.argv.includes('--reset');

// ── Production Safety Guard ─────────────────────────────────────
// Prevent accidental reset of production databases.
if (RESET && process.env.NODE_ENV === 'production') {
  if (process.env.ALLOW_SEED_RESET !== 'true') {
    console.error(
      '\n' +
      '╔══════════════════════════════════════════════════════════════════╗\n' +
      '║  🛑  SEED RESET BLOCKED — PRODUCTION ENVIRONMENT               ║\n' +
      '║                                                                ║\n' +
      '║  The --reset flag truncates ALL tables. This is destructive    ║\n' +
      '║  and cannot be undone without a database backup.               ║\n' +
      '║                                                                ║\n' +
      '║  If you intentionally need to reset production data:           ║\n' +
      '║    ALLOW_SEED_RESET=true npm run db:reset                      ║\n' +
      '║                                                                ║\n' +
      '║  This should almost NEVER be used on production databases.     ║\n' +
      '╚══════════════════════════════════════════════════════════════════╝\n',
    );
    process.exit(1);
  }
  console.warn(
    '\n⚠️  ALLOW_SEED_RESET=true override active. Proceeding with production reset.\n',
  );
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL required. Set in .env.local');

  const sqlClient = neon(url);
  const db = drizzle(sqlClient, { schema });

  if (RESET) {
    console.log('🗑️  --reset flag detected. Truncating all tables...');
    await db.execute(sql`TRUNCATE TABLE
      data_quality_issues, audit_events, regulatory_versions, report_snapshots,
      owner_actions, evidence_requirements, compliance_controls, impact_analyses,
      approval_reviews, draft_changes, regulatory_updates,
      source_validation_checklists, source_records,
      crosswalk_mappings, standards, regulatory_reference_records,
      user_role_assignments, users, roles,
      risks, evidence_register, function_impacts, gaps, source_inventory
      CASCADE`);
    console.log('  ✓ Tables truncated.');
  }

  console.log('🌱 Seeding database...');

  // ── 1. Seed demo roles ──────────────────────────────────────
  console.log('  → Roles');
  const roleRows = [
    { id: 'viewer', displayName: 'Viewer', description: 'Read-only access' },
    { id: 'business_owner', displayName: 'Business Owner', description: 'Operational data for assigned functions' },
    { id: 'compliance_editor', displayName: 'Compliance Editor', description: 'Draft changes and source management' },
    { id: 'compliance_approver', displayName: 'Compliance Approver', description: 'Approve and publish reference data' },
    { id: 'legal_reviewer', displayName: 'Legal Reviewer', description: 'Legal review of sources and drafts' },
    { id: 'risk_reviewer', displayName: 'Risk Reviewer', description: 'Risk assessment review' },
    { id: 'auditor', displayName: 'Auditor', description: 'Full read access including audit logs' },
    { id: 'admin', displayName: 'Admin', description: 'User and system management' },
  ];
  for (const r of roleRows) {
    await db.insert(schema.roles).values(r).onConflictDoNothing();
  }

  // ── 2. Seed demo users ──────────────────────────────────────
  console.log('  → Demo users');
  const demoUsers = [
    { email: 'admin@example.com', name: 'System Admin' },
    { email: 'compliance@example.com', name: 'Compliance Editor' },
    { email: 'approver@example.com', name: 'Compliance Approver' },
    { email: 'legal@example.com', name: 'Legal Reviewer' },
    { email: 'viewer@example.com', name: 'Read-Only Viewer' },
  ];
  for (const u of demoUsers) {
    await db.insert(schema.users).values({ ...u, id: deterministicId(u.email) }).onConflictDoNothing();
  }

  // ── 3. Regulatory Reference Records ─────────────────────────
  console.log(`  → ${(requirementsData as any[]).length} reference records`);
  for (const r of requirementsData as any[]) {
    await db.insert(schema.regulatoryReferenceRecords).values({
      stableReferenceId: r.matrixRowId,
      versionNumber: r.versionNumber ?? '1.0',
      recordStatus: 'active',
      regulatoryDomain: r.regulatoryDomain,
      jurisdictionRegion: r.jurisdictionRegion,
      regulatorAuthority: r.regulatorAuthority,
      lawRegulationName: r.lawRegulationFrameworkStandardName,
      specificCitation: r.specificCitationSectionClause,
      sourceType: normalizeSourceType(r.sourceType ?? r.lawRegulationFrameworkStandardName),
      regulatoryTier: r.regulatoryTier,
      scorPhase: r.scorPhase,
      level1Category: r.level1Category,
      level2Subcategory: r.level2Subcategory,
      level3RequirementArea: r.level3RequirementArea,
      level4DetailedRequirement: r.level4DetailedRequirement,
      level5GranularObligation: r.level5GranularObligation,
      exactSourceLanguage: r.exactRequirementOrSourceLanguage,
      plainEnglishInterpretation: r.plainEnglishInterpretation,
      whoMustComply: r.whoMustComply,
      businessFunctionsImpacted: r.businessFunctionImpacted,
      exampleBusinessOwner: r.exampleBusinessOwner,
      operationalProcessImpacted: r.operationalProcessImpacted,
      requiredAction: r.requiredAction,
      requiredControl: r.requiredControl,
      requiredEvidence: r.requiredEvidenceDocumentation,
      reportingRequirement: r.reportingRequirement,
      monitoringRequirement: r.monitoringRequirement,
      frequencyTiming: r.frequencyTiming,
      triggeringEvent: r.triggeringEvent,
      applicabilityConditions: r.applicabilityConditions,
      exceptionsExemptions: r.exceptionsExemptions,
      relatedStandards: r.relatedStandards,
      relatedLawsRegulations: r.relatedLawsRegulations,
      relatedInternalPolicies: r.relatedInternalPoliciesOrProcedures,
      dependencies: r.dependencies,
      potentialConflicts: r.potentialConflictsOrAmbiguities,
      riskOfNonCompliance: r.riskOfNonCompliance,
      severityPriority: r.severityPriority,
      implementationNotes: r.implementationNotes,
      practicalExample: r.practicalExampleForBusinessLeader,
      sourceReference: r.sourceNoteSourceReference,
      sourceFile: r.sourceFile,
      confidenceLevel: r.confidenceLevel,
      openQuestions: r.openQuestionsMissingInformation,
      reviewStatus: r.reviewStatus,
      accuracyEnhancementNote: r.accuracyEnhancementNote,
      externalVerificationUrl: r.externalVerificationUrl,
      recommendedEnhancement: r.recommendedEnhancementControlGap,
      targetRemediationOwner: r.targetRemediationOwner,
      actionRequired: r.actionRequired,
      validationDate: r.validationDate,
      rowType: r.rowType,
      primaryPersonaViewer: r.primaryPersonaViewer,
      lifecycleStage: r.lifecycleStage,
      processType: r.processType,
      status: r.status,
      actionability: r.actionability,
      digitalSystemOwner: r.digitalSystemOwner,
      controlType: r.controlType,
      evidenceCriticality: r.evidenceCriticality,
      uiDisplaySummary: r.uiDisplaySummary,
      needsReviewFlag: r.needsReviewFlag ? String(r.needsReviewFlag) : null,
      launchCriticalFlag: r.launchCriticalFlag ? String(r.launchCriticalFlag) : null,
    }).onConflictDoNothing();
  }

  // ── 4. Crosswalk Mappings ───────────────────────────────────
  console.log(`  → ${(crosswalkData as any[]).length} crosswalk mappings`);
  for (const c of crosswalkData as any[]) {
    await db.insert(schema.crosswalkMappings).values({
      stableReferenceId: c.crosswalkId,
      crosswalkArea: c.crosswalkArea,
      linkedLawsStandardsGuidance: c.linkedLawsStandardsGuidance,
      businessMeaning: c.businessMeaning,
      primaryEvidenceControl: c.primaryEvidenceControl,
      sourceCoverage: c.sourceCoverage,
      primaryScorPhase: c.primaryScorPhase,
      primaryPersonaViewer: c.primaryPersonaViewer,
      relatedAppView: c.relatedAppView,
      linkedMatrixRowIds: c.linkedMatrixRowIdsFilterLogic,
      sourceFile: c.sourceFile,
      lastReviewedDate: c.lastReviewedDate,
      confidenceLevel: c.confidenceLevel,
    }).onConflictDoNothing();
  }

  // ── 5. Source Records ───────────────────────────────────────
  console.log(`  → ${(sourceRegistryData as any[]).length} source records`);
  for (const s of sourceRegistryData as any[]) {
    await db.insert(schema.sourceRecords).values({
      stableReferenceId: s.id,
      sourceTitle: s.sourceTitle,
      sourceType: s.sourceType ?? 'other',
      sourceStatus: s.sourceStatus ?? 'intake',
      validationStatus: s.validationStatus ?? 'not_started',
      regulator: s.regulator,
      jurisdiction: s.jurisdiction,
      issuingAuthority: s.issuingAuthority,
      publicationDate: s.publicationDate,
      effectiveDate: s.effectiveDate,
      lastRetrievedDate: s.lastRetrievedDate,
      sourceUrl: s.sourceUrl,
      sourceFileName: s.sourceFileName,
      sourceVersion: s.sourceVersion,
      confidenceLevel: s.confidenceLevel,
      legalReviewRequired: s.legalReviewRequired ?? false,
      summary: s.summary,
      keyChanges: s.keyChanges,
      knownLimitations: s.knownLimitations,
      missingMetadata: toJsonText(s.missingMetadata),
      sourceReference: s.sourceReference,
      relatedObligationIds: toJsonText(s.relatedObligationIds),
      relatedRegulatoryUpdateIds: toJsonText(s.relatedRegulatoryUpdateIds),
      relatedDraftChangeIds: toJsonText(s.relatedDraftChangeIds),
      relatedCrosswalkIds: toJsonText(s.relatedCrosswalkIds),
      relatedControlIds: toJsonText(s.relatedControlIds),
      relatedEvidenceIds: toJsonText(s.relatedEvidenceIds),
      relatedReportIds: toJsonText(s.relatedReportIds),
      notes: s.notes,
    }).onConflictDoNothing();
  }

  // ── 6. Regulatory Updates ───────────────────────────────────
  console.log(`  → ${(regulatoryUpdatesData as any[]).length} regulatory updates`);
  for (const ru of regulatoryUpdatesData as any[]) {
    await db.insert(schema.regulatoryUpdates).values({
      stableReferenceId: ru.id,
      updateTitle: ru.updateTitle,
      sourceName: ru.sourceName,
      sourceType: ru.sourceType,
      regulator: ru.regulator,
      jurisdiction: ru.jurisdiction,
      changeType: ru.changeType ?? 'amendment',
      changeSummary: ru.changeSummary,
      sourceReference: ru.sourceReference,
      currentStage: ru.currentStage ?? 'intake',
      assignedReviewer: ru.assignedReviewer,
      confidenceLevel: ru.confidenceLevel,
      legalReviewRequired: ru.legalReviewRequired ?? false,
      impactedDomains: toJsonText(ru.impactedDomains),
      impactedBusinessFunctions: toJsonText(ru.impactedBusinessFunctions),
      relatedObligationIds: toJsonText(ru.relatedObligationIds),
      relatedCrosswalkIds: toJsonText(ru.relatedCrosswalkIds),
      publicationDate: ru.publicationDate,
      effectiveDate: ru.effectiveDate,
    }).onConflictDoNothing();
  }

  // ── 7. Draft Changes ────────────────────────────────────────
  console.log(`  → ${(draftChangesData as any[]).length} draft changes`);
  for (const dc of draftChangesData as any[]) {
    await db.insert(schema.draftChanges).values({
      stableReferenceId: dc.draftId,
      relatedUpdateId: dc.relatedUpdateId,
      affectedEntityType: dc.affectedEntityType,
      changeType: dc.changeType,
      affectedEntityId: dc.affectedEntityId,
      proposedChangeSummary: dc.proposedChangeSummary,
      previousValue: dc.previousValue,
      proposedValue: dc.proposedValue,
      sourceReference: dc.sourceReference,
      changeReason: dc.changeReason,
      requiredApprover: dc.requiredApprover,
      draftStatus: dc.draftStatus ?? 'draft',
      submittedBy: dc.submittedBy,
      submittedDate: dc.submittedDate,
    }).onConflictDoNothing();
  }

  // ── 8. Controls ─────────────────────────────────────────────
  console.log(`  → ${(controlsData as any[]).length} compliance controls`);
  for (const c of controlsData as any[]) {
    await db.insert(schema.complianceControls).values({
      stableReferenceId: c.id,
      controlName: c.controlName,
      controlDescription: c.controlDescription,
      controlType: c.controlType ?? 'preventive',
      controlStatus: c.controlStatus ?? 'not_started',
      controlOwner: c.controlOwner,
      businessFunction: c.businessFunction,
      relatedObligationIds: toJsonText(c.relatedObligationIds),
      relatedRegulationIds: toJsonText(c.relatedRegulationIds),
      relatedCrosswalkIds: toJsonText(c.relatedCrosswalkIds),
      relatedImpactAnalysisIds: toJsonText(c.relatedImpactAnalysisIds),
      relatedEvidenceIds: toJsonText(c.relatedEvidenceIds),
      riskLevel: c.riskLevel ?? 'medium',
      frequency: c.frequency,
      lastReviewedDate: c.lastReviewedDate,
      nextReviewDate: c.nextReviewDate,
      sourceReference: c.sourceReference,
      governanceStatus: c.governanceStatus ?? 'active',
      confidenceLevel: c.confidenceLevel,
      notes: c.notes,
    }).onConflictDoNothing();
  }

  // ── 9. Evidence Requirements ────────────────────────────────
  console.log(`  → ${(evidenceRequirementsData as any[]).length} evidence requirements`);
  for (const e of evidenceRequirementsData as any[]) {
    await db.insert(schema.evidenceRequirements).values({
      stableReferenceId: e.id,
      evidenceName: e.evidenceName,
      evidenceDescription: e.evidenceDescription,
      evidenceType: e.evidenceType ?? 'record',
      evidenceStatus: e.evidenceStatus ?? 'not_started',
      evidenceOwner: e.evidenceOwner,
      businessFunction: e.businessFunction,
      relatedControlIds: toJsonText(e.relatedControlIds),
      relatedObligationIds: toJsonText(e.relatedObligationIds),
      relatedRegulationIds: toJsonText(e.relatedRegulationIds),
      relatedImpactAnalysisIds: toJsonText(e.relatedImpactAnalysisIds),
      requiredFrequency: e.requiredFrequency,
      retentionRequirement: e.retentionRequirement,
      lastCollectedDate: e.lastCollectedDate,
      nextDueDate: e.nextDueDate,
      sourceReference: e.sourceReference,
      governanceStatus: e.governanceStatus ?? 'active',
      confidenceLevel: e.confidenceLevel,
      notes: e.notes,
    }).onConflictDoNothing();
  }

  // ── 10. Owner Actions ───────────────────────────────────────
  console.log(`  → ${(ownerActionsData as any[]).length} owner actions`);
  for (const a of ownerActionsData as any[]) {
    await db.insert(schema.ownerActions).values({
      stableReferenceId: a.id,
      actionTitle: a.actionTitle,
      actionDescription: a.actionDescription,
      owner: a.owner,
      businessFunction: a.businessFunction,
      relatedControlIds: toJsonText(a.relatedControlIds),
      relatedEvidenceIds: toJsonText(a.relatedEvidenceIds),
      relatedObligationIds: toJsonText(a.relatedObligationIds),
      relatedImpactAnalysisIds: toJsonText(a.relatedImpactAnalysisIds),
      actionStatus: a.actionStatus ?? 'not_started',
      priority: a.priority ?? 'medium',
      dueDate: a.dueDate,
      dependency: a.dependency,
      riskIfNotCompleted: a.riskIfNotCompleted,
      sourceReference: a.sourceReference,
    }).onConflictDoNothing();
  }

  // ── 11. Impact Analyses ─────────────────────────────────────
  console.log(`  → ${(impactAnalysesData as any[]).length} impact analyses`);
  for (const ia of impactAnalysesData as any[]) {
    await db.insert(schema.impactAnalyses).values({
      stableReferenceId: ia.id,
      relatedUpdateId: ia.relatedUpdateId,
      updateTitle: ia.updateTitle,
      sourceName: ia.sourceName,
      sourceType: ia.sourceType,
      regulator: ia.regulator,
      jurisdiction: ia.jurisdiction,
      changeType: ia.changeType,
      publicationDate: ia.publicationDate,
      effectiveDate: ia.effectiveDate,
      sourceReference: ia.sourceReference,
      impactStatus: ia.impactStatus ?? 'not_started',
      impactSeverity: ia.impactSeverity ?? 'medium',
      impactedObligationIds: toJsonText(ia.impactedObligationIds),
      impactedCrosswalkIds: toJsonText(ia.impactedCrosswalkIds),
      impactedStandards: ia.impactedStandards,
      impactedControls: ia.impactedControls,
      impactedEvidence: ia.impactedEvidence,
      impactedBusinessFunctions: ia.impactedBusinessFunctions,
      impactedOwners: ia.impactedOwners,
      impactedRisks: ia.impactedRisks,
      requiredActions: ia.requiredActions,
      recommendedNextSteps: ia.recommendedNextSteps,
      governanceReview: ia.governanceReview,
      reviewedBy: ia.reviewedBy,
    }).onConflictDoNothing();
  }

  // ── 12. Audit Events ────────────────────────────────────────
  console.log(`  → ${(auditEventsData as any[]).length} audit events`);
  for (const ae of auditEventsData as any[]) {
    await db.insert(schema.auditEvents).values({
      stableReferenceId: ae.auditId,
      entityType: ae.entityType,
      entityId: ae.entityId,
      action: ae.action,
      previousValue: ae.previousValue,
      newValue: ae.newValue,
      changedBy: ae.changedBy,
      changedAt: new Date(ae.changedAt),
      reason: ae.reason,
      approvalReference: ae.approvalReference,
    }).onConflictDoNothing();
  }

  // ── 13. Version History ─────────────────────────────────────
  console.log(`  → ${(versionHistoryData as any[]).length} version records`);
  for (const v of versionHistoryData as any[]) {
    await db.insert(schema.regulatoryVersions).values({
      stableReferenceId: v.stableReferenceId,
      versionId: v.versionId,
      versionNumber: v.versionNumber,
      recordStatus: v.recordStatus ?? 'active',
      effectiveDate: v.effectiveDate,
      supersededDate: v.supersededDate,
      changeSummary: v.changeSummary,
      approvedBy: v.approvedBy,
      previousVersionId: v.previousVersionId,
      sourceReference: v.sourceReference,
    }).onConflictDoNothing();
  }

  // ── 14. Data Quality Issues ─────────────────────────────────
  console.log(`  → ${(dataQualityIssuesData as any[]).length} data quality issues`);
  for (const dq of dataQualityIssuesData as any[]) {
    await db.insert(schema.dataQualityIssues).values({
      stableReferenceId: dq.id,
      issueTitle: dq.issueTitle,
      issueDescription: dq.issueDescription,
      issueType: dq.issueType,
      category: dq.category,
      severity: dq.severity ?? 'medium',
      status: dq.status ?? 'open',
      affectedEntityType: dq.affectedEntityType,
      affectedEntityId: dq.affectedEntityId,
      affectedEntityLabel: dq.affectedEntityLabel,
      businessFunction: dq.businessFunction,
      owner: dq.owner,
      relatedObligationIds: toJsonText(dq.relatedObligationIds),
      relatedControlIds: toJsonText(dq.relatedControlIds),
      relatedEvidenceIds: toJsonText(dq.relatedEvidenceIds),
      relatedSourceIds: toJsonText(dq.relatedSourceIds),
      relatedImpactAnalysisIds: toJsonText(dq.relatedImpactAnalysisIds),
      relatedDraftChangeIds: toJsonText(dq.relatedDraftChangeIds),
      relatedReportIds: toJsonText(dq.relatedReportIds),
      sourceReference: dq.sourceReference,
      confidenceLevel: dq.confidenceLevel,
      legalReviewRequired: dq.legalReviewRequired ?? false,
      recommendedAction: dq.recommendedAction,
      riskIfUnresolved: dq.riskIfUnresolved,
      dueDate: dq.dueDate,
      notes: dq.notes,
    }).onConflictDoNothing();
  }

  // ── 15. Risks ──────────────────────────────────────────────
  console.log(`  → ${(risksData as any[]).length} risks`);
  for (const r of risksData as any[]) {
    await db.insert(schema.risks).values({
      stableReferenceId: r.riskId,
      linkedMatrixRowId: r.linkedMatrixRowId,
      matrixRowId: r.matrixRowId,
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
    }).onConflictDoNothing();
  }

  // ── 16. Evidence Register ───────────────────────────────────
  console.log(`  → ${(evidenceData as any[]).length} evidence records`);
  for (const e of evidenceData as any[]) {
    await db.insert(schema.evidenceRegister).values({
      stableReferenceId: e.evidenceId,
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
    }).onConflictDoNothing();
  }

  // ── 17. Function Impacts ────────────────────────────────────
  console.log(`  → ${(functionImpactData as any[]).length} function impacts`);
  for (const fi of functionImpactData as any[]) {
    await db.insert(schema.functionImpacts).values({
      stableReferenceId: fi.functionImpactId,
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
    }).onConflictDoNothing();
  }

  // ── 18. Gaps ───────────────────────────────────────────────
  console.log(`  → ${(gapsData as any[]).length} gaps`);
  for (const g of gapsData as any[]) {
    await db.insert(schema.gaps).values({
      stableReferenceId: g.gapId,
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
    }).onConflictDoNothing();
  }

  // ── 19. Source Inventory ────────────────────────────────────
  console.log(`  → ${(sourcesData as any[]).length} source inventory`);
  for (const s of sourcesData as any[]) {
    await db.insert(schema.sourceInventory).values({
      stableReferenceId: s.sourceId,
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
    }).onConflictDoNothing();
  }

  console.log('✅ Seed complete.');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
