'use client';

/* ─── Dynamic Context Chips ──────────────────────────────────────────
   Phase 5.1-E: Client component that renders operating context chips
   in the topic page header. Reads from OperatingContextProvider.
   ──────────────────────────────────────────────────────────────────── */

import { Globe, Building2, Clock } from 'lucide-react';
import { useOperatingContext } from '@/components/context';
import {
  jurisdictionLabel,
  entityRoleLabel,
  stageLabel,
} from '@/lib/operating-context';

export function DynamicContextChips() {
  const { context } = useOperatingContext();

  return (
    <div className="topic-context-chips">
      <span className="topic-context-chip">
        <Globe className="topic-chip-icon" aria-hidden="true" />
        {jurisdictionLabel(context.jurisdiction)}
      </span>
      <span className="topic-context-chip">
        <Building2 className="topic-chip-icon" aria-hidden="true" />
        {entityRoleLabel(context.entityRole)}
      </span>
      <span className="topic-context-chip">
        <Clock className="topic-chip-icon" aria-hidden="true" />
        {stageLabel(context.stage)}
      </span>
    </div>
  );
}
