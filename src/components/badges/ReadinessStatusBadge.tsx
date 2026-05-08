'use client';

import { Badge } from '@/components/ui/badge';

export type ReadinessStatus = 'strong' | 'moderate' | 'needs_attention' | 'not_ready';

const styles: Record<ReadinessStatus, string> = {
  strong: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-800',
  needs_attention: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-800',
  not_ready: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800',
};

const labels: Record<ReadinessStatus, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  needs_attention: 'Needs Attention',
  not_ready: 'Not Ready',
};

export function ReadinessStatusBadge({ status }: { status: ReadinessStatus }) {
  return (
    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${styles[status] ?? styles.moderate}`}>
      {labels[status] ?? status}
    </Badge>
  );
}
