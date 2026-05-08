'use client';

/**
 * OperationalUpdatePanel — Inline update form for operational compliance data.
 *
 * Used inside Control, Evidence, and Action detail drawers to allow
 * authorized users to update operational fields (status, notes, dates).
 *
 * Behavior:
 * - Permission-gated via PermissionGate
 * - Mode-aware: shows "Database mode required" in JSON mode
 * - Only exposes whitelisted operational fields
 * - Never displays or modifies regulatory reference linkage
 * - Shows inline success/error feedback
 *
 * GOVERNANCE: This component does not modify controlled regulatory
 * reference data. It only updates operational compliance tracking fields.
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

// ── Types ───────────────────────────────────────────────────────

export type PanelEntityType = 'control' | 'evidence' | 'action';

interface StatusOption {
  value: string;
  label: string;
}

interface FieldConfig {
  status?: { current: string; options: StatusOption[] };
  notes?: { current: string | null };
  date1?: { label: string; field: string; current: string | null };
  date2?: { label: string; field: string; current: string | null };
}

interface OperationalUpdatePanelProps {
  entityType: PanelEntityType;
  entityId: string;
  fields: FieldConfig;
  isDatabaseMode: boolean;
  /** Called after successful save so parent can refresh */
  onSaved?: () => void;
}

// ── Permission mapping ──────────────────────────────────────────

const EDIT_PERMISSIONS: Record<PanelEntityType, Permission> = {
  control: PERMISSIONS.CONTROLS_EDIT,
  evidence: PERMISSIONS.EVIDENCE_EDIT,
  action: PERMISSIONS.ACTIONS_EDIT,
};

const API_PATHS: Record<PanelEntityType, string> = {
  control: '/api/operational/controls',
  evidence: '/api/operational/evidence',
  action: '/api/operational/actions',
};

const STATUS_FIELD_NAMES: Record<PanelEntityType, string> = {
  control: 'controlStatus',
  evidence: 'evidenceStatus',
  action: 'actionStatus',
};

// ── Component ───────────────────────────────────────────────────

export function OperationalUpdatePanel({
  entityType,
  entityId,
  fields,
  isDatabaseMode: dbMode,
  onSaved,
}: OperationalUpdatePanelProps) {
  const permission = EDIT_PERMISSIONS[entityType];

  return (
    <PermissionGate
      requires={permission}
      showDenied
      deniedLabel={`Requires ${permission} to update operational fields`}
    >
      <Card className="border-dashed border-sky-500/30 bg-sky-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Pencil className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            Operational Update
            <Badge variant="outline" className="text-[10px] ml-auto font-normal">
              {dbMode ? '● Database' : '○ JSON Mode'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dbMode ? (
            <UpdateForm
              entityType={entityType}
              entityId={entityId}
              fields={fields}
              onSaved={onSaved}
            />
          ) : (
            <JsonModeBanner />
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}

// ── JSON Mode Banner ────────────────────────────────────────────

function JsonModeBanner() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
      <Database className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
          Database mode required for persistence
        </p>
        <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
          Set <code className="bg-amber-200/40 dark:bg-amber-900/40 px-1 rounded">DATA_SOURCE=database</code> in
          your environment to enable operational data persistence. In JSON mode, all data is read-only.
        </p>
      </div>
    </div>
  );
}

// ── Update Form ─────────────────────────────────────────────────

function UpdateForm({
  entityType,
  entityId,
  fields,
  onSaved,
}: {
  entityType: PanelEntityType;
  entityId: string;
  fields: FieldConfig;
  onSaved?: () => void;
}) {
  const [status, setStatus] = React.useState(fields.status?.current ?? '');
  const [notes, setNotes] = React.useState(fields.notes?.current ?? '');
  const [date1, setDate1] = React.useState(fields.date1?.current ?? '');
  const [date2, setDate2] = React.useState(fields.date2?.current ?? '');
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const body: Record<string, string | null> = {};

    // Status field
    if (fields.status && status !== fields.status.current) {
      body[STATUS_FIELD_NAMES[entityType]] = status;
    }

    // Notes field
    if (fields.notes !== undefined) {
      const newNotes = notes.trim() || null;
      if (newNotes !== (fields.notes?.current ?? null)) {
        body.notes = newNotes;
      }
    }

    // Date fields
    if (fields.date1 && date1 !== (fields.date1.current ?? '')) {
      body[fields.date1.field] = date1 || null;
    }
    if (fields.date2 && date2 !== (fields.date2.current ?? '')) {
      body[fields.date2.field] = date2 || null;
    }

    if (Object.keys(body).length === 0) {
      setFeedback({ type: 'error', message: 'No changes detected.' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_PATHS[entityType]}/${entityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Updated successfully. Audit event recorded.' });
        onSaved?.();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || `Request failed (${res.status})`,
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Could not reach the server.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Status select */}
      {fields.status && (
        <FieldRow label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {fields.status.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FieldRow>
      )}

      {/* Notes textarea */}
      {fields.notes !== undefined && (
        <FieldRow label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Operational notes…"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FieldRow>
      )}

      {/* Date 1 */}
      {fields.date1 && (
        <FieldRow label={fields.date1.label}>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FieldRow>
      )}

      {/* Date 2 */}
      {fields.date2 && (
        <FieldRow label={fields.date2.label}>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FieldRow>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[10px] text-muted-foreground">
          Changes are persisted to database and audit-logged.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ── Shared FieldRow ─────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
