'use client';

/* ─── Context Emphasis Wrapper ───────────────────────────────────────
   Phase 5.1-E: Thin client component that applies CSS emphasis classes
   to data-attributed topic page sections based on the current operating
   context. Preserves TopicPageLayout as a server component.
   ──────────────────────────────────────────────────────────────────── */

import * as React from 'react';
import { useOperatingContext } from './OperatingContextProvider';
import { CONTEXT_DEFAULTS } from '@/lib/operating-context';

/**
 * Wraps a topic page article element and applies emphasis classes
 * to child elements with `data-context-*` attributes.
 *
 * Target attributes:
 *   data-context-jurisdiction="us" | "eu" | "us-eu"
 *   data-context-entity-role="nda-holder" | "mah" | ...
 *   data-context-stage="preclinical" | "pre-commercial" | ...
 *   data-context-source-jurisdiction="US" | "EU" | "Global" | "US / Global"
 *
 * If the wrapped content has NO data-context-* attributes and the user
 * has changed context away from defaults, a controlled fallback message
 * is shown indicating that context-specific notes require editor review.
 */
export function ContextEmphasis({ children }: { children: React.ReactNode }) {
  const { context } = useOperatingContext();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [hasContextContent, setHasContextContent] = React.useState(true);

  /* ── Detect context-attributed content before paint ──────────── */
  React.useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const found = el.querySelectorAll(
      '[data-context-jurisdiction], [data-context-entity-role], [data-context-stage], [data-context-source-jurisdiction]'
    );
    setHasContextContent(found.length > 0);
  }, []);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    /* ── Jurisdiction emphasis ─────────────────────────────────── */
    const jurisdictionBlocks = el.querySelectorAll<HTMLElement>(
      '[data-context-jurisdiction]'
    );
    jurisdictionBlocks.forEach((block) => {
      const blockJurisdiction = block.getAttribute('data-context-jurisdiction');
      if (context.jurisdiction === 'us-eu') {
        // All-jurisdictions view: no emphasis, no de-emphasis
        block.classList.remove(
          'context-emphasis-highlight',
          'context-emphasis-deemphasized'
        );
      } else if (blockJurisdiction === context.jurisdiction) {
        block.classList.add('context-emphasis-highlight');
        block.classList.remove('context-emphasis-deemphasized');
      } else if (blockJurisdiction === 'consistent') {
        // "Consistent across" blocks are never de-emphasized
        block.classList.remove(
          'context-emphasis-highlight',
          'context-emphasis-deemphasized'
        );
      } else {
        block.classList.remove('context-emphasis-highlight');
        block.classList.add('context-emphasis-deemphasized');
      }
    });

    /* ── Entity role emphasis ──────────────────────────────────── */
    const roleCards = el.querySelectorAll<HTMLElement>(
      '[data-context-entity-role]'
    );
    roleCards.forEach((card) => {
      const cardRole = card.getAttribute('data-context-entity-role');
      if (cardRole === context.entityRole) {
        card.classList.add('context-emphasis-highlight');
      } else {
        card.classList.remove('context-emphasis-highlight');
      }
    });

    /* ── Lifecycle stage emphasis ──────────────────────────────── */
    const stageCards = el.querySelectorAll<HTMLElement>(
      '[data-context-stage]'
    );
    stageCards.forEach((card) => {
      const cardStage = card.getAttribute('data-context-stage');
      if (cardStage === context.stage) {
        card.classList.add('context-emphasis-highlight');
      } else {
        card.classList.remove('context-emphasis-highlight');
      }
    });

    /* ── Source table jurisdiction emphasis ─────────────────────── */
    const sourceRows = el.querySelectorAll<HTMLElement>(
      '[data-context-source-jurisdiction]'
    );
    sourceRows.forEach((row) => {
      const sourceJurisdiction = row
        .getAttribute('data-context-source-jurisdiction')
        ?.toLowerCase();
      if (!sourceJurisdiction) return;

      if (context.jurisdiction === 'us-eu') {
        // Show all equally
        row.classList.remove(
          'context-emphasis-highlight',
          'context-emphasis-deemphasized'
        );
      } else {
        const matches =
          sourceJurisdiction.includes(context.jurisdiction) ||
          sourceJurisdiction === 'global';
        if (matches) {
          row.classList.add('context-emphasis-highlight');
          row.classList.remove('context-emphasis-deemphasized');
        } else {
          row.classList.remove('context-emphasis-highlight');
          // Don't de-emphasize source rows — just remove highlight
        }
      }
    });
  }, [context]);

  /* ── Determine if non-default context is active ────────────────── */
  const isNonDefault =
    context.jurisdiction !== CONTEXT_DEFAULTS.jurisdiction ||
    context.entityRole !== CONTEXT_DEFAULTS.entityRole ||
    context.stage !== CONTEXT_DEFAULTS.stage;

  const showUnmappedNote = !hasContextContent && isNonDefault;

  return (
    <div ref={wrapperRef} className="context-emphasis-wrapper">
      {showUnmappedNote && (
        <div className="topic-unmapped-context-note">
          <p className="topic-unmapped-context-heading">
            Context-specific note requires editor review
          </p>
          <p className="topic-unmapped-context-text">
            This topic has not yet been fully mapped for the selected operating
            context. The general topic orientation remains visible, but
            context-specific ownership, source emphasis, or applicability notes
            require editor review before publication.
          </p>
        </div>
      )}
      {children}
    </div>
  );
}

