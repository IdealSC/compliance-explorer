'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/filters/SearchInput';
import { ImpactSeverityBadge, ImpactStatusBadge, ChangeTypeBadge, LegalReviewMarker, ConfidenceIndicator } from '@/components/badges';
import { SampleDataBanner, GovernanceWarningBanner } from '@/components/governance';
import { getImpactAnalyses } from '@/lib/data';
import { ImpactAnalysisDrawer } from '@/components/detail/ImpactAnalysisDrawer';
import { AlertTriangle, Building2, ClipboardList, FileText, ShieldCheck, Target, Users, Calendar } from 'lucide-react';
import type { RegulatoryImpactAnalysis } from '@/types';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';

const STATUS_FILTERS = ['all', 'not_started', 'in_progress', 'needs_review', 'complete'] as const;
const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  not_started: 'Not Started',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  complete: 'Complete',
};

const SEVERITY_FILTERS = ['all', 'critical', 'high', 'medium', 'low'] as const;

export default function ImpactAnalysisPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading…</div>}>
      <ImpactAnalysisContent />
    </React.Suspense>
  );
}

function ImpactAnalysisContent() {
  const searchParams = useSearchParams();
  const updateIdParam = searchParams.get('updateId');

  const analyses = React.useMemo(() => getImpactAnalyses(), []);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [selectedAnalysis, setSelectedAnalysis] = React.useState<RegulatoryImpactAnalysis | null>(null);

  const filtered = React.useMemo(() => {
    return analyses.filter(a => {
      // Deep-link filter: only show assessments matching the URL param
      if (updateIdParam && a.relatedUpdateId !== updateIdParam) return false;
      if (statusFilter !== 'all' && a.impactStatus !== statusFilter) return false;
      if (severityFilter !== 'all' && a.impactSeverity !== severityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.updateTitle.toLowerCase().includes(q)
          || a.sourceName.toLowerCase().includes(q)
          || a.id.toLowerCase().includes(q)
          || a.jurisdiction?.toLowerCase().includes(q)
          || a.regulator?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [analyses, statusFilter, severityFilter, search, updateIdParam]);

  // Summary stats
  const totalObligations = new Set(analyses.flatMap(a => a.impactedObligationIds)).size;
  const totalControls = analyses.reduce((n, a) => n + a.impactedControls.length, 0);
  const totalOwnerActions = analyses.reduce((n, a) => n + a.impactedOwners.length, 0);
  const legalReviewCount = analyses.filter(a => a.governanceReview.legalReviewRequired).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Change Impact Analysis"
        description="Assess how proposed or published regulatory changes affect obligations, controls, evidence, business functions, owners, and risks across the compliance operating model."
        badge={{ label: `${analyses.length} assessments`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      <GovernanceWarningBanner>
        <strong>Assessment layer:</strong> Impact analysis references active regulatory data and draft updates but does not modify controlled reference data. This is an analytical tool to inform governance review and operational planning.
      </GovernanceWarningBanner>

      {updateIdParam && (
        <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
          <FileText className="h-4 w-4 shrink-0" />
          <span>Filtered to assessments linked to regulatory update <strong>{updateIdParam}</strong></span>
          <a href="/impact-analysis" className="ml-auto text-xs font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 underline">
            Clear filter
          </a>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={<Target className="h-4 w-4 text-violet-500" />} label="Impacted Obligations" value={totalObligations} />
        <SummaryCard icon={<ShieldCheck className="h-4 w-4 text-sky-500" />} label="Impacted Controls" value={totalControls} />
        <SummaryCard icon={<Users className="h-4 w-4 text-amber-500" />} label="Owner Actions" value={totalOwnerActions} />
        <SummaryCard icon={<AlertTriangle className="h-4 w-4 text-red-500" />} label="Legal Review Required" value={legalReviewCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <SearchInput value={search} onChange={setSearch} placeholder="Search assessments..." className="w-64" />
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</label>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {STATUS_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Severity</label>
          <div className="flex flex-wrap gap-1">
            {SEVERITY_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase transition-colors ${
                  severityFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <FilterEmptyState label="No impact assessments match the current filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <Card
              key={a.id}
              className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
              onClick={() => setSelectedAnalysis(a)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold leading-tight">{a.updateTitle}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.id} · {a.sourceName}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 shrink-0">
                    <ImpactSeverityBadge severity={a.impactSeverity} />
                    <ImpactStatusBadge status={a.impactStatus} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <ChangeTypeBadge type={a.changeType} />
                  <LegalReviewMarker required={a.governanceReview.legalReviewRequired} />
                  <ConfidenceIndicator level={a.governanceReview.confidenceLevel} />
                  {a.effectiveDate && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Effective: {a.effectiveDate}
                    </span>
                  )}
                </div>

                {/* Impact counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <CountPill icon={<Target className="h-3 w-3" />} label="Obligations" count={a.impactedObligationIds.length} />
                  <CountPill icon={<ShieldCheck className="h-3 w-3" />} label="Controls" count={a.impactedControls.length} />
                  <CountPill icon={<ClipboardList className="h-3 w-3" />} label="Evidence" count={a.impactedEvidence.length} />
                  <CountPill icon={<Building2 className="h-3 w-3" />} label="Functions" count={a.impactedBusinessFunctions.length} />
                </div>

                {/* Impacted functions list */}
                {a.impactedBusinessFunctions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {a.impactedBusinessFunctions.map(bf => (
                      <Badge key={bf.functionName} variant="outline" className="text-[10px]">{bf.functionName}</Badge>
                    ))}
                  </div>
                )}

                {/* Required actions summary */}
                {a.requiredActions.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{a.requiredActions.length} required action{a.requiredActions.length !== 1 ? 's' : ''}:</span>{' '}
                    {a.requiredActions.slice(0, 3).join(' · ')}
                    {a.requiredActions.length > 3 && ` · +${a.requiredActions.length - 3} more`}
                  </div>
                )}

                {/* Impacted owners */}
                {a.impactedOwners.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <Users className="h-3 w-3 text-muted-foreground mt-0.5" />
                    {[...new Set(a.impactedOwners.map(o => o.owner))].map(owner => (
                      <Badge key={owner} variant="secondary" className="text-[10px]">{owner}</Badge>
                    ))}
                  </div>
                )}

                {a.sourceReference && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Source-backed
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ImpactAnalysisDrawer
        analysis={selectedAnalysis}
        open={!!selectedAnalysis}
        onOpenChange={(open) => { if (!open) setSelectedAnalysis(null); }}
      />
    </div>
  );
}

/* ── Helper Components ────────────────────────────────────── */

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">{icon}</div>
        <div>
          <p className="text-xl font-bold tabular-nums">{value}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CountPill({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1">
      {icon}
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-bold tabular-nums">{count}</span>
    </div>
  );
}
