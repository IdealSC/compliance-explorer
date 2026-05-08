/**
 * Route Access Map — Maps every application route to required permissions.
 *
 * Used by canViewRoute() and permission-aware UI components.
 * In demo mode, routes are not hard-blocked but the map enables
 * role-aware indicators and future route guards.
 */
import { type Permission, PERMISSIONS as P } from './permissions';

export interface RouteAccess {
  path: string;
  label: string;
  requiredPermissions: Permission[];  // User needs ANY of these
  section: 'home' | 'explore' | 'monitor' | 'curated' | 'governance' | 'legacy';
}

export const ROUTE_ACCESS_MAP: RouteAccess[] = [
  // ── Home ──────────────────────────────────────────────────────
  { path: '/',                    label: 'Operating Map',               requiredPermissions: [P.REFERENCE_VIEW],          section: 'home' },

  // ── Explore ───────────────────────────────────────────────────
  { path: '/obligations',         label: 'Obligation Matrix',           requiredPermissions: [P.REFERENCE_VIEW],          section: 'explore' },
  { path: '/requirements',        label: 'All Requirements',            requiredPermissions: [P.REFERENCE_VIEW],          section: 'explore' },
  { path: '/crosswalk',           label: 'Standards Crosswalk',         requiredPermissions: [P.REFERENCE_VIEW],          section: 'explore' },
  { path: '/business-functions',  label: 'Business Functions',          requiredPermissions: [P.REFERENCE_VIEW],          section: 'explore' },

  // ── Curated ───────────────────────────────────────────────────
  { path: '/supply-chain',        label: 'Supply Chain',                requiredPermissions: [P.REFERENCE_VIEW],          section: 'curated' },
  { path: '/launch-critical',     label: 'Launch-Critical',             requiredPermissions: [P.REFERENCE_VIEW],          section: 'curated' },

  // ── Monitor ───────────────────────────────────────────────────
  { path: '/executive-dashboard', label: 'Executive Dashboard',         requiredPermissions: [P.EXECUTIVE_VIEW],          section: 'monitor' },
  { path: '/action-center',       label: 'Action Center',               requiredPermissions: [P.ACTIONS_VIEW],            section: 'monitor' },
  { path: '/reports',             label: 'Reports & Exports',           requiredPermissions: [P.REPORTS_VIEW],            section: 'monitor' },
  { path: '/controls-evidence',   label: 'Controls & Evidence',         requiredPermissions: [P.CONTROLS_VIEW],           section: 'monitor' },
  { path: '/risks',               label: 'Risk Register',               requiredPermissions: [P.OPERATIONAL_VIEW],        section: 'monitor' },

  // ── Governance ────────────────────────────────────────────────
  { path: '/regulatory-updates',  label: 'Regulatory Updates',          requiredPermissions: [P.SOURCE_VIEW, P.DRAFT_VIEW], section: 'governance' },
  { path: '/impact-analysis',     label: 'Impact Analysis',             requiredPermissions: [P.OPERATIONAL_VIEW, P.DATA_QUALITY_VIEW], section: 'governance' },
  { path: '/draft-mapping',       label: 'Draft Workspace',             requiredPermissions: [P.DRAFT_VIEW],              section: 'governance' },
  { path: '/review-approval',     label: 'Review & Approval',           requiredPermissions: [P.REVIEW_VIEW],             section: 'governance' },
  { path: '/version-history',     label: 'Version History',             requiredPermissions: [P.VERSION_VIEW],            section: 'governance' },
  { path: '/as-of-trace',          label: 'As-Of Trace',                 requiredPermissions: [P.VERSION_VIEW],            section: 'governance' },
  { path: '/audit-log',            label: 'Audit Log',                   requiredPermissions: [P.AUDIT_VIEW],              section: 'governance' },
  { path: '/source-intake',       label: 'Source Intake',               requiredPermissions: [P.SOURCE_VIEW, P.SOURCE_INTAKE], section: 'governance' },
  { path: '/source-registry',     label: 'Source Registry',             requiredPermissions: [P.SOURCE_VIEW],             section: 'governance' },
  { path: '/data-quality',        label: 'Data Quality & Validation',   requiredPermissions: [P.DATA_QUALITY_VIEW],       section: 'governance' },
  { path: '/ai-suggestions',      label: 'AI Suggestions',              requiredPermissions: [P.AI_SUGGESTION_VIEW],      section: 'governance' },
  { path: '/validation-workbench', label: 'Validation Workbench',         requiredPermissions: [P.VALIDATION_VIEW],          section: 'governance' },

  // ── Legacy ────────────────────────────────────────────────────
  { path: '/evidence',            label: 'Evidence Register (Legacy)',   requiredPermissions: [P.EVIDENCE_VIEW],           section: 'legacy' },
  { path: '/gaps',                label: 'Gaps & Actions (Legacy)',      requiredPermissions: [P.OPERATIONAL_VIEW],        section: 'legacy' },
  { path: '/sources',             label: 'Source Inventory (Legacy)',    requiredPermissions: [P.SOURCE_VIEW],             section: 'legacy' },
];

/** Lookup route access definition by path */
export function getRouteAccess(path: string): RouteAccess | undefined {
  return ROUTE_ACCESS_MAP.find((r) => r.path === path);
}
