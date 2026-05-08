'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { IntakeDetailDrawer } from '@/components/detail/IntakeDetailDrawer';
import { SampleDataBanner } from '@/components/governance/SampleDataBanner';
import {
  Inbox, Search, Filter, Scale, Clock,
  AlertCircle, CheckCircle2, ArrowRight, XCircle,
  FileText, Globe, Building2, User,
} from 'lucide-react';
import type { SourceIntakeRequest, IntakeStatus, IntakePriority } from '@/types/sourceIntake';

// ── Status / Priority Colors ────────────────────────────────────

const STATUS_COLORS: Record<IntakeStatus, string> = {
  submitted: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  triage: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  metadata_review: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  assigned: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  validation_pending: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  legal_review_required: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  ready_for_source_record: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  converted_to_source_record: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  closed: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

const STATUS_ICONS: Record<IntakeStatus, React.ReactNode> = {
  submitted: <Inbox className="h-3.5 w-3.5" />,
  triage: <Filter className="h-3.5 w-3.5" />,
  metadata_review: <FileText className="h-3.5 w-3.5" />,
  assigned: <User className="h-3.5 w-3.5" />,
  validation_pending: <Clock className="h-3.5 w-3.5" />,
  legal_review_required: <Scale className="h-3.5 w-3.5" />,
  ready_for_source_record: <CheckCircle2 className="h-3.5 w-3.5" />,
  converted_to_source_record: <ArrowRight className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  closed: <AlertCircle className="h-3.5 w-3.5" />,
};

const PRIORITY_COLORS: Record<IntakePriority, string> = {
  critical: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  low: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

// ── Status filter tabs ──────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: string; statuses: IntakeStatus[] }[] = [
  { label: 'All', value: 'all', statuses: [] },
  { label: 'Open', value: 'open', statuses: ['submitted', 'triage', 'metadata_review', 'assigned', 'validation_pending', 'legal_review_required'] },
  { label: 'Ready', value: 'ready', statuses: ['ready_for_source_record'] },
  { label: 'Converted', value: 'converted', statuses: ['converted_to_source_record'] },
  { label: 'Rejected', value: 'rejected', statuses: ['rejected'] },
  { label: 'Closed', value: 'closed', statuses: ['closed'] },
];

export default function SourceIntakePage() {
  const [records, setRecords] = React.useState<SourceIntakeRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dataSource, setDataSource] = React.useState<'json' | 'database'>('json');

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const [selectedIntake, setSelectedIntake] = React.useState<SourceIntakeRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const fetchRecords = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sources/intake');
      if (!res.ok) throw new Error('Failed to load intake requests');
      const data = await res.json();
      setRecords(data.records ?? []);
      setDataSource(data.dataSource === 'database' ? 'database' : 'json');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Handle refresh from drawer actions
  function handleRefresh() {
    fetchRecords();
    // Reload the selected record
    if (selectedIntake) {
      const id = selectedIntake.stableReferenceId ?? selectedIntake.id;
      fetch(`/api/sources/intake/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.record) {
            setSelectedIntake(data.record);
          }
        })
        .catch(() => {});
    }
  }

  // Filter records
  const filtered = React.useMemo(() => {
    let result = [...records];

    // Status filter
    const filterDef = STATUS_FILTERS.find(f => f.value === statusFilter);
    if (filterDef && filterDef.statuses.length > 0) {
      result = result.filter(r => filterDef.statuses.includes(r.intakeStatus));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.intakeTitle.toLowerCase().includes(q) ||
        (r.intakeDescription ?? '').toLowerCase().includes(q) ||
        (r.regulator ?? '').toLowerCase().includes(q) ||
        (r.jurisdiction ?? '').toLowerCase().includes(q) ||
        (r.sourceType ?? '').toLowerCase().includes(q) ||
        (r.stableReferenceId ?? '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [records, statusFilter, search]);

  // Status counts
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: records.length };
    for (const filter of STATUS_FILTERS) {
      if (filter.value === 'all') continue;
      counts[filter.value] = records.filter(r => filter.statuses.includes(r.intakeStatus)).length;
    }
    return counts;
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            Source Intake
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controlled intake, triage, and validation of new regulatory source materials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {dataSource === 'database' ? '🗄️ Database' : '📄 JSON'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {records.length} request{records.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {filter.label}
            <span className="ml-1.5 opacity-70">{statusCounts[filter.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search intake requests..."
          className="pl-9 h-9 text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Loading intake requests...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Records grid */}
      {!loading && !error && (
        <div className="grid gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No intake requests found.
            </div>
          )}

          {filtered.map(record => {
            const id = record.stableReferenceId ?? record.id;
            const completedItems = (record.checklistItems ?? []).filter((i: { status: string }) => i.status === 'complete').length;
            const totalItems = (record.checklistItems ?? []).length;

            return (
              <button
                key={id}
                onClick={() => { setSelectedIntake(record); setDrawerOpen(true); }}
                className="w-full text-left p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 hover:border-border transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground">{id}</span>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[record.intakeStatus] ?? ''}`}>
                        <span className="mr-1">{STATUS_ICONS[record.intakeStatus]}</span>
                        {record.intakeStatus.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[record.priority] ?? ''}`}>
                        {record.priority}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {record.intakeTitle}
                    </h3>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {record.intakeType.replace(/_/g, ' ')}
                      </span>
                      {record.jurisdiction && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {record.jurisdiction}
                        </span>
                      )}
                      {record.regulator && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {record.regulator}
                        </span>
                      )}
                      {record.assignedToName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {record.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right — checklist progress */}
                  <div className="shrink-0 text-right">
                    {totalItems > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        {completedItems}/{totalItems} items
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(completedItems / totalItems) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {record.legalReviewRequired && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-rose-500/10 text-rose-600 border-rose-500/20">
                          <Scale className="h-2.5 w-2.5 mr-0.5" /> Legal
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <SampleDataBanner />

      {/* Detail Drawer */}
      <IntakeDetailDrawer
        intake={selectedIntake}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        dataSource={dataSource}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
