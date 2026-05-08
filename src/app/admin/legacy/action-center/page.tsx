'use client';

import * as React from 'react';
import Link from 'next/link';
import { splitMultiValue } from '@/lib/filters';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/filters/SearchInput';
import {
  ControlStatusBadge, EvidenceStatusBadge, ActionPriorityBadge,
  ActionStatusBadge, ImpactSeverityBadge, ImpactStatusBadge,
  RiskLevelBadge, ConfidenceIndicator,
} from '@/components/badges';
import { SampleDataBanner, GovernanceWarningBanner } from '@/components/governance';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import {
  getComplianceControls, getEvidenceRequirements, getOwnerActions,
  getImpactAnalyses, getRequirements,
} from '@/lib/data';
import { EvidenceDetailDrawer } from '@/components/detail/EvidenceDetailDrawer';
import { ActionDetailDrawer } from '@/components/detail/ActionDetailDrawer';
import type { ComplianceControl, EvidenceRequirement, OwnerActionItem, RegulatoryImpactAnalysis, Requirement } from '@/types';
import { fmt } from '@/lib/format';
import {
  ShieldCheck, ClipboardList, Users, AlertTriangle, Calendar,
  CheckCircle2, XCircle, Clock, Eye, Ban, BarChart3, Network,
  Target, Zap, ChevronDown, Lock,
} from 'lucide-react';

// ═══ Constants ═══════════════════════════════════════════════════

const FUNCTIONS = [
  'All Functions',
  'Supply Chain', 'Procurement', 'Operations', 'Quality',
  'Legal', 'Compliance', 'Risk', 'Executive Leadership',
] as const;

const SECTIONS = ['priority', 'evidence', 'controls', 'impacts', 'obligations'] as const;
type SectionKey = typeof SECTIONS[number];
const SECTION_META: Record<SectionKey, { label: string; icon: React.ReactNode }> = {
  priority:    { label: 'Priority Work Queue',        icon: <Zap className="h-4 w-4" /> },
  evidence:    { label: 'Evidence Issues',            icon: <ClipboardList className="h-4 w-4" /> },
  controls:    { label: 'Control Issues',             icon: <ShieldCheck className="h-4 w-4" /> },
  impacts:     { label: 'Regulatory Change Impacts',  icon: <BarChart3 className="h-4 w-4" /> },
  obligations: { label: 'High-Risk Obligations',      icon: <Network className="h-4 w-4" /> },
};

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// ═══ Helpers ═════════════════════════════════════════════════════

function matchesFunction(fn: string, filter: string): boolean {
  if (filter === 'All Functions') return true;
  return fn.toLowerCase().includes(filter.toLowerCase());
}

function matchesSearch(q: string, ...fields: (string | null | undefined)[]): boolean {
  if (!q) return true;
  const lc = q.toLowerCase();
  return fields.some(f => f?.toLowerCase().includes(lc));
}

/** Lower rank = more urgent. Used to sort the Priority Work Queue. */
function urgencyRank(a: OwnerActionItem): number {
  let rank = (PRIORITY_ORDER[a.priority] ?? 3) * 100;
  if (a.actionStatus === 'overdue') rank -= 500;
  if (a.actionStatus === 'blocked') rank -= 200;
  if (a.dueDate) {
    const days = (new Date(a.dueDate).getTime() - Date.now()) / 864e5;
    if (days < 0) rank -= 300;
    else if (days <= 14) rank -= 50;
  }
  return rank;
}

// ═══ Page ════════════════════════════════════════════════════════

