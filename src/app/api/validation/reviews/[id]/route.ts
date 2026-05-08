/**
 * PATCH /api/validation/reviews/[id] — Update validation review fields.
 *
 * Updates notes, source support, citation accuracy, and review flags.
 *
 * GOVERNANCE: Updates advisory validation metadata only.
 * Does NOT approve, publish, or activate reference data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';
import { resolveSession } from '@/auth/session';
import {
  updateSourceSupportStatus,
  updateCitationAccuracyStatus,
  updateValidationNotes,
} from '@/lib/services/validation-writes';
import {
  UpdateSourceSupportSchema,
  UpdateCitationAccuracySchema,
  UpdateValidationNotesSchema,
} from '@/validation/validation-workbench';
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

      // C6 FIX: Only one field type per PATCH. Reject ambiguous multi-field requests.
      const hasSourceSupport = body.sourceSupportStatus !== undefined;
      const hasCitationAccuracy = body.citationAccuracyStatus !== undefined;
      if (hasSourceSupport && hasCitationAccuracy) {
        return NextResponse.json(
          { error: 'Only one field type per PATCH request. Send sourceSupportStatus and citationAccuracyStatus as separate requests.' },
          { status: 422 },
        );
      }

      // Determine which update operation based on provided fields
      if (hasSourceSupport) {
        const parsed = UpdateSourceSupportSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
            { status: 422 },
          );
        }
        const result = await updateSourceSupportStatus(id, parsed.data);
        if (!result.success) {
          const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
          return NextResponse.json({ error: result.error }, { status });
        }
        return NextResponse.json(result);
      }

      if (body.citationAccuracyStatus !== undefined) {
        const parsed = UpdateCitationAccuracySchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
            { status: 422 },
          );
        }
        const result = await updateCitationAccuracyStatus(id, parsed.data);
        if (!result.success) {
          const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
          return NextResponse.json({ error: result.error }, { status });
        }
        return NextResponse.json(result);
      }

      // Default: notes/findings update
      const parsed = UpdateValidationNotesSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
          { status: 422 },
        );
      }

      const result = await updateValidationNotes(id, parsed.data);
      if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
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
