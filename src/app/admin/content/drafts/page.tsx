'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DraftStatusBadge, ChangeTypeBadge } from '@/components/badges';
import { GovernanceWarningBanner, SimulationDisclaimer, SampleDataBanner, DiffDisplay } from '@/components/governance';
import { getDraftChanges, getRegulatoryUpdates, getDraftValidationReviews } from '@/lib/data';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { CreateDraftChangeForm, DraftStatusPanel } from '@/components/staging/StagingUpdatePanel';
import { PERMISSIONS } from '@/auth/permissions';
import { ArrowRight, FileText, Plus, Database, Sparkles, ShieldCheck } from 'lucide-react';
import type { DraftRegulatoryChange } from '@/types';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import { ValidationStatusBadge } from '@/components/validation/ValidationStatusBadge';

const STATUS_FILTERS = ['all', 'draft', 'ready_for_review', 'returned', 'approved', 'rejected'] as const;
const STATUS_LABELS: Record<string, string> = {
  all: 'All', draft: 'Draft', ready_for_review: 'Ready for Review',
  returned: 'Returned', approved: 'Approved', rejected: 'Rejected',
};

export default function DraftMappingPage() {
  const allDrafts = React.useMemo(() => getDraftChanges(), []);
  const updates = React.useMemo(() => getRegulatoryUpdates(), []);
  const updateMap = React.useMemo(() => new Map(updates.map((u) => [u.id, u])), [updates]);
  const validationReviews = React.useMemo(() => getDraftValidationReviews(), []);
  const validationMap = React.useMemo(
    () => new Map(validationReviews.map((r) => [r.draftChangeId, r])),
    [validationReviews],
  );

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [updateFilter, setUpdateFilter] = React.useState<string>('all');
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, string>>({});
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const isDbMode = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'
    : false;

  const getDraftStatus = (draft: DraftRegulatoryChange) =>
    localStatuses[draft.draftId] || draft.draftStatus;

  const filtered = React.useMemo(() => {
    let result = allDrafts;
    if (updateFilter !== 'all') result = result.filter((d) => d.relatedUpdateId === updateFilter);
    if (statusFilter !== 'all') result = result.filter((d) => getDraftStatus(d) === statusFilter);
    return result;
  }, [allDrafts, statusFilter, updateFilter, localStatuses]);

  const simulateAction = (draftId: string, newStatus: string) => {
    setLocalStatuses((prev) => ({ ...prev, [draftId]: newStatus }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Draft Workspace"
        description="Review and manage proposed changes to controlled regulatory data. Draft changes are proposals — they do not modify active reference data."
        badge={{ label: `${allDrafts.length} draft changes`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      {!isDbMode && <SimulationDisclaimer />}

      <GovernanceWarningBanner>
        <strong>Governance notice:</strong> Draft changes are proposals. They do not modify active regulatory reference data until reviewed and approved.
      </GovernanceWarningBanner>

      {/* Create Draft Change button */}
      <PermissionGate requires={PERMISSIONS.DRAFT_EDIT}>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Draft Change
            {!isDbMode && <Database className="h-3 w-3 ml-1 opacity-50" />}
          </button>
        ) : (
          <CreateDraftChangeForm
            isDatabaseMode={isDbMode}
            regulatoryUpdates={updates.map((u) => ({ id: u.id, updateTitle: u.updateTitle }))}
            onCreated={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </PermissionGate>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label htmlFor="update-filter" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regulatory Update</label>
          <select
            id="update-filter"
            value={updateFilter}
            onChange={(e) => setUpdateFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Updates</option>
            {updates.map((u) => (
              <option key={u.id} value={u.id}>{u.id} — {u.updateTitle.slice(0, 60)}…</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} draft changes</p>

      {/* Draft cards */}
      <div className="space-y-3">
        {filtered.map((d) => {
          const currentStatus = getDraftStatus(d);
          const parentUpdate = updateMap.get(d.relatedUpdateId);
          return (
            <Card key={d.draftId} className={currentStatus === 'approved' ? 'border-emerald-500/30' : currentStatus === 'returned' ? 'border-amber-500/30' : ''}>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-primary font-bold">{d.draftId}</span>
                      <DraftStatusBadge status={currentStatus} />
                      <Badge variant="outline" className="text-[10px] py-0">{d.affectedEntityType}</Badge>
                      {d.affectedEntityId && (
                        <span className="font-mono text-[10px] text-muted-foreground">{d.affectedEntityId}</span>
                      )}
                      {d.changeReason?.includes('[AI Citation Suggestion') && (
                        <Badge variant="outline" className="text-[10px] py-0 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-400/30 gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" /> AI-Linked
                        </Badge>
                      )}
                      {validationMap.get(d.draftId) && (
                        <ValidationStatusBadge status={validationMap.get(d.draftId)!.validationStatus} />
                      )}
                    </div>
                    <CardTitle className="text-sm leading-snug">{d.proposedChangeSummary}</CardTitle>
                    {parentUpdate && (
                      <p className="text-[10px] text-muted-foreground">
                        From: {parentUpdate.id} — {parentUpdate.updateTitle.slice(0, 80)}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Diff display */}
                <DiffDisplay previousValue={d.previousValue} proposedValue={d.proposedValue} />

                <div className="grid grid-cols-2 gap-3">
                  {d.changeReason && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.changeReason}</p>
                    </div>
                  )}
                  {d.requiredApprover && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Required Approver</span>
                      <p className="mt-0.5 text-xs text-foreground">{d.requiredApprover}</p>
                    </div>
                  )}
                  {d.sourceReference && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Reference</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d.sourceReference}</p>
                    </div>
                  )}
                  {d.submittedBy && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Submitted By</span>
                      <p className="mt-0.5 text-xs text-foreground">{d.submittedBy} · {d.submittedDate}</p>
                    </div>
                  )}
                </div>

                {/* Phase 3.10: Validation workbench link */}
                {validationMap.get(d.draftId) && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <a href="/validation-workbench" className="text-primary hover:underline font-medium">View in Validation Workbench</a>
                  </p>
                )}

                {/* Database mode: persistent draft status controls */}
                {isDbMode && (
                  <>
                    <DraftStatusPanel
                      draftId={d.draftId}
                      currentStatus={currentStatus}
                      isDatabaseMode={isDbMode}
                    />
                    {['ready_for_review', 'approved', 'rejected', 'returned'].includes(currentStatus) && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        Review actions are available on the{' '}
                        <a href="/review-approval" className="text-primary hover:underline font-medium">Review &amp; Approval</a> page.
                      </p>
                    )}
                  </>
                )}

                {/* JSON mode: simulated actions (preserved) */}
                {!isDbMode && (
                  <>
                    {(currentStatus === 'draft' || currentStatus === 'returned') && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => simulateAction(d.draftId, 'ready_for_review')}
                          className="rounded-md bg-violet-500/10 px-3 py-1.5 text-[10px] font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-500/20 transition-colors"
                        >
                          Mark Ready for Review
                        </button>
                      </div>
                    )}
                    {currentStatus === 'ready_for_review' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => simulateAction(d.draftId, 'returned')}
                          className="rounded-md bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                        >
                          Return for Clarification
                        </button>
                      </div>
                    )}
                    {localStatuses[d.draftId] && (
                      <p className="text-[10px] text-muted-foreground italic pt-1">
                        Simulated action: {currentStatus.replace(/_/g, ' ')} (local state only — active data unchanged)
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <FilterEmptyState label="No draft changes match the current filters." />
        )}
      </div>
    </div>
  );
}
