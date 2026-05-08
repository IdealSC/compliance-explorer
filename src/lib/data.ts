/**
 * Data Access Layer — Static JSON (Phase 1.x default).
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  DATA_SOURCE environment flag (Phase 2.1+)                      │
 * │                                                                  │
 * │  DATA_SOURCE=json      → Static JSON imports (default, current) │
 * │  DATA_SOURCE=database  → PostgreSQL via Drizzle (async)          │
 * │                                                                  │
 * │  When DATA_SOURCE=database, pages should use the async service   │
 * │  layer at @/lib/services/data.ts instead of these sync accessors.│
 * │  See: src/lib/services/data.ts                                   │
 * └──────────────────────────────────────────────────────────────────┘
 */
import type { Requirement, Risk, Evidence, Crosswalk, FunctionImpact, Gap, Source, RegulatoryUpdate, DraftRegulatoryChange, RegulatoryVersion, AuditEvent, RegulatoryImpactAnalysis, ComplianceControl, EvidenceRequirement, OwnerActionItem, SourceRecord, DataQualityIssue, SourceIntakeRequest, AiExtractionSuggestion, AiPromptVersion, DraftValidationReview } from '@/types';
import { getAllPersonaOptions } from '@/lib/persona-matching';
import requirementsData from '@/data/requirements.json';
import risksData from '@/data/risks.json';
import evidenceData from '@/data/evidence.json';
import crosswalkData from '@/data/crosswalks.json';
import functionImpactData from '@/data/functionImpact.json';
import gapsData from '@/data/gaps.json';
import sourcesData from '@/data/sources.json';

// Governance workflow data
import regulatoryUpdatesData from '@/data/governance/regulatoryUpdates.json';
import draftChangesData from '@/data/governance/draftChanges.json';
import versionHistoryData from '@/data/governance/versionHistory.json';
import auditEventsData from '@/data/governance/auditEvents.json';
import impactAnalysesData from '@/data/governance/impactAnalyses.json';

// Operational compliance data (Controls & Evidence layer)
import controlsData from '@/data/governance/controls.json';
import evidenceRequirementsData from '@/data/governance/evidenceRequirements.json';
import ownerActionsData from '@/data/governance/ownerActions.json';
import sourceRegistryData from '@/data/governance/sourceRegistry.json';
import dataQualityIssuesData from '@/data/governance/dataQualityIssues.json';
import sourceIntakeRequestsData from '@/data/governance/sourceIntakeRequests.json';
import aiSuggestionsData from '@/data/governance/aiSuggestions.json';
import aiPromptVersionsData from '@/data/governance/aiPromptVersions.json';
import draftValidationReviewsData from '@/data/governance/draftValidationReviews.json';

/** All 110 requirements from the compliance matrix */
export function getRequirements(): Requirement[] {
  return requirementsData as unknown as Requirement[];
}

/** All risk items from the Highest Risk sheet */
export function getRisks(): Risk[] {
  return risksData as unknown as Risk[];
}

/** All evidence items from the Evidence Register sheet */
export function getEvidence(): Evidence[] {
  return evidenceData as unknown as Evidence[];
}

/** All crosswalk areas from the Crosswalk Summary sheet */
export function getCrosswalks(): Crosswalk[] {
  return crosswalkData as unknown as Crosswalk[];
}

/** All business function impact records */
export function getFunctionImpacts(): FunctionImpact[] {
  return functionImpactData as unknown as FunctionImpact[];
}

/** All open gaps and questions */
export function getGaps(): Gap[] {
  return gapsData as unknown as Gap[];
}

/** All source inventory records */
export function getSources(): Source[] {
  return sourcesData as unknown as Source[];
}

// ═══ Governance Workflow Data ═══════════════════════════════════

/** All regulatory update intake records */
export function getRegulatoryUpdates(): RegulatoryUpdate[] {
  return regulatoryUpdatesData as unknown as RegulatoryUpdate[];
}

/** All draft regulatory change proposals */
export function getDraftChanges(): DraftRegulatoryChange[] {
  return draftChangesData as unknown as DraftRegulatoryChange[];
}

/** All version history records */
export function getVersionHistory(): RegulatoryVersion[] {
  return versionHistoryData as unknown as RegulatoryVersion[];
}

/** All audit log events (sorted newest-first) */
export function getAuditEvents(): AuditEvent[] {
  const events = auditEventsData as unknown as AuditEvent[];
  return [...events].sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}

