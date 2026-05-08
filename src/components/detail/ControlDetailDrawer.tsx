'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ControlStatusBadge, EvidenceStatusBadge, ActionPriorityBadge, ActionStatusBadge, ConfidenceIndicator, RiskLevelBadge } from '@/components/badges';
import { SampleDataBanner } from '@/components/governance';
import { OperationalUpdatePanel } from '@/components/operational/OperationalUpdatePanel';
import type { ComplianceControl, EvidenceRequirement, OwnerActionItem } from '@/types';
import { fmt } from '@/lib/format';
import { ShieldCheck, Lock, AlertTriangle, Users, ClipboardList, Scale, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ControlDetailDrawerProps {
  control: ComplianceControl | null;
  evidence: EvidenceRequirement[];
  actions: OwnerActionItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  not_started: <Clock className="h-3 w-3 text-slate-400" />,
  in_progress: <Clock className="h-3 w-3 text-sky-500" />,
  completed: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
  blocked: <XCircle className="h-3 w-3 text-red-500" />,
  overdue: <AlertTriangle className="h-3 w-3 text-rose-500" />,
};

export function ControlDetailDrawer({ control, evidence, actions, open, onOpenChange }: ControlDetailDrawerProps) {
  if (!control) return null;
  const c = control;

  // Resolve related evidence & actions
  const relatedEvidence = evidence.filter(e => c.relatedEvidenceIds.includes(e.id));
  const relatedActions = actions.filter(a => a.relatedControlIds.includes(c.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <ControlStatusBadge status={c.controlStatus} />
            <RiskLevelBadge level={c.riskLevel} />
            <Badge variant="outline" className="text-[10px] font-mono">{c.controlType}</Badge>
            {c.confidenceLevel && <ConfidenceIndicator level={c.confidenceLevel} />}
          </div>
          <SheetTitle className="text-base">{c.controlName}</SheetTitle>
          <p className="text-xs text-muted-foreground">{c.id} · Operational control data — does not modify regulatory reference data</p>
        </SheetHeader>

        <div className="space-y-5 py-4">
          <SampleDataBanner />

          {/* A. Control Summary */}
          <Section title="Control Summary" icon={<ShieldCheck className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground mb-3">{c.controlDescription}</p>
            <DetailGrid>
              <DetailItem label="Owner" value={c.controlOwner} />
              <DetailItem label="Business Function" value={c.businessFunction} />
              <DetailItem label="Frequency" value={c.frequency} />
              <DetailItem label="Last Reviewed" value={fmt(c.lastReviewedDate)} />
              <DetailItem label="Next Review" value={fmt(c.nextReviewDate)} />
              <DetailItem label="Governance Status" value={c.governanceStatus} />
            </DetailGrid>
          </Section>

          {/* A½. Operational Update */}
          <OperationalUpdatePanel
            entityType="control"
            entityId={c.id}
            isDatabaseMode={process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'}
            fields={{
              status: {
                current: c.controlStatus,
                options: [
                  { value: 'not_started', label: 'Not Started' },
                  { value: 'designed', label: 'Designed' },
                  { value: 'implemented', label: 'Implemented' },
                  { value: 'operating', label: 'Operating' },
                  { value: 'needs_review', label: 'Needs Review' },
                  { value: 'deficient', label: 'Deficient' },
                  { value: 'retired', label: 'Retired' },
                ],
              },
              notes: { current: c.notes },
              date1: { label: 'Next Review Date', field: 'nextReviewDate', current: c.nextReviewDate },
            }}
          />

          {/* B. Regulatory Linkage */}
          <Section title="Regulatory Linkage" icon={<Lock className="h-4 w-4" />}>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> Linked regulatory reference data is controlled and read-only.
            </p>
            {c.relatedObligationIds.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Obligations</span>
                <div className="flex flex-wrap gap-1 mt-1">{c.relatedObligationIds.map(id => <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>)}</div>
              </div>
            )}
            {c.relatedRegulationIds.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Regulations</span>
                <div className="flex flex-wrap gap-1 mt-1">{c.relatedRegulationIds.map(id => <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>)}</div>
              </div>
            )}
            {c.relatedCrosswalkIds.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Standards / Crosswalks</span>
                <div className="flex flex-wrap gap-1 mt-1">{c.relatedCrosswalkIds.map(id => <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>)}</div>
              </div>
            )}
            {c.relatedImpactAnalysisIds.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Impact Analyses</span>
                <div className="flex flex-wrap gap-1 mt-1">{c.relatedImpactAnalysisIds.map(id => <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>)}</div>
              </div>
            )}
            {c.sourceReference && <DetailItem label="Source Reference" value={c.sourceReference} />}
          </Section>

          {/* C. Evidence Requirements */}
          <Section title={`Evidence Requirements (${relatedEvidence.length})`} icon={<ClipboardList className="h-4 w-4" />}>
            {relatedEvidence.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No evidence requirements linked to this control.</p>
            ) : (
              <div className="space-y-2">
                {relatedEvidence.map(e => (
                  <div key={e.id} className="rounded-lg border border-border p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{e.evidenceName}</span>
                      <EvidenceStatusBadge status={e.evidenceStatus} />
                    </div>
                    <DetailGrid>
                      <DetailItem label="Type" value={e.evidenceType.replace(/_/g, ' ')} />
                      <DetailItem label="Owner" value={e.evidenceOwner} />
                      <DetailItem label="Frequency" value={e.requiredFrequency} />
                      <DetailItem label="Retention" value={e.retentionRequirement} />
                      <DetailItem label="Last Collected" value={fmt(e.lastCollectedDate)} />
                      <DetailItem label="Next Due" value={fmt(e.nextDueDate)} />
                    </DetailGrid>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* D. Owner Action Items */}
          <Section title={`Owner Action Items (${relatedActions.length})`} icon={<Users className="h-4 w-4" />}>
            {relatedActions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No action items linked to this control.</p>
            ) : (
              <div className="space-y-2">
                {relatedActions.map(a => (
                  <div key={a.id} className="rounded-lg border border-border p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {STATUS_ICON[a.actionStatus]}
                      <span className="text-xs font-semibold flex-1">{a.actionTitle}</span>
                      <ActionPriorityBadge priority={a.priority} />
                    </div>
                    <DetailGrid>
                      <DetailItem label="Owner" value={a.owner} />
                      <DetailItem label="Function" value={a.businessFunction} />
                      <DetailItem label="Due" value={fmt(a.dueDate)} />
                      <DetailItem label="Status" value={a.actionStatus.replace(/_/g, ' ')} />
                      {a.dependency && <DetailItem label="Dependency" value={a.dependency} />}
                      <DetailItem label="Risk" value={a.riskIfNotCompleted} />
                    </DetailGrid>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* E. Governance Notes */}
          <Section title="Governance Notes" icon={<Scale className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Confidence Level" value={c.confidenceLevel || '—'} />
              <DetailItem label="Governance Status" value={c.governanceStatus} />
              {c.sourceReference && <DetailItem label="Source Reference" value={c.sourceReference} />}
            </DetailGrid>
            {c.notes && (
              <div className="mt-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Notes</span>
                <p className="text-xs text-muted-foreground mt-0.5">{c.notes}</p>
              </div>
            )}
          </Section>

          {/* Footer */}
          <p className="text-[10px] text-muted-foreground text-center pt-2">
            Pilot v1.4 · Operational compliance layer · Not legal advice
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Helper Components ────────────────────────────────────── */

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">{children}</div>;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-xs text-foreground mt-0.5">{value}</dd>
    </div>
  );
}
