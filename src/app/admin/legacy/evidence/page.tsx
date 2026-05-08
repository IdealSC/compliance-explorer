'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { CuratedDisclaimer } from '@/components/layout/CuratedDisclaimer';
import { SummaryCards } from '@/components/cards/SummaryCards';
import { GenericFilterBar, type GenericFilterDef, type GenericFilterState } from '@/components/filters/GenericFilterBar';
import { DataTable } from '@/components/tables/DataTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { getEvidence, getRequirements, getRequirementMap, getUniqueFieldValues } from '@/lib/data';
import type { Evidence, Requirement } from '@/types';

/* ── Enriched evidence row (evidence + linked requirement metadata) ── */
interface EvidenceRow extends Evidence {
  linkedMatrixRowId: string | null;
  relatedSummary: string | null;
  businessOwner: string | null;
  digitalSystemOwner: string | null;
  lifecycleStage: string | null;
  status: string | null;
  needsReviewFlag: boolean;
  launchCriticalFlag: boolean;
  _linkedRequirement: Requirement | null;
}

/**
 * Build enriched evidence rows.
 * Evidence has no direct linked ID, but requirement data references
 * evidence items. Match requirements that reference each evidence item
 * via the `requiredEvidenceDocumentation` field.
 */
function buildEnrichedRows(evidence: Evidence[], requirements: Requirement[], reqMap: Map<string, Requirement>): EvidenceRow[] {
  return evidence.map((evd) => {
    // Find first requirement whose evidence field mentions this evidence artifact
    const artifactLower = (evd.evidenceArtifact || '').toLowerCase();
    const matched = requirements.find((req) => {
      const reqEvidence = req.requiredEvidenceDocumentation?.toLowerCase() || '';
      return artifactLower && reqEvidence.includes(artifactLower.substring(0, Math.min(artifactLower.length, 30)));
    });

    return {
      ...evd,
      linkedMatrixRowId: matched?.matrixRowId || null,
      relatedSummary: matched?.uiDisplaySummary || null,
      businessOwner: evd.evidenceOwner,
      digitalSystemOwner: evd.systemRepository,
      lifecycleStage: matched?.lifecycleStage || evd.primaryProcess || null,
      status: matched?.status || null,
      needsReviewFlag: matched?.needsReviewFlag ?? false,
      launchCriticalFlag: matched?.launchCriticalFlag ?? false,
      _linkedRequirement: matched || null,
    };
  });
}

