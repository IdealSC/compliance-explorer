/**
 * Common Validation Schemas — Phase 3.6.
 *
 * Shared Zod schemas used across multiple API domains.
 * Keep practical — don't over-abstract.
 */
import { z } from 'zod';

// ── String Primitives ───────────────────────────────────────────

/** Non-empty trimmed string */
export const nonEmptyString = z.string().trim().min(1, 'Must not be empty');

/** Optional string that can be null or empty */
export const optionalString = z.string().nullable().optional();

/** Optional trimmed non-empty string or null */
export const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional();

// ── Date ────────────────────────────────────────────────────────

/** ISO date string (YYYY-MM-DD) — optional */
export const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')
  .nullable()
  .optional();

// ── URL ─────────────────────────────────────────────────────────

/** Optional URL string */
export const optionalUrl = z.string().url().nullable().optional();

// ── Priority ────────────────────────────────────────────────────

export const priorityEnum = z.enum(['low', 'medium', 'high', 'critical']);

// ── Confidence ──────────────────────────────────────────────────

/** Confidence score between 0.0 and 1.0 */
export const confidenceScore = z.number().min(0).max(1);

// ── Boolean ─────────────────────────────────────────────────────

export const optionalBoolean = z.boolean().optional();
