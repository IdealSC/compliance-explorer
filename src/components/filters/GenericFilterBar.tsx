'use client';

import * as React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { MultiSelectFilter } from './MultiSelectFilter';
import { BooleanFilter } from './BooleanFilter';

export interface GenericFilterDef {
  key: string;
  label: string;
  type: 'multi-select' | 'boolean';
  options?: string[];
}

export interface GenericFilterState {
  search: string;
  [key: string]: string | string[] | boolean | null;
}

interface GenericFilterBarProps {
  filters: GenericFilterState;
  onChange: (filters: GenericFilterState) => void;
  filterDefs: GenericFilterDef[];
  totalCount: number;
  filteredCount: number;
  entityLabel?: string;
  searchPlaceholder?: string;
}

export function GenericFilterBar({
  filters,
  onChange,
  filterDefs,
  totalCount,
  filteredCount,
  entityLabel = 'items',
  searchPlaceholder = 'Search...',
}: GenericFilterBarProps) {
  const update = (key: string, value: string | string[] | boolean | null) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = React.useMemo(() => {
    if (filters.search !== '') return true;
    for (const def of filterDefs) {
      const val = filters[def.key];
      if (def.type === 'multi-select' && Array.isArray(val) && val.length > 0) return true;
      if (def.type === 'boolean' && val !== null) return true;
    }
    return false;
  }, [filters, filterDefs]);

  const clearAll = () => {
    const cleared: GenericFilterState = { search: '' };
    for (const def of filterDefs) {
      cleared[def.key] = def.type === 'multi-select' ? [] : null;
    }
    onChange(cleared);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <SearchInput
          value={filters.search}
          onChange={(v) => update('search', v)}
          className="w-80"
          placeholder={searchPlaceholder}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>
            {filteredCount === totalCount
              ? `${totalCount} ${entityLabel}`
              : `${filteredCount} of ${totalCount} ${entityLabel}`}
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

      <div className="flex flex-wrap items-center gap-2">
        {filterDefs.map((def) => {
          if (def.type === 'multi-select') {
            return (
              <MultiSelectFilter
                key={def.key}
                label={def.label}
                options={def.options || []}
                selected={(filters[def.key] as string[]) || []}
                onChange={(v) => update(def.key, v)}
              />
            );
          }
          if (def.type === 'boolean') {
            return (
              <BooleanFilter
                key={def.key}
                label={def.label}
                value={(filters[def.key] as boolean | null) ?? null}
                onChange={(v) => update(def.key, v)}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
