/**
 * Tier 2B: Source File Metadata Schema.
 *
 * source_files — metadata records for files associated with source records.
 *
 * GOVERNANCE:
 * This table stores file METADATA only — name, size, type, hash, storage location.
 * No file content is stored, parsed, extracted, or analyzed.
 * File metadata does NOT automatically create or modify active regulatory reference data.
 *
 * Phase 3.3: Object Storage & Source File Metadata
 */
import {
  pgTable,
  uuid,
  text,
  bigint,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './identity';
import { sourceRecords } from './sources';

// ── Enums ───────────────────────────────────────────────────────

export const sourceFileStatusEnum = pgEnum('source_file_status', [
  'registered',
  'pending_upload',
  'uploaded',
  'verified',
  'quarantined',
  'archived',
  'failed',
]);

// ── Source Files ─────────────────────────────────────────────────

export const sourceFiles = pgTable('source_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  stableReferenceId: text('stable_reference_id').notNull().unique(),
  sourceRecordId: uuid('source_record_id').notNull().references(() => sourceRecords.id),

  // File identity
  fileName: text('file_name').notNull(),
  fileDisplayName: text('file_display_name'),
  mimeType: text('mime_type').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).notNull(),

  // Integrity
  fileHash: text('file_hash'),
  hashAlgorithm: text('hash_algorithm').default('sha256'),

  // Storage location
  storageProvider: text('storage_provider').notNull().default('none'),
  storagePath: text('storage_path'),
  storageBucket: text('storage_bucket'),

  // Upload lifecycle
  uploadStatus: sourceFileStatusEnum('upload_status').notNull().default('registered'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  uploadedByEmail: text('uploaded_by_email'),
  uploadedByName: text('uploaded_by_name'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
