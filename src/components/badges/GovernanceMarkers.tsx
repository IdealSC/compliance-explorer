import { Scale, ShieldCheck, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Legal review required marker */
export function LegalReviewMarker({ required, className }: { required: boolean; className?: string }) {
  if (!required) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400', className)}>
      <Scale className="h-3 w-3" />
      Legal Review
    </span>
  );
}

/** Confidence level indicator */
export function ConfidenceIndicator({ level, className }: { level: string | null; className?: string }) {
  if (!level) return null;
  const colors: Record<string, string> = {
    High: 'text-emerald-600 dark:text-emerald-400',
    Medium: 'text-amber-600 dark:text-amber-400',
    Low: 'text-red-600 dark:text-red-400',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider', colors[level] || 'text-muted-foreground', className)}>
      <ShieldCheck className="h-3 w-3" />
      {level}
    </span>
  );
}

/** Source-backed indicator */
export function SourceBackedIndicator({ reference, className }: { reference: string | null; className?: string }) {
  if (!reference) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground', className)}>
      <FileText className="h-3 w-3" />
      Source-backed
    </span>
  );
}

/** Effective date display */
export function EffectiveDateDisplay({ date, className }: { date: string | null; className?: string }) {
  if (!date) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground', className)}>
      <Calendar className="h-3 w-3" />
      Effective: {date}
    </span>
  );
}

/** Record status badge for version timeline */
export function RecordStatusBadge({ status, className }: { status: string; className?: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    draft: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    pending_review: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
    superseded: 'bg-zinc-500/15 text-zinc-500',
    archived: 'bg-zinc-500/15 text-zinc-500',
  };
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', styles[status] || 'bg-muted text-muted-foreground', className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
