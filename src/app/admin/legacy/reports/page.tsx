'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SampleDataBanner, GovernanceWarningBanner } from '@/components/governance';
import { ReportPreviewDrawer } from '@/components/detail/ReportPreviewDrawer';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/auth/permissions';
import {
  REPORT_DEFINITIONS,
  REPORT_CATEGORIES,
  type ReportCategory,
  type ReportDefinition,
} from '@/lib/reportDefinitions';
import { buildReportRows } from '@/lib/reportData';
import { exportToCSV, exportToJSON, buildReportMeta } from '@/lib/export';
import { Download, FileJson, Clock, Filter, History, Database, ShieldCheck, AlertTriangle } from 'lucide-react';
import { FilterEmptyState } from '@/components/ui/FilterEmptyState';

// ── Business Functions for filter ────────────────────────────────

const BUSINESS_FUNCTIONS = [
  'All',
  'Supply Chain',
  'Procurement',
  'Operations',
  'Quality',
  'Legal',
  'Compliance',
  'Risk',
  'Executive Leadership',
];

// ── Snapshot History Types ────────────────────────────────────────

interface SnapshotRecord {
  stableReferenceId: string;
  reportName: string;
  reportType: string;
  generatedBy: string;
  generatedAt: string;
  exportFormat: string;
  recordCount: number;
  includesSampleData: boolean;
  checksum: string | null;
  relatedAuditEventId: string | null;
  sourceDatasets: string[] | null;
  filtersApplied: Record<string, string> | null;
}

// ═══ Page ════════════════════════════════════════════════════════

