'use client';

import { Badge } from '@/components/ui/badge';

export type ExposureLevel = 'low' | 'medium' | 'high' | 'critical';

const styles: Record<ExposureLevel, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-800',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-800',
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
};

export function ExposureLevelBadge({ level }: { level: ExposureLevel }) {
  return (
    <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${styles[level] ?? styles.low}`}>
      {level}
    </Badge>
  );
}
