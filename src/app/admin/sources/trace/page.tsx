'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecordStatusBadge } from '@/components/badges';
import { SampleDataBanner, GovernanceWarningBanner } from '@/components/governance';
import { getVersionHistory } from '@/lib/data';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import {
  Clock,
  Search,
  GitBranch,
  User,
  Calendar,
  FileCheck,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────

interface VersionResult {
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
  publishedAt: string | null;
  publishedByName: string | null;
  publicationEventId: string | null;
}

interface AsOfResponse {
  version: VersionResult | null;
  asOfDate: string;
  stableReferenceId: string;
  allVersionsCount: number;
}

// ═══ Page ════════════════════════════════════════════════════════

export default function AsOfTracePage() {
  // JSON mode: load version history for client-side filtering
  const jsonVersions = React.useMemo(() => getVersionHistory(), []);
  const jsonRefIds = React.useMemo(() => {
    const ids = new Set(jsonVersions.map((v) => v.stableReferenceId));
    return Array.from(ids).sort();
  }, [jsonVersions]);

  // State
  const [selectedRef, setSelectedRef] = React.useState<string>(jsonRefIds[0] || '');
  const [asOfDate, setAsOfDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [result, setResult] = React.useState<AsOfResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // ── Lookup Handler ────────────────────────────────────────────
  const handleLookup = React.useCallback(async () => {
    if (!selectedRef || !asOfDate) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Try database API first
      const res = await fetch(
        `/api/version-history/as-of?stableReferenceId=${encodeURIComponent(selectedRef)}&asOfDate=${encodeURIComponent(asOfDate)}`,
      );

      if (res.status === 503) {
        // JSON mode fallback — filter locally
        const asOfDateObj = new Date(asOfDate);
        const asOfDateStr = asOfDate;

        const candidates = jsonVersions
          .filter((v) => v.stableReferenceId === selectedRef)
          .filter((v) => {
            if (!v.effectiveDate) return false;
            if (v.effectiveDate > asOfDateStr) return false;
            if (v.supersededDate && v.supersededDate <= asOfDateStr) return false;
            return true;
          })
          .sort((a, b) => {
            const va = a.versionNumber.split('.').map(Number);
            const vb = b.versionNumber.split('.').map(Number);
            for (let i = 0; i < Math.max(va.length, vb.length); i++) {
              if ((vb[i] || 0) !== (va[i] || 0)) return (vb[i] || 0) - (va[i] || 0);
            }
            return 0;
          });

        const match = candidates[0] ?? null;
        const allVersionsCount = jsonVersions.filter(
          (v) => v.stableReferenceId === selectedRef,
        ).length;

        setResult({
          version: match
            ? {
                ...match,
                recordStatus: match.recordStatus,
                publishedAt: null,
                publishedByName: null,
                publicationEventId: null,
              }
            : null,
          asOfDate: asOfDateStr,
          stableReferenceId: selectedRef,
          allVersionsCount,
        });
        return;
      }

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Lookup failed');
        return;
      }

      const data: AsOfResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [selectedRef, asOfDate, jsonVersions]);

  // ── Render ────────────────────────────────────────────────────

  const ver = result?.version;

  return (
    <div className="space-y-6">
      <PageHeader
        title="As-Of Traceability"
        description="Look up what version of a regulatory record was active at any point in time. Provides full provenance including publication event, approval chain, and audit trail."
        badge={{ label: 'Phase 2.6', variant: 'secondary' }}
      />

      <SampleDataBanner />
      <GovernanceWarningBanner>
        As-of lookups are read-only queries against version history. They do not modify active regulatory reference data, operational status, or audit logs. In JSON mode, lookups use sample data only.
      </GovernanceWarningBanner>

      {/* ── Input Panel ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Historical Lookup
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Record selector */}
            <div className="space-y-1">
              <label
                htmlFor="as-of-ref"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Regulatory Record
              </label>
              <select
                id="as-of-ref"
                value={selectedRef}
                onChange={(e) => {
                  setSelectedRef(e.target.value);
                  setHasSearched(false);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {jsonRefIds.length === 0 && (
                  <option value="">No records available</option>
                )}
                {jsonRefIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div className="space-y-1">
              <label
                htmlFor="as-of-date"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                As-Of Date
              </label>
              <input
                id="as-of-date"
                type="date"
                value={asOfDate}
                onChange={(e) => {
                  setAsOfDate(e.target.value);
                  setHasSearched(false);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            {/* Lookup button */}
            <Button
              onClick={handleLookup}
              disabled={loading || !selectedRef || !asOfDate}
              className="h-9 gap-2"
            >
              <Search className="h-3.5 w-3.5" />
              {loading ? 'Looking up…' : 'Look Up'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Error State ──────────────────────────────────────── */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Result Panel ─────────────────────────────────────── */}
      {hasSearched && !loading && !error && result && (
        <div className="space-y-4">
          {/* Summary header */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              As of <strong className="text-foreground">{result.asOfDate}</strong> for{' '}
              <strong className="text-foreground font-mono">{result.stableReferenceId}</strong>
              {result.allVersionsCount > 0 && (
                <span className="ml-2 text-[10px]">
                  ({result.allVersionsCount} total version{result.allVersionsCount !== 1 ? 's' : ''})
                </span>
              )}
            </span>
          </div>

          {ver ? (
            <Card
              className={`${
                ver.recordStatus === 'active'
                  ? 'border-emerald-500/30 bg-emerald-500/[0.02] ring-1 ring-emerald-500/20'
                  : ver.recordStatus === 'superseded'
                  ? 'border-zinc-400/30 bg-zinc-500/[0.02]'
                  : 'border-border'
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Version header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600">
                    <GitBranch className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-mono text-lg font-bold text-foreground">
                    v{ver.versionNumber}
                  </span>
                  <RecordStatusBadge status={ver.recordStatus} />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {ver.versionId}
                  </span>
                </div>

                {/* Change summary */}
                <p className="text-sm text-foreground leading-relaxed">
                  {ver.changeSummary}
                </p>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {ver.effectiveDate && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Effective: <strong className="text-foreground">{ver.effectiveDate}</strong>
                      </span>
                    </div>
                  )}
                  {ver.supersededDate && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Superseded: <strong className="text-foreground">{ver.supersededDate}</strong>
                      </span>
                    </div>
                  )}
                  {ver.approvedBy && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{ver.approvedBy}</span>
                    </div>
                  )}
                  {ver.approvedAt && (
                    <div className="text-muted-foreground">
                      Approved:{' '}
                      {new Date(ver.approvedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>

                {/* Source reference */}
                {ver.sourceReference && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Source Reference
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ver.sourceReference}
                    </p>
                  </div>
                )}

                {/* Previous version link */}
                {ver.previousVersionId && (
                  <p className="text-[10px] text-muted-foreground">
                    ← Previous version: {ver.previousVersionId}
                  </p>
                )}

                {/* ── Publication Provenance ──────────────────── */}
                {(ver.publishedAt || ver.publishedByName || ver.publicationEventId) && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      <Shield className="h-3 w-3" />
                      Publication Provenance
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {ver.publishedAt && (
                        <div className="text-muted-foreground">
                          Published:{' '}
                          <strong className="text-foreground">
                            {new Date(ver.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </strong>
                        </div>
                      )}
                      {ver.publishedByName && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{ver.publishedByName}</span>
                        </div>
                      )}
                      {ver.publicationEventId && (
                        <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                          Event: {ver.publicationEventId}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <FilterEmptyState
              label={`No active version found for "${result.stableReferenceId}" as of ${result.asOfDate}.`}
              context={
                result.allVersionsCount > 0
                  ? `This record has ${result.allVersionsCount} version(s), but none were active on the selected date. Try an earlier or later date.`
                  : 'This record has no version history. It may not have been published yet.'
              }
            />
          )}

          {/* Cross-link to full version history */}
          {result.allVersionsCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <a
                href="/version-history"
                className="text-primary hover:underline"
              >
                View full version history →
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Initial state ────────────────────────────────────── */}
      {!hasSearched && !loading && (
        <div className="py-12 text-center space-y-2">
          <Clock className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Select a regulatory record and date to see what version was active at that point in time.
          </p>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="border-t border-border pt-4 mt-6">
        <p className="text-[10px] text-muted-foreground">
          As-of traceability provides read-only historical lookups. It does not modify active regulatory reference data, operational status, version history, or audit logs. All lookups are based on sample/demonstration data in JSON mode. Not legal advice. Not a validated GxP system.
        </p>
      </div>
    </div>
  );
}
