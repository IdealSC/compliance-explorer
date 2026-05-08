import * as React from 'react';

/**
 * Shared layout primitives for detail drawers.
 * Extracted from ControlDetailDrawer, ImpactAnalysisDrawer,
 * EvidenceDetailDrawer, and ActionDetailDrawer.
 */

export function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">{children}</div>;
}

export function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground font-semibold">{label}</span>
      <div className="text-xs">{value || '—'}</div>
    </div>
  );
}
