'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CuratedDisclaimer } from '@/components/layout/CuratedDisclaimer';
import { SummaryCards, type SummaryCard } from '@/components/cards/SummaryCards';
import { GenericFilterBar, type GenericFilterDef, type GenericFilterState } from '@/components/filters/GenericFilterBar';
import { DataTable } from '@/components/tables/DataTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { SeverityBadge } from '@/components/badges';
import { getRisks, getRequirementMap, getUniqueFieldValues } from '@/lib/data';
import type { Risk, Requirement } from '@/types';

/* ── Badge helper for Mitigation / Review status ─────────── */
function StatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const lower = value.toLowerCase();
  let style = 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400';
  if (lower.includes('required') || lower.includes('pending') || lower.includes('not started')) {
    style = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  }
  if (lower.includes('complete') || lower.includes('reviewed')) {
    style = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
  if (lower.includes('validation required') || lower.includes('citation')) {
    style = 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400';
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide leading-snug ${style}`}>
      {value}
    </span>
  );
}

/* ── Column definitions ──────────────────────────────────── */
function buildColumns(reqMap: Map<string, Requirement>, onLinkedClick: (req: Requirement) => void): ColumnDef<Risk, unknown>[] {
  return [
    {
      accessorKey: 'riskId',
      header: 'Risk ID',
      size: 95,
      cell: ({ getValue }) => <span className="font-mono text-xs font-semibold text-primary">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'riskThemeCategory',
      header: 'Risk Theme Category',
      size: 180,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'whyHighRisk',
      header: 'Risk Description',
      size: 280,
      cell: ({ getValue }) => <span className="text-xs leading-snug text-muted-foreground line-clamp-2">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'primaryFunction',
      header: 'Primary Function',
      size: 150,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'primaryScorPhase',
      header: 'SCOR Phase',
      size: 100,
      cell: ({ getValue }) => <span className="text-xs font-medium">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'primaryJurisdiction',
      header: 'Jurisdiction',
      size: 150,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'severityPriority',
      header: 'Severity',
      size: 110,
      cell: ({ getValue }) => <SeverityBadge severity={getValue<string | null>()} />,
    },
    {
      accessorKey: 'mitigationStatus',
      header: 'Mitigation Status',
      size: 180,
      cell: ({ getValue }) => <StatusBadge value={getValue<string | null>()} />,
    },
    {
      accessorKey: 'reviewStatus',
      header: 'Review Status',
      size: 220,
      cell: ({ getValue }) => <StatusBadge value={getValue<string | null>()} />,
    },
    {
      accessorKey: 'linkedMatrixRowId',
      header: 'Linked Req',
      size: 110,
      cell: ({ getValue }) => {
        const id = getValue<string | null>();
        if (!id) return <span className="text-muted-foreground text-xs">—</span>;
        const linked = reqMap.get(id);
        if (!linked) {
          return (
            <span className="text-xs text-amber-600" title="Linked requirement not found">
              {id} ⚠
            </span>
          );
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLinkedClick(linked);
            }}
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
            title="Open linked requirement"
          >
            {id}
            <ExternalLink className="h-3 w-3" />
          </button>
        );
      },
    },
  ];
}

/* ── Filter setup ────────────────────────────────────────── */
function buildEmptyFilters(): GenericFilterState {
  return {
    search: '',
    severityPriority: [],
    primaryFunction: [],
    primaryScorPhase: [],
    primaryJurisdiction: [],
    mitigationStatus: [],
    reviewStatus: [],
  };
}

function matchRisk(risk: Risk, filters: GenericFilterState): boolean {
  // Search
  if (filters.search) {
    const q = (filters.search as string).toLowerCase();
    const haystack = [
      risk.riskId,
      risk.riskTheme,
      risk.riskThemeCategory,
      risk.whyHighRisk,
      risk.obligation,
      risk.owner,
      risk.primaryFunction,
      risk.linkedMatrixRowId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  // Multi-select filters
  const multiFilters: { key: string; field: keyof Risk }[] = [
    { key: 'severityPriority', field: 'severityPriority' },
    { key: 'primaryFunction', field: 'primaryFunction' },
    { key: 'primaryScorPhase', field: 'primaryScorPhase' },
    { key: 'primaryJurisdiction', field: 'primaryJurisdiction' },
    { key: 'mitigationStatus', field: 'mitigationStatus' },
    { key: 'reviewStatus', field: 'reviewStatus' },
  ];

  for (const { key, field } of multiFilters) {
    const selected = filters[key] as string[];
    if (selected && selected.length > 0) {
      const val = risk[field];
      if (!val || !selected.includes(val)) return false;
    }
  }

  return true;
}

/* ── Page component ──────────────────────────────────────── */
export default function RisksPage() {
  const allRisks = React.useMemo(() => getRisks(), []);
  const reqMap = React.useMemo(() => getRequirementMap(), []);

  const [filters, setFilters] = React.useState<GenericFilterState>(buildEmptyFilters);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const filteredRisks = React.useMemo(
    () => allRisks.filter((r) => matchRisk(r, filters)),
    [allRisks, filters]
  );

  // Filter definitions
  const filterDefs = React.useMemo<GenericFilterDef[]>(() => [
    { key: 'severityPriority', label: 'Severity', type: 'multi-select', options: ['Critical', 'High', 'Medium'] },
    { key: 'primaryFunction', label: 'Function', type: 'multi-select', options: getUniqueFieldValues(allRisks, 'primaryFunction') },
    { key: 'primaryScorPhase', label: 'SCOR Phase', type: 'multi-select', options: getUniqueFieldValues(allRisks, 'primaryScorPhase') },
    { key: 'primaryJurisdiction', label: 'Jurisdiction', type: 'multi-select', options: getUniqueFieldValues(allRisks, 'primaryJurisdiction') },
    { key: 'mitigationStatus', label: 'Mitigation', type: 'multi-select', options: getUniqueFieldValues(allRisks, 'mitigationStatus') },
    { key: 'reviewStatus', label: 'Review Status', type: 'multi-select', options: getUniqueFieldValues(allRisks, 'reviewStatus') },
  ], [allRisks]);

  // KPI summary cards
  const summaryCards = React.useMemo<SummaryCard[]>(() => {
    const total = allRisks.length;
    const critHigh = allRisks.filter(
      (r) => r.severityPriority === 'Critical' || r.severityPriority === 'High'
    ).length;
    const needsReview = allRisks.filter(
      (r) => r.reviewStatus?.includes('Validation Required') || r.reviewStatus?.includes('Citation')
    ).length;
    const mitigationPending = allRisks.filter(
      (r) => r.mitigationStatus?.toLowerCase().includes('required') || r.mitigationStatus?.toLowerCase().includes('not started')
    ).length;
    const linked = allRisks.filter((r) => r.linkedMatrixRowId && reqMap.has(r.linkedMatrixRowId)).length;
    return [
      { label: 'Total Risks', value: total, accent: 'default' },
      { label: 'Critical / High Risks', value: critHigh, accent: 'critical' },
      { label: 'Needs Review', value: needsReview, accent: 'info' },
      { label: 'Mitigation Pending', value: mitigationPending, accent: 'warning' },
      { label: 'Linked Requirements', value: linked, accent: 'default' },
    ];
  }, [allRisks, reqMap]);

  const handleLinkedClick = (req: Requirement) => {
    setSelectedReq(req);
    setDrawerOpen(true);
  };

  const columns = React.useMemo(
    () => buildColumns(reqMap, handleLinkedClick),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reqMap]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Highest Risk Obligations"
        description="A dashboard view of the most critical, complex, ambiguous, or high-impact compliance risks, linked back to the underlying matrix rows where available."
        badge={{ label: `${allRisks.length} risks`, variant: 'secondary' }}
      />

      <CuratedDisclaimer />

      <SummaryCards cards={summaryCards} />

      <GenericFilterBar
        filters={filters}
        onChange={setFilters}
        filterDefs={filterDefs}
        totalCount={allRisks.length}
        filteredCount={filteredRisks.length}
        entityLabel="risks"
        searchPlaceholder="Search risks..."
      />

      <DataTable
        data={filteredRisks}
        columns={columns}
        entityLabel="risks"
        emptyMessage="No risks match the current filters."
      />

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
