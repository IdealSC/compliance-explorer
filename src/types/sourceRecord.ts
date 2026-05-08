/**
 * SourceRecord — Registered source material supporting compliance reference data.
 *
 * Source records are INTAKE/GOVERNANCE data. They track the provenance,
 * validation state, and readiness of laws, regulations, standards, guidance,
 * and other materials used to build the compliance operating map.
 *
 * Source records do NOT automatically create or update active regulatory
 * reference data. Materials must be validated, staged, reviewed, approved,
 * versioned, and audited before publication.
 */

// ── Source Type ──────────────────────────────────────────────────

export type SourceType =
  | 'law'
  | 'regulation'
  | 'standard'
  | 'guidance'
  | 'framework'
  | 'regulator_notice'
  | 'internal_note'
  | 'pdf'
  | 'spreadsheet'
  | 'website'
  | 'other';

// ── Source Status (lifecycle) ────────────────────────────────────

export type SourceStatus =
  | 'intake'
  | 'metadata_review'
  | 'validation_pending'
  | 'validated'
  | 'staged'
  | 'active'
  | 'superseded'
  | 'archived'
  | 'rejected';

// ── Validation Status ───────────────────────────────────────────

export type ValidationStatus =
  | 'not_started'
  | 'incomplete_metadata'
  | 'source_verified'
  | 'citation_review_needed'
  | 'legal_review_needed'
  | 'validated'
  | 'rejected';

// ── Validation Checklist ────────────────────────────────────────

export type ChecklistItemStatus =
  | 'not_started'
  | 'complete'
  | 'incomplete'
  | 'needs_review'
  | 'not_applicable';

export interface SourceValidationChecklistItem {
  id: string;
  sourceRecordId: string;
  itemLabel: string;
  itemDescription: string;
  status: ChecklistItemStatus;
  requiredForValidation: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string | null;
}

// ── Source File Metadata (Phase 3.3) ────────────────────────────

export type SourceFileStatus =
  | 'registered'
  | 'pending_upload'
  | 'uploaded'
  | 'verified'
  | 'quarantined'
  | 'archived'
  | 'failed';

export interface SourceFile {
  /** Unique identifier, e.g. "SF-lkj3f8-a9z2" */
  id: string;
  /** Parent source record stable reference ID */
  sourceRecordId: string;
  /** Original file name */
  fileName: string;
  /** Human-friendly display name */
  fileDisplayName: string | null;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  fileSizeBytes: number;
  /** SHA-256 content hash (null until verified) */
  fileHash: string | null;
  /** Hash algorithm used */
  hashAlgorithm: string | null;
  /** Storage provider */
  storageProvider: string;
  /** Provider-specific storage path/key */
  storagePath: string | null;
  /** Upload lifecycle status */
  uploadStatus: SourceFileStatus;
  /** Who uploaded */
  uploadedBy: string | null;
  uploadedByEmail: string | null;
  /** When uploaded */
  uploadedAt: string | null;
  /** When hash was verified */
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Source Record ────────────────────────────────────────────────

export interface SourceRecord {
  /** Unique identifier, e.g. "SRC-001" */
  id: string;
  sourceTitle: string;
  sourceType: SourceType;
  regulator: string | null;
  jurisdiction: string | null;
  issuingAuthority: string | null;
  publicationDate: string | null;
  effectiveDate: string | null;
  lastRetrievedDate: string | null;
  sourceUrl: string | null;
  sourceFileName: string | null;
  sourceVersion: string | null;

  // ── Lifecycle Status ──────────────────────────────────────────
  sourceStatus: SourceStatus;
  validationStatus: ValidationStatus;
  confidenceLevel: 'High' | 'Medium' | 'Low' | null;
  owner: string | null;
  reviewer: string | null;
  approver: string | null;
  legalReviewRequired: boolean;

  // ── Linkage (read-only references) ────────────────────────────
  relatedObligationIds: string[];
  relatedRegulatoryUpdateIds: string[];
  relatedDraftChangeIds: string[];
  relatedCrosswalkIds: string[];
  relatedControlIds: string[];
  relatedEvidenceIds: string[];
  relatedReportIds: string[];

  // ── Content & Quality ─────────────────────────────────────────
  summary: string | null;
  keyChanges: string | null;
  knownLimitations: string | null;
  missingMetadata: string[];
  sourceReference: string | null;

  // ── Validation Checklist (embedded) ───────────────────────────
  validationChecklist: SourceValidationChecklistItem[];

  // ── Source Files (embedded metadata, Phase 3.3) ───────────────
  sourceFiles: SourceFile[];

  // ── Metadata ──────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  notes: string | null;
}

