'use client';

import { cn } from '@/lib/utils';

interface BooleanFilterProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

export function BooleanFilter({ label, value, onChange }: BooleanFilterProps) {
  const cycle = () => {
    // null → true → false → null
    if (value === null) onChange(true);
    else if (value === true) onChange(false);
    else onChange(null);
  };

  return (
    <button
      onClick={cycle}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
        value === true
          ? 'border-primary/40 bg-primary/5 text-primary'
          : value === false
            ? 'border-rose-400/40 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
            : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {label}
      {value !== null && (
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
          {value ? 'Yes' : 'No'}
        </span>
      )}
    </button>
  );
}
