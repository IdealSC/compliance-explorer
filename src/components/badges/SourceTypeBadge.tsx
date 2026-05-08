import { cn } from '@/lib/utils';

const TYPE_STYLES: Record<string, string> = {
  law: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400',
  regulation: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400',
  standard: 'border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-400',
  guidance: 'border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400',
  framework: 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400',
  regulator_notice: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
  internal_note: 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400',
  pdf: 'border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400',
  spreadsheet: 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400',
  website: 'border-cyan-300 text-cyan-700 dark:border-cyan-700 dark:text-cyan-400',
  other: 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400',
};

export function SourceTypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', TYPE_STYLES[type] || TYPE_STYLES.other, className)}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}
