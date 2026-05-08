'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { RecordStatusBadge } from '@/components/badges';
import { SampleDataBanner } from '@/components/governance';
import { getVersionHistory } from '@/lib/data';
import { GitBranch, User, Calendar, Shield, ExternalLink } from 'lucide-react';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';

// ── Types ───────────────────────────────────────────────────────

interface EnrichedVersion {
  versionId: string;
  stableReferenceId: string;
  versionNumber: string;
  recordStatus: string;
  effectiveDate: string | null;
  supersededDate: string | null;
  changeSummary: string;
  approvedBy: string | null;
  approvedAt: string | null;
  previousVersionId: string | null;
  sourceReference: string | null;
  // Phase 2.6: Publication provenance
  publishedAt?: string | null;
  publishedByName?: string | null;
  publicationEventId?: string | null;
}

export default function VersionHistoryPage() {
  const [versions, setVersions] = React.useState<EnrichedVersion[]>([]);
  const [source, setSource] = React.useState<'json' | 'database'>('json');
  const [loading, setLoading] = React.useState(true);

  // Fetch versions — try API first, fall back to JSON
  React.useEffect(() => {
    let cancelled = false;
    async function fetchVersions() {
      try {
        const res = await fetch('/api/version-history');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setVersions(data.versions);
            setSource(data.source);
          }
          return;
        }
      } catch {
        // API unavailable, fall back
      }
      // JSON fallback
      if (!cancelled) {
        setVersions(
          getVersionHistory().map((v) => ({
            ...v,
            publishedAt: null,
            publishedByName: null,
            publicationEventId: null,
          })),
        );
        setSource('json');
      }
    }
    fetchVersions().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Get unique stable reference IDs
  const refIds = React.useMemo(() => {
    const ids = new Set(versions.map((v) => v.stableReferenceId));
    return Array.from(ids).sort();
  }, [versions]);

  const [selectedRef, setSelectedRef] = React.useState<string>('');

  // Auto-select first ref when data loads
  React.useEffect(() => {
    if (refIds.length > 0 && !selectedRef) {
      setSelectedRef(refIds[0]);
    }
  }, [refIds, selectedRef]);

  const timeline = React.useMemo(() => {
    return versions
      .filter((v) => v.stableReferenceId === selectedRef)
      .sort((a, b) => {
        // Sort by version number descending (newest first)
        const va = a.versionNumber.split('.').map(Number);
        const vb = b.versionNumber.split('.').map(Number);
        for (let i = 0; i < Math.max(va.length, vb.length); i++) {
          if ((vb[i] || 0) !== (va[i] || 0)) return (vb[i] || 0) - (va[i] || 0);
        }
        return 0;
      });
  }, [versions, selectedRef]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Version History"
          description="Loading version history…"
        />
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Version History"
        description="Track changes to individual regulatory records over time. Each version captures what changed, who approved it, and the authorization chain."
        badge={{ label: `${versions.length} versions · ${refIds.length} records`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      {/* Source indicator */}
      {source === 'database' && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
          <Shield className="h-3 w-3" />
          Database-backed version history with publication provenance
        </div>
      )}

      {/* Record selector */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="space-y-1">
          <label htmlFor="record-selector" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Select Regulatory Record
          </label>
          <select
            id="record-selector"
            value={selectedRef}
            onChange={(e) => setSelectedRef(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {refIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        {/* Cross-link to as-of trace */}
        {selectedRef && (
          <a
            href={`/as-of-trace`}
            className="flex items-center gap-1 text-xs text-primary hover:underline pb-1.5"
          >
            <ExternalLink className="h-3 w-3" />
            View as-of trace
          </a>
        )}
      </div>

      {/* Version timeline */}
      <div className="relative space-y-0">
        {timeline.map((ver, i) => {
          const isActive = ver.recordStatus === 'active';
          const isDraft = ver.recordStatus === 'draft';
          const isPendingReview = ver.recordStatus === 'pending_review';

          return (
            <div key={ver.versionId} className="relative flex gap-4">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  isActive ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                  : isDraft ? 'border-amber-500 border-dashed bg-amber-500/5 text-amber-600'
                  : isPendingReview ? 'border-violet-500 bg-violet-500/10 text-violet-600'
                  : 'border-zinc-300 dark:border-zinc-600 bg-muted text-muted-foreground'
                }`}>
                  <GitBranch className="h-3.5 w-3.5" />
                </div>
                {i < timeline.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${
                    isDraft ? 'border-l-2 border-dashed border-amber-400/40'
                    : isPendingReview ? 'border-l-2 border-dashed border-violet-400/40'
                    : 'bg-border'
                  }`} />
                )}
              </div>

              {/* Version card */}
              <Card
                size="sm"
                className={`flex-1 mb-3 ${
                  isActive ? 'border-emerald-500/30 bg-emerald-500/[0.02] ring-1 ring-emerald-500/20'
                  : isDraft ? 'border-dashed border-amber-500/40'
                  : isPendingReview ? 'border-dashed border-violet-500/40 ring-1 ring-violet-500/10'
                  : 'opacity-75'
                }`}
              >
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-foreground">v{ver.versionNumber}</span>
                    <RecordStatusBadge status={ver.recordStatus} />
                    <span className="font-mono text-[10px] text-muted-foreground">{ver.versionId}</span>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">{ver.changeSummary}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {ver.effectiveDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Effective: {ver.effectiveDate}</span>
                      </div>
                    )}
                    {ver.supersededDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Superseded: {ver.supersededDate}</span>
                      </div>
                    )}
                    {ver.approvedBy && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{ver.approvedBy}</span>
                      </div>
                    )}
                    {ver.approvedAt && (
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(ver.approvedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>

                  {ver.sourceReference && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ver.sourceReference}</p>
                    </div>
                  )}

                  {ver.previousVersionId && (
                    <p className="text-[10px] text-muted-foreground">
                      ← Previous: {ver.previousVersionId}
                    </p>
                  )}

                  {/* Phase 2.6: Publication Provenance */}
                  {(ver.publishedAt || ver.publishedByName || ver.publicationEventId) && (
                    <div className="border-t border-border pt-2 mt-1 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        <Shield className="h-2.5 w-2.5" />
                        Published
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                        {ver.publishedAt && (
                          <span>
                            {new Date(ver.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        )}
                        {ver.publishedByName && (
                          <span className="flex items-center gap-1">
                            <User className="h-2.5 w-2.5" />
                            {ver.publishedByName}
                          </span>
                        )}
                        {ver.publicationEventId && (
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {ver.publicationEventId}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}

        {timeline.length === 0 && (
          <FilterEmptyState label="No version history available for this record." />
        )}
      </div>
    </div>
  );
}
