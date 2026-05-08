/**
 * Identity & Access Schema — users, roles, user_role_assignments.
 *
 * Phase 2.2 will add auth integration. For now, these tables exist
 * in the schema for seed data and foreign key references.
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// ── Users ───────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

// ── Roles ───────────────────────────────────────────────────────

export const roles = pgTable('roles', {
  id: text('id').primaryKey(), // e.g., 'viewer', 'compliance_editor'
  displayName: text('display_name').notNull(),
  description: text('description'),
  permissionSet: jsonb('permission_set'),
});

// ── User ↔ Role Assignments ────────────────────────────────────

export const userRoleAssignments = pgTable('user_role_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  roleId: text('role_id').notNull().references(() => roles.id),
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});
