/**
 * POST /api/sources/intake/[id]/convert-to-source-record — Convert intake to source record
 *
 * Validates intake is in 'ready_for_source_record' status,
 * creates a new source record via the existing source-writes service,
 * and updates the intake status to 'converted_to_source_record'.
 *
 * GOVERNANCE:
 * - Creates source record ONLY — does NOT create obligations, draft mappings, or active reference data.
 * - Requires source.validate permission.
 * - All operations are audited.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { isDatabaseMode } from '@/lib/data-source';
import { convertIntakeToSourceRecord } from '@/lib/services/intake-writes';
import { resolveSession } from '@/auth/session';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id } = await params;

      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required.', code: 'JSON_MODE' },
          { status: 503 },
        );
      }

      const result = await convertIntakeToSourceRecord(id);

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404
          : result.code === 'INVALID_TRANSITION' ? 409
          : result.code === 'VALIDATION_ERROR' ? 422
          : result.code === 'FORBIDDEN' ? 403
          : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json({
        success: true,
        sourceRecordId: result.data?.sourceRecordId,
        auditEventId: result.auditEventId,
        governanceNote: 'Source record created. This action does NOT create obligations, draft mappings, or active reference data. The source record must still pass through the controlled publishing workflow.',
      }, { status: 201 });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] POST /api/sources/intake/[id]/convert-to-source-record error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
