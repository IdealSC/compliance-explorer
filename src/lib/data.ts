/**
 * Static data loader — imports generated JSON files.
 * Provides typed accessors for each entity with deduplication utilities.
 */
import type { Requirement, Risk, Evidence } from '@/types';
import requirementsData from '@/data/requirements.json';
import risksData from '@/data/risks.json';
import evidenceData from '@/data/evidence.json';

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
    primaryPersona: getUniqueValues('primaryPersonaViewer'),
    lifecycleStage: getUniqueValues('lifecycleStage'),
    severityPriority: ['Critical', 'High', 'Medium'], // Explicit ordering
    jurisdictionRegion: getUniqueValues('jurisdictionRegion'),
    regulatoryDomain: getUniqueValues('regulatoryDomain'),
  };
}
