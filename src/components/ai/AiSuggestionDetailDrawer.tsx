'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  XCircle, AlertTriangle, Shield, Eye, Clock, CheckCircle2,
  FileText, ArrowRight, Zap, AlertCircle, Filter, Sparkles,
  Scale, Ban, MessageSquare, Send, ArrowUpRight, Loader2,
} from 'lucide-react';
import type { AiExtractionSuggestion, AiSuggestionStatus, AiSuggestionType } from '@/types/aiSuggestion';

// ── Style Maps ──────────────────────────────────────────────────

const STATUS_COLORS: Record<AiSuggestionStatus, string> = {
  generated: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  human_review_required: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  accepted_to_draft: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
  superseded: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
  expired: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

const STATUS_LABELS: Record<AiSuggestionStatus, string> = {
  generated: 'Generated', human_review_required: 'Needs Review',
  accepted_to_draft: 'Accepted to Draft', rejected: 'Rejected',
  superseded: 'Superseded', expired: 'Expired',
};

const STATUS_ICONS: Record<AiSuggestionStatus, React.ReactNode> = {
  generated: <Zap className="h-3.5 w-3.5" />,
  human_review_required: <Eye className="h-3.5 w-3.5" />,
  accepted_to_draft: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  superseded: <ArrowRight className="h-3.5 w-3.5" />,
  expired: <Clock className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<AiSuggestionType, string> = {
  citation: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  obligation: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  control: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  crosswalk: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  interpretation: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
  evidence: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  business_function: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  risk: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  other: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

const TYPE_ICONS: Record<AiSuggestionType, React.ReactNode> = {
  citation: <FileText className="h-3.5 w-3.5" />, obligation: <Shield className="h-3.5 w-3.5" />,
  control: <CheckCircle2 className="h-3.5 w-3.5" />, crosswalk: <ArrowRight className="h-3.5 w-3.5" />,
  interpretation: <AlertCircle className="h-3.5 w-3.5" />, evidence: <FileText className="h-3.5 w-3.5" />,
  business_function: <Sparkles className="h-3.5 w-3.5" />, risk: <AlertTriangle className="h-3.5 w-3.5" />,
  other: <Filter className="h-3.5 w-3.5" />,
};

// Re-export for page use
export { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS, TYPE_COLORS, TYPE_ICONS };

// ── Props ───────────────────────────────────────────────────────

interface Props {
  record: AiExtractionSuggestion;
  onClose: () => void;
  onActionComplete?: () => void;
}

// ── Component ───────────────────────────────────────────────────

export function AiSuggestionDetailDrawer({ record, onClose, onActionComplete }: Props) {
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [notesInput, setNotesInput] = React.useState('');
  const [rejectReason, setRejectReason] = React.useState('');
  const [expireReason, setExpireReason] = React.useState('');
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [showExpireForm, setShowExpireForm] = React.useState(false);
  const [showNotesForm, setShowNotesForm] = React.useState(false);

  const isTerminal = ['rejected', 'expired', 'accepted_to_draft'].includes(record.suggestionStatus);
  const isGenerated = record.suggestionStatus === 'generated';
  const confidencePct = record.confidenceScore != null ? (record.confidenceScore * 100).toFixed(0) : null;
  const isLowConfidence = record.confidenceScore != null && record.confidenceScore < 0.80;

  async function performAction(action: string, body: Record<string, unknown>) {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/ai/suggestions/${record.stableReferenceId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || 'Action failed');
        return;
      }
      setActionSuccess(`Action "${action}" completed. Audit: ${json.auditEventId || 'n/a'}`);
      setShowRejectForm(false);
      setShowExpireForm(false);
      setShowNotesForm(false);
      onActionComplete?.();
    } catch {
      setActionError('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-background border-l shadow-2xl overflow-y-auto animate-in slide-in-from-right-5 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-lg border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-lg">AI Suggestion Detail</h2>
            <p className="text-xs text-muted-foreground font-mono">{record.stableReferenceId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* F. Governance Warnings */}
          <div className="rounded-lg border-2 border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>⚠ Draft-only governance record.</strong> AI suggestions are draft-only candidate records. They are not active reference data, legal advice, or compliance determinations.
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
              Citation suggestions may be converted to draft changes via the controlled conversion panel below. Converted drafts must go through the standard review → approval → publish pipeline before becoming active reference data.
            </p>
          </div>

          {/* A. Suggestion Summary */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Suggestion Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground">Status</span>
                <div className="mt-0.5">
                  <Badge variant="outline" className={STATUS_COLORS[record.suggestionStatus]}>
                    <span className="mr-1">{STATUS_ICONS[record.suggestionStatus]}</span>
                    {STATUS_LABELS[record.suggestionStatus]}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Type</span>
                <div className="mt-0.5">
                  <Badge variant="outline" className={TYPE_COLORS[record.suggestionType]}>
                    <span className="mr-1">{TYPE_ICONS[record.suggestionType]}</span>
                    {record.suggestionType}
                  </Badge>
                </div>
              </div>
              {confidencePct && (
                <div>
                  <span className="text-[10px] text-muted-foreground">Confidence</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isLowConfidence ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${confidencePct}%` }} />
                    </div>
                    <span className={`text-xs font-semibold ${isLowConfidence ? 'text-amber-600' : ''}`}>{confidencePct}%</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-[10px] text-muted-foreground">Legal Review</span>
                <p className="text-sm mt-0.5">{record.legalReviewRequired ? <span className="text-rose-600 font-medium">⚖ Required</span> : 'Not required'}</p>
              </div>
            </div>
            {record.confidenceExplanation && (
              <p className="text-xs text-muted-foreground mt-2 italic">{record.confidenceExplanation}</p>
            )}
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              <div><span className="opacity-60">Generated:</span> {new Date(record.generatedAt).toLocaleString()}</div>
              <div><span className="opacity-60">By:</span> {record.generatedBy}</div>
              {record.sourceReference && <div className="col-span-2"><span className="opacity-60">Source Ref:</span> {record.sourceReference}</div>}
            </div>
          </section>

          {/* B. Source Support */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Source Support</h3>
            <div className="space-y-2 text-sm">
              <KV label="Source Record" value={record.sourceRecordId} />
              <KV label="Source File" value={record.sourceFileId} />
              <KV label="Intake Request" value={record.intakeRequestId} />
              {record.sourceLocation && <KV label="Source Location" value={record.sourceLocation} />}
            </div>
            {record.sourceExcerpt ? (
              <div className="mt-2 p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs italic">&quot;{record.sourceExcerpt}&quot;</p>
              </div>
            ) : (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300/40">
                <p className="text-xs text-amber-700 dark:text-amber-400">⚠ Missing source excerpt</p>
              </div>
            )}
            {!record.sourceLocation && (
              <div className="mt-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300/40">
                <p className="text-xs text-amber-700 dark:text-amber-400">⚠ Missing source location reference</p>
              </div>
            )}
          </section>

          {/* C. Suggested Content */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Suggested Content</h3>
            <div className="space-y-2">
              <KV label="Citation" value={record.suggestedCitation} />
              <KV label="Obligation" value={record.suggestedObligationText} />
              <KV label="Plain English" value={record.suggestedPlainEnglishInterpretation} />
              <Tags label="Business Functions" tags={record.suggestedBusinessFunctions} />
              <Tags label="Controls" tags={record.suggestedControls} />
              <Tags label="Evidence" tags={record.suggestedEvidence} />
              <Tags label="Standards" tags={record.suggestedStandards} />
            </div>
          </section>

          {/* D. Model & Prompt */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Model &amp; Prompt Metadata</h3>
            <p className="text-[10px] text-muted-foreground italic mb-2">Metadata describes the model configuration that generated this record. No model is currently integrated or executing.</p>
            <div className="grid grid-cols-2 gap-2">
              <KV label="Model" value={record.modelName} />
              <KV label="Model Version" value={record.modelVersion} />
              <KV label="Prompt Version" value={record.promptVersion} />
              <KV label="Source Record" value={record.sourceRecordId} />
            </div>
          </section>

          {/* E. Human Review */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Human Review</h3>
            {record.reviewedAt ? (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-muted-foreground">Decision</span><p className="capitalize">{record.reviewerDecision || '—'}</p></div>
                  <div><span className="text-xs text-muted-foreground">By</span><p>{record.reviewedByEmail || 'Unknown'}</p></div>
                  <div className="col-span-2"><span className="text-xs text-muted-foreground">At</span><p>{new Date(record.reviewedAt).toLocaleString()}</p></div>
                </div>
                {record.reviewerNotes && (
                  <div className="p-2 rounded bg-muted/40 border mt-2">
                    <span className="text-xs text-muted-foreground">Notes</span>
                    <p className="text-sm mt-0.5">{record.reviewerNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No human review recorded yet.</p>
            )}
          </section>

          {/* Reviewer Actions */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reviewer Actions</h3>

            {actionError && <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 text-xs text-red-700 dark:text-red-400 mb-2">{actionError}</div>}
            {actionSuccess && <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 text-xs text-emerald-700 dark:text-emerald-400 mb-2">{actionSuccess}</div>}

            <div className="space-y-2">
              {/* Mark for Review */}
              {isGenerated && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs" disabled={actionLoading}
                  onClick={() => performAction('mark_for_review', {})}>
                  <Eye className="h-3.5 w-3.5" /> Mark as Human Review Required
                </Button>
              )}

              {/* Toggle Legal Review */}
              {!isTerminal && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs" disabled={actionLoading}
                  onClick={() => performAction('toggle_legal_review', { legalReviewRequired: !record.legalReviewRequired })}>
                  <Scale className="h-3.5 w-3.5" /> {record.legalReviewRequired ? 'Remove Legal Review Flag' : 'Mark Legal Review Required'}
                </Button>
              )}

              {/* Reject */}
              {!isTerminal && !showRejectForm && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs text-red-600" disabled={actionLoading}
                  onClick={() => setShowRejectForm(true)}>
                  <XCircle className="h-3.5 w-3.5" /> Reject Suggestion
                </Button>
              )}
              {showRejectForm && (
                <div className="p-3 rounded-lg border space-y-2">
                  <textarea className="w-full text-xs p-2 border rounded resize-none" rows={3} placeholder="Rejection reason (required)..."
                    value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="text-xs gap-1" disabled={actionLoading || !rejectReason.trim()}
                      onClick={() => performAction('reject', { reviewerNotes: rejectReason })}>
                      <Send className="h-3 w-3" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Expire */}
              {!isTerminal && !showExpireForm && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs" disabled={actionLoading}
                  onClick={() => setShowExpireForm(true)}>
                  <Clock className="h-3.5 w-3.5" /> Expire Suggestion
                </Button>
              )}
              {showExpireForm && (
                <div className="p-3 rounded-lg border space-y-2">
                  <textarea className="w-full text-xs p-2 border rounded resize-none" rows={2} placeholder="Expiration reason (optional)..."
                    value={expireReason} onChange={e => setExpireReason(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1" disabled={actionLoading}
                      onClick={() => performAction('expire', { reason: expireReason || undefined })}>
                      <Send className="h-3 w-3" /> Expire
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowExpireForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Update Notes */}
              {!showNotesForm && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs" disabled={actionLoading || isTerminal}
                  onClick={() => setShowNotesForm(true)}>
                  <MessageSquare className="h-3.5 w-3.5" /> {record.reviewerNotes ? 'Update' : 'Add'} Reviewer Notes
                </Button>
              )}
              {showNotesForm && (
                <div className="p-3 rounded-lg border space-y-2">
                  <textarea className="w-full text-xs p-2 border rounded resize-none" rows={3} placeholder="Reviewer notes..."
                    value={notesInput} onChange={e => setNotesInput(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1" disabled={actionLoading || !notesInput.trim()}
                      onClick={() => performAction('update_notes', { reviewerNotes: notesInput })}>
                      <Send className="h-3 w-3" /> Save Notes
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowNotesForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Accept-to-Draft — Citation Conversion (Phase 3.9) */}
              <ConvertToDraftPanel record={record} onActionComplete={onActionComplete} />

              {isTerminal && (
                <p className="text-xs text-muted-foreground italic mt-1">This suggestion is in a terminal state. Most actions are disabled.</p>
              )}
            </div>
          </section>

          {/* Timestamps */}
          <div className="border-t pt-4 space-y-1 text-xs text-muted-foreground">
            <p>Created: {new Date(record.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(record.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Convert to Draft Panel (Phase 3.9) ──────────────────────────

interface ConvertPanelProps {
  record: AiExtractionSuggestion;
  onActionComplete?: () => void;
}

function ConvertToDraftPanel({ record, onActionComplete }: ConvertPanelProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<{ draftChangeId: string; auditEventId: string } | null>(null);
  const [relatedUpdateId, setRelatedUpdateId] = React.useState('');
  const [changeReason, setChangeReason] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [updates, setUpdates] = React.useState<{ stableReferenceId: string; updateTitle: string }[]>([]);
  const [updatesLoading, setUpdatesLoading] = React.useState(false);

  const isCitation = record.suggestionType === 'citation';
  const isEligibleStatus = ['generated', 'human_review_required'].includes(record.suggestionStatus);
  const hasCitation = !!record.suggestedCitation?.trim();
  const hasSourceRef = !!record.sourceReference?.trim();
  const hasSourceExcerpt = !!record.sourceExcerpt?.trim();
  const isNotTerminal = !['rejected', 'expired', 'accepted_to_draft'].includes(record.suggestionStatus);
  const allEligible = isCitation && isEligibleStatus && hasCitation && hasSourceRef && hasSourceExcerpt && isNotTerminal;

  // Already converted
  if (record.suggestionStatus === 'accepted_to_draft' && record.relatedDraftChangeId) {
    return (
      <div className="rounded-lg border-2 border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/20 p-3 space-y-2">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Converted to Draft Change
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400/80 font-mono">
          Draft ID: {record.relatedDraftChangeId}
        </p>
        <a href="/draft-mapping" className="text-xs text-primary hover:underline flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3" /> View in Draft Workspace
        </a>
        <p className="text-[10px] text-muted-foreground italic mt-1">
          This draft must go through the standard review → approval → publish pipeline before becoming active reference data.
        </p>
      </div>
    );
  }

  // Non-citation suggestions
  if (!isCitation) {
    return (
      <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs opacity-40 cursor-not-allowed" disabled>
        <Ban className="h-3.5 w-3.5" /> Only citation suggestions may be converted to draft changes
      </Button>
    );
  }

  // Load regulatory updates when form opens
  const loadUpdates = async () => {
    setUpdatesLoading(true);
    try {
      const res = await fetch('/api/staging/regulatory-updates');
      if (res.ok) {
        const json = await res.json();
        const list = (json.records ?? json.updates ?? []) as { stableReferenceId?: string; id?: string; updateTitle?: string }[];
        setUpdates(list.map(u => ({
          stableReferenceId: u.stableReferenceId || u.id || '',
          updateTitle: u.updateTitle || 'Untitled',
        })));
      }
    } catch { /* ignore */ }
    setUpdatesLoading(false);
  };

  const handleConvert = async () => {
    if (!relatedUpdateId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/suggestions/${record.stableReferenceId}/accept-to-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relatedUpdateId,
          ...(changeReason.trim() ? { changeReason: changeReason.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Conversion failed');
        return;
      }
      setSuccess({ draftChangeId: json.draftChangeId, auditEventId: json.auditEventId });
      onActionComplete?.();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Eligibility Checklist */}
      <div className="rounded-lg border p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Conversion Eligibility</p>
        <EligibilityItem ok={isCitation} label="Suggestion type is citation" />
        <EligibilityItem ok={isEligibleStatus} label='Status is "generated" or "needs review"' />
        <EligibilityItem ok={hasCitation} label="Suggested citation text is present" />
        <EligibilityItem ok={hasSourceRef} label="Source reference is present" />
        <EligibilityItem ok={hasSourceExcerpt} label="Source excerpt is present" />
        <EligibilityItem ok={isNotTerminal} label="Not rejected or expired" />
        {record.legalReviewRequired && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            <span>Legal review flagged (informational — does not block conversion)</span>
          </div>
        )}
      </div>

      {/* Conversion Panel */}
      {allEligible && !success && !showForm && (
        <Button
          size="sm" variant="outline"
          className="w-full justify-start gap-2 text-xs text-indigo-600 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
          onClick={() => { setShowForm(true); loadUpdates(); }}
        >
          <ArrowRight className="h-3.5 w-3.5" /> Convert Citation Suggestion to Draft Change
        </Button>
      )}

      {showForm && !success && (
        <div className="rounded-lg border-2 border-indigo-300/60 p-3 space-y-3">
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-300/40 p-2">
            <p className="text-[10px] text-amber-700 dark:text-amber-400">
              <strong>⚠ Governance notice:</strong> This creates a draft/staging record only. It does not create active citation data, obligations, interpretations, mappings, or published reference data. The draft must go through review → approval → publish.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Parent Regulatory Update *</label>
            {updatesLoading ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading updates...</div>
            ) : (
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={relatedUpdateId}
                onChange={e => setRelatedUpdateId(e.target.value)}
              >
                <option value="">Select a regulatory update...</option>
                {updates.map(u => (
                  <option key={u.stableReferenceId} value={u.stableReferenceId}>
                    {u.stableReferenceId} — {u.updateTitle.slice(0, 60)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Change Reason (optional)</label>
            <textarea
              className="w-full text-xs p-2 border rounded resize-none"
              rows={2}
              placeholder="Optional context for this conversion..."
              value={changeReason}
              onChange={e => setChangeReason(e.target.value)}
            />
          </div>

          {error && <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 text-xs text-red-700 dark:text-red-400">{error}</div>}

          <div className="flex gap-2">
            <Button
              size="sm" className="text-xs gap-1"
              disabled={loading || !relatedUpdateId}
              onClick={handleConvert}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Convert Citation to Draft Change
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border-2 border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/20 p-3 space-y-2">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Successfully Converted
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400/80 font-mono">
            Draft ID: {success.draftChangeId}
          </p>
          <p className="text-[10px] text-muted-foreground">Audit: {success.auditEventId}</p>
          <a href="/draft-mapping" className="text-xs text-primary hover:underline flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> View in Draft Workspace
          </a>
          <p className="text-[10px] text-muted-foreground italic">
            This draft must go through the standard review → approval → publish pipeline before becoming active reference data.
          </p>
        </div>
      )}

      {!allEligible && isNotTerminal && (
        <p className="text-[10px] text-muted-foreground italic">All eligibility requirements must be met before conversion.</p>
      )}
    </div>
  );
}

function EligibilityItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {ok
        ? <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
        : <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
      }
      <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function KV({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function Tags({ label, tags }: { label: string; tags?: string[] | null }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1 mt-0.5">
        {tags.map(t => <Badge key={t} variant="outline" className="text-[10px] bg-muted/50">{t}</Badge>)}
      </div>
    </div>
  );
}
