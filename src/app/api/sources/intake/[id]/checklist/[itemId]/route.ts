/**
 * PATCH /api/sources/intake/[id]/checklist/[itemId] — Update a checklist item
 *
 * Accepts: status, notes. All other fields are protected.
 *
 * GOVERNANCE: Checklist updates are audited. Parent intake ownership is validated.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { isDatabaseMode } from '@/lib/data-source';
import { updateSourceIntakeChecklistItem } from '@/lib/services/intake-writes';
import { resolveSession } from '@/auth/session';

const VALID_STATUSES = ['not_started', 'complete', 'incomplete', 'needs_review', 'not_applicable'] as const;

// Protected fields — never accepted from client
const PROTECTED_FIELDS = new Set([
  'id', 'intakeRequestId',
  'itemLabel', 'itemDescription',
  'requiredForTriage', 'requiredForSourceRecordCreation',
  'completedByUserId', 'completedByEmail', 'completedAt',
  'createdAt', 'updatedAt',
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id, itemId } = await params;

      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required.', code: 'JSON_MODE' },
          { status: 503 },
        );
      }

      const body = await request.json();

      // Reject protected fields
      for (const field of PROTECTED_FIELDS) {
        if (field in body) {
          delete body[field];
        }
      }

      // Validate status if provided
      if (body.status && !VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }

      if (Object.keys(body).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
      }

      const result = await updateSourceIntakeChecklistItem(id, itemId, body);

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json({ success: true, auditEventId: result.auditEventId });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/sources/intake/[id]/checklist/[itemId] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
