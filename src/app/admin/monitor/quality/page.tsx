'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ActivitySquare, Search, AlertTriangle, ShieldCheck, ClipboardList,
  Database, Scale, Lock, Eye, BarChart3, Network,
  XCircle, Clock, Target, Zap, Gauge, TrendingUp,
} from 'lucide-react';
import { getDataQualityIssues, getRequirements, getComplianceControls, getEvidenceRequirements, getSourceRecords } from '@/lib/data';
import { SampleDataBanner } from '@/components/governance/SampleDataBanner';
import { GovernanceWarningBanner } from '@/components/governance/GovernanceWarningBanner';
import { MetricCard } from '@/components/cards/MetricCard';
import { DataQualitySeverityBadge, DataQualityStatusBadge, DataQualityIssueTypeBadge } from '@/components/badges';
import { ConfidenceIndicator } from '@/components/badges';
import { DataQualityDrawer } from '@/components/detail/DataQualityDrawer';
import type { DataQualityIssue, DataQualityCategory } from '@/types';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import { fmt } from '@/lib/format';

// ── Constants ────────────────────────────────────────────────────

const CATEGORIES: { key: DataQualityCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Issues' },
  { key: 'source', label: 'Source Quality' },
  { key: 'obligation', label: 'Obligation Quality' },
  { key: 'control_evidence', label: 'Control & Evidence' },
  { key: 'governance', label: 'Governance' },
  { key: 'business_function', label: 'Business Functions' },
  { key: 'ux_navigation', label: 'UX / Navigation' },
];

const FUNCTIONS = [
  'All', 'Supply Chain', 'Procurement', 'Operations', 'Quality',
  'Legal', 'Compliance', 'Risk', 'Executive Leadership',
];

const SEVERITIES = ['All', 'critical', 'high', 'medium', 'low'];
const STATUSES = ['All', 'open', 'in_review', 'planned', 'resolved', 'deferred'];

// ── Helpers ──────────────────────────────────────────────────────

function matchFilter(value: string, filter: string): boolean {
  return filter === 'All' || value === filter;
}

function pct(num: number, den: number): number {
  return den === 0 ? 100 : Math.round((num / den) * 100);
}

// ── Quality Score Card ───────────────────────────────────────────

