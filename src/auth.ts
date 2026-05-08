/**
 * Auth.js Initialization — Exports handlers, auth, signIn, signOut.
 *
 * This is the main Auth.js entry point. Import from here in:
 * - API route handler: `import { handlers } from "@/auth"`
 * - Server components/actions: `import { auth } from "@/auth"`
 * - Client sign-in/out: `import { signIn, signOut } from "@/auth"`
 *
 * GOVERNANCE:
 * - This module does NOT replace demo auth. Demo auth is handled
 *   separately in session.ts when DEMO_AUTH_ENABLED=true.
 * - Auth.js is active only when DEMO_AUTH_ENABLED=false.
 *
 * Phase 3.1: Production Identity Provider Integration
 */
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
