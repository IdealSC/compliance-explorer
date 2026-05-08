/**
 * GET /api/sources/registry/[id] — Get single source record + checklist
 * PATCH /api/sources/registry/[id] — Update source metadata
 *
 * GET: Returns source record with embedded checklist. RBAC: source.view.
 * PATCH: Updates whitelisted metadata fields. RBAC: source.intake. DB mode only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import {
  getSourceRecordById,
  updateSourceRecordMetadata,
  type UpdateSourceMetadataInput,
} from '@/lib/services/source-writes';
import { resolveSession } from '@/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const result = await getSourceRecordById(id);
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({ record: result.data });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/registry/[id] error:', err);
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
      const body = await request.json();
  
      // Extract only whitelisted metadata fields
      const input: UpdateSourceMetadataInput = {};
      const allowed = [
        'sourceTitle', 'regulator', 'jurisdiction', 'issuingAuthority',
        'publicationDate', 'effectiveDate', 'lastRetrievedDate',
        'sourceUrl', 'sourceFileName', 'sourceVersion',
        'summary', 'keyChanges', 'knownLimitations', 'sourceReference', 'notes',
      ] as const;
  
      let hasField = false;
      for (const field of allowed) {
        if (body[field] !== undefined) {
          (input as Record<string, unknown>)[field] = body[field];
          hasField = true;
        }
      }
  
      if (!hasField) {
        return NextResponse.json(
          { error: `No updateable fields provided. Allowed: ${allowed.join(', ')}` },
          { status: 400 },
        );
      }
  
      const result = await updateSourceRecordMetadata(id, input);
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({ success: true, entityId: id, updated: result.data, auditEventId: result.auditEventId });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/sources/registry/[id] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
