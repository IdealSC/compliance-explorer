import { cn } from '@/lib/utils';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

interface ImpactSeverityBadgeProps {
  severity: string;
  className?: string;
}

export function ImpactSeverityBadge({ severity, className }: ImpactSeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {severity}
    </span>
  );
}
