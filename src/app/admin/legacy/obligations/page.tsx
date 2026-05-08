'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/filters/FilterBar';
import { RequirementsTable } from '@/components/tables/RequirementsTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { COLUMNS_OBLIGATION_MATRIX } from '@/lib/columns';
import { getRequirements, getFilterOptions } from '@/lib/data';
import { matchesFilters, type FilterState, EMPTY_FILTERS } from '@/lib/filters';
import type { Requirement } from '@/types';

export default function ObligationsPage() {
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Obligation Matrix"
        description="The complete regulatory chain — Law → Obligation → Control → Evidence → Business Function — in one filterable view."
        badge={{
          label: `${allRequirements.length} obligations`,
          variant: 'secondary',
        }}
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
        columns={COLUMNS_OBLIGATION_MATRIX}
      />

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
