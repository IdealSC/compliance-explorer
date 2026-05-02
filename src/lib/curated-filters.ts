/**
 * Curated view inclusion logic — derived from workbook metadata and keyword matching.
 * These are NOT legal applicability determinations.
 */
import type { Requirement } from '@/types';

/**
 * Supply Chain keyword list — matched case-insensitively against
 * operationalProcessImpacted field.
 */
const SUPPLY_CHAIN_KEYWORDS = [
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
];

/**
 * Returns true if a requirement is relevant to the Supply Chain Leader view.
 * Inclusion logic (any of the following):
 * - Primary Persona = "Supply Chain Leader"
 * - Business Function includes "Supply Chain"
 * - Operational Process Impacted contains any supply chain keyword
 */
export function isSupplyChainRelevant(req: Requirement): boolean {
  // 1. Primary persona match
  if (req.primaryPersonaViewer?.includes('Supply Chain')) return true;

  // 2. Business function match (semicolon-delimited)
  if (req.businessFunctionImpacted) {
    const functions = req.businessFunctionImpacted.toLowerCase();
    if (functions.includes('supply chain')) return true;
  }

  // 3. Operational process keyword match
  if (req.operationalProcessImpacted) {
    const processLower = req.operationalProcessImpacted.toLowerCase();
    for (const keyword of SUPPLY_CHAIN_KEYWORDS) {
      if (processLower.includes(keyword)) return true;
    }
  }

  return false;
}

/**
 * Returns true if a requirement is launch-critical.
 */
export function isLaunchCritical(req: Requirement): boolean {
  return req.launchCriticalFlag === true;
}
