'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
          selected.length > 0
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-none">
              {selected.length}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={clearAll}
              onKeyDown={(e) => { if (e.key === 'Enter') clearAll(e as unknown as React.MouseEvent); }}
              className="rounded-sm p-0.5 hover:bg-primary/10"
              aria-label={`Clear ${label} filter`}
            >
              <X className="h-3 w-3" />
            </span>
          </span>
        )}
        {selected.length === 0 && <ChevronDown className="h-3 w-3 opacity-60" />}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        {/* Search within options */}
        {options.length > 6 && (
          <div className="border-b p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filter ${label.toLowerCase()}…`}
              className="h-7 w-full rounded border-none bg-muted px-2 text-xs placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
          </div>
        )}
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No options found
            </p>
          )}
          {filtered.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggle(option)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs transition-colors text-left',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span className="truncate">{option}</span>
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <button
              onClick={() => onChange([])}
              className="w-full rounded-sm px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
