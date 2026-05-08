/**
 * GET /api/sources/intake/[id]/checklist — Get checklist items for an intake request
 *
 * GOVERNANCE: Read-only view of checklist items. Requires source.view permission.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationError, requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';
import { getSourceIntakeRequests } from '@/lib/data';
import { getSourceIntakeChecklist } from '@/lib/services/intake-writes';
import { resolveSession } from '@/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id } = await params;
      requirePermission(PERMISSIONS.SOURCE_VIEW);

      if (isDatabaseMode()) {
        const result = await getSourceIntakeChecklist(id);
        if (!result.success) {
          const status = result.code === 'NOT_FOUND' ? 404 : 500;
          return NextResponse.json({ error: result.error, code: result.code }, { status });
        }
        return NextResponse.json({ items: result.data?.items ?? [], dataSource: 'database' });
      }

      // JSON fallback — find intake and return its embedded checklist
      const records = getSourceIntakeRequests();
      const record = records.find(r => r.stableReferenceId === id || r.id === id);
      if (!record) {
        return NextResponse.json({ error: 'Intake request not found.', code: 'NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json({ items: record.checklistItems ?? [], dataSource: 'json' });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ error: err.message, code: 'FORBIDDEN' }, { status: 403 });
      }
      console.error('[API] GET /api/sources/intake/[id]/checklist error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
