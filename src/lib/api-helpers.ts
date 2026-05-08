/**
 * API Route Helpers — Shared utilities for Next.js API route handlers.
 *
 * Provides consistent response shapes, error handling, and validation
 * across all API route groups. Reduces duplication and ensures no
 * stack trace leakage in error responses.
 *
 * Phase 2.9: Security Hardening
 *
 * ADOPTION: These helpers are available for use in new and refactored
 * API routes. Existing routes still use inline NextResponse.json() calls
 * with manual error handling — functionally equivalent but not yet
 * migrated. Adopt these helpers when touching existing routes.
 *
 * GOVERNANCE: These helpers enforce consistent security posture:
 * - Error responses never include stack traces
 * - AuthorizationError → 403
 * - ImmutabilityViolationError → 409
 * - JSON mode → 503 with clear message
 * - Invalid payloads → 400
 */
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseMode } from '@/lib/data-source';

// ── Response Helpers ────────────────────────────────────────────

/**
 * Standard success response.
 * Shape: { data: T }
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/**
 * Standard error response.
 * Shape: { error: string, code?: string }
 * Never includes stack traces.
 */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
): NextResponse {
  const body: { error: string; code?: string } = { error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}

// ── Error Handler ───────────────────────────────────────────────

/**
 * Catch-all error handler for API routes.
 * Maps known error types to proper HTTP status codes.
 * Never leaks stack traces to the client.
 *
 * @param err - The caught error
 * @param context - Optional route context for logging (e.g., "POST /api/reports/export")
 */
export function handleApiError(err: unknown, context?: string): NextResponse {
  // AuthorizationError → 403
  if (err instanceof Error && err.name === 'AuthorizationError') {
    return errorResponse('Forbidden', 403, 'FORBIDDEN');
  }

  // ImmutabilityViolationError → 409
  if (err instanceof Error && err.name === 'ImmutabilityViolationError') {
    return errorResponse(
      'Operation not permitted on immutable record',
      409,
      'IMMUTABILITY_VIOLATION',
    );
  }

  // Log for server diagnostics, return generic message
  if (context) {
    console.error(`[API] ${context} error:`, err);
  } else {
    console.error('[API] Unhandled error:', err);
  }

  return errorResponse('Internal server error', 500);
}

// ── Validation Helpers ──────────────────────────────────────────

/**
 * Assert database mode is active. Returns a 503 response if not.
 * Use at the top of API route handlers that require database access.
 *
 * @returns null if database mode is active, or a 503 NextResponse to return
 */
export function requireDatabaseMode(): NextResponse | null {
  if (!isDatabaseMode()) {
    return errorResponse(
      'This operation requires database mode. Set DATA_SOURCE=database in your environment.',
      503,
      'JSON_MODE',
    );
  }
  return null;
}

/**
 * Safely parse a JSON request body.
 * Returns the parsed body or a 400 error response.
 */
export async function parseJsonBody(
  req: NextRequest,
): Promise<{ body: Record<string, unknown> } | { error: NextResponse }> {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return { error: errorResponse('Request body must be a JSON object', 400) };
    }
    return { body: body as Record<string, unknown> };
  } catch {
    return { error: errorResponse('Invalid JSON in request body', 400) };
  }
}

/**
 * Validate that only allowed fields are present in a request body.
 * Returns a 400 response if disallowed fields are found.
 *
 * @param body - The parsed request body
 * @param allowedFields - Set of allowed field names
 * @returns null if valid, or a 400 NextResponse listing disallowed fields
 */
export function validateAllowedFields(
  body: Record<string, unknown>,
  allowedFields: Set<string>,
): NextResponse | null {
  const disallowed = Object.keys(body).filter((k) => !allowedFields.has(k));
  if (disallowed.length > 0) {
    return errorResponse(
      `Disallowed fields: ${disallowed.join(', ')}`,
      400,
      'DISALLOWED_FIELDS',
    );
  }
  return null;
}

/**
 * Reject request bodies that include protected/sensitive fields.
 * Returns a 400 response if any protected fields are found.
 *
 * @param body - The parsed request body
 * @param protectedFields - Fields that must not be client-provided
 */
export function rejectProtectedFields(
  body: Record<string, unknown>,
  protectedFields: string[],
): NextResponse | null {
  const found = protectedFields.filter((f) => f in body);
  if (found.length > 0) {
    return errorResponse(
      `Protected fields cannot be set by client: ${found.join(', ')}`,
      400,
      'PROTECTED_FIELDS',
    );
  }
  return null;
}
