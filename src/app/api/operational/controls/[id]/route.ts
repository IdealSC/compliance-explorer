/**
 * PATCH /api/operational/controls/[id]
 *
 * Update operational fields on a compliance control.
 *
 * Allowed fields: controlStatus, notes, nextReviewDate
 * Protected fields: all reference linkage, controlName, controlType, etc.
 *
 * Requires: controls.edit permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import {
  updateControlStatus,
  updateControlNotes,
} from '@/lib/services/operational-writes';
import { resolveSession } from '@/auth/session';

// Allowed control status values for validation
const VALID_STATUSES = ['not_started', 'designed', 'implemented', 'operating', 'needs_review', 'deficient', 'retired'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
  
      // Extract only allowed fields — silently ignore anything else
      const { controlStatus, notes, nextReviewDate } = body as {
        controlStatus?: string;
        notes?: string | null;
        nextReviewDate?: string | null;
      };
  
      // At least one field must be provided
      if (controlStatus === undefined && notes === undefined && nextReviewDate === undefined) {
        return NextResponse.json(
          { error: 'No updateable fields provided. Allowed: controlStatus, notes, nextReviewDate.' },
          { status: 400 },
        );
      }
  
      // Validate status if provided
      if (controlStatus !== undefined && !VALID_STATUSES.includes(controlStatus as typeof VALID_STATUSES[number])) {
        return NextResponse.json(
          { error: `Invalid controlStatus. Allowed: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
  
      // Execute updates
      let result;
  
      if (controlStatus !== undefined) {
        result = await updateControlStatus(id, controlStatus as typeof VALID_STATUSES[number]);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      if (notes !== undefined || nextReviewDate !== undefined) {
        result = await updateControlNotes(id, notes ?? null, nextReviewDate);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
      }
  
      return NextResponse.json({
        success: true,
        entityId: id,
        updated: { controlStatus, notes, nextReviewDate },
        auditEventId: result?.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN', permission: err.permission },
          { status: 403 },
        );
      }
      console.error('[API] PATCH /api/operational/controls error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
