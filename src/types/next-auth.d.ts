/**
 * Auth.js / NextAuth Type Augmentation
 *
 * Extends the default Auth.js types to include RBAC-relevant fields
 * (roles, demoUser) on User, Session, and JWT objects.
 *
 * Phase 3.1: Production Identity Provider Integration
 */
import type { RoleId } from '@/auth/roles';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    roles?: RoleId[];
    demoUser?: boolean;
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roles: RoleId[];
      demoUser: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: RoleId[];
    demoUser?: boolean;
  }
}
