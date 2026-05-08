/**
 * POST /api/staging/regulatory-updates
 *
 * Create a new draft regulatory update.
 *
 * Requires: reference.draft.create permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { createRegulatoryUpdateDraft } from '@/lib/services/staging-writes';
import { resolveSession } from '@/auth/session';

const VALID_CHANGE_TYPES = ['new', 'amendment', 'repeal', 'guidance', 'standard_update', 'interpretation_update'] as const;

export async function POST(request: NextRequest) {
  return resolveSession(async () => {  
    try {
      const body = await request.json();
  
      const { updateTitle, changeType, changeSummary, ...optionalFields } = body as Record<string, unknown>;
  
      // Validate required fields at API level
      if (!updateTitle || typeof updateTitle !== 'string') {
        return NextResponse.json(
          { error: 'updateTitle is required and must be a string.' },
          { status: 400 },
        );
      }
      if (!changeType || !VALID_CHANGE_TYPES.includes(changeType as typeof VALID_CHANGE_TYPES[number])) {
        return NextResponse.json(
          { error: `changeType is required. Allowed: ${VALID_CHANGE_TYPES.join(', ')}` },
          { status: 400 },
        );
      }
      if (!changeSummary || typeof changeSummary !== 'string') {
        return NextResponse.json(
          { error: 'changeSummary is required and must be a string.' },
          { status: 400 },
        );
      }
  
      const result = await createRegulatoryUpdateDraft({
        updateTitle: updateTitle as string,
        changeType: changeType as string,
        changeSummary: changeSummary as string,
        sourceName: optionalFields.sourceName as string | null | undefined,
        sourceType: optionalFields.sourceType as string | null | undefined,
        regulator: optionalFields.regulator as string | null | undefined,
        jurisdiction: optionalFields.jurisdiction as string | null | undefined,
        publicationDate: optionalFields.publicationDate as string | null | undefined,
        effectiveDate: optionalFields.effectiveDate as string | null | undefined,
        sourceReference: optionalFields.sourceReference as string | null | undefined,
        impactedDomains: optionalFields.impactedDomains as string[] | undefined,
        impactedBusinessFunctions: optionalFields.impactedBusinessFunctions as string[] | undefined,
        confidenceLevel: optionalFields.confidenceLevel as string | null | undefined,
        legalReviewRequired: optionalFields.legalReviewRequired as boolean | undefined,
        assignedReviewer: optionalFields.assignedReviewer as string | null | undefined,
        relatedObligationIds: optionalFields.relatedObligationIds as string[] | undefined,
        relatedCrosswalkIds: optionalFields.relatedCrosswalkIds as string[] | undefined,
      });
  
      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }
  
      return NextResponse.json({
        success: true,
        entityId: result.entityId,
        auditEventId: result.auditEventId,
      }, { status: 201 });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN', permission: err.permission },
          { status: 403 },
        );
      }
      console.error('[API] POST /api/staging/regulatory-updates error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
