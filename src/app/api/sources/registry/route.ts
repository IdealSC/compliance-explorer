/**
 * GET /api/sources/registry — List all source records
 * POST /api/sources/registry — Create a new source record
 *
 * GET: Returns source records from DB (database mode) or JSON (json mode).
 * POST: Creates a new source record. Requires: source.intake, DATA_SOURCE=database.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getSourceRecords } from '@/lib/data';
import {
  getSourceRecordsFromDb,
  createSourceRecord,
  type CreateSourceInput,
} from '@/lib/services/source-writes';
import { getSourceFilesByRecordIds } from '@/lib/services/source-file-writes';
import { resolveSession } from '@/auth/session';

const VALID_SOURCE_TYPES = ['law', 'regulation', 'standard', 'guidance', 'framework', 'regulator_notice', 'internal_note', 'pdf', 'spreadsheet', 'website', 'other'] as const;

export async function GET() {
  return resolveSession(async () => {  
    try {
      requirePermission(PERMISSIONS.SOURCE_VIEW);
  
      if (isDatabaseMode()) {
        const result = await getSourceRecordsFromDb();
        if (!result.success) {
          return NextResponse.json({ error: result.error, code: result.code }, { status: 500 });
        }

        // D5 fix: Batch-load source files for all records (avoids N+1)
        const records = result.data ?? [];
        try {
          const stableRefIds = records.map(r => r.id);
          const filesResult = await getSourceFilesByRecordIds(stableRefIds);
          if (filesResult.success && filesResult.data) {
            for (const record of records) {
              record.sourceFiles = filesResult.data.get(record.id) ?? [];
            }
          }
        } catch {
          // Source file loading is non-critical — records still returned with sourceFiles: []
        }

        return NextResponse.json({ records, dataSource: 'database' });
      }
  
      // JSON fallback
      const records = getSourceRecords();
      return NextResponse.json({ records, dataSource: 'json' });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/registry error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}

export async function POST(request: NextRequest) {
  return resolveSession(async () => {  
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for creating source records.', code: 'JSON_MODE' },
          { status: 503 },
        );
      }
  
      const body = await request.json();
      const { sourceTitle, sourceType, regulator, jurisdiction, issuingAuthority,
        publicationDate, effectiveDate, sourceUrl, sourceFileName,
        sourceVersion, summary, sourceReference, legalReviewRequired } = body as CreateSourceInput;
  
      // Validate required fields
      if (!sourceTitle || typeof sourceTitle !== 'string' || sourceTitle.trim().length === 0) {
        return NextResponse.json({ error: 'sourceTitle is required.' }, { status: 400 });
      }
      if (!sourceType || !VALID_SOURCE_TYPES.includes(sourceType as typeof VALID_SOURCE_TYPES[number])) {
        return NextResponse.json({ error: `Invalid sourceType. Allowed: ${VALID_SOURCE_TYPES.join(', ')}` }, { status: 400 });
      }
  
      const result = await createSourceRecord({
        sourceTitle: sourceTitle.trim(),
        sourceType: sourceType as typeof VALID_SOURCE_TYPES[number],
        regulator, jurisdiction, issuingAuthority,
        publicationDate, effectiveDate, sourceUrl, sourceFileName,
        sourceVersion, summary, sourceReference, legalReviewRequired,
      });
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'FORBIDDEN' ? 403 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({ success: true, ...result.data, auditEventId: result.auditEventId }, { status: 201 });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] POST /api/sources/registry error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
