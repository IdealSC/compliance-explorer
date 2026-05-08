/**
 * GET  /api/sources/registry/[id]/files — List file metadata for a source record
 * POST /api/sources/registry/[id]/files — Register new file metadata
 *
 * GET:  Returns all file metadata linked to the source record. RBAC: source.view.
 * POST: Registers new file metadata (NOT a file upload). RBAC: source.intake. DB mode only.
 *
 * GOVERNANCE: No file content is parsed, extracted, or analyzed.
 * This endpoint accepts file METADATA only (name, type, size, hash).
 *
 * Phase 3.3: Object Storage & Source File Metadata
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveSession } from '@/auth/session';
import { AuthorizationError } from '@/auth/rbac';
import {
  getSourceFilesForRecord,
  registerSourceFile,
  type RegisterSourceFileInput,
} from '@/lib/services/source-file-writes';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id } = await params;
      const result = await getSourceFilesForRecord(id);

      if (!result.success) {
        const status =
          result.code === 'JSON_MODE' ? 503 :
          result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status },
        );
      }

      return NextResponse.json({ files: result.data });
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN' },
          { status: 403 },
        );
      }
      console.error('[API] GET /api/sources/registry/[id]/files error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return resolveSession(async () => {
    try {
      const { id } = await params;
      const body = await request.json();

      // Validate required fields
      if (!body.fileName || typeof body.fileName !== 'string') {
        return NextResponse.json(
          { error: 'fileName is required and must be a string.' },
          { status: 400 },
        );
      }
      if (!body.mimeType || typeof body.mimeType !== 'string') {
        return NextResponse.json(
          { error: 'mimeType is required and must be a string.' },
          { status: 400 },
        );
      }
      if (body.fileSizeBytes === undefined || typeof body.fileSizeBytes !== 'number' || body.fileSizeBytes < 0) {
        return NextResponse.json(
          { error: 'fileSizeBytes is required and must be a non-negative number.' },
          { status: 400 },
        );
      }

      // Reject protected fields — server-controlled at registration
      const protectedFields = [
        'id', 'stableReferenceId', 'sourceRecordId',
        'uploadStatus', 'storageProvider', 'storagePath', 'storageBucket',
        'uploadedBy', 'uploadedByEmail', 'uploadedByName',
        'createdAt', 'updatedAt', 'uploadedAt', 'verifiedAt',
        'versionNumber',
      ];
      const found = protectedFields.filter((f) => f in body);
      if (found.length > 0) {
        return NextResponse.json(
          { error: `Protected fields cannot be set by client: ${found.join(', ')}` },
          { status: 400 },
        );
      }

      const input: RegisterSourceFileInput = {
        sourceRecordId: id,
        fileName: body.fileName,
        fileDisplayName: body.fileDisplayName ?? null,
        mimeType: body.mimeType,
        fileSizeBytes: body.fileSizeBytes,
        fileHash: body.fileHash ?? null,
        hashAlgorithm: body.hashAlgorithm ?? null,
        storagePath: null,    // Server-controlled — never from client
        storageBucket: null,  // Server-controlled — never from client
        notes: body.notes ?? null,
      };

      const result = await registerSourceFile(input);

      if (!result.success) {
        const status =
          result.code === 'JSON_MODE' ? 503 :
          result.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status },
        );
      }

      return NextResponse.json(
        {
          success: true,
          file: result.data,
          auditEventId: result.auditEventId,
        },
        { status: 201 },
      );
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json(
          { error: err.message, code: 'FORBIDDEN' },
          { status: 403 },
        );
      }
      console.error('[API] POST /api/sources/registry/[id]/files error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
