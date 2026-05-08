/**
 * Shared date formatting utility for compliance display components.
 * Converts YYYY-MM-DD strings to readable locale dates.
 * Returns '—' for null/undefined values.
 */
export function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
