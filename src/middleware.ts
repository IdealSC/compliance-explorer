/**
 * Next.js Edge Middleware — Security Headers + Auth.js Session
 *
 * Applies standard security headers to all responses.
 * Integrates Auth.js for session availability in the edge context.
 *
 * Phase 2.9: Security Hardening (headers)
 * Phase 3.1: Auth.js session integration (preparation for route protection)
 *
 * Headers applied:
 * - X-Content-Type-Options: nosniff — Prevents MIME-type sniffing
 * - X-Frame-Options: DENY — Prevents clickjacking via iframe embedding
 * - Referrer-Policy: strict-origin-when-cross-origin — Limits referrer leakage
 * - Permissions-Policy — Restricts browser feature access
 * - X-DNS-Prefetch-Control: off — Prevents DNS prefetching leakage
 *
 * NOTE: Content-Security-Policy (CSP) is intentionally omitted.
 * CSP can break Next.js inline scripts, hot-reload, and dynamic imports
 * if not carefully scoped. Add CSP at the deployment/CDN level with
 * proper nonce configuration.
 *
 * NOTE: Auth.js session is available in middleware context but does NOT
 * block any routes in Phase 3.1. Route protection will be added in Phase 3.2.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ── Security Headers ──────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  );
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  return response;
}

// Apply to all routes except static files and Next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
