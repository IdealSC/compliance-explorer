'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SampleDataBanner } from '@/components/governance/SampleDataBanner';
import {
  Sparkles, Search, Filter, Eye, XCircle, Clock, AlertTriangle,
  FileText, Shield, Zap, Scale, Link2, AlertCircle, Ban, Database,
  ChevronDown, Send, Loader2,
} from 'lucide-react';
import type { AiExtractionSuggestion, AiSuggestionStatus, AiSuggestionType } from '@/types/aiSuggestion';
import type { AiSuggestionWorkbenchMetrics } from '@/lib/services/ai-suggestion-reads';
import {
  AiSuggestionDetailDrawer,
  STATUS_COLORS, STATUS_LABELS, STATUS_ICONS, TYPE_COLORS, TYPE_ICONS,
} from '@/components/ai/AiSuggestionDetailDrawer';

// ── Tab Definitions ─────────────────────────────────────────────

const TABS = [
  { key: 'review', label: 'Needs Review', icon: Eye, filter: (r: AiExtractionSuggestion) => r.suggestionStatus === 'human_review_required' },
  { key: 'legal', label: 'Legal Review', icon: Scale, filter: (r: AiExtractionSuggestion) => r.legalReviewRequired && !['rejected', 'expired'].includes(r.suggestionStatus) },
  { key: 'low', label: 'Low Confidence', icon: AlertCircle, filter: (r: AiExtractionSuggestion) => r.confidenceScore != null && r.confidenceScore < 0.80 },
  { key: 'rejected', label: 'Rejected', icon: XCircle, filter: (r: AiExtractionSuggestion) => r.suggestionStatus === 'rejected' },
  { key: 'expired', label: 'Expired', icon: Clock, filter: (r: AiExtractionSuggestion) => r.suggestionStatus === 'expired' },
  { key: 'all', label: 'All Suggestions', icon: Sparkles, filter: () => true },
] as const;

const SUGGESTION_TYPES: AiSuggestionType[] = ['citation', 'obligation', 'interpretation', 'crosswalk', 'control', 'evidence', 'business_function', 'risk', 'other'];
const SUGGESTION_STATUSES: AiSuggestionStatus[] = ['generated', 'human_review_required', 'rejected', 'expired', 'superseded', 'accepted_to_draft'];

// ── Page ────────────────────────────────────────────────────────

