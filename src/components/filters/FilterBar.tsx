'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { MultiSelectFilter } from './MultiSelectFilter';
import { BooleanFilter } from './BooleanFilter';
import type { FilterState } from '@/lib/filters';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  options: {
    businessFunction: string[];
    primaryPersona: string[];
    lifecycleStage: string[];
    severityPriority: string[];
    jurisdictionRegion: string[];
    regulatoryDomain: string[];
  };
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({
  filters,
  onChange,
  options,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.businessFunction.length > 0 ||
    filters.primaryPersona.length > 0 ||
    filters.lifecycleStage.length > 0 ||
    filters.severityPriority.length > 0 ||
    filters.jurisdictionRegion.length > 0 ||
    filters.regulatoryDomain.length > 0 ||
    filters.launchCritical !== null ||
    filters.needsReview !== null;

  const clearAll = () => {
    onChange({
      search: '',
      businessFunction: [],
      primaryPersona: [],
      lifecycleStage: [],
      severityPriority: [],
      launchCritical: null,
      needsReview: null,
      jurisdictionRegion: [],
      regulatoryDomain: [],
    });
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Search + result count */}
      <div className="flex items-center gap-4">
        <SearchInput
          value={filters.search}
          onChange={(v) => update('search', v)}
          className="w-80"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>
            {filteredCount === totalCount
              ? `${totalCount} requirements`
              : `${filteredCount} of ${totalCount} requirements`}
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Row 2: Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label="Severity"
          options={options.severityPriority}
          selected={filters.severityPriority}
          onChange={(v) => update('severityPriority', v)}
        />
        <MultiSelectFilter
          label="Persona View"
          options={options.primaryPersona}
          selected={filters.primaryPersona}
          onChange={(v) => update('primaryPersona', v)}
        />
        <MultiSelectFilter
          label="Lifecycle Stage"
          options={options.lifecycleStage}
          selected={filters.lifecycleStage}
          onChange={(v) => update('lifecycleStage', v)}
        />
        <MultiSelectFilter
          label="Jurisdiction"
          options={options.jurisdictionRegion}
          selected={filters.jurisdictionRegion}
          onChange={(v) => update('jurisdictionRegion', v)}
        />
        <MultiSelectFilter
          label="Domain"
          options={options.regulatoryDomain}
          selected={filters.regulatoryDomain}
          onChange={(v) => update('regulatoryDomain', v)}
        />
        <MultiSelectFilter
          label="Business Function"
          options={options.businessFunction}
          selected={filters.businessFunction}
          onChange={(v) => update('businessFunction', v)}
        />

        <div className="mx-1 h-5 w-px bg-border" />

        <BooleanFilter
          label="Launch-Critical"
          value={filters.launchCritical}
          onChange={(v) => update('launchCritical', v)}
        />
        <BooleanFilter
          label="Needs Review"
          value={filters.needsReview}
          onChange={(v) => update('needsReview', v)}
        />
      </div>
    </div>
  );
}
