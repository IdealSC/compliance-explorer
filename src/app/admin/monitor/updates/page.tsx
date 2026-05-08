'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/filters/SearchInput';
import { StageBadge, ChangeTypeBadge, LegalReviewMarker, ConfidenceIndicator, EffectiveDateDisplay, SourceBackedIndicator } from '@/components/badges';
import { GovernanceWarningBanner, SampleDataBanner } from '@/components/governance';
import { getRegulatoryUpdates } from '@/lib/data';
import { RegulatoryUpdateDrawer } from '@/components/detail/RegulatoryUpdateDrawer';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { CreateDraftUpdateForm } from '@/components/staging/StagingUpdatePanel';
import { PERMISSIONS } from '@/auth/permissions';
import { BarChart3, Plus, Database } from 'lucide-react';
import type { RegulatoryUpdate } from '@/types';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';

const ALL_STAGES = ['all', 'intake', 'triage', 'draft_mapping', 'review', 'approved', 'published', 'rejected'] as const;
const STAGE_LABELS: Record<string, string> = {
  all: 'All',
  intake: 'Intake',
  triage: 'Triage',
  draft_mapping: 'Draft Mapping',
  review: 'Review',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
};

export default function RegulatoryUpdatesPage() {
  const updates = React.useMemo(() => getRegulatoryUpdates(), []);
  const [stageFilter, setStageFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [selectedUpdate, setSelectedUpdate] = React.useState<RegulatoryUpdate | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const isDbMode = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'
    : false;

  const filtered = React.useMemo(() => {
    let result = updates;
    if (stageFilter !== 'all') {
      result = result.filter((u) => u.currentStage === stageFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.updateTitle.toLowerCase().includes(q) ||
          (u.sourceName?.toLowerCase().includes(q)) ||
          u.changeSummary.toLowerCase().includes(q) ||
          (u.regulator?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [updates, stageFilter, search]);

  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: updates.length };
    for (const u of updates) counts[u.currentStage] = (counts[u.currentStage] || 0) + 1;
    return counts;
  }, [updates]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Updates"
        description="Track proposed and published changes to regulatory requirements. Updates must pass through the governance workflow before modifying active compliance data."
        badge={{ label: `${updates.length} updates`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      <GovernanceWarningBanner>
        <strong>Governance notice:</strong> Proposed regulatory updates are not active reference data until reviewed and approved through the governance workflow.
      </GovernanceWarningBanner>

      {/* Create Draft button */}
      <PermissionGate requires={PERMISSIONS.REFERENCE_DRAFT_CREATE}>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Draft Update
            {!isDbMode && <Database className="h-3 w-3 ml-1 opacity-50" />}
          </button>
        ) : (
          <CreateDraftUpdateForm
            isDatabaseMode={isDbMode}
            onCreated={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </PermissionGate>

      {/* Stage filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              stageFilter === stage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {STAGE_LABELS[stage]}
            {stageCounts[stage] ? ` (${stageCounts[stage]})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search updates by title, source, regulator…"
        className="max-w-md"
      />

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length === updates.length
          ? `${updates.length} regulatory updates`
          : `${filtered.length} of ${updates.length} updates`}
      </p>

      {/* Update cards */}
      <div className="space-y-3">
        {filtered.map((u) => (
          <Card key={u.id}>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-primary font-bold">{u.id}</span>
                    <StageBadge stage={u.currentStage} />
                    <ChangeTypeBadge type={u.changeType} />
                    <LegalReviewMarker required={u.legalReviewRequired} />
                  </div>
                  <CardTitle className="text-sm leading-snug">{u.updateTitle}</CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
                    {u.regulator && <span className="text-[10px] text-muted-foreground">{u.regulator}</span>}
                    {u.jurisdiction && <span className="text-[10px] text-muted-foreground">· {u.jurisdiction}</span>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-foreground leading-relaxed line-clamp-2">{u.changeSummary}</p>

              <div className="flex items-center gap-3 flex-wrap">
                <ConfidenceIndicator level={u.confidenceLevel} />
                <EffectiveDateDisplay date={u.effectiveDate} />
                <SourceBackedIndicator reference={u.sourceReference} />
              </div>

              {u.impactedBusinessFunctions.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Impact:</span>
                  {u.impactedBusinessFunctions.map((fn) => (
                    <Badge key={fn} variant="outline" className="text-[10px] py-0">{fn}</Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">Intake: {u.intakeDate}</span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/impact-analysis?updateId=${u.id}`}
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BarChart3 className="h-3 w-3" /> Impact
                  </Link>
                  <button
                    onClick={() => { setSelectedUpdate(u); setDrawerOpen(true); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <FilterEmptyState label="No regulatory updates match the current filters." />
        )}
      </div>

      <RegulatoryUpdateDrawer
        update={selectedUpdate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
