'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ActionStatusBadge, ActionPriorityBadge } from '@/components/badges';
import { SampleDataBanner } from '@/components/governance';
import { OperationalUpdatePanel } from '@/components/operational/OperationalUpdatePanel';
import type { OwnerActionItem } from '@/types';
import { fmt } from '@/lib/format';
import { Users, Lock, AlertTriangle, Scale, CheckCircle2, XCircle, Clock, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Section, DetailGrid, DetailItem } from '@/components/detail/DrawerPrimitives';

interface ActionDetailDrawerProps {
  action: OwnerActionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  not_started: <Clock className="h-4 w-4 text-slate-400" />,
  in_progress: <Clock className="h-4 w-4 text-sky-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  blocked: <XCircle className="h-4 w-4 text-red-500" />,
  overdue: <AlertTriangle className="h-4 w-4 text-rose-500" />,
};

export function ActionDetailDrawer({ action, open, onOpenChange }: ActionDetailDrawerProps) {
  if (!action) return null;
  const a = action;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SampleDataBanner />
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2 items-center">
            {STATUS_ICON[a.actionStatus]}
            <ActionStatusBadge status={a.actionStatus} />
            <ActionPriorityBadge priority={a.priority} />
          </div>
          <SheetTitle className="text-base leading-tight">{a.actionTitle}</SheetTitle>
          <p className="text-xs text-muted-foreground">{a.actionDescription}</p>
          <Badge variant="secondary" className="text-[10px] font-mono w-fit">{a.id}</Badge>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* A. Ownership & Schedule */}
          <Section title="Ownership & Schedule" icon={<Users className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Owner" value={a.owner} />
              <DetailItem label="Business Function" value={
                <Link href={`/business-functions`} className="text-primary hover:underline">{a.businessFunction}</Link>
              } />
              <DetailItem label="Due Date" value={fmt(a.dueDate)} />
              <DetailItem label="Status" value={a.actionStatus.replace(/_/g, ' ')} />
              <DetailItem label="Priority" value={a.priority} />
              {a.dependency && <DetailItem label="Dependency" value={a.dependency} />}
            </DetailGrid>
          </Section>

          {/* A½. Operational Update */}
          <OperationalUpdatePanel
            entityType="action"
            entityId={a.id}
            isDatabaseMode={process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'}
            fields={{
              status: {
                current: a.actionStatus,
                options: [
                  { value: 'not_started', label: 'Not Started' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'blocked', label: 'Blocked' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'overdue', label: 'Overdue' },
                ],
              },
              notes: { current: a.notes },
              date1: { label: 'Due Date', field: 'dueDate', current: a.dueDate },
            }}
          />

          {/* B. Risk */}
          <Section title="Risk if Not Completed" icon={<AlertTriangle className="h-4 w-4" />}>
            <div className={`rounded-lg p-3 ${
              a.priority === 'critical' || a.actionStatus === 'overdue'
                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40'
                : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40'
            }`}>
              <p className={`text-xs ${
                a.priority === 'critical' || a.actionStatus === 'overdue'
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-amber-800 dark:text-amber-300'
              }`}>{a.riskIfNotCompleted}</p>
            </div>
          </Section>

          {/* C. Recommended Next Step */}
          <Section title="Recommended Next Step" icon={<Lightbulb className="h-4 w-4" />}>
            <div className="rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 p-3">
              <p className="text-xs text-sky-800 dark:text-sky-300">
                {a.actionStatus === 'not_started' ? 'Assign this action to the responsible owner and set a start date.' :
                 a.actionStatus === 'in_progress' ? 'Continue execution and verify evidence collection is on track.' :
                 a.actionStatus === 'blocked' ? 'Resolve the blocking dependency and escalate if needed.' :
                 a.actionStatus === 'overdue' ? 'Escalate immediately. Assess impact of delay and re-prioritize.' :
                 a.actionStatus === 'completed' ? 'Verify completion evidence and close out the action item.' :
                 'Review and determine appropriate next step.'}
              </p>
            </div>
          </Section>

          {/* D. Regulatory Linkage */}
          <Section title="Regulatory Linkage" icon={<Lock className="h-4 w-4" />}>
            <p className="text-[10px] text-muted-foreground mb-2">
              These are read-only references to controlled regulatory data. Completing an action does not modify the underlying obligations or regulations.
            </p>
            <DetailGrid>
              <DetailItem label="Controls" value={
                a.relatedControlIds.length > 0
                  ? a.relatedControlIds.map(id => (
                      <Link key={id} href={`/controls-evidence?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                    ))
                  : '—'
              } />
              <DetailItem label="Evidence" value={
                a.relatedEvidenceIds.length > 0
                  ? a.relatedEvidenceIds.map(id => (
                      <Link key={id} href={`/controls-evidence?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                    ))
                  : '—'
              } />
              <DetailItem label="Obligations" value={
                a.relatedObligationIds.length > 0
                  ? a.relatedObligationIds.map(id => (
                      <Link key={id} href={`/obligations?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                    ))
                  : '—'
              } />
              {a.relatedImpactAnalysisIds.length > 0 && (
                <DetailItem label="Impact Analyses" value={
                  a.relatedImpactAnalysisIds.map(id => (
                    <Link key={id} href={`/impact-analysis?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>
                  ))
                } />
              )}
            </DetailGrid>
            {a.sourceReference && (
              <div className="mt-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Source: </span>
                <span className="text-[10px] text-muted-foreground">{a.sourceReference}</span>
              </div>
            )}
          </Section>

          {/* E. Governance Notes */}
          <Section title="Governance Notes" icon={<Scale className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground italic">
              Action items are operational compliance data. Completing this action does not change or publish any law, regulation, obligation, standard, citation, or crosswalk mapping.
            </p>
          </Section>
        </div>

        {/* Footer disclaimer */}
        <div className="border-t border-border pt-3 mt-2">
          <p className="text-[10px] text-muted-foreground">
            Owner actions are operational compliance data. Not legal advice. Not a validated GxP system.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}



