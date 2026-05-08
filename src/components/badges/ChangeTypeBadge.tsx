import { cn } from '@/lib/utils';

const CHANGE_TYPE_STYLES: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amendment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  repeal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  guidance: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  standard_update: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  interpretation_update: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  new: 'New',
  amendment: 'Amendment',
  repeal: 'Repeal',
  guidance: 'Guidance',
  standard_update: 'Standard Update',
  interpretation_update: 'Interpretation',
};

interface ChangeTypeBadgeProps {
  type: string;
  className?: string;
}

export function ChangeTypeBadge({ type, className }: ChangeTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        CHANGE_TYPE_STYLES[type] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {CHANGE_TYPE_LABELS[type] || type}
    </span>
  );
}
