'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CuratedDisclaimer } from '@/components/layout/CuratedDisclaimer';
import { SummaryCards, type SummaryCard } from '@/components/cards/SummaryCards';
import { FilterBar } from '@/components/filters/FilterBar';
import { RequirementsTable } from '@/components/tables/RequirementsTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { COLUMNS_SUPPLY_CHAIN } from '@/lib/columns';
import { getRequirements, getFilterOptions } from '@/lib/data';
import { matchesFilters, type FilterState, EMPTY_FILTERS } from '@/lib/filters';
import { isSupplyChainRelevant } from '@/lib/curated-filters';
import type { Requirement } from '@/types';

export default function SupplyChainPage() {
  // Base set: all supply-chain-relevant requirements
  const scRequirements = React.useMemo(
    () => getRequirements().filter(isSupplyChainRelevant),
    []
  );

  const filterOptions = React.useMemo(() => getFilterOptions(), []);

  const [filters, setFilters] = React.useState<FilterState>(EMPTY_FILTERS);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Apply user filters on top of the curated base set
  const filteredRequirements = React.useMemo(
    () => scRequirements.filter((req) => matchesFilters(req, filters)),
    [scRequirements, filters]
  );

  // KPI summary cards
  const summaryCards = React.useMemo<SummaryCard[]>(() => {
    const total = scRequirements.length;
    const launchCritical = scRequirements.filter((r) => r.launchCriticalFlag).length;
    const highCriticalSev = scRequirements.filter(
      (r) => r.severityPriority === 'Critical' || r.severityPriority === 'High'
    ).length;
    const needsReview = scRequirements.filter((r) => r.needsReviewFlag).length;
    return [
      { label: 'Total Supply Chain Obligations', value: total, accent: 'default' },
      { label: 'Launch-Critical', value: launchCritical, accent: 'critical' },
      { label: 'High / Critical Severity', value: highCriticalSev, accent: 'warning' },
      { label: 'Needs Review', value: needsReview, accent: 'info' },
    ];
  }, [scRequirements]);

  const handleRowClick = (requirement: Requirement) => {
    setSelectedReq(requirement);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Supply Chain Leader View"
        description="A curated view of obligations affecting distribution, serialization, 3PL oversight, cold chain, returns, inventory, shortages, importation, and operational launch readiness."
        badge={{ label: `${scRequirements.length} obligations`, variant: 'secondary' }}
      />

      <CuratedDisclaimer />

      <SummaryCards cards={summaryCards} />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        options={filterOptions}
        totalCount={scRequirements.length}
        filteredCount={filteredRequirements.length}
      />

      <RequirementsTable
        data={filteredRequirements}
        onRowClick={handleRowClick}
        columns={COLUMNS_SUPPLY_CHAIN}
      />

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
