/**
 * Shared style constant maps for compliance badges and indicators.
 * Extracted to avoid duplication across page and drawer components.
 */

/** Risk-level → Tailwind class map (used on control cards, drawers) */
export const RISK_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};
