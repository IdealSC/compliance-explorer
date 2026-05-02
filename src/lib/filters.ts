/**
 * Filter utilities for multi-value fields and controlled vocabulary matching.
 */
import type { Requirement } from '@/types';

/** Split semicolon-delimited fields into individual values */
export function splitMultiValue(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(';')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/** Check if a requirement matches a set of active filters */
export interface FilterState {
  search: string;
  businessFunction: string[];
  primaryPersona: string[];
  lifecycleStage: string[];
  severityPriority: string[];
  launchCritical: boolean | null;     // null = show all
  needsReview: boolean | null;        // null = show all
  jurisdictionRegion: string[];
  regulatoryDomain: string[];
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  businessFunction: [],
  primaryPersona: [],
  lifecycleStage: [],
  severityPriority: [],
  launchCritical: null,
  needsReview: null,
  jurisdictionRegion: [],
  regulatoryDomain: [],
};

/** Apply all active filters to a requirement */
export function matchesFilters(req: Requirement, filters: FilterState): boolean {
  // Full-text search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    const searchable = [
      req.matrixRowId,
      req.regulatoryDomain,
      req.lawRegulationFrameworkStandardName,
      req.level3RequirementArea,
      req.uiDisplaySummary,
      req.requiredAction,
      req.requiredEvidenceDocumentation,
      req.businessFunctionImpacted,
      req.sourceNoteSourceReference,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!searchable.includes(searchLower)) return false;
  }

  // Multi-value field: Business Function
  if (filters.businessFunction.length > 0) {
    const reqFunctions = splitMultiValue(req.businessFunctionImpacted);
    if (!filters.businessFunction.some((f) => reqFunctions.includes(f))) return false;
  }

  // Single-value filters
  if (filters.primaryPersona.length > 0) {
    if (!req.primaryPersonaViewer || !filters.primaryPersona.includes(req.primaryPersonaViewer)) return false;
  }

  if (filters.lifecycleStage.length > 0) {
    if (!req.lifecycleStage || !filters.lifecycleStage.includes(req.lifecycleStage)) return false;
  }

  if (filters.severityPriority.length > 0) {
    if (!req.severityPriority || !filters.severityPriority.includes(req.severityPriority)) return false;
  }

  if (filters.jurisdictionRegion.length > 0) {
    if (!req.jurisdictionRegion || !filters.jurisdictionRegion.includes(req.jurisdictionRegion)) return false;
  }

  if (filters.regulatoryDomain.length > 0) {
    if (!req.regulatoryDomain || !filters.regulatoryDomain.includes(req.regulatoryDomain)) return false;
  }

  // Boolean flags
  if (filters.launchCritical !== null) {
    if (req.launchCriticalFlag !== filters.launchCritical) return false;
  }

  if (filters.needsReview !== null) {
    if (req.needsReviewFlag !== filters.needsReview) return false;
  }

  return true;
}
