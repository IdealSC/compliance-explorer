'use client';

import { cn } from '@/lib/utils';

export interface HealthMetric {
  label: string;
  value: number;
  accent: 'critical' | 'warning' | 'info' | 'default';
}

interface HealthSnapshotProps {
  metrics: HealthMetric[];
}

const ACCENT_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-violet-500',
  default: 'bg-primary/50',
};

export function HealthSnapshot({ metrics }: HealthSnapshotProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-muted/30 px-5 py-3.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Health
      </span>
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
              ACCENT_DOT[m.accent]
            )}
          />
          <span className="text-sm font-bold text-foreground tabular-nums">
            {m.value}
          </span>
          <span className="text-xs text-muted-foreground">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
