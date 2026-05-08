/**
 * GET   /api/sources/registry/[id]/files/[fileId] — Get single file metadata
 * PATCH /api/sources/registry/[id]/files/[fileId] — Update file metadata or status
 *
 * GET:   Returns file metadata. RBAC: source.view.
 * PATCH: Updates metadata fields (source.intake) or status (source.validate). DB mode only.
 *
 * GOVERNANCE: No file content is parsed, extracted, or analyzed.
 * No DELETE method — archive (status change) is the only non-destructive removal path.
 *
 * DEFENSE-IN-DEPTH: Both GET and PATCH validate that the file belongs to the
 * parent source record specified in the [id] path parameter via validateFileOwnership().
 * A file from one source record cannot be fetched or updated through another source's route.
 *
 * Phase 3.3: Object Storage & Source File Metadata
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveSession } from '@/auth/session';
import { AuthorizationError } from '@/auth/rbac';
import {
  getSourceFileById,
  updateSourceFileMetadata,
  updateSourceFileStatus,
  verifySourceFile,
  archiveSourceFile,
  validateFileOwnership,
  type UpdateSourceFileMetadataInput,
} from '@/lib/services/source-file-writes';
import type { SourceFileStatus } from '@/types/sourceRecord';

// ── Protected Fields ────────────────────────────────────────────
// Fields that must NEVER be accepted from the client via PATCH.
// The service layer also enforces its own whitelist, but the API boundary
// rejects early for defense-in-depth.
const PATCH_PROTECTED_FIELDS = [
  // Identity (immutable after registration)
  'id', 'stableReferenceId', 'sourceRecordId',
  // File identity (immutable — set at registration)
  'fileName', 'mimeType', 'fileSizeBytes',
  // Integrity (server-controlled)
  'fileHash', 'hashAlgorithm',
  // Storage (server-controlled)
  'storageProvider', 'storageBucket', 'storagePath',
  // User attribution (server-set from session)
  'uploadedBy', 'uploadedByEmail', 'uploadedByName',
  // Timestamps (server-controlled)
  'createdAt', 'updatedAt', 'uploadedAt', 'verifiedAt',
  // Version (system-managed)
  'versionNumber',
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id, fileId } = await params;

      // Defense-in-depth: verify file belongs to the parent source record
      const ownership = await validateFileOwnership(fileId, id);
      if (!ownership.success) {
        const status =
          ownership.code === 'JSON_MODE' ? 503 :
          ownership.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(
          { error: ownership.error, code: ownership.code },
          { status },
        );
      }

      const result = await getSourceFileById(fileId);

      if (!result.success) {
        const status =
          result.code === 'JSON_MODE' ? 503 :
          result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status },
        );
      }

      return NextResponse.json({ file: result.data });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN' },
          { status: 403 },
        );
      }
      console.error('[API] GET /api/sources/registry/[id]/files/[fileId] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id, fileId } = await params;
      const body = await request.json();

      // Defense-in-depth: verify file exists and belongs to parent source record
      const ownership = await validateFileOwnership(fileId, id);
      if (!ownership.success) {
        const status =
          ownership.code === 'JSON_MODE' ? 503 :
          ownership.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(
          { error: ownership.error, code: ownership.code },
          { status },
        );
      }

      // Reject protected fields at API boundary
      const found = PATCH_PROTECTED_FIELDS.filter((f) => f in body);
      if (found.length > 0) {
        return NextResponse.json(
          { error: `Protected fields cannot be modified: ${found.join(', ')}. Only fileDisplayName, notes, and uploadStatus are accepted.` },
          { status: 400 },
        );
      }

      // Status change operation
      if (body.uploadStatus) {
        const newStatus = body.uploadStatus as SourceFileStatus;

        // Special handling for verify operation
        if (newStatus === 'verified' && body.verifyHash) {
          const result = await verifySourceFile(fileId, body.verifyHash);
          if (!result.success) {
            const status =
              result.code === 'JSON_MODE' ? 503 :
              result.code === 'NOT_FOUND' ? 404 :
              result.code === 'INVALID_TRANSITION' ? 409 : 400;
            return NextResponse.json(
              { error: result.error, code: result.code },
              { status },
            );
          }
          return NextResponse.json({
            success: true,
            file: result.data,
            auditEventId: result.auditEventId,
          });
        }

        // Special handling for archive
        if (newStatus === 'archived') {
          const result = await archiveSourceFile(fileId, body.reason);
          if (!result.success) {
            const status =
              result.code === 'JSON_MODE' ? 503 :
              result.code === 'NOT_FOUND' ? 404 :
              result.code === 'INVALID_TRANSITION' ? 409 : 400;
            return NextResponse.json(
              { error: result.error, code: result.code },
              { status },
            );
          }
          return NextResponse.json({
            success: true,
            file: result.data,
            auditEventId: result.auditEventId,
          });
        }

        // Generic status transition
        const result = await updateSourceFileStatus(fileId, newStatus, body.reason);
        if (!result.success) {
          const status =
            result.code === 'JSON_MODE' ? 503 :
            result.code === 'NOT_FOUND' ? 404 :
            result.code === 'INVALID_TRANSITION' ? 409 : 400;
          return NextResponse.json(
            { error: result.error, code: result.code },
            { status },
          );
        }
        return NextResponse.json({
          success: true,
          file: result.data,
          auditEventId: result.auditEventId,
        });
      }

      // Metadata update operation — only fileDisplayName and notes are allowed
      const input: UpdateSourceFileMetadataInput = {};
      let hasField = false;

      if (body.fileDisplayName !== undefined) {
        input.fileDisplayName = body.fileDisplayName;
        hasField = true;
      }
      if (body.notes !== undefined) {
        input.notes = body.notes;
        hasField = true;
      }

      if (!hasField) {
        return NextResponse.json(
          { error: 'No updateable fields provided. Allowed: fileDisplayName, notes, uploadStatus' },
          { status: 400 },
        );
      }

      const result = await updateSourceFileMetadata(fileId, input);
      if (!result.success) {
        const status =
          result.code === 'JSON_MODE' ? 503 :
          result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status },
        );
      }

      return NextResponse.json({
        success: true,
        file: result.data,
        auditEventId: result.auditEventId,
      });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN' },
          { status: 403 },
        );
      }
      console.error('[API] PATCH /api/sources/registry/[id]/files/[fileId] error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
