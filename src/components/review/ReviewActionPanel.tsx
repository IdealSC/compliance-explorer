'use client';

/**
 * ReviewActionPanel — Permission-gated review decision controls.
 *
 * Used on the /review-approval page to let authorized users execute
 * review workflow actions on approval review records.
 *
 * GOVERNANCE: This component does NOT publish, activate, supersede,
 * or archive active reference data. "Approve for Publication Readiness"
 * means approved for FUTURE publishing only.
 */
import * as React from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/auth/permissions';
import { ReviewStatusBadge } from '@/components/badges';
import {
  Loader2, Play, RotateCcw, X, Scale, CheckCircle2,
  AlertTriangle, ShieldAlert, MessageSquare,
} from 'lucide-react';

interface ReviewActionPanelProps {
  reviewId: string;
  reviewStatus: string;
  reviewTargetType: string;
  reviewTargetId: string;
  reviewedByName?: string | null;
  reviewComments?: string | null;
  approvalReference?: string | null;
  legalReviewRequired?: boolean;
  onUpdated?: () => void;
}

export function ReviewActionPanel({
  reviewId,
  reviewStatus,
  reviewTargetType,
  reviewTargetId,
  reviewedByName,
  reviewComments,
  approvalReference,
  legalReviewRequired,
  onUpdated,
}: ReviewActionPanelProps) {
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [comments, setComments] = React.useState('');
  const [refInput, setRefInput] = React.useState('');
  const [showComments, setShowComments] = React.useState(false);

  const handleAction = async (action: string) => {
    setSaving(true);
    setFeedback(null);

    try {
      const body: Record<string, string> = { action };
      if (comments.trim()) body.comments = comments.trim();
      if (action === 'approve_for_publication' && refInput.trim()) {
        body.approvalReference = refInput.trim();
      }
      if (comments.trim()) body.reason = comments.trim();

      const res = await fetch(`/api/review/approval-reviews/${reviewId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to execute review action.' });
      } else {
        setFeedback({ type: 'success', message: `Review action completed: ${action.replace(/_/g, ' ')}.` });
        setComments('');
        setRefInput('');
        onUpdated?.();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const isTerminal = ['approved_for_publication', 'rejected', 'returned_for_revision'].includes(reviewStatus);

  return (
    <div className="space-y-3 border-t border-border pt-3 mt-2">
      {/* Current status */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Review Status</span>
        <ReviewStatusBadge status={reviewStatus} />
        {reviewedByName && (
          <span className="text-[10px] text-muted-foreground">by {reviewedByName}</span>
        )}
        {legalReviewRequired && (
          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            <Scale className="h-3 w-3" /> Legal Review Required
          </span>
        )}
      </div>

      {/* Existing comments */}
      {reviewComments && (
        <div className="bg-muted/30 rounded-md px-3 py-2 text-xs text-muted-foreground">
          <span className="font-bold text-[10px] uppercase tracking-widest">Review Comments: </span>
          {reviewComments}
        </div>
      )}

      {/* Existing approval reference */}
      {approvalReference && (
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-[10px] uppercase tracking-widest">Approval Reference: </span>
          {approvalReference}
        </div>
      )}

      {/* Terminal status message */}
      {isTerminal && (
        <p className="text-[10px] text-muted-foreground italic">
          This review is in a terminal state. No further actions are available in Phase 2.5A.
        </p>
      )}

      {/* Action buttons for pending status */}
      {reviewStatus === 'pending' && (
        <PermissionGate
          requires={PERMISSIONS.REFERENCE_REVIEW}
          showDenied
          deniedLabel="Requires reference.review permission to start review."
        >
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleAction('start')}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              Start Review
            </button>
            <button
              onClick={() => handleAction('legal_review_required')}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-3 py-1.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Scale className="h-3 w-3" />}
              Requires Legal Review
            </button>
          </div>
        </PermissionGate>
      )}

      {/* Action buttons for in_review status */}
      {reviewStatus === 'in_review' && (
        <div className="space-y-2">
          {/* Comments field */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            {showComments ? 'Hide comment field' : 'Add review comments'}
          </button>

          {showComments && (
            <div className="space-y-2">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Review comments or reason for decision..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Return / Reject — requires reference.review */}
          <PermissionGate
            requires={PERMISSIONS.REFERENCE_REVIEW}
            showDenied
            deniedLabel="Requires reference.review permission"
          >
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleAction('return_for_revision')}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                Return for Revision
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                Reject
              </button>
              <button
                onClick={() => handleAction('legal_review_required')}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-3 py-1.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Scale className="h-3 w-3" />}
                Legal Review Required
              </button>
            </div>
          </PermissionGate>

          {/* Approve — requires reference.approve (elevated) */}
          <PermissionGate
            requires={PERMISSIONS.REFERENCE_APPROVE}
            showDenied
            deniedLabel="Requires reference.approve permission to approve for publication readiness."
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Approval reference (optional)"
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs flex-1 max-w-xs"
                />
                <button
                  onClick={() => handleAction('approve_for_publication')}
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Approve for Publication Readiness
                </button>
              </div>

              {/* Governance warning */}
              <div className="flex items-start gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5">
                <ShieldAlert className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>This approval does not publish or modify active regulatory reference data.</strong> Controlled publication is a separate, later workflow step (Phase 2.5B+).
                </p>
              </div>
            </div>
          </PermissionGate>
        </div>
      )}

      {/* Legal review required — can transition back to in_review */}
      {reviewStatus === 'legal_review_required' && (
        <PermissionGate
          requires={PERMISSIONS.REFERENCE_REVIEW}
          showDenied
          deniedLabel="Requires reference.review permission"
        >
          <button
            onClick={() => handleAction('start')}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Resume Review (Legal Complete)
          </button>
        </PermissionGate>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center gap-1.5 text-[10px] ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}