export default function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = React.useState<ReportCategory>('All');
  const [fnFilter, setFnFilter] = React.useState('All');
  const [drawerReport, setDrawerReport] = React.useState<ReportDefinition | null>(null);
  const [drawerRows, setDrawerRows] = React.useState<Record<string, unknown>[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'reports' | 'snapshots'>('reports');

  // Snapshot history state
  const [snapshots, setSnapshots] = React.useState<SnapshotRecord[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = React.useState(false);
  const [snapshotsError, setSnapshotsError] = React.useState<string | null>(null);

  // ── Memoized row counts (C1 fix — avoids rebuilding per render) ──
  const rowCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of REPORT_DEFINITIONS) {
      map[r.id] = buildReportRows(r.id, fnFilter !== 'All' ? fnFilter : undefined).length;
    }
    return map;
  }, [fnFilter]);

  // ── Filtered reports ──────────────────────────────────────────
  const visibleReports = React.useMemo(() => {
    if (categoryFilter === 'All') return REPORT_DEFINITIONS;
    return REPORT_DEFINITIONS.filter(r => r.category === categoryFilter);
  }, [categoryFilter]);

  // ── Open drawer (D5 fix — generatedAt computed at open time) ──
  const [generatedAt, setGeneratedAt] = React.useState(() => new Date().toISOString());

  const openReport = React.useCallback((report: ReportDefinition) => {
    const rows = buildReportRows(report.id, fnFilter !== 'All' ? fnFilter : undefined);
    setDrawerReport(report);
    setDrawerRows(rows);
    setGeneratedAt(new Date().toISOString());
    setDrawerOpen(true);
  }, [fnFilter]);

  // ── Create snapshot (database mode) ───────────────────────────
  const createExportSnapshot = React.useCallback(async (
    report: ReportDefinition,
    format: 'csv' | 'json' | 'print',
    rows: Record<string, unknown>[],
  ): Promise<{ snapshotId?: string; checksum?: string }> => {
    try {
      const resp = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportDefinitionId: report.id,
          reportName: report.name,
          reportType: report.category,
          exportFormat: format,
          dataScope: fnFilter !== 'All' ? `Function: ${fnFilter}` : 'All data',
          sourceDatasets: report.sourceDatasets,
          filtersApplied: fnFilter !== 'All' ? { businessFunction: fnFilter } : {},
          recordCount: rows.length,
        }),
      });
      if (resp.ok) {
        const result = await resp.json();
        return {
          snapshotId: result.data?.snapshotId,
          checksum: result.data?.checksum,
        };
      }
      // Non-blocking: if snapshot creation fails (JSON mode / no perms), export still proceeds
      return {};
    } catch {
      return {};
    }
  }, [fnFilter]);

  // ── Quick export without drawer ───────────────────────────────
  const quickExportCSV = React.useCallback(async (report: ReportDefinition) => {
    const rows = buildReportRows(report.id, fnFilter !== 'All' ? fnFilter : undefined);
    const snapshot = await createExportSnapshot(report, 'csv', rows);
    const meta = buildReportMeta({
      reportId: report.id,
      reportName: report.name,
      reportType: report.category,
      dataScope: fnFilter !== 'All' ? `Function: ${fnFilter}` : 'All data',
      sourceDatasets: report.sourceDatasets,
      recordCount: rows.length,
      filtersApplied: fnFilter !== 'All' ? { businessFunction: fnFilter } : {},
      snapshotId: snapshot.snapshotId,
      checksum: snapshot.checksum,
      exportFormat: 'csv',
    });
    exportToCSV(meta, report.columns, rows);
  }, [fnFilter, createExportSnapshot]);

  const quickExportJSON = React.useCallback(async (report: ReportDefinition) => {
    const rows = buildReportRows(report.id, fnFilter !== 'All' ? fnFilter : undefined);
    const snapshot = await createExportSnapshot(report, 'json', rows);
    const meta = buildReportMeta({
      reportId: report.id,
      reportName: report.name,
      reportType: report.category,
      dataScope: fnFilter !== 'All' ? `Function: ${fnFilter}` : 'All data',
      sourceDatasets: report.sourceDatasets,
      recordCount: rows.length,
      filtersApplied: fnFilter !== 'All' ? { businessFunction: fnFilter } : {},
      snapshotId: snapshot.snapshotId,
      checksum: snapshot.checksum,
      exportFormat: 'json',
    });
    exportToJSON(meta, report.columns, rows);
  }, [fnFilter, createExportSnapshot]);

  // ── Filters applied for drawer ─────────────────────────────────
  const filtersApplied = React.useMemo(() => {
    const f: Record<string, string> = {};
    if (fnFilter !== 'All') f.businessFunction = fnFilter;
    return f;
  }, [fnFilter]);

  // ── Load snapshots when tab switches ──────────────────────────
  const loadSnapshots = React.useCallback(async () => {
    setSnapshotsLoading(true);
    setSnapshotsError(null);
    try {
      const resp = await fetch('/api/reports/snapshots?limit=50');
      if (resp.status === 503) {
        setSnapshotsError('Persistent report snapshots require database mode.');
        return;
      }
      if (!resp.ok) {
        setSnapshotsError('Failed to load snapshots.');
        return;
      }
      const result = await resp.json();
      setSnapshots(result.data?.snapshots ?? []);
    } catch {
      setSnapshotsError('Failed to load snapshots.');
    } finally {
      setSnapshotsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'snapshots') {
      loadSnapshots();
    }
  }, [activeTab, loadSnapshots]);

  return (
    <>
      <PageHeader
        title="Reports & Exports"
        description="Generate business-readable exports, evidence gap reports, deficient control reports, regulatory impact summaries, and audit-ready snapshots."
      />

      <SampleDataBanner />
      <GovernanceWarningBanner>
        Reports are read-only output views generated from sample data. They do not modify active regulatory reference data, operational status, or audit logs. Not a validated GxP system.
      </GovernanceWarningBanner>

      {/* Print-only header (hidden on screen, shown in print) */}
      <div className="print-header hidden">
        <h1 style={{ fontSize: '16px', fontWeight: 'bold' }}>Compliance Operating Map — Reports &amp; Exports</h1>
        <p>Generated: {new Date(generatedAt).toLocaleString()}</p>
        <p>Generated By: Demo User</p>
        <p><strong>SAMPLE DATA:</strong> This report contains demonstration data only. Not validated for regulatory decisions. Not legal advice. Not a validated GxP system.</p>
      </div>

      <div className="space-y-6 mt-4">
        {/* ── Tab Switcher ──────────────────────────────────── */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'snapshots'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-3 w-3" /> Snapshot History
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            REPORTS TAB
           ══════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <>
            {/* ── As-of Timestamp ─────────────────────────────────── */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>As of: {new Date(generatedAt).toLocaleString()}</span>
            </div>

            {/* ── Category Filter ─────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Report Category
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REPORT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Business Function Filter ────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Business Function
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BUSINESS_FUNCTIONS.map(fn => (
                  <button
                    key={fn}
                    onClick={() => setFnFilter(fn)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      fnFilter === fn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {fn}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Export Permission Notice ────────────────────────── */}
            <PermissionGate
              requires={PERMISSIONS.REPORTS_EXPORT}
              showDenied
              deniedLabel="Export requires reports.export permission. You may preview reports."
            >
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Export enabled — snapshots will be persisted in database mode.</span>
              </div>
            </PermissionGate>

            {/* ── Report Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleReports.map(report => {
                const Icon = report.icon;
                const rowCount = rowCountMap[report.id] ?? 0;
                return (
                  <Card
                    key={report.id}
                    className="group cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => openReport(report)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{report.name}</h3>
                            <Badge variant="outline" className="text-[10px] mt-1">{report.category}</Badge>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-mono">{rowCount}</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{report.description}</p>

                      <div className="flex items-center gap-1.5 pt-1 no-print">
                        <PermissionGate requires={PERMISSIONS.REPORTS_EXPORT}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[10px] h-7 gap-1 px-2"
                            onClick={(e) => { e.stopPropagation(); quickExportCSV(report); }}
                          >
                            <Download className="h-3 w-3" /> CSV
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[10px] h-7 gap-1 px-2"
                            onClick={(e) => { e.stopPropagation(); quickExportJSON(report); }}
                          >
                            <FileJson className="h-3 w-3" /> JSON
                          </Button>
                        </PermissionGate>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {report.columns.length} columns · {report.sourceDatasets.length} source{report.sourceDatasets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {visibleReports.length === 0 && (
              <FilterEmptyState
                label="No reports match the selected category."
                context="Try selecting a different report category or choosing 'All Reports' to see every available export."
              />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            SNAPSHOT HISTORY TAB
           ══════════════════════════════════════════════════════ */}
        {activeTab === 'snapshots' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Report Snapshot History</h2>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={loadSnapshots}>
                Refresh
              </Button>
            </div>

            {snapshotsError && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{snapshotsError}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Set DATA_SOURCE=database to enable persistent report snapshots.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {snapshotsLoading && (
              <p className="text-xs text-muted-foreground italic">Loading snapshots...</p>
            )}

            {!snapshotsLoading && !snapshotsError && snapshots.length === 0 && (
              <FilterEmptyState
                label="No report snapshots found."
                context="Export a report in database mode to create the first snapshot."
              />
            )}

            {!snapshotsLoading && !snapshotsError && snapshots.length > 0 && (
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Snapshot ID</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Report</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Type</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Generated By</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Generated At</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Format</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Records</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Sample Data</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Checksum</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Audit Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots.map((s) => (
                      <tr key={s.stableReferenceId} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-1.5 px-3 font-mono text-[10px]">{s.stableReferenceId}</td>
                        <td className="py-1.5 px-3 max-w-[180px] truncate">{s.reportName}</td>
                        <td className="py-1.5 px-3">
                          <Badge variant="outline" className="text-[9px]">{s.reportType}</Badge>
                        </td>
                        <td className="py-1.5 px-3">{s.generatedBy}</td>
                        <td className="py-1.5 px-3 whitespace-nowrap">{new Date(s.generatedAt).toLocaleString()}</td>
                        <td className="py-1.5 px-3">
                          <Badge variant="secondary" className="text-[9px] uppercase">{s.exportFormat}</Badge>
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">{s.recordCount}</td>
                        <td className="py-1.5 px-3">
                          {s.includesSampleData && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" /> Yes
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-[9px] max-w-[120px] truncate" title={s.checksum ?? '—'}>
                          {s.checksum ? `${s.checksum.slice(0, 12)}…` : '—'}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-[10px]">{s.relatedAuditEventId ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-border pt-4 mt-6">
          <p className="text-[10px] text-muted-foreground">
            Reports are read-only output views. They do not modify active regulatory reference data, operational status, evidence status, control status, version history, or audit logs. All exports contain sample/demonstration data only. Not legal advice. Not a validated GxP system.
          </p>
        </div>

        {/* Print-only footer */}
        <div className="print-footer hidden">
          SAMPLE DATA — This document was generated from demonstration data and is not validated for regulatory, legal, or compliance decisions. Not a validated GxP system. Generated {new Date(generatedAt).toLocaleString()}.
        </div>
      </div>

      {/* ── Drawer ──────────────────────────────────────────── */}
      <ReportPreviewDrawer
        report={drawerReport}
        rows={drawerRows}
        generatedAt={generatedAt}
        filtersApplied={filtersApplied}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
