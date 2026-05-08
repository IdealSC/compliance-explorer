/**
 * Auth.js Catch-All Route Handler
 *
 * Serves all Auth.js routes:
 * - /api/auth/signin
 * - /api/auth/callback/oidc
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 *
 * Coexists with /api/auth/demo-login/ — the demo login route
 * continues to work independently when DEMO_AUTH_ENABLED=true.
 *
 * Phase 3.1: Production Identity Provider Integration
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
