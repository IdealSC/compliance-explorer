/**
 * GET /api/sources/intake — List all source intake requests
 * POST /api/sources/intake — Create a new source intake request
 *
 * GET: Returns intake requests from DB (database mode) or JSON sample data.
 * POST: Creates a new intake request. Requires: source.intake, DATA_SOURCE=database.
 *
 * GOVERNANCE: Intake requests are workflow data only. They do not create
 * obligations, draft mappings, or active reference data.
 *
 * Phase 3.6: Zod validation applied to POST handler.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getSourceIntakeRequests } from '@/lib/data';
import {
  getSourceIntakeRequestsFromDb,
  createSourceIntakeRequest,
} from '@/lib/services/intake-writes';
import { resolveSession } from '@/auth/session';
import { validateRequestBody } from '@/lib/validation';
import { CreateIntakeSchema } from '@/validation/source-intake';

export async function GET() {
  return resolveSession(async () => {
    try {
      requirePermission(PERMISSIONS.SOURCE_VIEW);

      if (isDatabaseMode()) {
        const result = await getSourceIntakeRequestsFromDb();
        if (!result.success) {
          return NextResponse.json({ error: result.error, code: result.code }, { status: 500 });
        }
        return NextResponse.json({
          records: result.data?.records ?? [],
          dataSource: 'database',
        });
      }

      // JSON fallback
      const records = getSourceIntakeRequests();
      return NextResponse.json({ records, dataSource: 'json' });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/intake error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return resolveSession(async () => {
    try {
      if (!isDatabaseMode()) {
        return NextResponse.json(
          { error: 'Database mode required for creating intake requests.', code: 'JSON_MODE' },
          { status: 503 },
        );
      }

      // Zod validation — .strict() rejects unknown/protected fields
      const parseResult = await validateRequestBody(CreateIntakeSchema, request);
      if ('error' in parseResult) return parseResult.error;
      const { data } = parseResult;

      const result = await createSourceIntakeRequest({
        intakeTitle: data.intakeTitle,
        intakeType: data.intakeType,
        intakeDescription: data.intakeDescription,
        priority: data.priority,
        sourceType: data.sourceType,
        regulator: data.regulator,
        jurisdiction: data.jurisdiction,
        issuingAuthority: data.issuingAuthority,
        publicationDate: data.publicationDate,
        effectiveDate: data.effectiveDate,
        sourceUrl: data.sourceUrl,
        sourceFileName: data.sourceFileName,
        relatedSourceRecordId: data.relatedSourceRecordId,
        businessFunctionsImpacted: data.businessFunctionsImpacted,
        domainsImpacted: data.domainsImpacted,
        intakeSummary: data.intakeSummary,
        sourceReference: data.sourceReference,
      });

      if (!result.success) {
        const status = result.code === 'JSON_MODE' ? 503 : result.code === 'FORBIDDEN' ? 403 : 400;
        return NextResponse.json({ error: result.error, code: result.code }, { status });
      }

      return NextResponse.json(
        { success: true, ...result.data, auditEventId: result.auditEventId },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] POST /api/sources/intake error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

