/**
 * Derived persona matching layer.
 *
 * Instead of relying solely on the `primaryPersonaViewer` workbook field,
 * this module scans multiple requirement fields for persona-relevant terms
 * to produce a broader, more realistic set of relevant personas.
 *
 * The original `primaryPersonaViewer` field is never mutated.
 */
import type { Requirement } from '@/types';

/* ── Persona keyword dictionaries ─────────────────────────── */

/**
 * Quality Leader matching terms — case-insensitive.
 * Sourced from GxP, FDA/EMA regulatory language, and pharma quality vocabulary.
 */
const QUALITY_TERMS: string[] = [
  'quality',
  'qa',
  'quality assurance',
  'quality unit',
  'qms',
  'pqs',
  'gmp',
  'cgmp',
  'gdp',
  'batch release',
  'batch record',
  'quarantine',
  'disposition',
  'deviation',
  'capa',
  'complaint',
  'recall',
  'investigation',
  'suspect product',
  'illegitimate product',
  'qta',
  'quality agreement',
  'audit trail',
  'data integrity',
  'part 11',
  'annex 11',
  'validation',
  'document control',
];

/**
 * Supply Chain Leader matching terms — case-insensitive.
 * Mirrors SUPPLY_CHAIN_KEYWORDS from curated-filters.ts plus broader terms.
 */
const SUPPLY_CHAIN_TERMS: string[] = [
  'supply chain',
  'logistics',
  'distribution',
  '3pl',
  'serialization',
  'epcis',
  'vrs',
  'returns',
  'cold chain',
  'inventory',
  'importation',
  'shortage',
  'supplier',
  'warehouse',
  'order',
  'customer',
  'dscsa',
  'procurement',
  'shipping',
  'transport',
  'customs',
  'import',
  'export',
  'traceability',
];

/* ── Persona config: { label, terms } ────────────────────── */

interface PersonaConfig {
  label: string;
  terms: string[];
}

const PERSONA_CONFIGS: PersonaConfig[] = [
  { label: 'Quality Leader', terms: QUALITY_TERMS },
  { label: 'Supply Chain Leader', terms: SUPPLY_CHAIN_TERMS },
];

/* ── Fields scanned for keyword matching ─────────────────── */

/**
 * The list of Requirement fields to scan for persona-relevant terms.
 * These are the "broad secondary match" fields.
 */
const SCAN_FIELDS: (keyof Requirement)[] = [
  'primaryPersonaViewer',
  'businessFunctionImpacted',
  'exampleBusinessOwner',
  'requiredControl',
  'requiredEvidenceDocumentation',
  'operationalProcessImpacted',
  'plainEnglishInterpretation',
  'implementationNotes',
  'riskOfNonCompliance',
];

/* ── Core API ────────────────────────────────────────────── */

/**
 * Returns an array of persona labels relevant to a given requirement.
 * Includes:
 *   1. The explicit `primaryPersonaViewer` value (if set)
 *   2. Any persona whose keyword list matches content in the scanned fields
 *
 * Results are deduplicated. The original requirement data is not mutated.
 */
export function getRelevantPersonas(req: Requirement): string[] {
  const personas = new Set<string>();

  // 1. Always include the explicit primary persona
  if (req.primaryPersonaViewer) {
    personas.add(req.primaryPersonaViewer);
  }

  // 2. Derive additional personas from field content scanning
  // Build the combined haystack once per requirement
  const haystack = SCAN_FIELDS
    .map((field) => {
      const val = req[field];
      return typeof val === 'string' ? val : '';
    })
    .join(' ')
    .toLowerCase();

  for (const config of PERSONA_CONFIGS) {
    if (personas.has(config.label)) continue; // Already matched explicitly
    for (const term of config.terms) {
      if (haystack.includes(term)) {
        personas.add(config.label);
        break; // One match is sufficient
      }
    }
  }

  return Array.from(personas);
}

/**
 * Returns true if a requirement matches any of the selected persona filters
 * using derived matching (not just primaryPersonaViewer).
 */
export function matchesPersonaFilter(req: Requirement, selectedPersonas: string[]): boolean {
  if (selectedPersonas.length === 0) return true;
  const relevantPersonas = getRelevantPersonas(req);
  return selectedPersonas.some((p) => relevantPersonas.includes(p));
}

/**
 * Returns the full set of persona labels that appear across all requirements
 * (both explicit and derived). Used to populate the filter dropdown.
 */
export function getAllPersonaOptions(requirements: Requirement[]): string[] {
  const all = new Set<string>();
  for (const req of requirements) {
    for (const p of getRelevantPersonas(req)) {
      all.add(p);
    }
  }
  return Array.from(all).sort();
}
