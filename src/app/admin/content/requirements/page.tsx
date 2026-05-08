'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/filters/FilterBar';
import { RequirementsTable } from '@/components/tables/RequirementsTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { getRequirements, getFilterOptions } from '@/lib/data';
import { matchesFilters, type FilterState, EMPTY_FILTERS } from '@/lib/filters';
import type { Requirement } from '@/types';

export default function RequirementsPage() {
  const allRequirements = React.useMemo(() => getRequirements(), []);
  const filterOptions = React.useMemo(() => getFilterOptions(), []);

  const [filters, setFilters] = React.useState<FilterState>(EMPTY_FILTERS);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const filteredRequirements = React.useMemo(
    () => allRequirements.filter((req) => matchesFilters(req, filters)),
    [allRequirements, filters]
  );

  const handleRowClick = (requirement: Requirement) => {
    setSelectedReq(requirement);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="All Requirements"
        description="Complete compliance matrix — searchable and filterable across all regulatory dimensions."
        badge={{ label: `${allRequirements.length} total`, variant: 'secondary' }}
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        options={filterOptions}
        totalCount={allRequirements.length}
        filteredCount={filteredRequirements.length}
      />

      <RequirementsTable
        data={filteredRequirements}
        onRowClick={handleRowClick}
      />

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
