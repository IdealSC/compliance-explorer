'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/filters/SearchInput';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import { ControlStatusBadge, EvidenceStatusBadge, ActionPriorityBadge, ActionStatusBadge, ConfidenceIndicator, RiskLevelBadge } from '@/components/badges';
import { SampleDataBanner, GovernanceWarningBanner } from '@/components/governance';
import { getComplianceControls, getEvidenceRequirements, getOwnerActions } from '@/lib/data';
import { ControlDetailDrawer } from '@/components/detail/ControlDetailDrawer';
import type { ComplianceControl, EvidenceRequirement, OwnerActionItem } from '@/types';
import { fmt } from '@/lib/format';
import {
  ShieldCheck, ClipboardList, Users, AlertTriangle, Calendar,
  CheckCircle2, XCircle, Clock, Eye, Ban
} from 'lucide-react';

// ═══ Constants ═══════════════════════════════════════════════════

const TABS = ['controls', 'evidence', 'actions'] as const;
type TabKey = typeof TABS[number];
const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  controls: <ShieldCheck className="h-3.5 w-3.5" />,
  evidence: <ClipboardList className="h-3.5 w-3.5" />,
  actions: <Users className="h-3.5 w-3.5" />,
};

const CONTROL_STATUS_FILTERS = ['all', 'operating', 'needs_review', 'deficient', 'not_started', 'designed', 'implemented', 'retired'] as const;
const EVIDENCE_STATUS_FILTERS = ['all', 'missing', 'expired', 'rejected', 'under_review', 'requested', 'not_started', 'collected', 'accepted'] as const;
const ACTION_STATUS_FILTERS = ['all', 'overdue', 'blocked', 'in_progress', 'not_started', 'completed'] as const;
const RISK_FILTERS = ['all', 'critical', 'high', 'medium', 'low'] as const;

// ═══ Page ════════════════════════════════════════════════════════

