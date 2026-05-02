'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TableScrollWrapperProps {
  children: React.ReactNode;
  /** Show a sticky first column. Requires the first <th>/<td> to be styled separately. */
  stickyFirstCol?: boolean;
  className?: string;
}

/**
 * Wraps a table in a horizontally-scrollable container with:
 * 1. A synchronized top scrollbar (mirrors the bottom one)
 * 2. Left/right fade shadows when overflow exists
 * 3. Optional sticky first column support
 */
export function TableScrollWrapper({
  children,
  stickyFirstCol = false,
  className,
}: TableScrollWrapperProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const topBarRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = React.useState(0);
  const [clientWidth, setClientWidth] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const syncingRef = React.useRef<'top' | 'bottom' | null>(null);

  /* ── Measure scroll dimensions ──────────────────────────── */
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      setScrollWidth(el.scrollWidth);
      setClientWidth(el.clientWidth);
      setScrollLeft(el.scrollLeft);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Also observe the inner content for column changes
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild);
    }

    return () => ro.disconnect();
  }, [children]);

  /* ── Sync scroll positions ─────────────────────────────── */
  const handleBottomScroll = React.useCallback(() => {
    if (syncingRef.current === 'top') return;
    syncingRef.current = 'bottom';
    const el = scrollRef.current;
    const top = topBarRef.current;
    if (el && top) {
      top.scrollLeft = el.scrollLeft;
      setScrollLeft(el.scrollLeft);
    }
    requestAnimationFrame(() => { syncingRef.current = null; });
  }, []);

  const handleTopScroll = React.useCallback(() => {
    if (syncingRef.current === 'bottom') return;
    syncingRef.current = 'top';
    const el = scrollRef.current;
    const top = topBarRef.current;
    if (el && top) {
      el.scrollLeft = top.scrollLeft;
      setScrollLeft(top.scrollLeft);
    }
    requestAnimationFrame(() => { syncingRef.current = null; });
  }, []);

  const hasOverflow = scrollWidth > clientWidth + 2; // 2px tolerance
  const canScrollLeft = scrollLeft > 2;
  const canScrollRight = scrollLeft < scrollWidth - clientWidth - 2;

  return (
    <div className={cn('relative', className)}>
      {/* ── Top scrollbar (only visible when overflow exists) ── */}
      {hasOverflow && (
        <div
          ref={topBarRef}
          onScroll={handleTopScroll}
          className="overflow-x-auto overflow-y-hidden"
          style={{ height: 12 }}
          aria-hidden="true"
        >
          <div style={{ width: scrollWidth, height: 1 }} />
        </div>
      )}

      {/* ── Left fade shadow ────────────────────────────────── */}
      <div
        className={cn(
          'pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 transition-opacity duration-200',
          'bg-gradient-to-r from-card to-transparent',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
        style={stickyFirstCol ? { left: 90 } : undefined}
        aria-hidden="true"
      />

      {/* ── Right fade shadow ───────────────────────────────── */}
      <div
        className={cn(
          'pointer-events-none absolute top-0 bottom-0 right-0 z-10 w-8 transition-opacity duration-200',
          'bg-gradient-to-l from-card to-transparent',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />

      {/* ── Scrollable table area ───────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleBottomScroll}
        className={cn(
          'overflow-x-auto',
          stickyFirstCol && 'table-sticky-first-col'
        )}
      >
        <div ref={innerRef}>{children}</div>
      </div>
    </div>
  );
}
