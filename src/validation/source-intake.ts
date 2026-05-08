/**
 * Source Intake Validation Schemas — Phase 3.6.
 *
 * Zod schemas for source intake API routes.
 * Replaces manual field validation in route handlers.
 *
 * GOVERNANCE:
 * - .strict() rejects unknown/protected fields at schema level
 * - Protected fields (id, submittedBy*, etc.) are excluded by design
 * - Server-side validation is authoritative
 */
import { z } from 'zod';
import {
  nonEmptyString,
  optionalString,
  optionalNonEmptyString,
  optionalDateString,
  optionalUrl,
  priorityEnum,
} from './common';

// ── Enums ───────────────────────────────────────────────────────

export const intakeTypeEnum = z.enum([
  'new_source',
  'updated_source',
  'new_guidance',
  'updated_guidance',
  'standard_update',
  'regulator_notice',
  'internal_note',
  'source_file_metadata',
  'other',
]);

export const intakeStatusEnum = z.enum([
  'submitted',
  'triage',
  'metadata_review',
  'assigned',
  'validation_pending',
  'legal_review_required',
  'ready_for_source_record',
  'converted_to_source_record',
  'rejected',
  'closed',
]);

export const metadataCompletenessEnum = z.enum([
  'not_started',
  'incomplete',
  'complete',
  'needs_review',
]);

// ── Create Intake Request ───────────────────────────────────────

export const CreateIntakeSchema = z.object({
  intakeTitle: nonEmptyString.pipe(z.string().max(500)),
  intakeType: intakeTypeEnum,
  intakeDescription: optionalString,
  priority: priorityEnum.optional(),
  sourceType: optionalNonEmptyString,
  regulator: optionalNonEmptyString,
  jurisdiction: optionalNonEmptyString,
  issuingAuthority: optionalNonEmptyString,
  publicationDate: optionalDateString,
  effectiveDate: optionalDateString,
  sourceUrl: optionalUrl,
  sourceFileName: optionalNonEmptyString,
  relatedSourceRecordId: optionalNonEmptyString,
  businessFunctionsImpacted: optionalString,
  domainsImpacted: optionalString,
  intakeSummary: optionalString,
  sourceReference: optionalString,
}).strict();

export type CreateIntakeInput = z.infer<typeof CreateIntakeSchema>;

// ── Update Intake Metadata ──────────────────────────────────────

export const UpdateIntakeMetadataSchema = z.object({
  intakeTitle: nonEmptyString.pipe(z.string().max(500)).optional(),
  intakeDescription: optionalString,
  sourceType: optionalNonEmptyString,
  regulator: optionalNonEmptyString,
  jurisdiction: optionalNonEmptyString,
  issuingAuthority: optionalNonEmptyString,
  publicationDate: optionalDateString,
  effectiveDate: optionalDateString,
  sourceUrl: optionalUrl,
  sourceFileName: optionalNonEmptyString,
  businessFunctionsImpacted: optionalString,
  domainsImpacted: optionalString,
  intakeSummary: optionalString,
  sourceReference: optionalString,
  triageNotes: optionalString,
}).strict();

// ── Update Intake Status ────────────────────────────────────────

export const UpdateIntakeStatusSchema = z.object({
  newStatus: intakeStatusEnum,
  reason: optionalString,
}).strict();

// ── Assign Intake ───────────────────────────────────────────────

export const AssignIntakeSchema = z.object({
  assignedToEmail: z.string().email('Must be a valid email'),
  assignedToName: optionalNonEmptyString,
}).strict();

// ── Update Checklist Item ───────────────────────────────────────

export const UpdateChecklistItemSchema = z.object({
  itemId: nonEmptyString,
  status: z.enum(['not_started', 'complete', 'incomplete', 'needs_review', 'not_applicable']),
  notes: optionalString,
}).strict();
