'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CuratedDisclaimer } from '@/components/layout/CuratedDisclaimer';
import { SummaryCards, type SummaryCard } from '@/components/cards/SummaryCards';
import { FilterBar } from '@/components/filters/FilterBar';
import { RequirementsTable } from '@/components/tables/RequirementsTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { COLUMNS_LAUNCH_CRITICAL } from '@/lib/columns';
import { getRequirements, getFilterOptions } from '@/lib/data';
import { matchesFilters, type FilterState, EMPTY_FILTERS } from '@/lib/filters';
import { isLaunchCritical } from '@/lib/curated-filters';
import type { Requirement } from '@/types';

export default function LaunchCriticalPage() {
  // Base set: launch-critical requirements only
  const lcRequirements = React.useMemo(
    () => getRequirements().filter(isLaunchCritical),
    []
  );

  const filterOptions = React.useMemo(() => getFilterOptions(), []);

  const [filters, setFilters] = React.useState<FilterState>(EMPTY_FILTERS);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Apply user filters on top of the curated base set
  const filteredRequirements = React.useMemo(
    () => lcRequirements.filter((req) => matchesFilters(req, filters)),
    [lcRequirements, filters]
  );

  // KPI summary cards
  const summaryCards = React.useMemo<SummaryCard[]>(() => {
    const total = lcRequirements.length;
    const highCriticalSev = lcRequirements.filter(
      (r) => r.severityPriority === 'Critical' || r.severityPriority === 'High'
    ).length;
    const evidenceCritical = lcRequirements.filter(
      (r) => r.evidenceCriticality === 'Critical'
    ).length;
    const needsReview = lcRequirements.filter((r) => r.needsReviewFlag).length;
    return [
      { label: 'Total Launch-Critical Obligations', value: total, accent: 'critical' },
      { label: 'High / Critical Severity', value: highCriticalSev, accent: 'warning' },
      { label: 'Evidence-Critical', value: evidenceCritical, accent: 'default' },
      { label: 'Needs Review', value: needsReview, accent: 'info' },
    ];
  }, [lcRequirements]);

  const handleRowClick = (requirement: Requirement) => {
    setSelectedReq(requirement);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Launch-Critical Obligations"
        description="Requirements that should be considered before or during first commercial launch, including launch readiness, distribution readiness, evidence readiness, and high-risk operational controls."
        badge={{ label: `${lcRequirements.length} obligations`, variant: 'secondary' }}
      />

      <CuratedDisclaimer />

      <SummaryCards cards={summaryCards} />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        options={filterOptions}
        totalCount={lcRequirements.length}
        filteredCount={filteredRequirements.length}
      />

      <RequirementsTable
        data={filteredRequirements}
        onRowClick={handleRowClick}
        columns={COLUMNS_LAUNCH_CRITICAL}
      />

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
