'use client';

import { cn } from '@/lib/utils';
import type { FunctionImpact } from '@/types';

interface BusinessFunctionCardProps {
  fn: FunctionImpact;
  obligationCount: number;
  isActive: boolean;
  onClick: () => void;
}

export function BusinessFunctionCard({
  fn,
  obligationCount,
  isActive,
  onClick,
}: BusinessFunctionCardProps) {
  const phases = fn.primaryScorPhases
    ? fn.primaryScorPhases.split(';').map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <button
      type="button"
      onClick={onClick}
      data-active={isActive}
      className={cn(
        'function-card flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left ring-1 ring-transparent w-full',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground leading-tight">
          {fn.businessFunction}
        </h3>
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
          {obligationCount}
        </span>
      </div>

      {phases.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {phases.map((phase) => (
            <span
              key={phase}
              className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {phase}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
        {fn.highestRiskQuestions}
      </p>

      <p className="text-[10px] text-muted-foreground/60 leading-snug line-clamp-2">
        {fn.whatTheyNeedToActOn}
      </p>
    </button>
  );
}
