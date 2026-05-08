/**
 * PATCH /api/staging/draft-changes/[id]
 *
 * Update fields on a draft change.
 * Only editable when draftStatus is 'draft' or 'returned'.
 *
 * Requires: draft.edit permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { updateDraftChange } from '@/lib/services/staging-writes';
import { resolveSession } from '@/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
  
      if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        return NextResponse.json(
          { error: 'Request body must contain at least one field to update.' },
          { status: 400 },
        );
      }
  
      const result = await updateDraftChange(id, body);
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({
        success: true,
        entityId: result.entityId,
        updated: result.updated,
        auditEventId: result.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN', permission: err.permission },
          { status: 403 },
        );
      }
      console.error('[API] PATCH /api/staging/draft-changes/[id] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
