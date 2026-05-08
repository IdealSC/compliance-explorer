/**
 * PATCH /api/sources/registry/[id]/status
 *
 * Update source record status or validation status.
 * Also supports special actions: validate, reject, legal_review_required.
 *
 * Requires: source.validate permission, DATA_SOURCE=database.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import {
  updateSourceStatus,
  updateSourceValidationStatus,
  markSourceValidated,
  rejectSourceRecord,
  markSourceLegalReviewRequired,
} from '@/lib/services/source-writes';
import { resolveSession } from '@/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {  
    try {
      const { id } = await params;
      const body = await request.json();
      const { action, sourceStatus, validationStatus, reason } = body as {
        action?: 'validate' | 'reject' | 'legal_review_required';
        sourceStatus?: string;
        validationStatus?: string;
        reason?: string;
      };
  
      // Special actions take priority
      if (action === 'validate') {
        const result = await markSourceValidated(id);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ success: true, entityId: id, ...result.data, auditEventId: result.auditEventId });
      }
  
      if (action === 'reject') {
        if (!reason || reason.trim().length === 0) {
          return NextResponse.json({ error: 'Reason is required for rejection.' }, { status: 400 });
        }
        const result = await rejectSourceRecord(id, reason);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ success: true, entityId: id, ...result.data, auditEventId: result.auditEventId });
      }
  
      if (action === 'legal_review_required') {
        const result = await markSourceLegalReviewRequired(id, reason);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ success: true, entityId: id, ...result.data, auditEventId: result.auditEventId });
      }
  
      // Direct status updates
      if (sourceStatus) {
        const result = await updateSourceStatus(id, sourceStatus as Parameters<typeof updateSourceStatus>[1], reason);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ success: true, entityId: id, ...result.data, auditEventId: result.auditEventId });
      }
  
      if (validationStatus) {
        const result = await updateSourceValidationStatus(id, validationStatus as Parameters<typeof updateSourceValidationStatus>[1], reason);
        if (!result.success) {
          const status = result.code === 'JSON_MODE' ? 503 : result.code === 'NOT_FOUND' ? 404 : 400;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ success: true, entityId: id, ...result.data, auditEventId: result.auditEventId });
      }
  
      return NextResponse.json({ error: 'Provide action, sourceStatus, or validationStatus.' }, { status: 400 });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/sources/registry/[id]/status error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