export default function ActionCenterPage() {
  const controls = React.useMemo(() => getComplianceControls(), []);
  const evidence = React.useMemo(() => getEvidenceRequirements(), []);
  const actions  = React.useMemo(() => getOwnerActions(), []);
  const impacts  = React.useMemo(() => getImpactAnalyses(), []);
  const reqs     = React.useMemo(() => getRequirements(), []);

  const [fnFilter, setFnFilter] = React.useState('All Functions');
  const [search, setSearch] = React.useState('');
  const [expandedSections, setExpandedSections] = React.useState<Set<SectionKey>>(new Set(['priority']));

  // Drawer state
  const [selEvidence, setSelEvidence] = React.useState<EvidenceRequirement | null>(null);
  const [evdDrawerOpen, setEvdDrawerOpen] = React.useState(false);
  const [selAction, setSelAction] = React.useState<OwnerActionItem | null>(null);
  const [actDrawerOpen, setActDrawerOpen] = React.useState(false);

  const toggle = (s: SectionKey) => setExpandedSections(prev => {
    const next = new Set(prev);
    next.has(s) ? next.delete(s) : next.add(s);
    return next;
  });

  // ── Filtered data ────────────────────────────────────────────
  const fActions = React.useMemo(() => {
    return actions
      .filter(a => a.actionStatus !== 'completed')
      .filter(a => matchesFunction(a.businessFunction, fnFilter))
      .filter(a => matchesSearch(search, a.actionTitle, a.owner, a.id, a.businessFunction))
      .sort((a, b) => urgencyRank(a) - urgencyRank(b));
  }, [actions, fnFilter, search]);

  const fEvidence = React.useMemo(() => {
    return evidence
      .filter(e => ['missing','expired','rejected','under_review'].includes(e.evidenceStatus) ||
        (e.nextDueDate && (new Date(e.nextDueDate).getTime() - Date.now()) / 864e5 <= 30 && (new Date(e.nextDueDate).getTime() - Date.now()) >= 0))
      .filter(e => matchesFunction(e.businessFunction, fnFilter))
      .filter(e => matchesSearch(search, e.evidenceName, e.evidenceOwner, e.id, e.businessFunction));
  }, [evidence, fnFilter, search]);

  const fControls = React.useMemo(() => {
    return controls
      .filter(c => ['deficient','needs_review','not_started'].includes(c.controlStatus) || c.riskLevel === 'critical' || c.riskLevel === 'high')
      .filter(c => matchesFunction(c.businessFunction, fnFilter))
      .filter(c => matchesSearch(search, c.controlName, c.controlOwner, c.id, c.businessFunction));
  }, [controls, fnFilter, search]);

  const fImpacts = React.useMemo(() => {
    return impacts
      .filter(i => {
        if (fnFilter === 'All Functions') return true;
        return i.impactedBusinessFunctions.some(bf => matchesFunction(bf.functionName, fnFilter));
      })
      .filter(i => matchesSearch(search, i.updateTitle, i.sourceName, i.id));
  }, [impacts, fnFilter, search]);

  const fReqs = React.useMemo(() => {
    return reqs
      .filter(r => r.severityPriority === 'Critical' || r.severityPriority === 'High')
      .filter(r => {
        if (fnFilter === 'All Functions') return true;
        if (!r.businessFunctionImpacted) return false;
        return splitMultiValue(r.businessFunctionImpacted).some(
          fn => fn.toLowerCase() === fnFilter.toLowerCase()
        );
      })
      .filter(r => matchesSearch(search, r.matrixRowId, r.plainEnglishInterpretation, r.lawRegulationFrameworkStandardName));
  }, [reqs, fnFilter, search]);

  // ── Metrics ──────────────────────────────────────────────────
  const metrics = React.useMemo(() => {
    const fnActions = actions.filter(a => matchesFunction(a.businessFunction, fnFilter));
    const openActions = fnActions.filter(a => a.actionStatus !== 'completed');
    const fnEvidence = evidence.filter(e => matchesFunction(e.businessFunction, fnFilter));
    const fnControls = controls.filter(c => matchesFunction(c.businessFunction, fnFilter));
    return {
      openActions: openActions.length,
      overdue: openActions.filter(a => a.actionStatus === 'overdue').length,
      dueSoon: openActions.filter(a => a.dueDate && (new Date(a.dueDate).getTime() - Date.now()) / 864e5 <= 14 && (new Date(a.dueDate).getTime() - Date.now()) >= 0).length,
      highPriority: openActions.filter(a => a.priority === 'critical' || a.priority === 'high').length,
      missingEvd: fnEvidence.filter(e => e.evidenceStatus === 'missing').length,
      expiredEvd: fnEvidence.filter(e => e.evidenceStatus === 'expired').length,
      evdDueSoon: fnEvidence.filter(e => {
        if (!e.nextDueDate) return false;
        const days = (new Date(e.nextDueDate).getTime() - Date.now()) / 864e5;
        return days >= 0 && days <= 30;
      }).length,
      deficient: fnControls.filter(c => c.controlStatus === 'deficient').length,
      needsReview: fnControls.filter(c => c.controlStatus === 'needs_review').length,
      impactsAttention: fImpacts.filter(i => i.impactStatus !== 'complete').length,
    };
  }, [actions, evidence, controls, fImpacts, fnFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Owner Action Center"
        description="See what each owner or function needs to do next — overdue actions, missing evidence, deficient controls, and regulatory impacts."
      />
      <SampleDataBanner />
      <GovernanceWarningBanner>
        The Action Center shows operational compliance work. It references — but does not modify — active regulatory reference data such as laws, regulations, obligations, or standards.
      </GovernanceWarningBanner>

      {/* ── Function Selector + Search ───────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg p-1 flex-wrap">
          {FUNCTIONS.map(fn => (
            <button key={fn} onClick={() => setFnFilter(fn)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                fnFilter === fn ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>{fn}</button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search actions, evidence, controls…" className="max-w-xs" />
      </div>

      {/* ── Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3">
        <MetricCard label="Open Actions" value={metrics.openActions} icon={<Target className="h-4 w-4" />} />
        <MetricCard label="Overdue" value={metrics.overdue} icon={<Clock className="h-4 w-4" />} variant={metrics.overdue > 0 ? 'red' : 'default'} />
        <MetricCard label="Due ≤ 2 Weeks" value={metrics.dueSoon} icon={<Calendar className="h-4 w-4" />} variant={metrics.dueSoon > 0 ? 'amber' : 'default'} />
        <MetricCard label="High Priority" value={metrics.highPriority} icon={<AlertTriangle className="h-4 w-4" />} variant={metrics.highPriority > 0 ? 'amber' : 'default'} />
        <MetricCard label="Missing Evidence" value={metrics.missingEvd} icon={<Ban className="h-4 w-4" />} variant={metrics.missingEvd > 0 ? 'red' : 'default'} />
        <MetricCard label="Expired Evidence" value={metrics.expiredEvd} icon={<XCircle className="h-4 w-4" />} variant={metrics.expiredEvd > 0 ? 'red' : 'default'} />
        <MetricCard label="Evd Due ≤ 30d" value={metrics.evdDueSoon} icon={<Calendar className="h-4 w-4" />} variant={metrics.evdDueSoon > 0 ? 'amber' : 'default'} />
        <MetricCard label="Deficient Controls" value={metrics.deficient} icon={<ShieldCheck className="h-4 w-4" />} variant={metrics.deficient > 0 ? 'red' : 'default'} />
        <MetricCard label="Needs Review" value={metrics.needsReview} icon={<Eye className="h-4 w-4" />} variant={metrics.needsReview > 0 ? 'amber' : 'default'} />
        <MetricCard label="Reg. Impacts" value={metrics.impactsAttention} icon={<BarChart3 className="h-4 w-4" />} variant={metrics.impactsAttention > 0 ? 'amber' : 'default'} />
      </div>

      {/* ── Collapsible Sections ──────────────────────────────── */}
      {SECTIONS.map(sectionKey => {
        const meta = SECTION_META[sectionKey];
        const count = sectionKey === 'priority' ? fActions.length
          : sectionKey === 'evidence' ? fEvidence.length
          : sectionKey === 'controls' ? fControls.length
          : sectionKey === 'impacts' ? fImpacts.length
          : fReqs.length;
        const isOpen = expandedSections.has(sectionKey);

        return (
          <section key={sectionKey} className="border border-border rounded-lg overflow-hidden">
            <button onClick={() => toggle(sectionKey)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left">
              {meta.icon}
              <span className="text-sm font-semibold flex-1">{meta.label}</span>
              <Badge variant="secondary" className="text-[10px] tabular-nums">{count}</Badge>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="p-4 space-y-3">
                {sectionKey === 'priority' && <PriorityQueue items={fActions} onSelect={(a) => { setSelAction(a); setActDrawerOpen(true); }} />}
                {sectionKey === 'evidence' && <EvidenceIssues items={fEvidence} onSelect={(e) => { setSelEvidence(e); setEvdDrawerOpen(true); }} />}
                {sectionKey === 'controls' && <ControlIssues items={fControls} />}
                {sectionKey === 'impacts' && <ImpactSection items={fImpacts} />}
                {sectionKey === 'obligations' && <ObligationSection items={fReqs} />}
              </div>
            )}
          </section>
        );
      })}

      {/* ── Drawers ───────────────────────────────────────────── */}
      <EvidenceDetailDrawer evidence={selEvidence} open={evdDrawerOpen} onOpenChange={setEvdDrawerOpen} />
      <ActionDetailDrawer action={selAction} open={actDrawerOpen} onOpenChange={setActDrawerOpen} />
    </div>
  );
}

