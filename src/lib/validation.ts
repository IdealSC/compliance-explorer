/**
 * Shared Zod Validation Utilities — Phase 3.6.
 *
 * Provides type-safe request validation using Zod schemas.
 * Integrates with existing api-helpers.ts response patterns.
 *
 * GOVERNANCE:
 * - Server-side validation is authoritative
 * - Zod errors are sanitized before returning to client
 * - Protected field rejection remains defense-in-depth
 * - Schemas define allowed fields via .strict() mode
 *
 * Phase 3.6: Zod Validation Schemas
 */
import { NextRequest, NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { errorResponse } from '@/lib/api-helpers';

/**
 * Format a ZodError into a safe, client-facing error message.
 * Never leaks internal schema details beyond field names and basic issue types.
 */
export function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return `${path}: ${issue.message}`;
  });
  return `Validation failed: ${issues.join('; ')}`;
}

/**
 * Validate a request body against a Zod schema.
 * Returns the parsed/validated data or a 400 error response.
 *
 * Usage:
 * ```ts
 * const result = await validateRequestBody(MySchema, request);
 * if ('error' in result) return result.error;
 * const { data } = result; // typed to schema output
 * ```
 */
export async function validateRequestBody<T>(
  schema: ZodSchema<T>,
  req: NextRequest,
): Promise<{ data: T } | { error: NextResponse }> {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return { error: errorResponse('Invalid JSON in request body', 400, 'INVALID_JSON') };
  }

  try {
    const data = schema.parse(rawBody);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: errorResponse(formatZodError(err), 400, 'VALIDATION_ERROR'),
      };
    }
    return { error: errorResponse('Validation failed', 400, 'VALIDATION_ERROR') };
  }
}

/**
 * Validate search/query parameters against a Zod schema.
 * Extracts params from URLSearchParams and validates.
 */
export function validateSearchParams<T>(
  schema: ZodSchema<T>,
  params: URLSearchParams,
): { data: T } | { error: NextResponse } {
  const raw: Record<string, string> = {};
  params.forEach((value, key) => {
    raw[key] = value;
  });

  try {
    const data = schema.parse(raw);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        error: errorResponse(formatZodError(err), 400, 'VALIDATION_ERROR'),
      };
    }
    return { error: errorResponse('Invalid query parameters', 400, 'VALIDATION_ERROR') };
  }
}