function ScoreCard({ label, score, desc, icon }: { label: string; score: number; desc: string; icon: React.ReactNode }) {
  const color = score >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : score >= 60 ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';
  const bg = score >= 80 ? 'border-emerald-200 dark:border-emerald-900/40'
    : score >= 60 ? 'border-amber-200 dark:border-amber-900/40'
    : 'border-rose-200 dark:border-rose-900/40';
  return (
    <Card className={bg}>
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-[10px] font-semibold">{label}</span></div>
          <span className={`text-lg font-bold tabular-nums ${color}`}>{score}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">{desc}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function DataQualityPage() {
  const issues = React.useMemo(() => getDataQualityIssues(), []);
  const reqs = React.useMemo(() => getRequirements(), []);
  const controls = React.useMemo(() => getComplianceControls(), []);
  const evidence = React.useMemo(() => getEvidenceRequirements(), []);
  const sources = React.useMemo(() => getSourceRecords(), []);

  // Filters
  const [category, setCategory] = React.useState<DataQualityCategory | 'all'>('all');
  const [search, setSearch] = React.useState('');
  const [sevFilter, setSevFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [fnFilter, setFnFilter] = React.useState('All');
  const [legalFilter, setLegalFilter] = React.useState('All');

  // Drawer
  const [selected, setSelected] = React.useState<DataQualityIssue | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // ── Quality Scores (read-only, computed from existing data) ──
  const scores = React.useMemo(() => {
    const totalReqs = reqs.length;
    const withControls = reqs.filter(r => controls.some(c => c.relatedObligationIds.some(oid => oid === r.matrixRowId))).length;
    const validEvd = evidence.filter(e => e.evidenceStatus === 'collected' || e.evidenceStatus === 'accepted').length;
    const totalEvd = evidence.length;
    const validatedSrc = sources.filter(s => s.validationStatus === 'validated').length;
    const totalSrc = sources.length;
    const withReview = reqs.filter(r => r.validationDate).length;
    const openIssues = issues.filter(i => i.status === 'open' || i.status === 'in_review').length;

    const sourceScore = pct(validatedSrc, totalSrc);
    const obligationScore = pct(withControls, totalReqs);
    const evidenceScore = pct(validEvd, totalEvd);
    const reviewScore = pct(withReview, totalReqs);
    const govScore = Math.max(0, 100 - openIssues * 3);
    const overall = Math.round((sourceScore + obligationScore + evidenceScore + reviewScore + govScore) / 5);

    return { overall, sourceScore, obligationScore, evidenceScore, reviewScore, govScore };
  }, [reqs, controls, evidence, sources, issues]);

  // ── Filtered issues ─────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return issues.filter(i => {
      if (category !== 'all' && i.category !== category) return false;
      if (!matchFilter(i.severity, sevFilter)) return false;
      if (!matchFilter(i.status, statusFilter)) return false;
      if (!matchFilter(i.businessFunction, fnFilter)) return false;
      if (legalFilter === 'Yes' && !i.legalReviewRequired) return false;
      if (legalFilter === 'No' && i.legalReviewRequired) return false;
      if (search) {
        const lc = search.toLowerCase();
        if (!i.issueTitle.toLowerCase().includes(lc) && !i.id.toLowerCase().includes(lc) && !i.affectedEntityId.toLowerCase().includes(lc) && !i.businessFunction.toLowerCase().includes(lc)) return false;
      }
      return true;
    });
  }, [issues, category, sevFilter, statusFilter, fnFilter, legalFilter, search]);

  // ── Summary Metrics ─────────────────────────────────────────
  const metrics = React.useMemo(() => {
    const open = issues.filter(i => i.status === 'open').length;
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    const legal = issues.filter(i => i.legalReviewRequired && i.status !== 'resolved').length;
    const stale = issues.filter(i => i.issueType === 'stale_review').length;
    const missingSrc = issues.filter(i => i.issueType === 'missing_source_reference').length;
    const missingCtrl = issues.filter(i => i.issueType === 'missing_control').length;
    const missingEvd = issues.filter(i => i.issueType === 'missing_evidence').length;
    const expiredEvd = issues.filter(i => i.issueType === 'expired_evidence' || i.issueType === 'rejected_evidence').length;
    const lowConf = issues.filter(i => i.issueType === 'low_confidence').length;
    return { open, critical, high, legal, stale, missingSrc, missingCtrl, missingEvd, expiredEvd, lowConf };
  }, [issues]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><ActivitySquare className="h-5 w-5" /> Data Quality & Validation</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Diagnostic dashboard identifying weak, incomplete, stale, unsupported, or high-risk records across the compliance operating map.
        </p>
      </div>

      <SampleDataBanner />
      <GovernanceWarningBanner>
        This dashboard is a read-only diagnostic tool. It does not modify controlled reference data, obligations, standards, controls, evidence, or audit logs. Quality scores are indicators only — not legal compliance determinations.
      </GovernanceWarningBanner>

      {/* ── Quality Scores ──────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold flex items-center gap-2 mb-3"><Gauge className="h-4 w-4" /> Quality Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <ScoreCard label="Overall" score={scores.overall} desc="Composite quality indicator across all dimensions" icon={<TrendingUp className="h-3.5 w-3.5" />} />
          <ScoreCard label="Source Completeness" score={scores.sourceScore} desc="Sources validated in the Source Registry" icon={<Database className="h-3.5 w-3.5" />} />
          <ScoreCard label="Obligation Operationalization" score={scores.obligationScore} desc="Obligations with at least one linked control" icon={<Network className="h-3.5 w-3.5" />} />
          <ScoreCard label="Evidence Readiness" score={scores.evidenceScore} desc="Evidence items with collected or accepted status" icon={<ClipboardList className="h-3.5 w-3.5" />} />
          <ScoreCard label="Review Freshness" score={scores.reviewScore} desc="Obligations with a recorded validation date" icon={<Eye className="h-3.5 w-3.5" />} />
          <ScoreCard label="Governance Readiness" score={scores.govScore} desc="Based on open diagnostic issue count" icon={<ShieldCheck className="h-3.5 w-3.5" />} />
        </div>
        <p className="text-[9px] text-muted-foreground mt-1.5 flex items-center gap-1">
          <Lock className="h-2.5 w-2.5" /> Scores are computed from sample data. They are not legal compliance attestations.
        </p>
      </div>

      {/* ── Summary Metrics ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-3">
        <MetricCard label="Open Issues" value={metrics.open} icon={<Target className="h-4 w-4" />} />
        <MetricCard label="Critical" value={metrics.critical} icon={<AlertTriangle className="h-4 w-4 text-red-500" />} />
        <MetricCard label="High" value={metrics.high} icon={<Zap className="h-4 w-4 text-orange-500" />} />
        <MetricCard label="Missing Source" value={metrics.missingSrc} icon={<Database className="h-4 w-4 text-amber-500" />} />
        <MetricCard label="Missing Control" value={metrics.missingCtrl} icon={<ShieldCheck className="h-4 w-4 text-amber-500" />} />
        <MetricCard label="Missing Evidence" value={metrics.missingEvd} icon={<ClipboardList className="h-4 w-4 text-amber-500" />} />
        <MetricCard label="Expired / Rejected" value={metrics.expiredEvd} icon={<XCircle className="h-4 w-4 text-red-500" />} />
        <MetricCard label="Low Confidence" value={metrics.lowConf} icon={<BarChart3 className="h-4 w-4 text-purple-500" />} />
        <MetricCard label="Legal Review" value={metrics.legal} icon={<Scale className="h-4 w-4 text-purple-500" />} />
        <MetricCard label="Stale Reviews" value={metrics.stale} icon={<Clock className="h-4 w-4 text-amber-500" />} />
      </div>

      {/* ── Category Tabs ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-0">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${category === c.key ? 'bg-background border border-b-0 border-border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >{c.label} <Badge variant="secondary" className="ml-1 text-[9px] tabular-nums">{c.key === 'all' ? issues.length : issues.filter(i => i.category === c.key).length}</Badge></button>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-4 pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search issues by title, ID, entity, function…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect label="Severity" value={sevFilter} onChange={setSevFilter} options={SEVERITIES} />
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
            <FilterSelect label="Function" value={fnFilter} onChange={setFnFilter} options={FUNCTIONS} />
            <FilterSelect label="Legal Review" value={legalFilter} onChange={setLegalFilter} options={['All', 'Yes', 'No']} />
          </div>
        </CardContent>
      </Card>

      {/* ── Issue Cards ──────────────────────────────────────────── */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(issue => (
          <Card
            key={issue.id}
            className="cursor-pointer transition-colors hover:border-primary/40"
            onClick={() => { setSelected(issue); setDrawerOpen(true); }}
          >
            <CardContent className="pt-4 pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-snug">{issue.issueTitle}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{issue.id}</div>
                </div>
                {issue.confidenceLevel && <ConfidenceIndicator level={issue.confidenceLevel} />}
              </div>
              <div className="flex flex-wrap gap-1">
                <DataQualityIssueTypeBadge type={issue.issueType} />
                <DataQualitySeverityBadge severity={issue.severity} />
                <DataQualityStatusBadge status={issue.status} />
                {issue.legalReviewRequired && (
                  <Badge variant="outline" className="text-[9px] border-purple-400 text-purple-600 dark:text-purple-400 gap-0.5">
                    <Scale className="h-2.5 w-2.5" /> Legal
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                <div><span className="font-semibold">Entity:</span> {issue.affectedEntityId}</div>
                <div><span className="font-semibold">Function:</span> {issue.businessFunction}</div>
                <div><span className="font-semibold">Owner:</span> {issue.owner}</div>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{issue.recommendedAction}</p>
              {issue.dueDate && (
                <div className="text-[10px] text-muted-foreground"><span className="font-semibold">Due:</span> {fmt(issue.dueDate)}</div>
              )}
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <FilterEmptyState
            label={fnFilter === 'Risk' || fnFilter === 'Executive Leadership'
              ? `No data quality issues are mapped to the ${fnFilter} function in this sample dataset.`
              : 'No data quality issues match the current filters.'}
            context={fnFilter === 'Risk' || fnFilter === 'Executive Leadership'
              ? 'In a production environment, this function would have dedicated obligations, controls, and quality assessments. Try selecting a different business function or clearing filters.'
              : undefined}
          />
        )}
      </div>

      {/* ── Footer Disclaimer ────────────────────────────────────── */}
      <div className="border-t border-border pt-4 mt-6">
        <p className="text-[10px] text-muted-foreground">
          Data quality findings are diagnostic assessments generated from sample/demonstration data. They do not constitute legal advice, compliance attestation, or validated audit findings. Quality scores are computed indicators, not regulatory determinations. This tool does not modify any controlled reference data.
        </p>
      </div>

      <DataQualityDrawer issue={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

// ── Local Components ──────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground font-semibold">{label}:</span>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-7 rounded-md border bg-background px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );
}