// ═══ Section Renderers ═══════════════════════════════════════════

function PriorityQueue({ items, onSelect }: { items: OwnerActionItem[]; onSelect: (a: OwnerActionItem) => void }) {
  if (items.length === 0) return <FilterEmptyState label="No actions match current filters." />;
  return (
    <div className="space-y-2">
      {items.slice(0, 20).map(a => {
        const isFlagged = a.actionStatus === 'overdue' || a.actionStatus === 'blocked' || a.priority === 'critical';
        return (
          <Card key={a.id} className={`cursor-pointer hover:ring-1 hover:ring-primary/30 transition-shadow ${isFlagged ? 'border-red-500/30' : ''}`}
            onClick={() => onSelect(a)}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                <StatusIcon status={a.actionStatus} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">{a.id}</Badge>
                    <span className="text-xs font-semibold truncate">{a.actionTitle}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{a.actionDescription}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <ActionStatusBadge status={a.actionStatus} />
                    <ActionPriorityBadge priority={a.priority} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
                <span><strong>Owner:</strong> {a.owner}</span>
                <span><strong>Function:</strong> <Link href="/business-functions" className="text-primary hover:underline">{a.businessFunction}</Link></span>
                <span><strong>Due:</strong> {fmt(a.dueDate)}</span>
                {a.relatedControlIds.length > 0 && (
                  <span><strong>Controls:</strong> {a.relatedControlIds.map(id => <Link key={id} href={`/controls-evidence?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>)}</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground"><strong>Risk:</strong> {a.riskIfNotCompleted}</p>
            </CardContent>
          </Card>
        );
      })}
      {items.length > 20 && <p className="text-xs text-muted-foreground text-center">Showing 20 of {items.length} actions</p>}
    </div>
  );
}

function EvidenceIssues({ items, onSelect }: { items: EvidenceRequirement[]; onSelect: (e: EvidenceRequirement) => void }) {
  if (items.length === 0) return <FilterEmptyState label="No evidence issues match current filters." />;
  return (
    <div className="space-y-2">
      {items.map(e => (
        <Card key={e.id} className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-shadow" onClick={() => onSelect(e)}>
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{e.id}</Badge>
              <span className="text-xs font-semibold truncate flex-1">{e.evidenceName}</span>
              <EvidenceStatusBadge status={e.evidenceStatus} />
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{e.evidenceDescription}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
              <span><strong>Owner:</strong> {e.evidenceOwner}</span>
              <span><strong>Function:</strong> {e.businessFunction}</span>
              <span><strong>Due:</strong> {fmt(e.nextDueDate)}</span>
              <span><strong>Freq:</strong> {e.requiredFrequency}</span>
            </div>
            {e.relatedControlIds.length > 0 && (
              <div className="text-[10px] text-muted-foreground">
                <strong>Controls:</strong> {e.relatedControlIds.map(id => <Link key={id} href={`/controls-evidence?search=${id}`} className="text-primary hover:underline mr-1" onClick={ev => ev.stopPropagation()}>{id}</Link>)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ControlIssues({ items }: { items: ComplianceControl[] }) {
  if (items.length === 0) return <FilterEmptyState label="No control issues match current filters." />;
  return (
    <div className="space-y-2">
      {items.map(c => (
        <Card key={c.id}>
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Link href={`/controls-evidence?search=${c.id}`} className="contents">
                <Badge variant="outline" className="text-[10px] font-mono shrink-0 text-primary hover:underline">{c.id}</Badge>
              </Link>
              <span className="text-xs font-semibold truncate flex-1">{c.controlName}</span>
              <ControlStatusBadge status={c.controlStatus} />
              <RiskLevelBadge level={c.riskLevel} />
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{c.controlDescription}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
              <span><strong>Owner:</strong> {c.controlOwner}</span>
              <span><strong>Function:</strong> {c.businessFunction}</span>
              <span><strong>Type:</strong> {c.controlType}</span>
              <span><strong>Next Review:</strong> {fmt(c.nextReviewDate)}</span>
            </div>
            {c.relatedObligationIds.length > 0 && (
              <div className="text-[10px] text-muted-foreground">
                <strong>Obligations:</strong> {c.relatedObligationIds.slice(0, 4).map(id => <Link key={id} href={`/obligations?search=${id}`} className="text-primary hover:underline mr-1">{id}</Link>)}
                {c.relatedObligationIds.length > 4 && <span>+{c.relatedObligationIds.length - 4} more</span>}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ImpactSection({ items }: { items: RegulatoryImpactAnalysis[] }) {
  if (items.length === 0) return <FilterEmptyState label="No regulatory impacts match current filters." />;
  return (
    <div className="space-y-2">
      {items.map(i => (
        <Card key={i.id}>
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Link href={`/impact-analysis`} className="contents">
                <Badge variant="outline" className="text-[10px] font-mono shrink-0 text-primary hover:underline">{i.id}</Badge>
              </Link>
              <span className="text-xs font-semibold truncate flex-1">{i.updateTitle}</span>
              <ImpactSeverityBadge severity={i.impactSeverity} />
              <ImpactStatusBadge status={i.impactStatus} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
              <span><strong>Source:</strong> {i.sourceName}</span>
              <span><strong>Type:</strong> {i.changeType}</span>
              <span><strong>Effective:</strong> {fmt(i.effectiveDate)}</span>
              <span><strong>Legal Review:</strong> {i.governanceReview.legalReviewRequired ? 'Required' : 'No'}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
              <span><strong>Obligations:</strong> {i.impactedObligationIds.length}</span>
              <span><strong>Controls:</strong> {i.impactedControls.length}</span>
              <span><strong>Evidence:</strong> {i.impactedEvidence.length}</span>
              <span><strong>Functions:</strong> {i.impactedBusinessFunctions.length}</span>
              {i.governanceReview.confidenceLevel && <ConfidenceIndicator level={i.governanceReview.confidenceLevel} />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ObligationSection({ items }: { items: Requirement[] }) {
  if (items.length === 0) return <FilterEmptyState label="No high-risk obligations match current filters." />;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
        <Lock className="h-3 w-3" />
        <span>These are controlled regulatory reference data. This view is read-only.</span>
      </div>
      {items.slice(0, 15).map(r => (
        <Card key={r.matrixRowId}>
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Link href={`/obligations?search=${r.matrixRowId}`} className="contents">
                <Badge variant="outline" className="text-[10px] font-mono shrink-0 text-primary hover:underline">{r.matrixRowId}</Badge>
              </Link>
              <span className="text-xs font-semibold truncate flex-1">{r.lawRegulationFrameworkStandardName || 'Untitled'}</span>
              {r.severityPriority && (
                <Badge variant={r.severityPriority === 'Critical' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {r.severityPriority}
                </Badge>
              )}
            </div>
            {r.plainEnglishInterpretation && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">{r.plainEnglishInterpretation}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] text-muted-foreground">
              {r.businessFunctionImpacted && <span><strong>Functions:</strong> {r.businessFunctionImpacted}</span>}
              {r.specificCitationSectionClause && <span><strong>Citation:</strong> {r.specificCitationSectionClause}</span>}
              {r.sourceType && <span><strong>Source:</strong> {r.sourceType}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length > 15 && <p className="text-xs text-muted-foreground text-center">Showing 15 of {items.length} obligations</p>}
    </div>
  );
}

// ═══ Shared Primitives ═══════════════════════════════════════════

function MetricCard({ label, value, icon, variant = 'default' }: { label: string; value: number; icon: React.ReactNode; variant?: 'default' | 'red' | 'amber' }) {
  const bg = variant === 'red' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
    : variant === 'amber' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
    : 'bg-card border-border';
  return (
    <Card className={`${bg}`}>
      <CardContent className="p-3 flex flex-col items-center gap-1">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-lg font-bold tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  const map: Record<string, React.ReactNode> = {
    completed:   <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />,
    overdue:     <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5" />,
    blocked:     <XCircle className="h-4 w-4 text-red-500 mt-0.5" />,
    in_progress: <Clock className="h-4 w-4 text-sky-500 mt-0.5" />,
  };
  return <div>{map[status] || <Clock className="h-4 w-4 text-slate-400 mt-0.5" />}</div>;
}

