/**
 * Normalization utilities for workbook data import.
 * Handles whitespace trimming, null coercion, and flag parsing.
 */

/** Trim whitespace and convert empty/sentinel values to null */
export function normalizeString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '' || str === 'None' || str === 'N/A') return null;
  return str;
}

/** Normalize but preserve "Not specified in source" as null for cleaner UI */
export function normalizeStringStrict(value: unknown): string | null {
  const str = normalizeString(value);
  if (str === 'Not specified in source') return null;
  return str;
}

/** Parse boolean flags from workbook TRUE/FALSE strings */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  const str = String(value).trim().toUpperCase();
  return str === 'TRUE' || str === '1' || str === 'YES';
}

/** Parse number from workbook cell, return 0 if invalid */
export function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Convert a workbook column header to a camelCase field name.
 * e.g., "Matrix Row ID" → "matrixRowId"
 *       "Severity / Priority" → "severityPriority"
 *       "Launch-Critical Flag" → "launchCriticalFlag"
 */
export function headerToCamelCase(header: string): string {
  return header
    .replace(/[\/\-\(\)&]/g, ' ')     // Replace special chars with space
    .replace(/[^a-zA-Z0-9\s]/g, '')   // Remove remaining non-alphanumeric
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}