/** All impact analysis records */
export function getImpactAnalyses(): RegulatoryImpactAnalysis[] {
  return impactAnalysesData as unknown as RegulatoryImpactAnalysis[];
}

// ═══ Operational Compliance Data (Controls & Evidence) ══════════

/** All compliance controls */
export function getComplianceControls(): ComplianceControl[] {
  return controlsData as unknown as ComplianceControl[];
}

/** All evidence requirements */
export function getEvidenceRequirements(): EvidenceRequirement[] {
  return evidenceRequirementsData as unknown as EvidenceRequirement[];
}

/** All owner action items */
export function getOwnerActions(): OwnerActionItem[] {
  // JSON data predates the `notes` field — provide a safe default
  return (ownerActionsData as unknown as OwnerActionItem[]).map(a => ({
    ...a,
    notes: a.notes ?? null,
  }));
}

// ═══ Source Registry Data ═══════════════════════════════════════

/** All source registry records */
export function getSourceRecords(): SourceRecord[] {
  return (sourceRegistryData as unknown as SourceRecord[]).map(r => ({
    ...r,
    sourceFiles: r.sourceFiles ?? [],
  }));
}

/**
 * Requirement lookup map keyed by matrixRowId.
 * Used by Risk and Evidence views to resolve linked requirements.
 */
let _reqMap: Map<string, Requirement> | null = null;
export function getRequirementMap(): Map<string, Requirement> {
  if (!_reqMap) {
    _reqMap = new Map();
    for (const req of getRequirements()) {
      _reqMap.set(req.matrixRowId, req);
    }
  }
  return _reqMap;
}

/**
 * Extract unique non-null values from a field across all requirements.
 * For semicolon-delimited fields, splits and deduplicates individual values.
 */
export function getUniqueValues(
  field: keyof Requirement,
  opts?: { split?: boolean }
): string[] {
  const requirements = getRequirements();
  const values = new Set<string>();

  for (const req of requirements) {
    const raw = req[field];
    if (raw === null || raw === undefined) continue;

    if (opts?.split && typeof raw === 'string') {
      for (const part of raw.split(';')) {
        const trimmed = part.trim();
        if (trimmed) values.add(trimmed);
      }
    } else if (typeof raw === 'string') {
      values.add(raw);
    }
  }

  return Array.from(values).sort();
}

/**
 * Extract unique non-null string values from a given field
 * across an arbitrary array of objects (risks, evidence, etc.).
 */
export function getUniqueFieldValues<T>(
  data: T[],
  field: keyof T
): string[] {
  const values = new Set<string>();
  for (const item of data) {
    const raw = item[field];
    if (raw !== null && raw !== undefined && typeof raw === 'string' && raw.trim()) {
      values.add(raw.trim());
    }
  }
  return Array.from(values).sort();
}

/** Pre-computed filter option sets */
export function getFilterOptions() {
  return {
    businessFunction: getUniqueValues('businessFunctionImpacted', { split: true }),
    primaryPersona: getAllPersonaOptions(getRequirements()),
    lifecycleStage: getUniqueValues('lifecycleStage'),
    severityPriority: ['Critical', 'High', 'Medium'], // Explicit ordering
    jurisdictionRegion: getUniqueValues('jurisdictionRegion'),
    regulatoryDomain: getUniqueValues('regulatoryDomain'),
  };
}

/** All data quality diagnostic issues (read-only) */
export function getDataQualityIssues(): DataQualityIssue[] {
  return dataQualityIssuesData as unknown as DataQualityIssue[];
}

/** All source intake requests (read-only, sample data) */
export function getSourceIntakeRequests(): SourceIntakeRequest[] {
  return sourceIntakeRequestsData as unknown as SourceIntakeRequest[];
}

/** All AI extraction suggestions (read-only, sample data) */
export function getAiSuggestions(): AiExtractionSuggestion[] {
  return aiSuggestionsData as unknown as AiExtractionSuggestion[];
}

/** All AI prompt versions (read-only, sample data) */
export function getAiPromptVersions(): AiPromptVersion[] {
  return aiPromptVersionsData as unknown as AiPromptVersion[];
}

/** All draft validation reviews (read-only, sample data — Phase 3.10) */
export function getDraftValidationReviews(): DraftValidationReview[] {
  return draftValidationReviewsData as unknown as DraftValidationReview[];
}
