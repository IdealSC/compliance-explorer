/**
 * POST /api/staging/draft-changes
 *
 * Create a new draft regulatory change.
 *
 * Requires: draft.edit permission
 * Requires: DATA_SOURCE=database
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError } from '@/auth/rbac';
import { createDraftChange } from '@/lib/services/staging-writes';
import { resolveSession } from '@/auth/session';

const VALID_ENTITY_TYPES = ['obligation', 'crosswalk', 'citation', 'interpretation', 'control', 'evidence', 'function_impact'] as const;
const VALID_CHANGE_TYPES = ['new', 'update', 'supersede', 'citation_update', 'interpretation_update', 'crosswalk_update', 'control_update', 'evidence_update', 'function_impact_update'] as const;

export async function POST(request: NextRequest) {
  return resolveSession(async () => {  
    try {
      const body = await request.json();
  
      const { relatedUpdateId, affectedEntityType, changeType, proposedChangeSummary, ...optionalFields } = body as Record<string, unknown>;
  
      // Validate required fields
      if (!relatedUpdateId || typeof relatedUpdateId !== 'string') {
        return NextResponse.json(
          { error: 'relatedUpdateId is required and must be a string.' },
          { status: 400 },
        );
      }
      if (!affectedEntityType || !VALID_ENTITY_TYPES.includes(affectedEntityType as typeof VALID_ENTITY_TYPES[number])) {
        return NextResponse.json(
          { error: `affectedEntityType is required. Allowed: ${VALID_ENTITY_TYPES.join(', ')}` },
          { status: 400 },
        );
      }
      if (!changeType || !VALID_CHANGE_TYPES.includes(changeType as typeof VALID_CHANGE_TYPES[number])) {
        return NextResponse.json(
          { error: `changeType is required. Allowed: ${VALID_CHANGE_TYPES.join(', ')}` },
          { status: 400 },
        );
      }
      if (!proposedChangeSummary || typeof proposedChangeSummary !== 'string') {
        return NextResponse.json(
          { error: 'proposedChangeSummary is required and must be a string.' },
          { status: 400 },
        );
      }
  
      const result = await createDraftChange({
        relatedUpdateId: relatedUpdateId as string,
        affectedEntityType: affectedEntityType as string,
        changeType: changeType as string,
        proposedChangeSummary: proposedChangeSummary as string,
        affectedEntityId: optionalFields.affectedEntityId as string | null | undefined,
        previousValue: optionalFields.previousValue as string | null | undefined,
        proposedValue: optionalFields.proposedValue as string | null | undefined,
        sourceReference: optionalFields.sourceReference as string | null | undefined,
        changeReason: optionalFields.changeReason as string | null | undefined,
        requiredApprover: optionalFields.requiredApprover as string | null | undefined,
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
      console.error('[API] POST /api/staging/draft-changes error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  
  });
}
