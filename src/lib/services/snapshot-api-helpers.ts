/**
 * Report Snapshot API Helpers — Shared validation and input parsing for
 * report snapshot API endpoints.
 *
 * C4 FIX: Extracted from duplicate validation logic in
 * /api/reports/snapshots and /api/reports/export routes.
 */
import type { SnapshotMetadataInput } from '@/lib/services/snapshot-writes';

// ── Required Fields ─────────────────────────────────────────────

const REQUIRED_FIELDS = ['reportDefinitionId', 'reportName', 'reportType', 'exportFormat', 'recordCount'] as const;
const VALID_FORMATS = ['csv', 'json', 'print', 'preview'] as const;

// ── Types ───────────────────────────────────────────────────────

export type ParseResult =
  | { success: true; input: SnapshotMetadataInput }
  | { success: false; error: string };

// ── Parser ──────────────────────────────────────────────────────

/**
 * Parse and validate a report snapshot request body.
 * Returns either a validated SnapshotMetadataInput or an error string.
 */
export function parseSnapshotRequest(body: Record<string, unknown>): ParseResult {
  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] && body[field] !== 0) {
      return { success: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate export format
  const format = body.exportFormat as string;
  if (!(VALID_FORMATS as readonly string[]).includes(format)) {
    return {
      success: false,
      error: `Invalid exportFormat. Must be one of: ${VALID_FORMATS.join(', ')}`,
    };
  }

  const input: SnapshotMetadataInput = {
    reportDefinitionId: body.reportDefinitionId as string,
    reportName: body.reportName as string,
    reportType: body.reportType as string,
    dataScope: (body.dataScope as string) ?? 'All data',
    sourceDatasets: (body.sourceDatasets as string[]) ?? [],
    filtersApplied: (body.filtersApplied as Record<string, string>) ?? {},
    recordCount: Number(body.recordCount),
    exportFormat: format as SnapshotMetadataInput['exportFormat'],
  };

  return { success: true, input };
}
