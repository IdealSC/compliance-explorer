'use client';

/**
 * Validation Workbench — Phase 3.10.
 *
 * Pre-review validation workspace for draft regulatory changes.
 * Enables Legal and Compliance users to assess:
 * - Source support quality
 * - Citation accuracy (AI-linked drafts)
 * - Legal review requirements
 * - Draft readiness for formal review
 *
 * GOVERNANCE: This page displays and manages advisory validation metadata only.
 * No approval, publication, or active-data mutation occurs from this page.
 */

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DraftStatusBadge } from '@/components/badges';
import { SampleDataBanner } from '@/components/governance';
import { getDraftChanges, getDraftValidationReviews } from '@/lib/data';
import {
  ValidationStatusBadge,
  SourceSupportBadge,
  CitationAccuracyBadge,
} from '@/components/validation/ValidationStatusBadge';
import { ValidationDetailDrawer } from '@/components/validation/ValidationDetailDrawer';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';
import {
  ShieldCheck,
  Sparkles,
  Scale,
  AlertTriangle,
  BookOpen,
  Search,
  Eye,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import type { DraftValidationReview, DraftRegulatoryChange } from '@/types';

// ── Tab filter config ───────────────────────────────────────────

const TABS = [
  { key: 'needs_validation', label: 'Needs Validation', icon: Clock },
  { key: 'ai_linked', label: 'AI-Linked', icon: Sparkles },
  { key: 'legal_review', label: 'Legal Review', icon: Scale },
  { key: 'source_issues', label: 'Source Issues', icon: AlertTriangle },
  { key: 'returned', label: 'Returned', icon: RotateCcw },
  { key: 'validated', label: 'Validated', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'all', label: 'All', icon: BookOpen },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function ValidationWorkbenchPage() {
  // ── Data ────────────────────────────────────────────────────
  const allDrafts = React.useMemo(() => getDraftChanges(), []);
  const allReviews = React.useMemo(() => getDraftValidationReviews(), []);
  const draftMap = React.useMemo(
    () => new Map(allDrafts.map((d) => [d.draftId, d])),
    [allDrafts],
  );

  const isDbMode = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_DATA_SOURCE === 'database'
    : false;

  // ── DB mode state ─────────────────────────────────────────
  const [dbReviews, setDbReviews] = React.useState<DraftValidationReview[]>([]);
  const [loadingDb, setLoadingDb] = React.useState(false);

  const fetchDbReviews = React.useCallback(async () => {
    if (!isDbMode) return;
    setLoadingDb(true);
    try {
      const res = await fetch('/api/validation/drafts');
      const data = await res.json();
      if (res.ok && data.reviews) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDbReviews(data.reviews.map((r: any) => ({
          ...r,
          id: r.stableReferenceId ?? r.id,
        })));
      }
    } catch {
      // Non-critical
    } finally {
      setLoadingDb(false);
    }
  }, [isDbMode]);

  React.useEffect(() => {
    fetchDbReviews();
  }, [fetchDbReviews]);

  const reviews = isDbMode ? dbReviews : allReviews;

  // ── Filters ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<TabKey>('needs_validation');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    let result = reviews;

    // Tab filter
    switch (activeTab) {
      case 'needs_validation':
        result = result.filter((r) => ['not_started', 'in_validation'].includes(r.validationStatus));
        break;
      case 'ai_linked':
        result = result.filter((r) => r.validationType === 'ai_assisted_citation' || !!r.aiSuggestionId);
        break;
      case 'legal_review':
        result = result.filter((r) => r.validationStatus === 'legal_review_required' || r.legalReviewRequired);
        break;
      case 'source_issues':
        result = result.filter((r) => ['unsupported', 'missing_source', 'partially_supported'].includes(r.sourceSupportStatus));
        break;
      case 'returned':
        result = result.filter((r) => r.validationStatus === 'returned_for_revision');
        break;
      case 'validated':
        result = result.filter((r) => r.validationStatus === 'validated_for_review');
        break;
      case 'rejected':
        result = result.filter((r) => r.validationStatus === 'rejected');
        break;
      case 'all':
      default:
        break;
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const draft = draftMap.get(r.draftChangeId);
        return (
          r.id.toLowerCase().includes(q) ||
          r.draftChangeId.toLowerCase().includes(q) ||
          (draft?.proposedChangeSummary ?? '').toLowerCase().includes(q) ||
          (r.reviewerNotes ?? '').toLowerCase().includes(q) ||
          (r.validationFindings ?? '').toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [reviews, activeTab, searchQuery, draftMap]);

  // ── Summary metrics ───────────────────────────────────────
  const needsValidation = reviews.filter((r) => ['not_started', 'in_validation'].includes(r.validationStatus)).length;
  const aiLinked = reviews.filter((r) => r.validationType === 'ai_assisted_citation' || !!r.aiSuggestionId).length;
  const legalPending = reviews.filter((r) => r.legalReviewRequired && !r.legalReviewCompleted).length;
  const sourceIssues = reviews.filter((r) => ['unsupported', 'missing_source', 'partially_supported'].includes(r.sourceSupportStatus)).length;

  // ── Drawer ────────────────────────────────────────────────
  const [selectedReview, setSelectedReview] = React.useState<DraftValidationReview | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validation Workbench"
        description="Validate draft regulatory changes for source support, citation accuracy, and legal review requirements before formal approval."
        badge={{ label: `${reviews.length} reviews`, variant: 'secondary' }}
      />

      <SampleDataBanner />

      {/* ── Governance banner ────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2.5">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Phase 3.10 — Legal / Compliance Validation:</strong> Validation is advisory review metadata only.
          {' '}It does not approve, publish, activate, or modify controlled regulatory reference data.
          {' '}Validated drafts must still proceed through review → approval → publishing.
          {!isDbMode && ' Validation actions require database mode.'}
        </p>
      </div>

      {/* ── Summary metrics ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab('needs_validation')}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{needsValidation}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Needs Validation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab('ai_linked')}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <div>
                <p className="text-lg font-bold">{aiLinked}</p>
                <p className="text-[10px] text-muted-foreground font-medium">AI-Linked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab('legal_review')}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-lg font-bold">{legalPending}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Legal Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab('source_issues')}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-lg font-bold">{sourceIssues}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Source Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── DB mode controls ─────────────────────────────────── */}
      {isDbMode && (
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDbReviews}
            disabled={loadingDb}
            className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-[10px] font-semibold hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loadingDb ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Badge variant="outline" className="text-[10px]">
            <Database className="h-3 w-3 mr-1" />
            Database Mode
          </Badge>
        </div>
      )}

      {/* ── Tab filters ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${
              activeTab === key
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by ID, draft summary, notes, or findings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <FilterEmptyState label={reviews.length === 0
          ? 'No validation reviews found. Create a validation review from the Draft Workspace.'
          : `No validation reviews match the current filter.`
        } />
      )}

      <div className="space-y-3">
        {filtered.map((review) => {
          const draft = draftMap.get(review.draftChangeId);
          const isAiLinked = !!review.aiSuggestionId || review.validationType === 'ai_assisted_citation';

          return (
            <Card
              key={review.id}
              className={
                review.validationStatus === 'validated_for_review' ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                : review.validationStatus === 'rejected' ? 'border-red-500/30 bg-red-500/[0.02]'
                : review.validationStatus === 'returned_for_revision' ? 'border-amber-500/30 bg-amber-500/[0.02]'
                : review.validationStatus === 'in_validation' ? 'border-blue-500/30 bg-blue-500/[0.02]'
                : review.validationStatus === 'legal_review_required' ? 'border-purple-500/30 bg-purple-500/[0.02]'
                : ''
              }
            >
              <CardHeader className="border-b py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-primary font-bold">{review.id}</span>
                      <ValidationStatusBadge status={review.validationStatus} />
                      {draft && <DraftStatusBadge status={draft.draftStatus} />}
                      <SourceSupportBadge status={review.sourceSupportStatus} />
                      {isAiLinked && (
                        <Badge variant="outline" className="text-[10px] py-0 bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {review.legalReviewRequired && !review.legalReviewCompleted && (
                        <Badge variant="outline" className="text-[10px] py-0 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                          <Scale className="h-3 w-3 mr-1" />
                          Legal
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm leading-snug">
                      {draft?.proposedChangeSummary ?? `Validation for ${review.draftChangeId}`}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Draft</span>
                    <p className="mt-0.5 font-mono text-muted-foreground">{review.draftChangeId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</span>
                    <p className="mt-0.5 capitalize">{review.validationType.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Citation</span>
                    <div className="mt-0.5">
                      <CitationAccuracyBadge status={review.citationAccuracyStatus} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reviewer</span>
                    <p className="mt-0.5">{review.reviewedByName ?? '—'}</p>
                  </div>
                </div>

                {review.reviewerNotes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{review.reviewerNotes}</p>
                )}

                {review.requiredCorrections && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 line-clamp-2">
                      {review.requiredCorrections}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedReview(review)}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View validation details
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Detail Drawer ────────────────────────────────────── */}
      {selectedReview && (
        <ValidationDetailDrawer
          review={selectedReview}
          draft={draftMap.get(selectedReview.draftChangeId) ?? null}
          onClose={() => setSelectedReview(null)}
          isDbMode={isDbMode}
        />
      )}
    </div>
  );
}
