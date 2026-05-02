/**
 * Constants — Color maps, severity ordering, SCOR phases, and brand tokens.
 * Used across badges, charts, and dashboard components.
 */

// ── Severity Colors ─────────────────────────────────────────
export const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',   // Red
  High: '#f59e0b',       // Amber
  Medium: '#3b82f6',     // Blue
};

export const SEVERITY_ORDER = ['Critical', 'High', 'Medium'] as const;

// ── SCOR Phase Colors ───────────────────────────────────────
export const SCOR_COLORS: Record<string, string> = {
  PLAN: '#8b5cf6',       // Purple
  SOURCE: '#06b6d4',     // Cyan
  MAKE: '#10b981',       // Green
  DELIVER: '#3498db',    // Blue
  RETURN: '#f59e0b',     // Amber
  ENABLE: '#64748b',     // Slate
};

export const SCOR_ORDER = ['PLAN', 'SOURCE', 'MAKE', 'DELIVER', 'RETURN', 'ENABLE'] as const;

// ── Status Colors ───────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  'Reviewed – App Ready Pending Legal Sign-Off': '#10b981',
  'Citation / Applicability Validation Required': '#f59e0b',
  'Timing Clarification Required': '#3b82f6',
};

// ── Lifecycle Stage Order ───────────────────────────────────
export const LIFECYCLE_ORDER = [
  'Planning / Resilience',
  'Clinical Development',
  'Pre-Launch / Launch Readiness',
  'Supplier / Import Readiness',
  'Manufacturing / Release',
  'Commercial Distribution / Postmarket',
  'Post-Approval Lifecycle',
  'Enterprise Quality System',
] as const;

// ── Evidence Criticality Colors ─────────────────────────────
export const EVIDENCE_CRITICALITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#64748b',
};

// ── Chart Theme (Recharts) ──────────────────────────────────
export const CHART_COLORS = [
  '#3498db', '#1e3a5f', '#f39c12', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f59e0b', '#64748b', '#ec4899',
];

// ── Navigation Items ────────────────────────────────────────
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/supply-chain', label: 'Supply Chain', icon: 'Truck' },
  { href: '/launch-critical', label: 'Launch-Critical', icon: 'Rocket' },
  { href: '/risks', label: 'Highest Risk', icon: 'AlertTriangle' },
  { href: '/evidence', label: 'Evidence', icon: 'FileCheck' },
  { href: '/requirements', label: 'All Requirements', icon: 'List' },
] as const;
