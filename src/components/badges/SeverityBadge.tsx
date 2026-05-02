import { cn } from '@/lib/utils';

const SEVERITY_STYLES: Record<string, string> = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  High: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

interface SeverityBadgeProps {
  severity: string | null;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  if (!severity) return <span className="text-muted-foreground text-xs">—</span>;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {severity}
    </span>
  );
}
