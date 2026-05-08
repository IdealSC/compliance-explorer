'use client';

/**
 * StagingUpdatePanel — Mode-aware, permission-gated staging controls.
 *
 * Used inside RegulatoryUpdateDrawer and draft-mapping page to allow
 * authorized users to update draft/staging fields.
 *
 * Behavior:
 * - Permission-gated via PermissionGate
 * - Mode-aware: shows "Database mode required" in JSON mode
 * - Only exposes whitelisted draft/staging fields
 * - Never displays or modifies active regulatory reference data
 * - Shows inline success/error feedback
 *
 * GOVERNANCE: This component does not modify controlled regulatory
 * reference data. It only updates draft/staging records.
 */
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/auth/permissions';
import type { Permission } from '@/auth/permissions';
import {
  Pencil, Database, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

// ── Stage Update Panel ──────────────────────────────────────────

interface StageUpdatePanelProps {
  entityId: string;
  currentStage: string;
  isDatabaseMode: boolean;
  onUpdated?: () => void;
}

const STAGE_OPTIONS = [
  { value: 'intake', label: 'Intake' },
  { value: 'triage', label: 'Triage' },
  { value: 'draft_mapping', label: 'Draft Mapping' },
  { value: 'review', label: 'Review' },
  { value: 'rejected', label: 'Rejected' },
];

export function StageUpdatePanel({ entityId, currentStage, isDatabaseMode: dbMode, onUpdated }: StageUpdatePanelProps) {
  const [selectedStage, setSelectedStage] = React.useState(currentStage);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async () => {
    if (selectedStage === currentStage) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/staging/regulatory-updates/${entityId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update stage.' });
      } else {
        setFeedback({ type: 'success', message: `Stage updated to ${selectedStage.replace(/_/g, ' ')}.` });
        onUpdated?.();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!dbMode) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/20 bg-muted/30 px-3 py-2">
        <Database className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">Database mode required for stage updates.</span>
      </div>
    );
  }

  return (
    <PermissionGate
      requires={PERMISSIONS.REFERENCE_DRAFT_EDIT}
      showDenied
      deniedLabel="Requires reference.draft.edit permission to change stage."
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            disabled={saving}
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving || selectedStage === currentStage}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3 w-3" />}
            Update Stage
          </button>
        </div>
        {feedback && (
          <div className={`flex items-center gap-1.5 text-[10px] ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {feedback.message}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}

// ── Draft Status Action Panel ───────────────────────────────────

interface DraftStatusPanelProps {
  draftId: string;
  currentStatus: string;
  isDatabaseMode: boolean;
  onUpdated?: () => void;
}

export function DraftStatusPanel({ draftId, currentStatus, isDatabaseMode: dbMode, onUpdated }: DraftStatusPanelProps) {
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAction = async (action: string) => {
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/staging/draft-changes/${draftId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update status.' });
      } else {
        setFeedback({ type: 'success', message: `Draft status updated.` });
        onUpdated?.();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!dbMode) {
    return null; // In JSON mode, the simulated buttons remain
  }

  return (
    <div className="space-y-2">
      {(currentStatus === 'draft' || currentStatus === 'returned') && (
        <PermissionGate
          requires={PERMISSIONS.DRAFT_EDIT}
          showDenied
          deniedLabel="Requires draft.edit permission"
        >
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('ready_for_review')}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-3 py-1.5 text-[10px] font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Mark Ready for Review
            </button>
            <button
              onClick={() => handleAction('submit')}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-3 py-1.5 text-[10px] font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-500/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Submit for Review
            </button>
          </div>
        </PermissionGate>
      )}

      {currentStatus === 'ready_for_review' && (
        <PermissionGate
          requires={PERMISSIONS.REFERENCE_REVIEW}
          showDenied
          deniedLabel="Requires reference.review permission"
        >
          <button
            onClick={() => handleAction('return_to_draft')}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Return for Clarification
          </button>
        </PermissionGate>
      )}

      {feedback && (
        <div className={`flex items-center gap-1.5 text-[10px] ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}

// ── Create Draft Update Form ────────────────────────────────────

interface CreateDraftUpdateFormProps {
  isDatabaseMode: boolean;
  onCreated?: (entityId: string) => void;
  onCancel?: () => void;
}

const CHANGE_TYPE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'repeal', label: 'Repeal' },
  { value: 'guidance', label: 'Guidance' },
  { value: 'standard_update', label: 'Standard Update' },
  { value: 'interpretation_update', label: 'Interpretation Update' },
];

export function CreateDraftUpdateForm({ isDatabaseMode: dbMode, onCreated, onCancel }: CreateDraftUpdateFormProps) {
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      updateTitle: formData.get('updateTitle') as string,
      changeType: formData.get('changeType') as string,
      changeSummary: formData.get('changeSummary') as string,
      sourceName: (formData.get('sourceName') as string) || null,
      regulator: (formData.get('regulator') as string) || null,
      jurisdiction: (formData.get('jurisdiction') as string) || null,
      sourceReference: (formData.get('sourceReference') as string) || null,
    };

    try {
      const res = await fetch('/api/staging/regulatory-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create draft.' });
      } else {
        setFeedback({ type: 'success', message: `Draft ${data.entityId} created.` });
        onCreated?.(data.entityId);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!dbMode) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Database mode required to create draft regulatory updates. Set <code className="font-mono text-[10px] bg-muted px-1 rounded">DATA_SOURCE=database</code> in your environment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-primary" />
          Create Draft Regulatory Update
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {/* Governance warning */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-800 dark:text-amber-300">
            This draft does <strong>not</strong> modify active regulatory reference data. It will be reviewed before any changes are published.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="updateTitle" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
            <input id="updateTitle" name="updateTitle" required className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="e.g., FDA Guidance on AI/ML-based SaMD" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="changeType" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Type *</label>
              <select id="changeType" name="changeType" required className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                {CHANGE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sourceName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Document</label>
              <input id="sourceName" name="sourceName" className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="e.g., FDA Guidance Document" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="regulator" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regulator</label>
              <input id="regulator" name="regulator" className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="e.g., FDA, EMA, ICH" />
            </div>
            <div className="space-y-1">
              <label htmlFor="jurisdiction" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Jurisdiction</label>
              <input id="jurisdiction" name="jurisdiction" className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="e.g., US, EU, Global" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="changeSummary" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Summary *</label>
            <textarea id="changeSummary" name="changeSummary" required rows={3} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-none" placeholder="Describe what changed and its potential compliance impact…" />
          </div>

          <div className="space-y-1">
            <label htmlFor="sourceReference" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source Reference URL</label>
            <input id="sourceReference" name="sourceReference" className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="https://…" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Create Draft
              </button>
              {onCancel && (
                <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div className={`flex items-center gap-1.5 text-xs ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {feedback.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {feedback.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ── Create Draft Change Form ────────────────────────────────────

interface CreateDraftChangeFormProps {
  isDatabaseMode: boolean;
  regulatoryUpdates: Array<{ id: string; updateTitle: string }>;
  onCreated?: (entityId: string) => void;
  onCancel?: () => void;
}

const ENTITY_TYPE_OPTIONS = [
  { value: 'obligation', label: 'Obligation' },
  { value: 'crosswalk', label: 'Crosswalk' },
  { value: 'citation', label: 'Citation' },
  { value: 'interpretation', label: 'Interpretation' },
  { value: 'control', label: 'Control' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'function_impact', label: 'Function Impact' },
];

const DRAFT_CHANGE_TYPE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'update', label: 'Update' },
  { value: 'supersede', label: 'Supersede' },
  { value: 'citation_update', label: 'Citation Update' },
  { value: 'interpretation_update', label: 'Interpretation Update' },
  { value: 'crosswalk_update', label: 'Crosswalk Update' },
  { value: 'control_update', label: 'Control Update' },
  { value: 'evidence_update', label: 'Evidence Update' },
  { value: 'function_impact_update', label: 'Function Impact Update' },
];

export function CreateDraftChangeForm({ isDatabaseMode: dbMode, regulatoryUpdates, onCreated, onCancel }: CreateDraftChangeFormProps) {
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      relatedUpdateId: formData.get('relatedUpdateId') as string,
      affectedEntityType: formData.get('affectedEntityType') as string,
      changeType: formData.get('changeType') as string,
      proposedChangeSummary: formData.get('proposedChangeSummary') as string,
      affectedEntityId: (formData.get('affectedEntityId') as string) || null,
      previousValue: (formData.get('previousValue') as string) || null,
      proposedValue: (formData.get('proposedValue') as string) || null,
      changeReason: (formData.get('changeReason') as string) || null,
    };

    try {
      const res = await fetch('/api/staging/draft-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create draft change.' });
      } else {
        setFeedback({ type: 'success', message: `Draft ${data.entityId} created.` });
        onCreated?.(data.entityId);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!dbMode) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Database mode required to create draft changes. Set <code className="font-mono text-[10px] bg-muted px-1 rounded">DATA_SOURCE=database</code> in your environment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-primary" />
          Create Draft Change
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-800 dark:text-amber-300">
            Draft changes are proposals. They do <strong>not</strong> modify active regulatory reference data until approved.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="relatedUpdateId" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Related Regulatory Update *</label>
            <select id="relatedUpdateId" name="relatedUpdateId" required className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
              <option value="">Select update…</option>
              {regulatoryUpdates.map((u) => (
                <option key={u.id} value={u.id}>{u.id} — {u.updateTitle.slice(0, 60)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="affectedEntityType" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Affected Entity Type *</label>
              <select id="affectedEntityType" name="affectedEntityType" required className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="changeType" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Type *</label>
              <select id="changeType" name="changeType" required className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                {DRAFT_CHANGE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="affectedEntityId" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Affected Entity ID</label>
            <input id="affectedEntityId" name="affectedEntityId" className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="e.g., CM-0001, CW-01" />
          </div>

          <div className="space-y-1">
            <label htmlFor="proposedChangeSummary" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Proposed Change Summary *</label>
            <textarea id="proposedChangeSummary" name="proposedChangeSummary" required rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-none" placeholder="Describe the proposed change…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="previousValue" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Previous Value</label>
              <textarea id="previousValue" name="previousValue" rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-none" placeholder="Current text/value…" />
            </div>
            <div className="space-y-1">
              <label htmlFor="proposedValue" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Proposed Value</label>
              <textarea id="proposedValue" name="proposedValue" rows={2} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs resize-none" placeholder="New text/value…" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="changeReason" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Change Reason</label>
            <input id="changeReason" name="changeReason" className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" placeholder="Regulatory requirement, process improvement…" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Create Draft Change
              </button>
              {onCancel && (
                <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div className={`flex items-center gap-1.5 text-xs ${feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {feedback.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {feedback.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