/* ── Badge helpers ───────────────────────────────────────── */
function CriticalityBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>;
  const lower = value.toLowerCase();
  let style = 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400';
  if (lower === 'critical') style = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (lower === 'high') style = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  if (lower === 'medium') style = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (lower === 'low') style = 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide leading-snug ${style}`}>
      {value}
    </span>
  );
}

function ReviewBadge({ flag }: { flag: boolean }) {
  if (!flag) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide leading-snug text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      ⚠ Needs Review
    </span>
  );
}

/* ── Column definitions ──────────────────────────────────── */
function buildColumns(onLinkedClick: (req: Requirement) => void): ColumnDef<EvidenceRow, unknown>[] {
  return [
    {
      accessorKey: 'evidenceId',
      header: 'Evidence ID',
      size: 95,
      cell: ({ getValue }) => <span className="font-mono text-xs font-semibold text-primary">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'evidenceArtifact',
      header: 'Evidence Item',
      size: 220,
      cell: ({ getValue }) => <span className="text-xs leading-snug font-medium">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'evidenceCriticality',
      header: 'Evidence Criticality',
      size: 130,
      cell: ({ getValue }) => <CriticalityBadge value={getValue<string | null>()} />,
    },
    {
      accessorKey: 'linkedMatrixRowId',
      header: 'Linked Req',
      size: 110,
      cell: ({ row }) => {
        const id = row.original.linkedMatrixRowId;
        const req = row.original._linkedRequirement;
        if (!id || !req) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLinkedClick(req);
            }}
            className="font-mono text-xs font-semibold text-primary hover:underline"
            title="Open linked requirement"
          >
            {id}
          </button>
        );
      },
    },
    {
      accessorKey: 'relatedSummary',
      header: 'Related Requirement',
      size: 250,
      cell: ({ getValue }) => (
        <span className="text-xs leading-snug text-muted-foreground line-clamp-2">
          {getValue<string | null>() || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'businessOwner',
      header: 'Business Owner',
      size: 180,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'digitalSystemOwner',
      header: 'System / Repository',
      size: 200,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'lifecycleStage',
      header: 'Lifecycle Stage',
      size: 170,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'minimumReviewCadence',
      header: 'Review Cadence',
      size: 180,
      cell: ({ getValue }) => <span className="text-xs leading-snug">{getValue<string | null>() || '—'}</span>,
    },
    {
      accessorKey: 'needsReviewFlag',
      header: 'Needs Review',
      size: 120,
      cell: ({ getValue }) => <ReviewBadge flag={getValue<boolean>()} />,
    },
  ];
}

/* ── Filter setup ────────────────────────────────────────── */
function buildEmptyFilters(): GenericFilterState {
  return {
    search: '',
    evidenceCriticality: [],
    businessOwner: [],
    digitalSystemOwner: [],
    lifecycleStage: [],
    needsReview: null,
  };
}

function matchEvidence(row: EvidenceRow, filters: GenericFilterState): boolean {
  // Search
  if (filters.search) {
    const q = (filters.search as string).toLowerCase();
    const haystack = [
      row.evidenceId,
      row.evidenceArtifact,
      row.regulatoryDriver,
      row.primaryProcess,
      row.evidenceOwner,
      row.systemRepository,
      row.inspectionUse,
      row.linkedMatrixRowId,
      row.relatedSummary,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  // Multi-select filters
  const multiFilters: { key: string; field: keyof EvidenceRow }[] = [
    { key: 'evidenceCriticality', field: 'evidenceCriticality' },
    { key: 'businessOwner', field: 'businessOwner' },
    { key: 'digitalSystemOwner', field: 'digitalSystemOwner' },
    { key: 'lifecycleStage', field: 'lifecycleStage' },
  ];

  for (const { key, field } of multiFilters) {
    const selected = filters[key] as string[];
    if (selected && selected.length > 0) {
      const val = row[field];
      if (!val || typeof val !== 'string' || !selected.includes(val)) return false;
    }
  }

  // Boolean filter
  if (filters.needsReview === true && !row.needsReviewFlag) return false;
  if (filters.needsReview === false && row.needsReviewFlag) return false;

  return true;
}

/* ── Page component ──────────────────────────────────────── */
export default function EvidencePage() {
  const allEvidence = React.useMemo(() => getEvidence(), []);
  const allRequirements = React.useMemo(() => getRequirements(), []);
  const reqMap = React.useMemo(() => getRequirementMap(), []);

  const enrichedRows = React.useMemo(
    () => buildEnrichedRows(allEvidence, allRequirements, reqMap),
    [allEvidence, allRequirements, reqMap]
  );

  const [filters, setFilters] = React.useState<GenericFilterState>(buildEmptyFilters);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const filteredRows = React.useMemo(
    () => enrichedRows.filter((r) => matchEvidence(r, filters)),
    [enrichedRows, filters]
  );

  const filterDefs = React.useMemo<GenericFilterDef[]>(() => [
    { key: 'evidenceCriticality', label: 'Criticality', type: 'multi-select', options: getUniqueFieldValues(allEvidence, 'evidenceCriticality') },
    { key: 'businessOwner', label: 'Owner / Function', type: 'multi-select', options: getUniqueFieldValues(enrichedRows, 'businessOwner') },
    { key: 'digitalSystemOwner', label: 'System / Repository', type: 'multi-select', options: getUniqueFieldValues(enrichedRows, 'digitalSystemOwner') },
    { key: 'lifecycleStage', label: 'Lifecycle Stage', type: 'multi-select', options: getUniqueFieldValues(enrichedRows, 'lifecycleStage') },
    { key: 'needsReview', label: 'Needs Review', type: 'boolean' },
  ], [allEvidence, enrichedRows]);

  // KPI summary cards
  const summaryCards = React.useMemo(() => {
    const total = enrichedRows.length;
    const critHigh = enrichedRows.filter(
      (r) => r.evidenceCriticality === 'Critical' || r.evidenceCriticality === 'High'
    ).length;
    const launchLinked = enrichedRows.filter((r) => r.launchCriticalFlag).length;
    const needsReview = enrichedRows.filter((r) => r.needsReviewFlag).length;
    const missingLink = enrichedRows.filter((r) => !r._linkedRequirement).length;
    return [
      { label: 'Total Evidence Items', value: total, accent: 'default' as const },
      { label: 'Critical / High Evidence', value: critHigh, accent: 'critical' as const },
      { label: 'Launch-Critical Linked', value: launchLinked, accent: 'warning' as const },
      { label: 'Needs Review', value: needsReview, accent: 'info' as const },
      { label: 'Missing Linked Req', value: missingLink, accent: 'default' as const },
    ];
  }, [enrichedRows]);

  const handleLinkedClick = React.useCallback((req: Requirement) => {
    setSelectedReq(req);
    setDrawerOpen(true);
  }, []);

  const columns = React.useMemo(
    () => buildColumns(handleLinkedClick),
    [handleLinkedClick]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Evidence & Documentation Requirements"
        description="A working view of the documentation, records, controls, logs, reports, agreements, and system evidence needed to demonstrate compliance."
        badge={{ label: `${enrichedRows.length} evidence items`, variant: 'secondary' }}
      />

      <CuratedDisclaimer />

      <SummaryCards cards={summaryCards} />

      <GenericFilterBar
        filters={filters}
        onChange={setFilters}
        filterDefs={filterDefs}
        totalCount={enrichedRows.length}
        filteredCount={filteredRows.length}
        entityLabel="evidence items"
        searchPlaceholder="Search evidence..."
      />

      <DataTable
        data={filteredRows}
        columns={columns}
        entityLabel="evidence items"
        emptyMessage="No evidence items match the current filters."
      />

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
