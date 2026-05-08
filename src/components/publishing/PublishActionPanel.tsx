'use client';

/**
 * PublishActionPanel — Permission-gated controlled publishing controls.
 *
 * Displays publication readiness validation checklist and a "Publish"
 * button for approved draft changes. Creates a new versioned active
 * reference record upon publishing.
 *
 * GOVERNANCE: Publishing NEVER overwrites existing active reference data.
 * It creates new versioned records and supersedes prior versions.
 * Three-level SoD enforcement (creator ≠ submitter ≠ approver ≠ publisher).
 */
import * as React from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/auth/permissions';
import {
  Loader2, Upload, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, BookOpen, Clock,
} from 'lucide-react';

interface PublishActionPanelProps {
  draftStableReferenceId: string;
  proposedChangeSummary: string;
  affectedEntityType: string;
  sourceReference: string | null;
  draftStatus: string;
  approvedByName: string | null;
  approvalReference: string | null;
  onPublished?: () => void;
}

interface ValidationCheck {
  check: string;
  passed: boolean;
  detail?: string;
}

const CHECK_LABELS: Record<string, string> = {
  draft_exists: 'Draft record exists',
  draft_status_approved: 'Draft approved for publication readiness',
  not_already_published: 'Not already published',
  source_reference_exists: 'Source reference provided',
  approval_review_approved: 'Approval review completed',
  legal_review_complete: 'Legal review satisfied',
  database_mode: 'Database mode active',
};

export function PublishActionPanel({
  draftStableReferenceId,
  proposedChangeSummary,
  affectedEntityType,
  sourceReference,
  draftStatus,
  approvedByName,
  approvalReference,
  onPublished,
}: PublishActionPanelProps) {
  const [validating, setValidating] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [checks, setChecks] = React.useState<ValidationCheck[] | null>(null);
  const [validationReady, setValidationReady] = React.useState<boolean | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string; data?: Record<string, string> } | null>(null);

  // Already published — show completed state
  if (draftStatus === 'published') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          Published — This draft has been promoted to a versioned active reference record.
        </span>
      </div>
    );
  }

  // Not ready for publishing — show informational state
  if (draftStatus !== 'approved') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-muted-foreground/20 bg-muted/30 px-3 py-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          Not yet eligible for publication. Draft must be approved for publication readiness first.
        </span>
      </div>
    );
  }

  const runValidation = async () => {
    setValidating(true);
    setFeedback(null);
    try {
      // C5 FIX: Call server-side validation endpoint for authoritative checks
      const res = await fetch(`/api/publishing/draft-changes/${draftStableReferenceId}/validate`);
      if (res.ok) {
        const data = await res.json();
        setChecks(data.checks ?? []);
        setValidationReady(data.ready === true);
        if (!data.ready) {
          setFeedback({ type: 'error', message: 'Server validation: not all preconditions met.' });
        }
        return;
      }
      // Fallback: if server endpoint unavailable, use client-side preview with warning
      const statusStr = String(draftStatus);
      setChecks([
        { check: 'draft_exists', passed: true },
        { check: 'draft_status_approved', passed: statusStr === 'approved' },
        { check: 'not_already_published', passed: statusStr !== 'published' },
        { check: 'source_reference_exists', passed: !!sourceReference },
        { check: 'approval_review_approved', passed: !!approvedByName },
        { check: 'legal_review_complete', passed: true },
      ]);
      const allPassed = statusStr === 'approved' && !!sourceReference && !!approvedByName;
      setValidationReady(allPassed);
      setFeedback({ type: 'error', message: 'Server validation unavailable — showing client-side preview only. Publishing will still enforce server rules.' });
    } catch {
      setFeedback({ type: 'error', message: 'Validation failed. Check connection.' });
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/publishing/draft-changes/${draftStableReferenceId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationSummary: proposedChangeSummary,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: 'Draft published as versioned active reference record.',
          data: data.data,
        });
        onPublished?.();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Publishing failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error during publishing.' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <PermissionGate requires={PERMISSIONS.REFERENCE_PUBLISH} fallback={
      <div className="flex items-center gap-2 rounded-md border border-muted-foreground/20 bg-muted/30 px-3 py-2">
        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          Publishing requires the <code className="font-mono text-[10px]">reference.publish</code> permission. Contact your administrator.
        </span>
      </div>
    }>
      <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.03] p-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Controlled Publication
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Publishing creates a <strong>new versioned active reference record</strong> and preserves the prior version.
          It does not overwrite existing regulatory reference data. Three-level separation of duties is enforced.
        </p>

        {/* Draft summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Draft</span>
            <p className="mt-0.5 font-mono text-[10px] text-primary">{draftStableReferenceId}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entity Type</span>
            <p className="mt-0.5 capitalize text-foreground">{affectedEntityType.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</span>
            <p className="mt-0.5 text-muted-foreground">{sourceReference || '—'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Approved By</span>
            <p className="mt-0.5 text-foreground">{approvedByName || '—'}</p>
          </div>
        </div>

        {/* Validation checklist */}
        {checks && (
          <div className="space-y-1 rounded-md border border-border bg-background p-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Publication Readiness Checklist
            </span>
            {checks.map((c) => (
              <div key={c.check} className="flex items-center gap-2 text-[10px]">
                {c.passed ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                )}
                <span className={c.passed ? 'text-foreground' : 'text-red-600'}>
                  {CHECK_LABELS[c.check] || c.check}
                </span>
                {c.detail && !c.passed && (
                  <span className="text-muted-foreground ml-1">— {c.detail}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/20">
          {!checks && (
            <button
              onClick={runValidation}
              disabled={validating}
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              {validating ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookOpen className="h-3 w-3" />}
              Validate Readiness
            </button>
          )}

          {validationReady && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Publish Versioned Reference Record
            </button>
          )}

          {validationReady === false && (
            <div className="flex items-center gap-1 text-[10px] text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Preconditions not met. Resolve issues above before publishing.</span>
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-md border px-3 py-2 text-xs ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300'
              : 'border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-300'
          }`}>
            <p className="font-medium">{feedback.message}</p>
            {feedback.data && (
              <div className="mt-1 space-y-0.5 text-[10px] font-mono">
                {feedback.data.publicationEventId && <p>Publication Event: {feedback.data.publicationEventId}</p>}
                {feedback.data.newVersionId && <p>Version: {feedback.data.newVersionId}</p>}
                {feedback.data.newRecordId && <p>Record: {feedback.data.newRecordId}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
