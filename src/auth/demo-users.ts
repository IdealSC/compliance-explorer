/**
 * Demo Users — Deterministic demo identities for the prototype.
 *
 * IDs are pre-computed SHA-256 deterministic UUIDs using the same
 * `compliance-seed:{email}` approach from Phase 2.1.1 seed.
 * Pre-computed to avoid importing Node.js `crypto` into client bundles
 * (DemoUserPanel.tsx imports this module as a 'use client' component).
 *
 * To regenerate IDs if the seed prefix changes:
 *   node -e "const c=require('crypto'); const h=c.createHash('sha256')
 *     .update('compliance-seed:EMAIL').digest('hex');
 *     console.log([h.slice(0,8),h.slice(8,12),'4'+h.slice(13,16),
 *     '8'+h.slice(17,20),h.slice(20,32)].join('-'))"
 *
 * GOVERNANCE: All users are clearly labelled as demo users.
 * Do not use for production identity. Replace with NextAuth/SSO in Phase 2.4+.
 */
import { ROLES, type RoleId } from './roles';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  roles: RoleId[];
  demoUser: true;
  active: true;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: '3a7e098d-55a8-4c1b-8428-a3562a4f30ea',
    name: 'Demo Viewer',
    email: 'viewer.demo@example.com',
    roles: [ROLES.VIEWER],
    demoUser: true,
    active: true,
  },
  {
    id: '2ebf54e7-b971-4763-83de-96c75c5d0f47',
    name: 'Demo Business Owner',
    email: 'business.owner.demo@example.com',
    roles: [ROLES.BUSINESS_OWNER],
    demoUser: true,
    active: true,
  },
  {
    id: '3cc98b33-8a0a-437f-8125-ef15dab1386a',
    name: 'Demo Compliance Editor',
    email: 'compliance.editor.demo@example.com',
    roles: [ROLES.COMPLIANCE_EDITOR],
    demoUser: true,
    active: true,
  },
  {
    id: '92414bad-1846-47d5-8366-951817dc37b2',
    name: 'Demo Compliance Approver',
    email: 'compliance.approver.demo@example.com',
    roles: [ROLES.COMPLIANCE_APPROVER],
    demoUser: true,
    active: true,
  },
  {
    id: '91c781b9-39ad-440e-8f85-44c38f61ddda',
    name: 'Demo Legal Reviewer',
    email: 'legal.reviewer.demo@example.com',
    roles: [ROLES.LEGAL_REVIEWER],
    demoUser: true,
    active: true,
  },
  {
    id: '9a1e1ac2-df89-414e-85d0-5ddbcc1cf61a',
    name: 'Demo Risk Reviewer',
    email: 'risk.reviewer.demo@example.com',
    roles: [ROLES.RISK_REVIEWER],
    demoUser: true,
    active: true,
  },
  {
    id: '4b9998cd-b692-40e2-837f-67a4f772f9fc',
    name: 'Demo Auditor',
    email: 'auditor.demo@example.com',
    roles: [ROLES.AUDITOR],
    demoUser: true,
    active: true,
  },
  {
    id: 'f02c1a9b-3f80-4fcf-88a1-957c2e164769',
    name: 'Demo Admin',
    email: 'admin.demo@example.com',
    roles: [ROLES.ADMIN],
    demoUser: true,
    active: true,
  },
];

/** Lookup demo user by email */
export function getDemoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email === email);
}

/** Lookup demo user by ID */
export function getDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

/** Default demo user (Compliance Approver — good balance of permissions) */
export const DEFAULT_DEMO_USER = DEMO_USERS.find(
  (u) => u.email === 'compliance.approver.demo@example.com'
)!;

