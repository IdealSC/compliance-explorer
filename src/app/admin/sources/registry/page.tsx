'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Database, Search, FileText, AlertTriangle, Scale, CheckCircle2,
  ArchiveIcon, Link2, FileDiff, ArrowRight, Shield, Upload,
  FileCheck, ClipboardList, History, Users, Lock, Eye, Plus, Paperclip,
} from 'lucide-react';
import { getSourceRecords } from '@/lib/data';
import { SampleDataBanner } from '@/components/governance/SampleDataBanner';
import { GovernanceWarningBanner } from '@/components/governance/GovernanceWarningBanner';
import { MetricCard } from '@/components/cards/MetricCard';
import { SourceStatusBadge } from '@/components/badges/SourceStatusBadge';
import { ValidationStatusBadge } from '@/components/badges/ValidationStatusBadge';
import { SourceTypeBadge } from '@/components/badges/SourceTypeBadge';
import { ConfidenceIndicator } from '@/components/badges/GovernanceMarkers';
import { SourceDetailDrawer } from '@/components/detail/SourceDetailDrawer';
import type { SourceRecord } from '@/types/sourceRecord';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';

// ── Filter helper ───────────────────────────────────────────────

function matchesFilter(value: string | null | undefined, filter: string): boolean {
  if (filter === 'All') return true;
  return (value ?? '') === filter;
}

// ── Readiness categories ────────────────────────────────────────

const READINESS_CATEGORIES = [
  { title: 'File Intake', icon: Upload, status: 'planned', desc: 'Secure upload with virus scan, file-type validation, size limits, and audit-logged receipt confirmation.' },
  { title: 'Metadata Requirements', icon: FileText, status: 'partial', desc: 'Mandatory fields: title, type, regulator, jurisdiction, issuing authority, publication date, version, reference URL.' },
  { title: 'Source Validation', icon: CheckCircle2, status: 'partial', desc: 'Checklist-driven validation confirming identity, authority, jurisdiction, dates, version, and applicability.' },
  { title: 'Citation Extraction', icon: Search, status: 'planned', desc: 'Structured extraction of regulatory citations, section references, and obligation-triggering language.' },
  { title: 'Draft Mapping', icon: FileDiff, status: 'available', desc: 'Map validated source citations to draft obligations via the Draft Workspace. Requires staging approval.' },
  { title: 'Legal / Compliance Review', icon: Scale, status: 'planned', desc: 'Formal legal review gate before source-derived obligations become active reference data.' },
  { title: 'Approval Workflow', icon: ClipboardList, status: 'available', desc: 'Review & Approval workflow with role-based authorization, multi-level sign-off, and rejection paths.' },
  { title: 'Versioning', icon: History, status: 'available', desc: 'Version-controlled publication of approved obligations with full change history and rollback capability.' },
  { title: 'Audit Trail', icon: Eye, status: 'available', desc: 'Immutable audit log capturing all source intake, validation, mapping, approval, and publication events.' },
  { title: 'Security & Roles', icon: Users, status: 'planned', desc: 'Role-based access control with separation of intake, review, approval, and publication permissions.' },
];

const WORKFLOW_STEPS = [
  'Source intake',
  'Metadata review',
  'Source validation',
  'Citation extraction',
  'Draft obligation mapping',
  'Legal / compliance review',
  'Approval',
  'Versioned publication',
  'Audit log',
  'Impact analysis',
  'Business owner actioning',
];

// ═════════════════════════════════════════════════════════════════

