'use client';

import { Badge } from '@/components/ui/badge';
import type { DataQualityStatus } from '@/types';

const styles: Record<DataQualityStatus, string> = {
  open: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-300 dark:border-rose-800',
  in_review: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400 border-sky-300 dark:border-sky-800',
  planned: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800',
  resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
  deferred: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700',
};

const labels: Record<DataQualityStatus, string> = {
  open: 'Open',
  in_review: 'In Review',
  planned: 'Planned',
  resolved: 'Resolved',
  deferred: 'Deferred',
};

export function DataQualityStatusBadge({ status }: { status: DataQualityStatus }) {
  return (
    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${styles[status] ?? styles.open}`}>
      {labels[status] ?? status}
    </Badge>
  );
}
