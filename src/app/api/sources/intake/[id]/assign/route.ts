/**
 * PATCH /api/sources/intake/[id]/assign — Assign an intake request
 *
 * GOVERNANCE: Assignment is audited. Only source.validate permission can assign.
 * Phase 3.6: Zod validation applied.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { isDatabaseMode } from '@/lib/data-source';
import { assignSourceIntakeRequest } from '@/lib/services/intake-writes';
import { resolveSession } from '@/auth/session';
import { validateRequestBody } from '@/lib/validation';
import { AssignIntakeSchema } from '@/validation/source-intake';

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

      // Zod validation
      const parseResult = await validateRequestBody(AssignIntakeSchema, request);
      if ('error' in parseResult) return parseResult.error;
      const { data } = parseResult;

      const result = await assignSourceIntakeRequest(
        id,
        data.assignedToEmail,
        data.assignedToName ?? data.assignedToEmail,
      );

      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json({ success: true, auditEventId: result.auditEventId });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] PATCH /api/sources/intake/[id]/assign error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

