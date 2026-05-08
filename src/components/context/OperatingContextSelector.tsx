'use client';

/* ─── Operating Context Selector ─────────────────────────────────────
   Phase 5.1-E: Compact context bar with chip-based selectors.
   Renders below the public navigation on all public pages.
   ──────────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useOperatingContext } from './OperatingContextProvider';
import {
  type OperatingContext,
  type ContextOption,
  JURISDICTION_OPTIONS,
  ENTITY_ROLE_OPTIONS,
  LIFECYCLE_STAGE_OPTIONS,
  isDefaultContext,
  jurisdictionLabel,
  entityRoleLabel,
  stageLabel,
} from '@/lib/operating-context';

/* ─── Dimension config ────────────────────────────────────────────── */

interface DimensionConfig<T extends string> {
  key: keyof OperatingContext;
  label: string;
  options: ContextOption<T>[];
  getDisplayLabel: (v: T) => string;
}

const DIMENSIONS: DimensionConfig<string>[] = [
  {
    key: 'jurisdiction',
    label: 'Jurisdiction',
    options: JURISDICTION_OPTIONS,
    getDisplayLabel: (v) => jurisdictionLabel(v as never),
  },
  {
    key: 'entityRole',
    label: 'Entity Role',
    options: ENTITY_ROLE_OPTIONS,
    getDisplayLabel: (v) => entityRoleLabel(v as never),
  },
  {
    key: 'stage',
    label: 'Lifecycle Stage',
    options: LIFECYCLE_STAGE_OPTIONS,
    getDisplayLabel: (v) => stageLabel(v as never),
  },
];

/* ─── Chip + Dropdown ─────────────────────────────────────────────── */

function ContextChip({
  dimension,
  currentValue,
  isOpen,
  onToggle,
  onSelect,
}: {
  dimension: DimensionConfig<string>;
  currentValue: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const chipRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  /* Close on outside click */
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        chipRef.current &&
        !chipRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onToggle();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  /* Keyboard: Escape closes */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onToggle();
      }
    },
    [isOpen, onToggle]
  );

  return (
    <div className="context-chip-wrapper" ref={chipRef} onKeyDown={handleKeyDown}>
      <button
        className={`context-chip ${isOpen ? 'context-chip--active' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${dimension.label}: ${dimension.getDisplayLabel(currentValue)}`}
        type="button"
      >
        <span className="context-chip-value">
          {dimension.getDisplayLabel(currentValue)}
        </span>
        <ChevronDown
          className={`context-chip-chevron ${isOpen ? 'context-chip-chevron--open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="context-dropdown"
          ref={dropdownRef}
          role="listbox"
          aria-label={dimension.label}
        >
          <div className="context-dropdown-label">{dimension.label}</div>
          {dimension.options.map((opt) => (
            <button
              key={opt.value}
              className={`context-dropdown-option ${
                opt.value === currentValue ? 'context-dropdown-option--selected' : ''
              }`}
              role="option"
              aria-selected={opt.value === currentValue}
              onClick={() => {
                onSelect(opt.value);
                onToggle();
              }}
              type="button"
            >
              {opt.label}
              {opt.value === currentValue && (
                <span className="context-dropdown-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Summary ──────────────────────────────────────────────── */

function MobileContextSummary({
  context,
  onExpand,
}: {
  context: OperatingContext;
  onExpand: () => void;
}) {
  return (
    <button className="context-mobile-summary" onClick={onExpand} type="button">
      <span className="context-mobile-label">Operating Context:</span>
      <span className="context-mobile-values">
        {jurisdictionLabel(context.jurisdiction)} ·{' '}
        {entityRoleLabel(context.entityRole)} ·{' '}
        {stageLabel(context.stage)}
      </span>
      <span className="context-mobile-change">Change</span>
    </button>
  );
}

/* ─── Main Selector ───────────────────────────────────────────────── */

export function OperatingContextSelector() {
  const pathname = usePathname();
  const { context, updateDimension, hasInteracted, resetToDefaults } =
    useOperatingContext();
  const [openDimension, setOpenDimension] = React.useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState(false);

  /* Don't render on admin routes */
  if (pathname.startsWith('/admin')) return null;

  const showReset = !isDefaultContext(context);

  const handleToggle = (key: string) => {
    setOpenDimension((prev) => (prev === key ? null : key));
  };

  const handleSelect = (key: keyof OperatingContext, value: string) => {
    updateDimension(key, value as never);
  };

  return (
    <div className="context-bar" role="region" aria-label="Operating context selector">
      {/* Desktop view */}
      <div className="context-bar-inner context-bar-desktop">
        <span className="context-bar-label">Operating Context:</span>

        <div className="context-chips">
          {DIMENSIONS.map((dim) => (
            <ContextChip
              key={dim.key}
              dimension={dim}
              currentValue={context[dim.key]}
              isOpen={openDimension === dim.key}
              onToggle={() => handleToggle(dim.key)}
              onSelect={(v) => handleSelect(dim.key, v)}
            />
          ))}
        </div>

        {showReset && (
          <button
            className="context-reset"
            onClick={resetToDefaults}
            type="button"
            aria-label="Reset operating context to defaults"
          >
            <RotateCcw className="context-reset-icon" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* Mobile view */}
      <div className="context-bar-mobile">
        {!mobileExpanded ? (
          <MobileContextSummary
            context={context}
            onExpand={() => setMobileExpanded(true)}
          />
        ) : (
          <div className="context-bar-inner">
            <div className="context-chips context-chips--mobile">
              {DIMENSIONS.map((dim) => (
                <ContextChip
                  key={dim.key}
                  dimension={dim}
                  currentValue={context[dim.key]}
                  isOpen={openDimension === dim.key}
                  onToggle={() => handleToggle(dim.key)}
                  onSelect={(v) => handleSelect(dim.key, v)}
                />
              ))}
            </div>
            <div className="context-mobile-actions">
              {showReset && (
                <button
                  className="context-reset"
                  onClick={resetToDefaults}
                  type="button"
                >
                  <RotateCcw className="context-reset-icon" aria-hidden="true" />
                  Reset
                </button>
              )}
              <button
                className="context-mobile-done"
                onClick={() => setMobileExpanded(false)}
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* First-visit prompt */}
      {!hasInteracted && (
        <p className="context-prompt">
          Set your operating context to see how this topic changes by
          jurisdiction, entity role, and lifecycle stage.
        </p>
      )}
    </div>
  );
}
