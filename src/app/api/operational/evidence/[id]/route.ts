/**
 * PATCH /api/operational/evidence/[id]
 *
 * Update operational fields on an evidence requirement.
 *
 * Allowed fields: evidenceStatus, notes, lastCollectedDate, nextDueDate
 * Protected fields: all reference linkage, evidenceName, evidenceType, etc.
 *
 * Requires: evidence.edit permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import {
  updateEvidenceStatus,
  updateEvidenceNotes,
} from '@/lib/services/operational-writes';
import { resolveSession } from '@/auth/session';

const VALID_STATUSES = ['not_started', 'requested', 'collected', 'under_review', 'accepted', 'rejected', 'expired', 'missing'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
  
      const { evidenceStatus, notes, lastCollectedDate, nextDueDate } = body as {
        evidenceStatus?: string;
        notes?: string | null;
        lastCollectedDate?: string | null;
        nextDueDate?: string | null;
      };
  
      if (evidenceStatus === undefined && notes === undefined && lastCollectedDate === undefined && nextDueDate === undefined) {
        return NextResponse.json(
          { error: 'No updateable fields provided. Allowed: evidenceStatus, notes, lastCollectedDate, nextDueDate.' },
          { status: 400 },
        );
      }
  
      if (evidenceStatus !== undefined && !VALID_STATUSES.includes(evidenceStatus as typeof VALID_STATUSES[number])) {
        return NextResponse.json(
          { error: `Invalid evidenceStatus. Allowed: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
  
      let result;
  
      if (evidenceStatus !== undefined) {
        result = await updateEvidenceStatus(id, evidenceStatus as typeof VALID_STATUSES[number]);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      if (notes !== undefined || lastCollectedDate !== undefined || nextDueDate !== undefined) {
        result = await updateEvidenceNotes(id, notes ?? null, lastCollectedDate, nextDueDate);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      return NextResponse.json({
        success: true,
        entityId: id,
        updated: { evidenceStatus, notes, lastCollectedDate, nextDueDate },
        auditEventId: result?.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN', permission: err.permission },
          { status: 403 },
        );
      }
      console.error('[API] PATCH /api/operational/evidence error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