export default function ControlsEvidencePage() {
  // ── Load data ──────────────────────────────────────────────────
  const controls = React.useMemo(() => getComplianceControls(), []);
  const evidence = React.useMemo(() => getEvidenceRequirements(), []);
  const actions = React.useMemo(() => getOwnerActions(), []);

  // ── State ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<TabKey>('controls');
  const [search, setSearch] = React.useState('');
  const [controlStatusFilter, setControlStatusFilter] = React.useState('all');
  const [evidenceStatusFilter, setEvidenceStatusFilter] = React.useState('all');
  const [actionStatusFilter, setActionStatusFilter] = React.useState('all');
  const [riskFilter, setRiskFilter] = React.useState('all');
  const [selectedControl, setSelectedControl] = React.useState<ComplianceControl | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // ── Summary Metrics ────────────────────────────────────────────
  const metrics = React.useMemo(() => {
    const needsReview = controls.filter(c => c.controlStatus === 'needs_review').length;
    const deficient = controls.filter(c => c.controlStatus === 'deficient').length;
    const missingEvd = evidence.filter(e => e.evidenceStatus === 'missing').length;
    const expiredEvd = evidence.filter(e => e.evidenceStatus === 'expired').length;
    const dueSoon = evidence.filter(e => {
      if (!e.nextDueDate) return false;
      const due = new Date(e.nextDueDate);
      const now = new Date();
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
    const overdueAct = actions.filter(a => a.actionStatus === 'overdue').length;
    const criticalAct = actions.filter(a => a.priority === 'critical' || a.priority === 'high').length;
    return { total: controls.length, needsReview, deficient, missingEvd, expiredEvd, dueSoon, overdueAct, criticalAct };
  }, [controls, evidence, actions]);

  // ── Filtered Controls ──────────────────────────────────────────
  const filteredControls = React.useMemo(() => {
    let result = controls;
    if (controlStatusFilter !== 'all') result = result.filter(c => c.controlStatus === controlStatusFilter);
    if (riskFilter !== 'all') result = result.filter(c => c.riskLevel === riskFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.controlName.toLowerCase().includes(q) ||
        c.controlOwner.toLowerCase().includes(q) ||
        c.businessFunction.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [controls, controlStatusFilter, riskFilter, search]);

  // ── Filtered Evidence ──────────────────────────────────────────
  const filteredEvidence = React.useMemo(() => {
    let result = evidence;
    if (evidenceStatusFilter !== 'all') result = result.filter(e => e.evidenceStatus === evidenceStatusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.evidenceName.toLowerCase().includes(q) ||
        e.evidenceOwner.toLowerCase().includes(q) ||
        e.businessFunction.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [evidence, evidenceStatusFilter, search]);

  // ── Filtered Actions ───────────────────────────────────────────
  const filteredActions = React.useMemo(() => {
    let result = actions;
    if (actionStatusFilter !== 'all') result = result.filter(a => a.actionStatus === actionStatusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.actionTitle.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        a.businessFunction.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [actions, actionStatusFilter, search]);

  // ── Drawer ─────────────────────────────────────────────────────
  const openDrawer = (c: ComplianceControl) => {
    setSelectedControl(c);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controls & Evidence Ownership"
        description="Track operational controls, evidence requirements, owners, due dates, and action items required to operationalize compliance obligations."
      />

      <SampleDataBanner />
      <GovernanceWarningBanner>
        Controls and evidence are operational compliance data. This view links to — but does not modify — active regulatory reference data such as laws, regulations, obligations, or standards.
      </GovernanceWarningBanner>

      {/* ── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard label="Total Controls" value={metrics.total} icon={<ShieldCheck className="h-4 w-4" />} />
        <MetricCard label="Needs Review" value={metrics.needsReview} icon={<Eye className="h-4 w-4" />} variant={metrics.needsReview > 0 ? 'amber' : 'default'} />
        <MetricCard label="Deficient" value={metrics.deficient} icon={<XCircle className="h-4 w-4" />} variant={metrics.deficient > 0 ? 'red' : 'default'} />
        <MetricCard label="Missing Evidence" value={metrics.missingEvd} icon={<AlertTriangle className="h-4 w-4" />} variant={metrics.missingEvd > 0 ? 'red' : 'default'} />
        <MetricCard label="Expired Evidence" value={metrics.expiredEvd} icon={<Ban className="h-4 w-4" />} variant={metrics.expiredEvd > 0 ? 'red' : 'default'} />
        <MetricCard label="Evidence Due ≤30d" value={metrics.dueSoon} icon={<Calendar className="h-4 w-4" />} variant={metrics.dueSoon > 0 ? 'amber' : 'default'} />
        <MetricCard label="Overdue Actions" value={metrics.overdueAct} icon={<Clock className="h-4 w-4" />} variant={metrics.overdueAct > 0 ? 'red' : 'default'} />
        <MetricCard label="High/Critical Actions" value={metrics.criticalAct} icon={<AlertTriangle className="h-4 w-4" />} variant={metrics.criticalAct > 0 ? 'amber' : 'default'} />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1" role="tablist" aria-label="Data view tabs">
        {TABS.map(tab => {
          const count = tab === 'controls' ? filteredControls.length : tab === 'evidence' ? filteredEvidence.length : filteredActions.length;
          const label = tab === 'controls' ? 'Controls' : tab === 'evidence' ? 'Evidence' : 'Owner Actions';
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span aria-hidden="true">{TAB_ICONS[tab]}</span>
              {label}
              <span className="ml-0.5 text-[10px] tabular-nums opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${activeTab === 'controls' ? 'controls' : activeTab === 'evidence' ? 'evidence' : 'owner actions'}…`} className="max-w-xs" />
        {activeTab === 'controls' && (
          <>
            <FilterPills label="Status" options={CONTROL_STATUS_FILTERS as unknown as string[]} value={controlStatusFilter} onChange={setControlStatusFilter} />
            <FilterPills label="Risk" options={RISK_FILTERS as unknown as string[]} value={riskFilter} onChange={setRiskFilter} />
          </>
        )}
        {activeTab === 'evidence' && (
          <FilterPills label="Status" options={EVIDENCE_STATUS_FILTERS as unknown as string[]} value={evidenceStatusFilter} onChange={setEvidenceStatusFilter} />
        )}
        {activeTab === 'actions' && (
          <FilterPills label="Status" options={ACTION_STATUS_FILTERS as unknown as string[]} value={actionStatusFilter} onChange={setActionStatusFilter} />
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {activeTab === 'controls' && (
        <div className="space-y-3">
          {filteredControls.length === 0 && <FilterEmptyState label="No controls match the current filters." />}
          {filteredControls.map(c => (
            <ControlCard key={c.id} control={c} evidenceCount={c.relatedEvidenceIds.length} onOpen={() => openDrawer(c)} />
          ))}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="space-y-3">
          {filteredEvidence.length === 0 && <FilterEmptyState label="No evidence items match the current filters." />}
          {filteredEvidence.map(e => (
            <EvidenceCard key={e.id} evidence={e} />
          ))}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-3">
          {filteredActions.length === 0 && <FilterEmptyState label="No action items match the current filters." />}
          {filteredActions.map(a => (
            <ActionCard key={a.id} action={a} />
          ))}
        </div>
      )}

      {/* ── Drawer ─────────────────────────────────────────────── */}
      <ControlDetailDrawer
        control={selectedControl}
        evidence={evidence}
        actions={actions}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

// ═══ Sub-Components ═════════════════════════════════════════════

function MetricCard({ label, value, icon, variant = 'default' }: { label: string; value: number; icon: React.ReactNode; variant?: 'default' | 'amber' | 'red' }) {
  const bg = variant === 'red' ? 'border-red-500/30 bg-red-500/5' : variant === 'amber' ? 'border-amber-500/30 bg-amber-500/5' : '';
  return (
    <Card className={bg}>
      <CardContent className="p-3 flex flex-col items-center text-center gap-1">
        {icon}
        <span className="text-xl font-bold tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function ControlCard({ control: c, evidenceCount, onOpen }: { control: ComplianceControl; evidenceCount: number; onOpen: () => void }) {
  return (
    <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={onOpen}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{c.id}</Badge>
              <span className="text-xs font-semibold truncate">{c.controlName}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <ControlStatusBadge status={c.controlStatus} />
              <RiskLevelBadge level={c.riskLevel} />
              <Badge variant="outline" className="text-[10px]">{c.controlType}</Badge>
              {c.confidenceLevel && <ConfidenceIndicator level={c.confidenceLevel} />}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
          <span><strong>Owner:</strong> {c.controlOwner}</span>
          <span><strong>Function:</strong> {c.businessFunction}</span>
          <span><strong>Frequency:</strong> {c.frequency}</span>
          <span><strong>Next Review:</strong> {fmt(c.nextReviewDate)}</span>
          <span><strong>Evidence:</strong> {evidenceCount} items</span>
        </div>
        {c.relatedObligationIds.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-[10px] text-muted-foreground mr-1">Obligations:</span>
            {c.relatedObligationIds.map(id => <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EvidenceCard({ evidence: e }: { evidence: EvidenceRequirement }) {
  const isFlagged = ['missing', 'expired', 'rejected'].includes(e.evidenceStatus);
  const isDueSoon = e.nextDueDate && (() => {
    const due = new Date(e.nextDueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  })();

  return (
    <Card className={isFlagged ? 'border-red-500/30' : isDueSoon ? 'border-amber-500/30' : ''}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{e.id}</Badge>
              <span className="text-xs font-semibold truncate">{e.evidenceName}</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{e.evidenceDescription}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <EvidenceStatusBadge status={e.evidenceStatus} />
              <Badge variant="outline" className="text-[10px]">{e.evidenceType.replace(/_/g, ' ')}</Badge>
              {e.confidenceLevel && <ConfidenceIndicator level={e.confidenceLevel} />}
              {e.evidenceStatus === 'missing' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400"><AlertTriangle className="h-3 w-3" /> Missing</span>}
              {e.evidenceStatus === 'expired' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400"><Ban className="h-3 w-3" /> Expired</span>}
              {e.evidenceStatus === 'rejected' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400"><XCircle className="h-3 w-3" /> Rejected</span>}
              {isDueSoon && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400"><Calendar className="h-3 w-3" /> Due Soon</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
          <span><strong>Owner:</strong> {e.evidenceOwner}</span>
          <span><strong>Function:</strong> {e.businessFunction}</span>
          <span><strong>Frequency:</strong> {e.requiredFrequency}</span>
          <span><strong>Retention:</strong> {e.retentionRequirement}</span>
          <span><strong>Next Due:</strong> {fmt(e.nextDueDate)}</span>
        </div>
        {e.relatedControlIds.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-[10px] text-muted-foreground mr-1">Controls:</span>
            {e.relatedControlIds.map(id => <Badge key={id} variant="outline" className="text-[10px] font-mono">{id}</Badge>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionCard({ action: a }: { action: OwnerActionItem }) {
  const isFlagged = a.actionStatus === 'overdue' || a.actionStatus === 'blocked';
  return (
    <Card className={isFlagged ? 'border-red-500/30' : ''}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {a.actionStatus === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
             a.actionStatus === 'overdue' ? <AlertTriangle className="h-4 w-4 text-rose-500" /> :
             a.actionStatus === 'blocked' ? <XCircle className="h-4 w-4 text-red-500" /> :
             a.actionStatus === 'in_progress' ? <Clock className="h-4 w-4 text-sky-500" /> :
             <Clock className="h-4 w-4 text-slate-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{a.id}</Badge>
              <span className="text-xs font-semibold truncate">{a.actionTitle}</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{a.actionDescription}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <ActionStatusBadge status={a.actionStatus} />
              <ActionPriorityBadge priority={a.priority} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
          <span><strong>Owner:</strong> {a.owner}</span>
          <span><strong>Function:</strong> {a.businessFunction}</span>
          <span><strong>Due:</strong> {fmt(a.dueDate)}</span>
          {a.dependency && <span><strong>Depends on:</strong> {a.dependency}</span>}
        </div>
        <p className="text-[10px] text-muted-foreground"><strong>Risk if not completed:</strong> {a.riskIfNotCompleted}</p>
      </CardContent>
    </Card>
  );
}

function FilterPills({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-1">{label}:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
            value === opt
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          {opt === 'all' ? 'All' : opt.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}

