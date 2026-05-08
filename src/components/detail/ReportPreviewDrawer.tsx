'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SampleDataBanner } from '@/components/governance';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/auth/permissions';
import { Section, DetailGrid, DetailItem } from '@/components/detail/DrawerPrimitives';
import { exportToCSV, exportToJSON, triggerPrint, buildReportMeta } from '@/lib/export';
import type { ReportDefinition } from '@/lib/reportDefinitions';
import { Download, FileJson, Printer, ExternalLink, Clock, Database, Shield, Scale, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ReportPreviewDrawerProps {
  report: ReportDefinition | null;
  rows: Record<string, unknown>[];
  generatedAt: string;
  filtersApplied: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportPreviewDrawer({
  report,
  rows,
  generatedAt,
  filtersApplied,
  open,
  onOpenChange,
}: ReportPreviewDrawerProps) {
  const [lastSnapshotId, setLastSnapshotId] = React.useState<string | null>(null);
  const [lastChecksum, setLastChecksum] = React.useState<string | null>(null);
  const [exportPending, setExportPending] = React.useState(false);

  // Reset snapshot ID when drawer opens with new report
  React.useEffect(() => {
    if (open) {
      setLastSnapshotId(null);
      setLastChecksum(null);
    }
  }, [open, report?.id]);

  if (!report) return null;

  // ── Snapshot creation helper ────────────────────────────────
  const createSnapshot = async (format: 'csv' | 'json' | 'print'): Promise<{ snapshotId?: string; checksum?: string }> => {
    try {
      const resp = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportDefinitionId: report.id,
          reportName: report.name,
          reportType: report.category,
          exportFormat: format,
          dataScope: Object.keys(filtersApplied).length > 0
            ? `Filtered: ${Object.entries(filtersApplied).map(([k, v]) => `${k}=${v}`).join(', ')}`
            : 'All data',
          sourceDatasets: report.sourceDatasets,
          filtersApplied,
          recordCount: rows.length,
        }),
      });
      if (resp.ok) {
        const result = await resp.json();
        return { snapshotId: result.data?.snapshotId, checksum: result.data?.checksum };
      }
      return {};
    } catch {
      return {};
    }
  };

  const buildMeta = (snapshot: { snapshotId?: string; checksum?: string }) => buildReportMeta({
    reportId: report.id,
    reportName: report.name,
    reportType: report.category,
    dataScope: Object.keys(filtersApplied).length > 0
      ? `Filtered: ${Object.entries(filtersApplied).map(([k, v]) => `${k}=${v}`).join(', ')}`
      : 'All data',
    sourceDatasets: report.sourceDatasets,
    recordCount: rows.length,
    filtersApplied,
    snapshotId: snapshot.snapshotId,
    checksum: snapshot.checksum,
  });

  const handleCSV = async () => {
    setExportPending(true);
    const snapshot = await createSnapshot('csv');
    if (snapshot.snapshotId) setLastSnapshotId(snapshot.snapshotId);
    if (snapshot.checksum) setLastChecksum(snapshot.checksum);
    exportToCSV(buildMeta(snapshot), report.columns, rows);
    setExportPending(false);
  };

  const handleJSON = async () => {
    setExportPending(true);
    const snapshot = await createSnapshot('json');
    if (snapshot.snapshotId) setLastSnapshotId(snapshot.snapshotId);
    if (snapshot.checksum) setLastChecksum(snapshot.checksum);
    exportToJSON(buildMeta(snapshot), report.columns, rows);
    setExportPending(false);
  };

  const handlePrint = async () => {
    setExportPending(true);
    const snapshot = await createSnapshot('print');
    if (snapshot.snapshotId) setLastSnapshotId(snapshot.snapshotId);
    if (snapshot.checksum) setLastChecksum(snapshot.checksum);
    setExportPending(false);
    // C3 FIX: snapshot state is set before triggerPrint so the
    // print-only header below will render the snapshot metadata.
    // Small delay ensures React re-render completes before print dialog opens.
    setTimeout(() => triggerPrint(), 100);
  };

  const previewRows = rows.slice(0, 25);
  const visibleColumns = report.columns.slice(0, 6);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SampleDataBanner />
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="text-[10px] font-mono">{report.id}</Badge>
            <Badge variant="outline" className="text-[10px]">{report.category}</Badge>
          </div>
          <SheetTitle className="text-base leading-tight">{report.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">{report.purpose}</p>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* A. Report Info */}
          <Section title="Report Info" icon={<Clock className="h-4 w-4" />}>
            <DetailGrid>
              <DetailItem label="Generated" value={new Date(generatedAt).toLocaleString()} />
              <DetailItem label="Generated By" value="Demo User" />
              <DetailItem label="Records" value={`${rows.length} rows`} />
              <DetailItem label="Columns" value={`${report.columns.length} fields`} />
            </DetailGrid>
            {Object.keys(filtersApplied).length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] text-muted-foreground font-semibold">Filters: </span>
                {Object.entries(filtersApplied).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="text-[10px] mr-1">{k}: {v}</Badge>
                ))}
              </div>
            )}
          </Section>

          {/* B. Data Sources */}
          <Section title="Data Sources" icon={<Database className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-1">
              {report.sourceDatasets.map(ds => (
                <Badge key={ds} variant="secondary" className="text-[10px] font-mono">{ds}</Badge>
              ))}
            </div>
          </Section>

          {/* C. Preview Table */}
          <Section title={`Preview (${previewRows.length} of ${rows.length})`} icon={<Shield className="h-4 w-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {visibleColumns.map(col => (
                      <th key={col.key} className="text-left py-1.5 px-2 font-semibold text-muted-foreground whitespace-nowrap">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      {visibleColumns.map(col => (
                        <td key={col.key} className="py-1.5 px-2 max-w-[200px] truncate">{String(row[col.key] ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                  {previewRows.length === 0 && (
                    <tr>
                      <td colSpan={visibleColumns.length} className="py-4 text-center text-muted-foreground italic">No data matches the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {rows.length > 25 && (
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                Showing first 25 of {rows.length} rows. Export for full data.
              </p>
            )}
          </Section>
          {report.columns.length > visibleColumns.length && (
            <p className="text-[10px] text-muted-foreground italic -mt-1">
              Showing {visibleColumns.length} of {report.columns.length} columns. Export for full data.
            </p>
          )}

          {/* D. Export Actions (Permission-gated) */}
          <Section title="Export" icon={<Download className="h-4 w-4" />}>
            <PermissionGate
              requires={PERMISSIONS.REPORTS_EXPORT}
              showDenied
              deniedLabel="Export requires reports.export permission."
            >
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  disabled={exportPending}
                  onClick={handleCSV}
                >
                  <Download className="h-3.5 w-3.5" /> CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  disabled={exportPending}
                  onClick={handleJSON}
                >
                  <FileJson className="h-3.5 w-3.5" /> JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  disabled={exportPending}
                  onClick={handlePrint}
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>

              {/* Snapshot confirmation */}
              {lastSnapshotId && (
                <div className="flex items-start gap-2 mt-3 p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[10px] space-y-0.5">
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Snapshot: </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-300">{lastSnapshotId}</span>
                    </div>
                    {lastChecksum && (
                      <div>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Checksum: </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-300">{lastChecksum.slice(0, 16)}…</span>
                      </div>
                    )}
                    <div className="text-emerald-600/70 dark:text-emerald-400/70">This export is audit-tracked and governed.</div>
                  </div>
                </div>
              )}
            </PermissionGate>
          </Section>

          {/* E. Cross-Link */}
          <Section title="Related Views" icon={<ExternalLink className="h-4 w-4" />}>
            <Link href={report.crossLinkHref} className="text-xs text-primary hover:underline">
              Open in full view →
            </Link>
          </Section>

          {/* F. Governance Notes */}
          <Section title="Governance Notes" icon={<Scale className="h-4 w-4" />}>
            <p className="text-xs text-muted-foreground italic">
              This report is a read-only output view generated from sample/demonstration data. It does not modify active regulatory reference data, operational status, evidence status, control status, version history, or audit logs. Not legal advice. Not a validated GxP system.
            </p>
          </Section>
        </div>

        {/* C3 FIX: Print-only snapshot provenance — visible only when printing */}
        <div className="print-header hidden">
          <p><strong>{report.name}</strong> — {report.category}</p>
          <p>Generated: {new Date(generatedAt).toLocaleString()} · Generated By: Demo User</p>
          {lastSnapshotId && <p>Snapshot ID: {lastSnapshotId}</p>}
          {lastChecksum && <p>Checksum (SHA-256): {lastChecksum}</p>}
          <p><strong>SAMPLE DATA:</strong> This export contains demonstration data only. Not validated for regulatory, legal, or compliance decisions.</p>
          <p>This report is generated from sample/demonstration data. Not validated for regulatory decisions. Not legal advice. Not a validated GxP system.</p>
        </div>

        {/* Footer disclaimer */}
        <div className="border-t border-border pt-3 mt-2">
          <p className="text-[10px] text-muted-foreground">
            Report generated from demonstration data. As of: {new Date(generatedAt).toLocaleString()}.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
