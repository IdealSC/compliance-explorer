/**
 * PATCH /api/validation/reviews/[id]/status — Transition validation status.
 *
 * Enforces valid state transitions and precondition checks.
 *
 * GOVERNANCE: Updates advisory validation metadata only.
 * Does NOT approve, publish, or activate reference data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';
import { updateValidationStatus } from '@/lib/services/validation-writes';
import { UpdateValidationStatusSchema } from '@/validation/validation-workbench';
import { AuthorizationError } from '@/auth/rbac';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for validation operations.' },
          { status: 503 },
        );
      }

      const { id } = await params;
      const body = await request.json();

      const parsed = UpdateValidationStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
          { status: 422 },
        );
      }

      const result = await updateValidationStatus(id, parsed.data);

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404
          : result.code === 'FORBIDDEN' ? 403
          : result.code === 'INVALID_TRANSITION' ? 409
          : result.code === 'PRECONDITION_FAILED' ? 422
          : 400;
        return NextResponse.json({ error: result.error }, { status });
      }

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
  });
}
