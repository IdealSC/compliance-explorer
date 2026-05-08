'use client';

import * as React from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Shield, Link2, CheckCircle2, StickyNote, AlertTriangle,
  Calendar, User, Globe, Scale, ExternalLink, Circle, CheckSquare, XCircle, Clock,
  Paperclip, HardDrive, Archive, Plus,
} from 'lucide-react';
import type { SourceRecord } from '@/types/sourceRecord';
import { SourceStatusBadge } from '@/components/badges/SourceStatusBadge';
import { ValidationStatusBadge } from '@/components/badges/ValidationStatusBadge';
import { SourceTypeBadge } from '@/components/badges/SourceTypeBadge';
import { ConfidenceIndicator } from '@/components/badges/GovernanceMarkers';

interface Props {
  source: SourceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dbMode?: boolean;
  onRefresh?: () => Promise<void>;
}

export function SourceDetailDrawer({ source, open, onOpenChange, dbMode = false, onRefresh }: Props) {
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectInput, setShowRejectInput] = React.useState(false);
  const [showFileForm, setShowFileForm] = React.useState(false);
  const [fileFormData, setFileFormData] = React.useState({ fileName: '', mimeType: '', fileSizeBytes: '' as string, fileDisplayName: '', notes: '' });
  const [fileFormLoading, setFileFormLoading] = React.useState(false);
  const [fileFormError, setFileFormError] = React.useState<string | null>(null);
  const [archiveConfirmId, setArchiveConfirmId] = React.useState<string | null>(null);

  if (!source) return null;

  async function doAction(url: string, body: Record<string, unknown>) {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (onRefresh) await onRefresh();
      } else {
        const errData = await res.json().catch(() => null);
        setActionError(errData?.error ?? `Action failed (${res.status})`);
      }
    } catch {
      setActionError('Network error — action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-base leading-snug">{source.sourceTitle}</SheetTitle>
          <SheetDescription className="sr-only">Source record detail</SheetDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <SourceTypeBadge type={source.sourceType} />
            <SourceStatusBadge status={source.sourceStatus} />
            <ValidationStatusBadge status={source.validationStatus} />
            {source.legalReviewRequired && (
              <Badge variant="outline" className="text-[10px] border-purple-400 text-purple-600 dark:text-purple-400">
                <Scale className="h-3 w-3 mr-1" /> Legal Review Required
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-4 pt-4">
          {/* A. Source Summary */}
          <Section title="Source Summary" icon={<FileText className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Source ID" value={source.id} />
              <DetailItem label="Source Type" value={source.sourceType.replace(/_/g, ' ')} />
              <DetailItem label="Regulator" value={source.regulator} />
              <DetailItem label="Jurisdiction" value={source.jurisdiction} />
              <DetailItem label="Issuing Authority" value={source.issuingAuthority} />
              <DetailItem label="Publication Date" value={source.publicationDate} />
              <DetailItem label="Effective Date" value={source.effectiveDate} />
              <DetailItem label="Source Version" value={source.sourceVersion} />
              <DetailItem label="Last Retrieved" value={source.lastRetrievedDate} />
            </DetailGrid>
            {source.sourceUrl && (
              <div className="pt-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Source URL</span>
                <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{source.sourceUrl}</span>
                </div>
              </div>
            )}
            {source.sourceFileName && (
              <DetailItem label="Source File" value={source.sourceFileName} />
            )}
          </Section>

          {/* B. Governance Status */}
          <Section title="Governance Status" icon={<Shield className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Source Status" value={<SourceStatusBadge status={source.sourceStatus} />} />
              <DetailItem label="Validation Status" value={<ValidationStatusBadge status={source.validationStatus} />} />
              <DetailItem label="Confidence" value={source.confidenceLevel ? <ConfidenceIndicator level={source.confidenceLevel} /> : '—'} />
              <DetailItem label="Legal Review Required" value={source.legalReviewRequired ? 'Yes' : 'No'} />
              <DetailItem label="Owner" value={source.owner} />
              <DetailItem label="Reviewer" value={source.reviewer} />
              <DetailItem label="Approver" value={source.approver} />
              <DetailItem label="Reviewed At" value={source.reviewedAt} />
              <DetailItem label="Approved At" value={source.approvedAt} />
            </DetailGrid>
          </Section>

          {/* C. Related Compliance Map Links */}
          <Section title="Related Compliance Map Links" icon={<Link2 className="h-4 w-4" />}>
            <p className="text-[10px] text-muted-foreground italic mb-2">
              Linked regulatory reference data is read-only and controlled. Source records do not modify active reference data.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <LinkCount label="Obligations" ids={source.relatedObligationIds} prefix="CM" />
              <LinkCount label="Regulatory Updates" ids={source.relatedRegulatoryUpdateIds} prefix="RU" />
              <LinkCount label="Draft Changes" ids={source.relatedDraftChangeIds} prefix="DC" />
              <LinkCount label="Crosswalks" ids={source.relatedCrosswalkIds} prefix="XW" />
              <LinkCount label="Controls" ids={source.relatedControlIds} prefix="CTRL" />
              <LinkCount label="Evidence" ids={source.relatedEvidenceIds} prefix="EVD" />
              <LinkCount label="Reports" ids={source.relatedReportIds} prefix="RPT" />
            </div>
          </Section>

          {/* D. Source Files (Phase 3.3) */}
          <Section title="Source Files" icon={<Paperclip className="h-4 w-4" />}>
            <p className="text-[10px] text-muted-foreground italic mb-2">
              File metadata only. No file content is parsed, extracted, or analyzed.
            </p>
            {source.sourceFiles.length === 0 && !showFileForm && (
              <p className="text-xs text-muted-foreground">No files registered.</p>
            )}
            {source.sourceFiles.length > 0 && (
              <div className="space-y-1.5">
                {source.sourceFiles.map(f => (
                  <div key={f.id} className="rounded-md border px-3 py-2 flex items-start gap-2">
                    <HardDrive className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{f.fileDisplayName || f.fileName}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {f.mimeType} · {formatFileSize(f.fileSizeBytes ?? 0)} · <FileStatusBadge status={f.uploadStatus} />
                      </div>
                      {f.fileHash && (
                        <div className="text-[9px] text-muted-foreground font-mono truncate">SHA-256: {f.fileHash.slice(0, 16)}…</div>
                      )}
                      <div className="text-[9px] text-muted-foreground">
                        Registered {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
                        {f.uploadedByEmail && ` by ${f.uploadedByEmail}`}
                      </div>
                    </div>
                    {dbMode && f.uploadStatus !== 'archived' && archiveConfirmId !== f.id && (
                      <button
                        disabled={actionLoading}
                        onClick={() => setArchiveConfirmId(f.id)}
                        className="text-[9px] text-red-600 dark:text-red-400 hover:underline shrink-0"
                        title="Archive file metadata"
                      >
                        <Archive className="h-3 w-3" />
                      </button>
                    )}
                    {dbMode && archiveConfirmId === f.id && (
                      <div className="shrink-0 space-y-1">
                        <div className="text-[8px] text-muted-foreground">Archive this file metadata? Status change only — no data is deleted.</div>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={actionLoading}
                            onClick={async () => {
                              await doAction(`/api/sources/registry/${source.id}/files/${f.id}`, { uploadStatus: 'archived', reason: 'Archived via UI' });
                              setArchiveConfirmId(null);
                            }}
                            className="text-[8px] px-1.5 py-0.5 rounded bg-red-600 text-white font-medium"
                          >Archive</button>
                          <button
                            onClick={() => setArchiveConfirmId(null)}
                            className="text-[8px] px-1.5 py-0.5 rounded border text-muted-foreground hover:bg-muted"
                          >Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {dbMode && !showFileForm && (
              <button
                onClick={() => setShowFileForm(true)}
                className="mt-2 px-3 py-1.5 rounded-md border border-dashed border-blue-400 text-blue-600 dark:text-blue-400 text-[10px] font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />Register File Metadata
              </button>
            )}
            {dbMode && showFileForm && (
              <div className="mt-2 rounded-md border bg-muted/30 p-3 space-y-2">
                <div className="text-[10px] font-semibold">Register File Metadata</div>
                <p className="text-[9px] text-muted-foreground">Records metadata only — this does not upload a file.</p>
                <input
                  placeholder="File name (e.g. FDA-21CFR211.pdf)"
                  value={fileFormData.fileName}
                  onChange={e => setFileFormData(p => ({ ...p, fileName: e.target.value }))}
                  className="h-7 w-full rounded-md border bg-background px-2 text-[11px]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="MIME type (e.g. application/pdf)"
                    value={fileFormData.mimeType}
                    onChange={e => setFileFormData(p => ({ ...p, mimeType: e.target.value }))}
                    className="h-7 rounded-md border bg-background px-2 text-[11px]"
                  />
                  <input
                    placeholder="File size (bytes)"
                    type="number"
                    min="0"
                    value={fileFormData.fileSizeBytes}
                    onChange={e => setFileFormData(p => ({ ...p, fileSizeBytes: e.target.value }))}
                    className="h-7 rounded-md border bg-background px-2 text-[11px]"
                  />
                </div>
                <input
                  placeholder="Display name (optional)"
                  value={fileFormData.fileDisplayName}
                  onChange={e => setFileFormData(p => ({ ...p, fileDisplayName: e.target.value }))}
                  className="h-7 w-full rounded-md border bg-background px-2 text-[11px]"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={fileFormData.notes}
                  onChange={e => setFileFormData(p => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-[11px] min-h-[40px] resize-y"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowFileForm(false); setFileFormData({ fileName: '', mimeType: '', fileSizeBytes: '', fileDisplayName: '', notes: '' }); }}
                    className="px-2 py-1 rounded-md border text-[10px] hover:bg-muted"
                  >Cancel</button>
                  <button
                    disabled={fileFormLoading || !fileFormData.fileName.trim() || !fileFormData.mimeType.trim() || !fileFormData.fileSizeBytes}
                    onClick={async () => {
                      setFileFormLoading(true);
                      try {
                        const res = await fetch(`/api/sources/registry/${source.id}/files`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            fileName: fileFormData.fileName.trim(),
                            mimeType: fileFormData.mimeType.trim(),
                            fileSizeBytes: parseInt(fileFormData.fileSizeBytes, 10) || 0,
                            fileDisplayName: fileFormData.fileDisplayName.trim() || null,
                            notes: fileFormData.notes.trim() || null,
                          }),
                        });
                        if (res.ok) {
                          setShowFileForm(false);
                          setFileFormData({ fileName: '', mimeType: '', fileSizeBytes: '', fileDisplayName: '', notes: '' });
                          setFileFormError(null);
                          if (onRefresh) await onRefresh();
                        } else {
                          const errData = await res.json().catch(() => null);
                          setFileFormError(errData?.error ?? `Registration failed (${res.status})`);
                        }
                      } catch (e) {
                        setFileFormError('Network error — could not register file metadata.');
                      } finally {
                        setFileFormLoading(false);
                      }
                    }}
                    className="px-3 py-1 rounded-md bg-blue-600 text-white text-[10px] font-medium disabled:opacity-40 hover:bg-blue-700"
                  >{fileFormLoading ? 'Saving…' : 'Register'}</button>
                </div>
                {fileFormError && (
                  <p className="text-[9px] text-red-600 dark:text-red-400 mt-1">{fileFormError}</p>
                )}
              </div>
            )}
          </Section>

          {/* E. Validation Checklist */}
          {source.validationChecklist.length > 0 && (
            <Section title="Validation Checklist" icon={<CheckCircle2 className="h-4 w-4" />}>
              <p className="text-[10px] text-muted-foreground italic mb-2">
                Sample checklist — does not represent a real approval workflow.
              </p>
              <div className="space-y-1.5">
                {source.validationChecklist.map(item => (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    <ChecklistIcon status={item.status} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight">{item.itemLabel}</div>
                      {item.reviewedBy && (
                        <div className="text-[10px] text-muted-foreground">
                          {item.reviewedBy} · {item.reviewedAt}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-muted-foreground italic">{item.notes}</div>
                      )}
                    </div>
                    {item.requiredForValidation && (
                      <Badge variant="outline" className="text-[8px] shrink-0">Required</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* F. Source Notes */}
          <Section title="Source Notes" icon={<StickyNote className="h-4 w-4" />}>
            <DetailGrid>
              <div className="col-span-2"><DetailItem label="Summary" value={source.summary} /></div>
              {source.keyChanges && <div className="col-span-2"><DetailItem label="Key Changes" value={source.keyChanges} /></div>}
              {source.knownLimitations && <div className="col-span-2"><DetailItem label="Known Limitations" value={source.knownLimitations} /></div>}
              {source.missingMetadata.length > 0 && (
                <div className="col-span-2"><DetailItem label="Missing Metadata" value={source.missingMetadata.join(', ')} /></div>
              )}
              {source.notes && <div className="col-span-2"><DetailItem label="Notes" value={source.notes} /></div>}
            </DetailGrid>
          </Section>

          {/* G. Intake Warning */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                This source record does not automatically create or update active regulatory reference data.
                Source materials must be validated, staged, reviewed, approved, versioned, and audited before publication.
              </p>
            </div>
          </div>

          {/* H. DB Mode Actions */}
          {dbMode && (
            <Section title="Validation Actions" icon={<Shield className="h-4 w-4" />}>
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">
                  Validating a source record does not automatically create, update, approve, publish, or supersede regulatory reference data.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={actionLoading || source.validationStatus === 'validated'}
                    onClick={() => doAction(`/api/sources/registry/${source.id}/status`, { action: 'validate' })}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-[10px] font-medium disabled:opacity-40 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />Mark Validated
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => doAction(`/api/sources/registry/${source.id}/status`, { action: 'legal_review_required' })}
                    className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-[10px] font-medium disabled:opacity-40 hover:bg-purple-700"
                  >
                    <Scale className="h-3 w-3 inline mr-1" />Legal Review Required
                  </button>
                  {!showRejectInput ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowRejectInput(true)}
                      className="px-3 py-1.5 rounded-md bg-red-600 text-white text-[10px] font-medium disabled:opacity-40 hover:bg-red-700"
                    >
                      <XCircle className="h-3 w-3 inline mr-1" />Reject
                    </button>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <input
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="h-7 rounded-md border bg-background px-2 text-[10px] w-48"
                      />
                      <button
                        disabled={actionLoading || !rejectReason.trim()}
                        onClick={async () => {
                          await doAction(`/api/sources/registry/${source.id}/status`, { action: 'reject', reason: rejectReason });
                          setShowRejectInput(false);
                          setRejectReason('');
                        }}
                        className="px-2 py-1 rounded-md bg-red-600 text-white text-[10px] font-medium disabled:opacity-40"
                      >Confirm</button>
                    </div>
                  )}
                </div>
                {actionError && (
                  <p className="text-[9px] text-red-600 dark:text-red-400 mt-1">{actionError}</p>
                )}
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">{children}</div>;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground font-semibold">{label}</span>
      <div className="text-xs">{value || '—'}</div>
    </div>
  );
}

function LinkCount({ label, ids, prefix }: { label: string; ids: string[]; prefix: string }) {
  return (
    <div className="rounded-md border px-2.5 py-1.5 text-xs">
      <div className="text-[10px] text-muted-foreground font-semibold">{label}</div>
      <div className="font-mono font-bold">{ids.length}</div>
      {ids.length > 0 && (
        <div className="text-[9px] text-muted-foreground truncate">{ids.slice(0, 3).join(', ')}{ids.length > 3 ? ` +${ids.length - 3}` : ''}</div>
      )}
    </div>
  );
}

function ChecklistIcon({ status }: { status: string }) {
  switch (status) {
    case 'complete': return <CheckSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
    case 'incomplete': return <Circle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />;
    case 'needs_review': return <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />;
    case 'not_applicable': return <XCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />;
    default: return <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${units[i]}`;
}

function FileStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    registered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    pending_upload: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    uploaded: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    quarantined: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${colors[status] || 'bg-zinc-100 text-zinc-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