export default function SourceRegistryPage() {
  const jsonSources = getSourceRecords();

  // ── DB Mode Detection & API Fetching ────────────────────────
  const [dbSources, setDbSources] = React.useState<SourceRecord[] | null>(null);
  const [dataSource, setDataSource] = React.useState<'json' | 'database'>('json');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);

  const fetchSources = React.useCallback(async () => {
    try {
      const res = await fetch('/api/sources/registry');
      if (res.ok) {
        const data = await res.json();
        if (data.dataSource === 'database') {
          setDbSources(data.records);
          setDataSource('database');
        }
      }
    } catch { /* fallback to JSON */ }
  }, []);

  React.useEffect(() => { fetchSources(); }, [fetchSources]);

  const sources = dataSource === 'database' && dbSources ? dbSources : jsonSources;
  const isDbMode = dataSource === 'database';

  // ── Filters ─────────────────────────────────────────────────
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [validationFilter, setValidationFilter] = React.useState('All');
  const [jurisdictionFilter, setJurisdictionFilter] = React.useState('All');
  const [regulatorFilter, setRegulatorFilter] = React.useState('All');
  const [legalFilter, setLegalFilter] = React.useState('All');

  // ── Drawer ──────────────────────────────────────────────────
  const [selected, setSelected] = React.useState<SourceRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'registry' | 'readiness'>('registry');

  // ── Unique filter values ────────────────────────────────────
  const uniqueTypes = React.useMemo(() => ['All', ...Array.from(new Set(sources.map(s => s.sourceType))).sort()], [sources]);
  const uniqueStatuses = React.useMemo(() => ['All', ...Array.from(new Set(sources.map(s => s.sourceStatus))).sort()], [sources]);
  const uniqueValidation = React.useMemo(() => ['All', ...Array.from(new Set(sources.map(s => s.validationStatus))).sort()], [sources]);
  const uniqueJurisdictions = React.useMemo(() => ['All', ...Array.from(new Set(sources.filter(s => s.jurisdiction).map(s => s.jurisdiction!))).sort()], [sources]);
  const uniqueRegulators = React.useMemo(() => ['All', ...Array.from(new Set(sources.filter(s => s.regulator).map(s => s.regulator!))).sort()], [sources]);

  // ── Filtered list ───────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return sources.filter(s => {
      if (search && !s.sourceTitle.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (!matchesFilter(s.sourceType, typeFilter)) return false;
      if (!matchesFilter(s.sourceStatus, statusFilter)) return false;
      if (!matchesFilter(s.validationStatus, validationFilter)) return false;
      if (!matchesFilter(s.jurisdiction, jurisdictionFilter)) return false;
      if (!matchesFilter(s.regulator, regulatorFilter)) return false;
      if (legalFilter === 'Yes' && !s.legalReviewRequired) return false;
      if (legalFilter === 'No' && s.legalReviewRequired) return false;
      return true;
    });
  }, [sources, search, typeFilter, statusFilter, validationFilter, jurisdictionFilter, regulatorFilter, legalFilter]);

  // ── Metrics (computed once) ─────────────────────────────────
  const metrics = React.useMemo(() => {
    const total = sources.length;
    const pendingValidation = sources.filter(s => ['intake', 'metadata_review', 'validation_pending'].includes(s.sourceStatus)).length;
    const legalReview = sources.filter(s => s.legalReviewRequired && s.validationStatus !== 'validated').length;
    const incompleteMetadata = sources.filter(s => s.missingMetadata.length > 0).length;
    const validated = sources.filter(s => s.validationStatus === 'validated').length;
    const supersededArchived = sources.filter(s => ['superseded', 'archived'].includes(s.sourceStatus)).length;
    const linkedObligations = sources.filter(s => s.relatedObligationIds.length > 0).length;
    const linkedDrafts = sources.filter(s => s.relatedDraftChangeIds.length > 0 || s.relatedRegulatoryUpdateIds.length > 0).length;
    return { total, pendingValidation, legalReview, incompleteMetadata, validated, supersededArchived, linkedObligations, linkedDrafts };
  }, [sources]);

  return (
    <div className="space-y-6">
      <SampleDataBanner />
      <GovernanceWarningBanner>
        Source records are intake/staging data. They do not create or modify active regulatory reference data, obligations, standards, controls, evidence, or audit logs.
      </GovernanceWarningBanner>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Database className="h-5 w-5" /> Source Registry</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Controlled registry of laws, regulations, standards, guidance, files, and source materials supporting the compliance operating map.
          </p>
        </div>
        {isDbMode && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Create Source
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        <button
          onClick={() => setActiveTab('registry')}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${activeTab === 'registry' ? 'bg-background border border-b-0 border-border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >Source Registry</button>
        <button
          onClick={() => setActiveTab('readiness')}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${activeTab === 'readiness' ? 'bg-background border border-b-0 border-border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >Import Readiness</button>
      </div>

      {/* ═══ TAB 1: Registry ═══════════════════════════════════ */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total Sources" value={metrics.total} icon={<Database className="h-4 w-4" />} />
            <MetricCard label="Pending Validation" value={metrics.pendingValidation} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
            <MetricCard label="Legal Review Needed" value={metrics.legalReview} icon={<Scale className="h-4 w-4 text-purple-500" />} />
            <MetricCard label="Incomplete Metadata" value={metrics.incompleteMetadata} icon={<FileText className="h-4 w-4 text-orange-500" />} />
            <MetricCard label="Validated" value={metrics.validated} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
            <MetricCard label="Superseded / Archived" value={metrics.supersededArchived} icon={<ArchiveIcon className="h-4 w-4 text-zinc-400" />} />
            <MetricCard label="Linked to Obligations" value={metrics.linkedObligations} icon={<Link2 className="h-4 w-4 text-blue-500" />} />
            <MetricCard label="Linked to Updates/Drafts" value={metrics.linkedDrafts} icon={<FileDiff className="h-4 w-4 text-indigo-500" />} />
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title or ID…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={uniqueTypes} />
                <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={uniqueStatuses} />
                <FilterSelect label="Validation" value={validationFilter} onChange={setValidationFilter} options={uniqueValidation} />
                <FilterSelect label="Jurisdiction" value={jurisdictionFilter} onChange={setJurisdictionFilter} options={uniqueJurisdictions} />
                <FilterSelect label="Regulator" value={regulatorFilter} onChange={setRegulatorFilter} options={uniqueRegulators} />
                <FilterSelect label="Legal Review" value={legalFilter} onChange={setLegalFilter} options={['All', 'Yes', 'No']} />
              </div>
            </CardContent>
          </Card>

          {/* Source Cards */}
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map(src => (
              <Card
                key={src.id}
                className="cursor-pointer transition-colors hover:border-primary/40"
                onClick={() => { setSelected(src); setDrawerOpen(true); }}
              >
                <CardContent className="pt-4 pb-3 space-y-2">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-snug">{src.sourceTitle}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{src.id}</div>
                    </div>
                    {src.confidenceLevel && <ConfidenceIndicator level={src.confidenceLevel} />}
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1">
                    <SourceTypeBadge type={src.sourceType} />
                    <SourceStatusBadge status={src.sourceStatus} />
                    <ValidationStatusBadge status={src.validationStatus} />
                    {src.legalReviewRequired && (
                      <Badge variant="outline" className="text-[9px] border-purple-400 text-purple-600 dark:text-purple-400 gap-0.5">
                        <Scale className="h-2.5 w-2.5" /> Legal
                      </Badge>
                    )}
                  </div>

                  {/* Detail row */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                    <div>
                      <div className="font-semibold">Regulator</div>
                      <div>{src.regulator || '—'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Jurisdiction</div>
                      <div>{src.jurisdiction || '—'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Pub Date</div>
                      <div>{src.publicationDate || '—'}</div>
                    </div>
                  </div>

                  {/* Linkage row */}
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>{src.relatedObligationIds.length} obligations</span>
                    <span>{src.relatedControlIds.length} controls</span>
                    <span>{src.relatedEvidenceIds.length} evidence</span>
                    <span>{src.relatedDraftChangeIds.length} drafts</span>
                    {src.sourceFiles.length > 0 && (
                      <span className="inline-flex items-center gap-0.5"><Paperclip className="h-2.5 w-2.5" />{src.sourceFiles.length} files</span>
                    )}
                  </div>

                  {/* Reviewed */}
                  {src.reviewedAt && (
                    <div className="text-[10px] text-muted-foreground">
                      Last reviewed: {src.reviewedAt}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <FilterEmptyState label="No source records match the current filters." />
            )}
          </div>

          {/* Footer Disclaimer */}
          <div className="border-t border-border pt-4 mt-6">
            <p className="text-[10px] text-muted-foreground">
              Source records are intake/governance data. They do not automatically create or update active regulatory reference data, obligations, standards, controls, evidence, or audit logs.{!isDbMode && ' All records shown are sample/demonstration data only.'} Not legal advice. Not a validated GxP system.
            </p>
          </div>

          {/* Create Source Form (DB mode only) */}
          {showCreateForm && isDbMode && (
            <CreateSourceForm
              loading={createLoading}
              onCancel={() => setShowCreateForm(false)}
              onSubmit={async (data) => {
                setCreateLoading(true);
                try {
                  const res = await fetch('/api/sources/registry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    setShowCreateForm(false);
                    await fetchSources();
                  }
                } finally {
                  setCreateLoading(false);
                }
              }}
            />
          )}
        </div>
      )}

      {/* ═══ TAB 2: Import Readiness ═══════════════════════════ */}
      {activeTab === 'readiness' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4" /> Import Readiness Assessment
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Before real source import is enabled, the following requirements must be satisfied. This assessment is informational only — no real file upload or OCR is implemented.
              </p>

              {/* Readiness Categories */}
              <div className="grid gap-3 md:grid-cols-2">
                {READINESS_CATEGORIES.map(cat => (
                  <div key={cat.title} className="rounded-lg border p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <cat.icon className="h-4 w-4" /> {cat.title}
                      </div>
                      <ReadinessStatus status={cat.status} />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Diagram */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4" /> Future-State Source Import Workflow
              </h2>
              <div className="flex flex-wrap items-center gap-1">
                {WORKFLOW_STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap">{step}</Badge>
                    {i < WORKFLOW_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Each stage must complete before proceeding. Governance gates enforce separation between intake, validation, review, and publication.
              </p>
            </CardContent>
          </Card>

          {/* Not-Yet Disclaimer */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                File upload, OCR, automatic legal interpretation, and real-time import are not implemented. This readiness assessment documents requirements for a future controlled implementation. Source records currently use sample/demonstration data only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <SourceDetailDrawer source={selected} open={drawerOpen} onOpenChange={setDrawerOpen} dbMode={isDbMode} onRefresh={fetchSources} />
    </div>
  );
}

/* ── Create Source Form ────────────────────────────────────────── */

const SOURCE_TYPES = ['law', 'regulation', 'standard', 'guidance', 'framework', 'regulator_notice', 'internal_note', 'pdf', 'spreadsheet', 'website', 'other'] as const;

function CreateSourceForm({ loading, onCancel, onSubmit }: {
  loading: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<string>('regulation');
  const [regulator, setRegulator] = React.useState('');
  const [jurisdiction, setJurisdiction] = React.useState('');
  const [issuingAuthority, setIssuingAuthority] = React.useState('');
  const [publicationDate, setPublicationDate] = React.useState('');
  const [sourceUrl, setSourceUrl] = React.useState('');
  const [summary, setSummary] = React.useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg border shadow-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Source Record
        </h3>
        <p className="text-[10px] text-muted-foreground">
          Creating a source record does not create or modify active regulatory reference data.
        </p>

        <label className="block text-[10px] font-semibold">
          Source Title *
          <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-xs mt-0.5" placeholder="e.g. 21 CFR Part 211" />
        </label>

        <label className="block text-[10px] font-semibold">
          Source Type *
          <select value={type} onChange={e => setType(e.target.value)} className="w-full h-8 rounded-md border bg-background px-2 text-xs mt-0.5">
            {SOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[10px] font-semibold">
            Regulator
            <Input value={regulator} onChange={e => setRegulator(e.target.value)} className="h-8 text-xs mt-0.5" placeholder="e.g. FDA" />
          </label>
          <label className="block text-[10px] font-semibold">
            Jurisdiction
            <Input value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} className="h-8 text-xs mt-0.5" placeholder="e.g. United States" />
          </label>
        </div>

        <label className="block text-[10px] font-semibold">
          Issuing Authority
          <Input value={issuingAuthority} onChange={e => setIssuingAuthority(e.target.value)} className="h-8 text-xs mt-0.5" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[10px] font-semibold">
            Publication Date
            <Input type="date" value={publicationDate} onChange={e => setPublicationDate(e.target.value)} className="h-8 text-xs mt-0.5" />
          </label>
          <label className="block text-[10px] font-semibold">
            Source URL
            <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className="h-8 text-xs mt-0.5" placeholder="https://..." />
          </label>
        </div>

        <label className="block text-[10px] font-semibold">
          Summary
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} className="w-full rounded-md border bg-background px-2 py-1 text-xs mt-0.5 resize-none" />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-md border text-xs">Cancel</button>
          <button
            disabled={!title.trim() || loading}
            onClick={() => onSubmit({
              sourceTitle: title.trim(), sourceType: type,
              regulator: regulator || null, jurisdiction: jurisdiction || null,
              issuingAuthority: issuingAuthority || null, publicationDate: publicationDate || null,
              sourceUrl: sourceUrl || null, summary: summary || null,
            })}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Source Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Local Components ──────────────────────────────────────────── */

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground font-semibold">{label}:</span>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-7 rounded-md border bg-background px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );
}

function ReadinessStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    planned: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[status] || styles.planned}`}>
      {status}
    </span>
  );
}
