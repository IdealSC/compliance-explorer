/**
 * Source File Validation Schemas — Phase 3.6.
 *
 * Zod schemas for source file metadata API routes.
 *
 * GOVERNANCE:
 * - File metadata only — no file binary content
 * - .strict() rejects unknown fields
 * - Protected fields excluded by schema design
 */
import { z } from 'zod';
import { nonEmptyString, optionalString, optionalNonEmptyString } from './common';

// ── Enums ───────────────────────────────────────────────────────

export const sourceFileStatusEnum = z.enum([
  'registered',
  'pending_upload',
  'uploaded',
  'verified',
  'quarantined',
  'archived',
  'failed',
]);

export const hashAlgorithmEnum = z.enum(['sha256', 'sha384', 'sha512', 'md5']);

// ── Create Source File Metadata ─────────────────────────────────

export const CreateSourceFileSchema = z.object({
  fileName: nonEmptyString.pipe(z.string().max(500)),
  fileDisplayName: optionalNonEmptyString,
  mimeType: nonEmptyString.pipe(z.string().max(255)),
  fileSizeBytes: z.number().int().nonnegative('File size must be non-negative'),
  fileHash: optionalNonEmptyString,
  hashAlgorithm: hashAlgorithmEnum.optional(),
  notes: optionalString,
}).strict();

// ── Update Source File Metadata ─────────────────────────────────

export const UpdateSourceFileMetadataSchema = z.object({
  fileDisplayName: optionalNonEmptyString,
  notes: optionalString,
}).strict();

// ── Update Source File Status ───────────────────────────────────

export const UpdateSourceFileStatusSchema = z.object({
  newStatus: sourceFileStatusEnum,
  reason: optionalString,
}).strict();
