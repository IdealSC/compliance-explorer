/**
 * PATCH /api/sources/registry/[id]/checklist/[itemId]
 *
 * Update a single validation checklist item's status and notes.
 * Requires: source.validate permission, DATA_SOURCE=database.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { updateChecklistItem } from '@/lib/services/source-writes';
import { resolveSession } from '@/auth/session';

const VALID_STATUSES = ['not_started', 'complete', 'incomplete', 'needs_review', 'not_applicable'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { itemId } = await params;
      const body = await request.json();
      const { status, notes } = body as { status?: string; notes?: string | null };
  
      if (!status) {
        return NextResponse.json({ error: 'status is required.' }, { status: 400 });
      }
  
      if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
        return NextResponse.json(
          { error: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
  
      const result = await updateChecklistItem(
        itemId,
        status as typeof VALID_STATUSES[number],
        notes,
      );
  
      if (!result.success) {
        const statusCode = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status: statusCode });
      }
  
      return NextResponse.json({ success: true, itemId, ...result.data, auditEventId: result.auditEventId });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/sources/registry/[id]/checklist/[itemId] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
