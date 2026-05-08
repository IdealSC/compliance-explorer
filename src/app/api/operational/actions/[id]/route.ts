/**
 * PATCH /api/operational/actions/[id]
 *
 * Update operational fields on an owner action item.
 *
 * Allowed fields: actionStatus, notes, dueDate
 * Protected fields: all reference linkage, actionTitle, priority, owner, etc.
 *
 * Requires: actions.edit permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import {
  updateActionStatus,
  updateActionNotes,
  updateActionDueDate,
} from '@/lib/services/operational-writes';
import { resolveSession } from '@/auth/session';

const VALID_STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'overdue'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
  
      const { actionStatus, notes, dueDate } = body as {
        actionStatus?: string;
        notes?: string | null;
        dueDate?: string | null;
      };
  
      if (actionStatus === undefined && notes === undefined && dueDate === undefined) {
        return NextResponse.json(
          { error: 'No updateable fields provided. Allowed: actionStatus, notes, dueDate.' },
          { status: 400 },
        );
      }
  
      if (actionStatus !== undefined && !VALID_STATUSES.includes(actionStatus as typeof VALID_STATUSES[number])) {
        return NextResponse.json(
          { error: `Invalid actionStatus. Allowed: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
  
      let result;
  
      if (actionStatus !== undefined) {
        result = await updateActionStatus(id, actionStatus as typeof VALID_STATUSES[number]);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      if (notes !== undefined) {
        result = await updateActionNotes(id, notes);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      if (dueDate !== undefined) {
        result = await updateActionDueDate(id, dueDate);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      return NextResponse.json({
        success: true,
        entityId: id,
        updated: { actionStatus, notes, dueDate },
        auditEventId: result?.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN', permission: err.permission },
          { status: 403 },
        );
      }
      console.error('[API] PATCH /api/operational/actions error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
