import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  in_progress: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  needs_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  complete: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  complete: 'Complete',
};

interface ImpactStatusBadgeProps {
  status: string;
  className?: string;
}

export function ImpactStatusBadge({ status, className }: ImpactStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
    </span>
  );
}
