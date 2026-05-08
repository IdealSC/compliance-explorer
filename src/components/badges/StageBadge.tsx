import { cn } from '@/lib/utils';

const STAGE_STYLES: Record<string, string> = {
  intake: 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
  triage: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  draft_mapping: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STAGE_LABELS: Record<string, string> = {
  intake: 'Intake',
  triage: 'Triage',
  draft_mapping: 'Draft Mapping',
  review: 'Review',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
};

interface StageBadgeProps {
  stage: string;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        STAGE_STYLES[stage] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {STAGE_LABELS[stage] || stage}
    </span>
  );
}
