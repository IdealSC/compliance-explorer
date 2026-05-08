import { cn } from '@/lib/utils';

interface DiffDisplayProps {
  previousValue: string | null;
  proposedValue: string | null;
  className?: string;
}

/**
 * Red/green diff-style display for proposed regulatory changes.
 * Shows the previous value (struck-through, red) and proposed value (green).
 */
export function DiffDisplay({ previousValue, proposedValue, className }: DiffDisplayProps) {
  if (!previousValue && !proposedValue) return null;

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden text-xs', className)}>
      {previousValue && (
        <div className="bg-red-500/5 border-b border-border px-3 py-2">
          <span className="font-mono text-red-600 dark:text-red-400 mr-2">−</span>
          <span className="text-muted-foreground">{previousValue}</span>
        </div>
      )}
      {proposedValue && (
        <div className="bg-emerald-500/5 px-3 py-2">
          <span className="font-mono text-emerald-600 dark:text-emerald-400 mr-2">+</span>
          <span className="text-foreground">{proposedValue}</span>
        </div>
      )}
    </div>
  );
}
