'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/filters/SearchInput';
import { SampleDataBanner } from '@/components/governance';
import { getAuditEvents } from '@/lib/data';
import { Clock, ArrowRight } from 'lucide-react';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';

const ENTITY_TYPES = ['all', 'requirement', 'crosswalk', 'draft_change', 'regulatory_update', 'approval_review', 'publication_event', 'version', 'evidence', 'risk', 'gap', 'compliance_control', 'evidence_requirement', 'owner_action', 'immutability_check', 'source_record', 'source_checklist', 'report_snapshot'] as const;
const ACTION_TYPES = ['all', 'record_created', 'field_updated', 'status_changed', 'draft_submitted', 'draft_approved', 'draft_rejected', 'draft_returned', 'version_published', 'version_superseded', 'control_status_updated', 'control_notes_updated', 'evidence_status_updated', 'evidence_notes_updated', 'action_status_updated', 'action_notes_updated', 'action_due_date_updated', 'regulatory_update_draft_created', 'regulatory_update_stage_changed', 'regulatory_update_draft_updated', 'draft_change_created', 'draft_change_updated', 'draft_change_ready_for_review', 'draft_change_submitted', 'draft_change_returned', 'approval_review_created', 'approval_review_started', 'approval_review_returned_for_revision', 'approval_review_rejected', 'approval_review_legal_review_required', 'approval_review_approved_for_publication', 'approval_review_comments_updated', 'publishing_validation_completed', 'publishing_draft_change_published', 'publishing_reference_record_created', 'publishing_prior_version_superseded', 'publishing_regulatory_update_operationalized', 'publishing_failed', 'immutability_check_passed', 'immutability_check_failed', 'source_record_created', 'source_record_metadata_updated', 'source_record_status_changed', 'source_record_validation_status_changed', 'source_record_legal_review_required', 'source_record_validated', 'source_record_rejected', 'source_checklist_item_updated', 'report_snapshot_created', 'report_export_csv', 'report_export_json', 'report_export_print', 'report_export_failed', 'report_snapshot_viewed'] as const;

const ACTION_COLORS: Record<string, string> = {
  record_created: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  field_updated: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  status_changed: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  draft_submitted: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  draft_approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  draft_rejected: 'bg-red-500/15 text-red-700 dark:text-red-400',
  draft_returned: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  version_published: 'bg-green-500/15 text-green-800 dark:text-green-400',
  version_superseded: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
  // Phase 2.3: Operational write actions
  control_status_updated: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  control_notes_updated: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  evidence_status_updated: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400',
  evidence_notes_updated: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400',
  action_status_updated: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  action_notes_updated: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  action_due_date_updated: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  // Phase 2.4: Staging / draft regulatory persistence actions
  regulatory_update_draft_created: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  regulatory_update_stage_changed: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  regulatory_update_draft_updated: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  draft_change_created: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400',
  draft_change_updated: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400',
  draft_change_ready_for_review: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400',
  draft_change_submitted: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400',
  draft_change_returned: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  // Phase 2.5A: Review/approval workflow actions
  approval_review_created: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  approval_review_started: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  approval_review_returned_for_revision: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  approval_review_rejected: 'bg-red-600/15 text-red-800 dark:text-red-400',
  approval_review_legal_review_required: 'bg-purple-600/15 text-purple-800 dark:text-purple-400',
  approval_review_approved_for_publication: 'bg-green-600/15 text-green-800 dark:text-green-400',
  approval_review_comments_updated: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  // Phase 2.5B: Controlled publishing actions
  publishing_validation_completed: 'bg-lime-500/15 text-lime-700 dark:text-lime-400',
  publishing_draft_change_published: 'bg-green-600/20 text-green-800 dark:text-green-300',
  publishing_reference_record_created: 'bg-emerald-600/20 text-emerald-800 dark:text-emerald-300',
  publishing_prior_version_superseded: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
  publishing_regulatory_update_operationalized: 'bg-green-700/20 text-green-900 dark:text-green-300',
  publishing_failed: 'bg-red-600/20 text-red-800 dark:text-red-300',
  // Phase 2.6: Immutability verification actions
  immutability_check_passed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  immutability_check_failed: 'bg-red-600/20 text-red-800 dark:text-red-300',
  // Phase 2.7: Source registry lifecycle actions
  source_record_created: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  source_record_metadata_updated: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  source_record_status_changed: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  source_record_validation_status_changed: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  source_record_legal_review_required: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  source_record_validated: 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300',
  source_record_rejected: 'bg-red-500/15 text-red-700 dark:text-red-400',
  source_checklist_item_updated: 'bg-amber-400/15 text-amber-600 dark:text-amber-400',
  // Phase 2.8: Report snapshot / export governance actions
  report_snapshot_created: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  report_export_csv: 'bg-sky-600/15 text-sky-800 dark:text-sky-300',
  report_export_json: 'bg-sky-600/15 text-sky-800 dark:text-sky-300',
  report_export_print: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  report_export_failed: 'bg-red-500/15 text-red-700 dark:text-red-400',
  report_snapshot_viewed: 'bg-sky-400/15 text-sky-600 dark:text-sky-400',
};

export default function AuditLogPage() {
  const events = React.useMemo(() => getAuditEvents(), []);
  const [entityFilter, setEntityFilter] = React.useState<string>('all');
  const [actionFilter, setActionFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    let result = events;
    if (entityFilter !== 'all') result = result.filter((e) => e.entityType === entityFilter);
    if (actionFilter !== 'all') result = result.filter((e) => e.action === actionFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.entityId.toLowerCase().includes(q) ||
          e.changedBy.toLowerCase().includes(q) ||
          (e.reason?.toLowerCase().includes(q)) ||
          e.action.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, entityFilter, actionFilter, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Immutable record of all changes to governed entities. Audit events are append-only and form the evidence chain for GxP audit readiness."
        badge={{ label: `${events.length} events`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by entity ID, user, reason…"
          className="w-72"
        />
        <div className="space-y-1">
          <label htmlFor="entity-filter" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entity Type</label>
          <select
            id="entity-filter"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="action-filter" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</label>
          <select
            id="action-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All Actions' : t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length === events.length
          ? `${events.length} audit events`
          : `${filtered.length} of ${events.length} events`}
      </p>

      {/* Audit event list */}
      <div className="space-y-2">
        {filtered.map((e) => (
          <Card key={e.auditId} size="sm">
            <CardContent className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">{e.auditId}</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ACTION_COLORS[e.action] || 'bg-muted text-muted-foreground'}`}>
                    {e.action.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0">{e.entityType.replace('_', ' ')}</Badge>
                  <span className="font-mono text-xs text-primary font-bold">{e.entityId}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {new Date(e.changedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Diff */}
              {(e.previousValue || e.newValue) && (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {e.previousValue && (
                    <span className="rounded bg-red-500/5 px-2 py-0.5 text-muted-foreground line-through">{e.previousValue}</span>
                  )}
                  {e.previousValue && e.newValue && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                  {e.newValue && (
                    <span className="rounded bg-emerald-500/5 px-2 py-0.5 text-foreground">{e.newValue}</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span>By: <strong className="text-foreground font-medium">{e.changedBy}</strong></span>
                {e.reason && <span className="truncate max-w-md">Reason: {e.reason}</span>}
                {e.approvalReference && (
                  <span className="font-mono text-[10px]">Ref: {e.approvalReference}</span>
                )}
                {/* B2 FIX: Display sourceReference for publishing provenance */}
                {e.sourceReference && (
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">Source: {e.sourceReference}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <FilterEmptyState label="No audit events match the current filters." />
        )}
      </div>
    </div>
  );
}