export default function AiSuggestionsPage() {
  const [records, setRecords] = React.useState<AiExtractionSuggestion[]>([]);
  const [metrics, setMetrics] = React.useState<AiSuggestionWorkbenchMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('review');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [legalFilter, setLegalFilter] = React.useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = React.useState<string>('all');
  const [showFilters, setShowFilters] = React.useState(false);

  // ── Generation Panel State (Phase 3.8) ──────────────────────────
  const [showGenerate, setShowGenerate] = React.useState(false);
  const [genSourceRecordId, setGenSourceRecordId] = React.useState('');
  const [genSourceReference, setGenSourceReference] = React.useState('');
  const [genSourceExcerpt, setGenSourceExcerpt] = React.useState('');
  const [genSourceLocation, setGenSourceLocation] = React.useState('');
  const [genMaxSuggestions, setGenMaxSuggestions] = React.useState(10);
  const [genLoading, setGenLoading] = React.useState(false);
  const [genResult, setGenResult] = React.useState<{ success: boolean; message: string; count?: number } | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [sugRes, metRes] = await Promise.all([
        fetch('/api/ai/suggestions'),
        fetch('/api/ai/suggestions/metrics'),
      ]);
      if (!sugRes.ok) throw new Error('Failed to load suggestions');
      const sugJson = await sugRes.json();
      setRecords(sugJson.records ?? []);
      if (metRes.ok) {
        const metJson = await metRes.json();
        setMetrics(metJson.metrics ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerate = React.useCallback(async () => {
    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await fetch('/api/ai/citation-suggestions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceRecordId: genSourceRecordId.trim(),
          sourceReference: genSourceReference.trim(),
          sourceExcerpt: genSourceExcerpt.trim(),
          sourceLocation: genSourceLocation.trim() || undefined,
          maxSuggestions: genMaxSuggestions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenResult({ success: true, message: `Generated ${data.count} citation suggestion(s).`, count: data.count });
        loadData(); // Refresh list
      } else {
        setGenResult({ success: false, message: data.error ?? 'Generation failed.' });
      }
    } catch (e) {
      setGenResult({ success: false, message: e instanceof Error ? e.message : 'Network error.' });
    } finally {
      setGenLoading(false);
    }
  }, [genSourceRecordId, genSourceReference, genSourceExcerpt, genSourceLocation, genMaxSuggestions, loadData]);

  React.useEffect(() => { loadData(); }, [loadData]);

  // Apply tab + filters + search
  const filtered = React.useMemo(() => {
    const tab = TABS.find(t => t.key === activeTab) ?? TABS[5];
    let result = records.filter(tab.filter);

    if (typeFilter !== 'all') result = result.filter(r => r.suggestionType === typeFilter);
    if (statusFilter !== 'all') result = result.filter(r => r.suggestionStatus === statusFilter);
    if (legalFilter === 'yes') result = result.filter(r => r.legalReviewRequired);
    if (legalFilter === 'no') result = result.filter(r => !r.legalReviewRequired);
    if (confidenceFilter === 'low') result = result.filter(r => r.confidenceScore < 0.80);
    if (confidenceFilter === 'high') result = result.filter(r => r.confidenceScore >= 0.80);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.suggestedCitation?.toLowerCase().includes(term) ||
        r.suggestedObligationText?.toLowerCase().includes(term) ||
        r.sourceExcerpt?.toLowerCase().includes(term) ||
        r.stableReferenceId.toLowerCase().includes(term) ||
        r.sourceRecordId?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [records, activeTab, typeFilter, statusFilter, legalFilter, confidenceFilter, searchTerm]);

  const tabCounts = React.useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of TABS) c[t.key] = records.filter(t.filter).length;
    return c;
  }, [records]);

  const selectedRecord = selectedId ? records.find(r => r.stableReferenceId === selectedId) : null;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;
  if (error) return <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-6 text-red-700 dark:text-red-300"><h3 className="font-semibold mb-2">Error</h3><p>{error}</p></div>;

  return (
    <div className="space-y-6">
      <SampleDataBanner />

      {/* Governance Warning */}
      <div className="rounded-xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">AI Suggestion Governance — Draft-Only Records</h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-1 leading-relaxed">
              AI suggestions are <strong>draft-only candidate records</strong>. They are not active reference data, legal advice, or compliance determinations.
              All suggestions require human review before any action is taken. Accept-to-draft functionality is deferred to Phase 3.9.
            </p>
          </div>
        </div>
      </div>

      {/* AI Integration Status Banner (Phase 3.8) */}
      <div className="rounded-lg border border-indigo-300/40 bg-indigo-50 dark:bg-indigo-950/20 p-3 flex items-center gap-3">
        <Shield className="h-4 w-4 text-indigo-500 flex-shrink-0" />
        <p className="text-xs text-indigo-700 dark:text-indigo-400">
          <strong>AI Citation Extraction (Phase 3.8).</strong> When enabled via AI_PROVIDER and AI_FEATURE_CITATION_SUGGESTIONS_ENABLED,
          citation suggestions can be generated from validated source records. All output requires mandatory human review.
          Accept-to-draft remains disabled.
        </p>
      </div>

      {/* ── Citation Generation Panel (Phase 3.8) ────────────────── */}
      <div className="rounded-xl border border-indigo-400/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <button onClick={() => setShowGenerate(!showGenerate)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-indigo-100/30 dark:hover:bg-indigo-900/20 transition-colors rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold">Generate Citation Suggestions</span>
            <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/30">Phase 3.8</Badge>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showGenerate ? 'rotate-180' : ''}`} />
        </button>
        {showGenerate && (
          <div className="p-4 pt-0 space-y-4">
            {/* Governance Warnings */}
            <div className="grid gap-2">
              <div className="rounded-md border border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20 p-2">
                <p className="text-[10px] text-amber-700 dark:text-amber-400"><strong>⚠ Citation Only.</strong> This tool extracts candidate citation references only. It does not extract obligations, create draft mappings, or provide legal advice.</p>
              </div>
              <div className="rounded-md border border-rose-300/50 bg-rose-50/50 dark:bg-rose-950/20 p-2">
                <p className="text-[10px] text-rose-700 dark:text-rose-400"><strong>⚖ Legal Review Required.</strong> All generated citations are flagged for mandatory human and legal review. They are NOT active reference data.</p>
              </div>
              <div className="rounded-md border border-slate-300/50 bg-slate-50/50 dark:bg-slate-950/20 p-2">
                <p className="text-[10px] text-slate-700 dark:text-slate-400"><strong>🚫 Accept-to-Draft Disabled.</strong> Citations cannot be converted to draft records until Phase 3.9 controlled workflow is approved.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Source Record ID *</label>
                <Input value={genSourceRecordId} onChange={e => setGenSourceRecordId(e.target.value)} placeholder="SRC-001" className="text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Source Reference *</label>
                <Input value={genSourceReference} onChange={e => setGenSourceReference(e.target.value)} placeholder="21 CFR 211" className="text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Source Location</label>
                <Input value={genSourceLocation} onChange={e => setGenSourceLocation(e.target.value)} placeholder="Section 4.2" className="text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Max Suggestions</label>
                <Input type="number" min={1} max={20} value={genMaxSuggestions} onChange={e => setGenMaxSuggestions(parseInt(e.target.value) || 10)} className="text-xs" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Source Excerpt * (max 12,000 chars)</label>
              <textarea value={genSourceExcerpt} onChange={e => setGenSourceExcerpt(e.target.value)}
                placeholder="Paste regulatory source text here for citation extraction..."
                className="w-full min-h-[120px] text-xs p-2 border rounded-md bg-background resize-y" maxLength={12000} />
              <p className="text-[10px] text-muted-foreground text-right mt-0.5">{genSourceExcerpt.length} / 12,000</p>
            </div>

            {/* Result Message */}
            {genResult && (
              <div className={`rounded-md border p-3 ${
                genResult.success ? 'border-green-300 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                  : 'border-red-300 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'}`}>
                <p className="text-xs">{genResult.message}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <button onClick={handleGenerate}
                disabled={genLoading || !genSourceRecordId.trim() || !genSourceReference.trim() || !genSourceExcerpt.trim()}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {genLoading ? 'Generating...' : 'Generate Citation Suggestions'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold tracking-tight">AI Suggestion Review Workbench</h1>
            <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30">Phase 3.8</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Triage, review, reject, expire, and annotate AI extraction suggestions.</p>
        </div>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Total" value={metrics.total} icon={Sparkles} color="indigo" />
          <MetricCard label="Needs Review" value={metrics.reviewRequired} icon={Eye} color="amber" />
          <MetricCard label="Legal Review" value={metrics.legalReviewRequired} icon={Scale} color="rose" />
          <MetricCard label="Low Confidence" value={metrics.lowConfidence} icon={AlertCircle} color="orange" />
          <MetricCard label="Rejected" value={metrics.rejected} icon={XCircle} color="red" />
          <MetricCard label="Expired" value={metrics.expired} icon={Clock} color="gray" />
          <MetricCard label="Linked to Source" value={metrics.linkedToSource} icon={Link2} color="teal" />
          <MetricCard label="Linked to File" value={metrics.linkedToFile} icon={FileText} color="cyan" />
          <MetricCard label="Missing Excerpt" value={metrics.missingExcerpt} icon={AlertTriangle} color="amber" />
          <MetricCard label="Missing Location" value={metrics.missingLocation} icon={AlertTriangle} color="amber" />
          <MetricCard label="Generated" value={metrics.generated} icon={Zap} color="blue" />
          <MetricCard label="Blocked from Draft" value={metrics.blockedFromDraft} icon={Ban} color="slate" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === tab.key ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="h-3 w-3" />
              {tab.label}
              <span className="text-[10px] opacity-60">{tabCounts[tab.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search citations, obligations, source excerpts, IDs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 ${showFilters ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
          <Filter className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg border bg-muted/20">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full mt-1 text-xs p-1.5 border rounded bg-background">
              <option value="all">All Types</option>
              {SUGGESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full mt-1 text-xs p-1.5 border rounded bg-background">
              <option value="all">All Statuses</option>
              {SUGGESTION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Legal Review</label>
            <select value={legalFilter} onChange={e => setLegalFilter(e.target.value)} className="w-full mt-1 text-xs p-1.5 border rounded bg-background">
              <option value="all">Any</option>
              <option value="yes">Required</option>
              <option value="no">Not Required</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Confidence</label>
            <select value={confidenceFilter} onChange={e => setConfidenceFilter(e.target.value)} className="w-full mt-1 text-xs p-1.5 border rounded bg-background">
              <option value="all">Any</option>
              <option value="low">Below 80%</option>
              <option value="high">80% or above</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No AI suggestions match the current filters.</p>
          <p className="text-xs mt-1 max-w-md mx-auto">An empty result set in sample mode does not indicate absence of real-world compliance risk. In production, this workbench would display AI-generated candidate extractions for human review.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(record => (
            <button key={record.stableReferenceId} onClick={() => setSelectedId(record.stableReferenceId)}
              className="w-full text-left rounded-xl border bg-card p-4 hover:border-indigo-400/50 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${TYPE_COLORS[record.suggestionType]}`}>
                    <span className="mr-1">{TYPE_ICONS[record.suggestionType]}</span>{record.suggestionType}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${STATUS_COLORS[record.suggestionStatus]}`}>
                    <span className="mr-1">{STATUS_ICONS[record.suggestionStatus]}</span>{STATUS_LABELS[record.suggestionStatus]}
                  </Badge>
                  {record.legalReviewRequired && <Badge variant="outline" className="text-xs bg-rose-500/15 text-rose-600 border-rose-500/30">⚖ Legal</Badge>}
                  {record.confidenceScore < 0.80 && <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-600 border-amber-500/30">Low Confidence</Badge>}
                </div>
                {record.confidenceScore != null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <div className="h-1.5 w-14 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${record.confidenceScore < 0.80 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                        style={{ width: `${record.confidenceScore * 100}%` }} />
                    </div>
                    <span>{(record.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <h3 className="mt-2 font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {record.suggestedCitation || record.sourceLocation || 'Untitled Suggestion'}
              </h3>
              {record.suggestedObligationText && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{record.suggestedObligationText}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span className="font-mono opacity-60">{record.stableReferenceId}</span>
                {record.sourceRecordId && <span>Source: {record.sourceRecordId}</span>}
                <span>Model: {record.modelName} / {record.promptVersion}</span>
                <span>{new Date(record.generatedAt).toLocaleDateString()}</span>
              </div>
              {record.reviewerNotes && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                  <p className="text-xs text-red-700 dark:text-red-400"><strong>Reviewer:</strong> {record.reviewerNotes}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Drawer */}
      {selectedRecord && (
        <AiSuggestionDetailDrawer record={selectedRecord} onClose={() => setSelectedId(null)}
          onActionComplete={() => { setSelectedId(null); loadData(); }} />
      )}

      {/* Footer */}
      <div className="border-t pt-4 mt-6">
        <p className="text-[10px] text-muted-foreground">
          AI suggestions are draft-only governance records. They do not modify active reference data, operational status, or audit logs.
          Accept-to-draft is not enabled. Citation suggestions require human review. Not legal advice. Not a validated GxP system.
        </p>
      </div>
    </div>
  );
}

// ── Metric Card ─────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-500/10', amber: 'text-amber-600 bg-amber-500/10',
    rose: 'text-rose-600 bg-rose-500/10', orange: 'text-orange-600 bg-orange-500/10',
    red: 'text-red-600 bg-red-500/10', gray: 'text-gray-500 bg-gray-500/10',
    teal: 'text-teal-600 bg-teal-500/10', cyan: 'text-cyan-600 bg-cyan-500/10',
    blue: 'text-blue-600 bg-blue-500/10', slate: 'text-slate-600 bg-slate-500/10',
  };
  const c = colorMap[color] || colorMap.gray;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${c}`}><Icon className="h-3.5 w-3.5" /></div>
          <div>
            <p className="text-lg font-bold leading-tight">{value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
