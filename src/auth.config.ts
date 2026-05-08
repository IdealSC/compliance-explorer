/**
 * Auth.js Configuration — Provider and callback setup.
 *
 * This file is edge-compatible (no database adapter, no Node.js-only imports).
 * It configures:
 * - Generic OIDC provider (works with Entra ID, Okta, Google, any OIDC IdP)
 * - JWT callbacks to persist RBAC roles into the session token
 * - Session callbacks to expose roles on the client-side session object
 *
 * GOVERNANCE:
 * - OIDC groups are mapped to RoleId values via group-mapping.ts
 * - Default role is viewer (least privilege) if no groups match
 * - AI cannot change this mapping — only admin configuration can
 * - demoUser is always false for OIDC sessions
 *
 * Phase 3.1: Production Identity Provider Integration
 */
import type { NextAuthConfig } from 'next-auth';
import { mapGroupsToRoles, getGroupClaimName } from '@/auth/group-mapping';
import type { RoleId } from '@/auth/roles';

/**
 * Check whether OIDC environment variables are configured.
 * When not configured, the OIDC provider is omitted (demo-only mode).
 */
function isOidcConfigured(): boolean {
  return !!(
    process.env.AUTH_OIDC_ISSUER &&
    process.env.AUTH_OIDC_ID &&
    process.env.AUTH_OIDC_SECRET
  );
}

/**
 * Build the providers array.
 * Only includes the OIDC provider if credentials are configured.
 */
function buildProviders(): NextAuthConfig['providers'] {
  if (!isOidcConfigured()) {
    return [];
  }

  // Dynamic import to avoid bundling provider when not needed
  // Using inline provider config for generic OIDC
  return [
    {
      id: 'oidc',
      name: 'SSO',
      type: 'oidc' as const,
      issuer: process.env.AUTH_OIDC_ISSUER,
      clientId: process.env.AUTH_OIDC_ID,
      clientSecret: process.env.AUTH_OIDC_SECRET,

      // Extract roles from OIDC profile claims
      profile(profile: Record<string, unknown>) {
        const groupClaim = getGroupClaimName();
        const groups = Array.isArray(profile[groupClaim])
          ? (profile[groupClaim] as string[])
          : [];
        const roles = mapGroupsToRoles(groups);

        return {
          id: profile.sub as string,
          name: (profile.name as string) ?? (profile.email as string) ?? 'Unknown',
          email: profile.email as string,
          roles,
          demoUser: false,
        };
      },
    },
  ];
}

export const authConfig: NextAuthConfig = {
  providers: buildProviders(),

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  callbacks: {
    /**
     * JWT callback — persist roles and demoUser flag into the token.
     * 'user' is only available at sign-in time.
     */
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user.roles as RoleId[]) ?? ['viewer'];
        token.demoUser = user.demoUser ?? false;
      }
      return token;
    },

    /**
     * Session callback — expose roles and demoUser on the session object.
     * This makes them available to server components and API routes via auth().
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub ?? '';
        (session.user as any).roles = (token.roles as RoleId[]) ?? ['viewer'];
        (session.user as any).demoUser = token.demoUser ?? false;
      }
      return session;
    },
  },

  // NOTE: Custom sign-in page deferred to Phase 3.2.
  // Auth.js uses its built-in sign-in page by default.
  // When ready, create src/app/auth/signin/page.tsx and uncomment:
  // pages: { signIn: '/auth/signin' },

  trustHost: true,
};
