/**
 * GET /api/sources/intake/[id] — Get a single source intake request
 * PATCH /api/sources/intake/[id] — Update intake metadata
 *
 * GOVERNANCE: Intake requests are workflow data only.
 * Phase 3.6: Zod validation applied to PATCH handler.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getSourceIntakeRequests } from '@/lib/data';
import {
  getSourceIntakeRequestById,
  updateSourceIntakeRequest,
} from '@/lib/services/intake-writes';
import { resolveSession } from '@/auth/session';
import { validateRequestBody } from '@/lib/validation';
import { UpdateIntakeMetadataSchema } from '@/validation/source-intake';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id } = await params;
      requirePermission(PERMISSIONS.SOURCE_VIEW);

      if (isDatabaseMode()) {
        const result = await getSourceIntakeRequestById(id);
        if (!result.success) {
          const status = result.code === 'NOT_FOUND' ? 404 : 500;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ record: result.data?.record, dataSource: 'database' });
      }

      // JSON fallback
      const records = getSourceIntakeRequests();
      const record = records.find(r => r.stableReferenceId === id || r.id === id);
      if (!record) {
        return NextResponse.json({ error: 'Intake request not found.', code: 'NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json({ record, dataSource: 'json' });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/intake/[id] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PATCH(
  request: NextRequest,
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

      // Zod validation — .strict() rejects protected/unknown fields
      const parseResult = await validateRequestBody(UpdateIntakeMetadataSchema, request);
      if ('error' in parseResult) return parseResult.error;
      const { data } = parseResult;

      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
      }

      const result = await updateSourceIntakeRequest(id, data);

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json({ success: true, auditEventId: result.auditEventId });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/sources/intake/[id] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

