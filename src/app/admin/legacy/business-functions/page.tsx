'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequirementsTable } from '@/components/tables/RequirementsTable';
import { RequirementDrawer } from '@/components/detail/RequirementDrawer';
import { BusinessFunctionCard } from '@/components/cards/BusinessFunctionCard';
import { COLUMNS_BUSINESS_FUNCTION } from '@/lib/columns';
import { getRequirements, getFunctionImpacts } from '@/lib/data';
import { splitMultiValue } from '@/lib/filters';
import type { Requirement, FunctionImpact } from '@/types';

export default function BusinessFunctionsPage() {
  const allRequirements = React.useMemo(() => getRequirements(), []);
  const functionImpacts = React.useMemo(() => getFunctionImpacts(), []);

  const [selectedFunction, setSelectedFunction] = React.useState<string | null>(null);
  const [selectedReq, setSelectedReq] = React.useState<Requirement | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Count obligations per function
  const countsByFunction = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const fi of functionImpacts) {
      if (!fi.businessFunction) continue;
      const fnName = fi.businessFunction;
      let count = 0;
      for (const req of allRequirements) {
        const reqFunctions = splitMultiValue(req.businessFunctionImpacted);
        if (reqFunctions.some((f) => f.toLowerCase() === fnName.toLowerCase())) {
          count++;
        }
      }
      counts.set(fnName, count);
    }
    return counts;
  }, [allRequirements, functionImpacts]);

  // Filter requirements by selected function
  const filteredRequirements = React.useMemo(() => {
    if (!selectedFunction) return allRequirements;
    return allRequirements.filter((req) => {
      const reqFunctions = splitMultiValue(req.businessFunctionImpacted);
      return reqFunctions.some(
        (f) => f.toLowerCase() === selectedFunction.toLowerCase()
      );
    });
  }, [allRequirements, selectedFunction]);

  const handleRowClick = (requirement: Requirement) => {
    setSelectedReq(requirement);
    setDrawerOpen(true);
  };

  const handleFunctionClick = (fn: FunctionImpact) => {
    if (selectedFunction === fn.businessFunction) {
      setSelectedFunction(null); // Deselect
    } else {
      setSelectedFunction(fn.businessFunction);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Function View"
        description="What each function needs to understand, act on, and prove. Click a function to filter obligations."
        badge={{
          label: `${functionImpacts.length} functions`,
          variant: 'secondary',
        }}
      />

      {/* Function cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {functionImpacts.map((fi) => (
          <BusinessFunctionCard
            key={fi.functionImpactId}
            fn={fi}
            obligationCount={countsByFunction.get(fi.businessFunction ?? '') ?? 0}
            isActive={selectedFunction === fi.businessFunction}
            onClick={() => handleFunctionClick(fi)}
          />
        ))}
      </div>

      {/* Filtered requirements table */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            {selectedFunction
              ? `${selectedFunction} Obligations`
              : 'All Obligations'}
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredRequirements.length} of {allRequirements.length}
          </span>
          {selectedFunction && (
            <button
              type="button"
              onClick={() => setSelectedFunction(null)}
              className="text-xs text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <RequirementsTable
          data={filteredRequirements}
          onRowClick={handleRowClick}
          columns={COLUMNS_BUSINESS_FUNCTION}
        />
      </div>

      <RequirementDrawer
        requirement={selectedReq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
