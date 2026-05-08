'use client';

import { Badge } from '@/components/ui/badge';
import type { DataQualitySeverity } from '@/types';

const styles: Record<DataQualitySeverity, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-800',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-800',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-300 dark:border-slate-700',
};

export function DataQualitySeverityBadge({ severity }: { severity: DataQualitySeverity }) {
  return (
    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${styles[severity] ?? styles.low}`}>
      {severity}
    </Badge>
  );
}
