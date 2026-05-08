'use client';

/**
 * Column definition sets for curated views.
 * Each view gets its own column array built from shared cell renderers.
 * All columns use the same Requirement type — no data transformation.
 */
import type { ColumnDef } from '@tanstack/react-table';
import { SeverityBadge, FlagBadge } from '@/components/badges';
import type { Requirement } from '@/types';

/* ── Shared cell renderers ────────────────────────────────── */

const monoId = (val: string) => (
  <span className="font-mono text-xs font-semibold text-primary">{val}</span>
);

const textXs = (val: string | null) => (
  <span className="text-xs leading-snug">{val || <span className="text-muted-foreground">—</span>}</span>
);

const textXsClamp2 = (val: string | null) => (
  <span className="text-xs leading-snug line-clamp-2">
    {val || <span className="text-muted-foreground">—</span>}
  </span>
);

const textXsClamp3Muted = (val: string | null) => (
  <span className="text-xs leading-snug text-muted-foreground line-clamp-3">{val || '—'}</span>
);

const multiFunctionCell = (val: string | null) => {
  if (!val) return <span className="text-muted-foreground text-xs">—</span>;
  const functions = val.split(';').map((f) => f.trim()).filter(Boolean);
  if (functions.length <= 2) {
    return <span className="text-xs leading-snug">{functions.join(', ')}</span>;
  }
  return (
    <span className="text-xs leading-snug">
      {functions[0]}, {functions[1]}{' '}
      <span className="text-muted-foreground">+{functions.length - 2}</span>
    </span>
  );
};

/* ── Individual column definitions ───────────────────────── */

export const COL_ID: ColumnDef<Requirement> = {
  accessorKey: 'matrixRowId',
  header: 'ID',
  size: 90,
  cell: ({ getValue }) => monoId(getValue<string>()),
};

export const COL_DOMAIN: ColumnDef<Requirement> = {
  accessorKey: 'regulatoryDomain',
  header: 'Regulatory Domain',
  size: 200,
  cell: ({ getValue }) => textXs(getValue<string>()),
};

export const COL_JURISDICTION: ColumnDef<Requirement> = {
  accessorKey: 'jurisdictionRegion',
  header: 'Jurisdiction',
  size: 150,
  cell: ({ getValue }) => textXs(getValue<string>()),
};

export const COL_LAW: ColumnDef<Requirement> = {
  accessorKey: 'lawRegulationFrameworkStandardName',
  header: 'Law / Framework',
  size: 250,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

export const COL_REQUIREMENT_AREA: ColumnDef<Requirement> = {
  accessorKey: 'level3RequirementArea',
  header: 'Requirement Area',
  size: 180,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

export const COL_SUMMARY: ColumnDef<Requirement> = {
  accessorKey: 'uiDisplaySummary',
  header: 'Summary',
  size: 350,
  cell: ({ getValue }) => textXsClamp3Muted(getValue<string | null>()),
};

export const COL_BUSINESS_FUNCTION: ColumnDef<Requirement> = {
  accessorKey: 'businessFunctionImpacted',
  header: 'Business Function',
  size: 160,
  cell: ({ getValue }) => multiFunctionCell(getValue<string | null>()),
};

export const COL_SEVERITY: ColumnDef<Requirement> = {
  accessorKey: 'severityPriority',
  header: 'Severity',
  size: 110,
  cell: ({ getValue }) => <SeverityBadge severity={getValue<string | null>()} />,
};

export const COL_LAUNCH_CRITICAL: ColumnDef<Requirement> = {
  accessorKey: 'launchCriticalFlag',
  header: 'Launch-Critical',
  size: 130,
  cell: ({ getValue }) => (
    <FlagBadge value={getValue<boolean>()} variant="launch-critical" />
  ),
};

export const COL_NEEDS_REVIEW: ColumnDef<Requirement> = {
  accessorKey: 'needsReviewFlag',
  header: 'Needs Review',
  size: 120,
  cell: ({ getValue }) => (
    <FlagBadge value={getValue<boolean>()} variant="needs-review" />
  ),
};

export const COL_REQUIRED_ACTION: ColumnDef<Requirement> = {
  accessorKey: 'requiredAction',
  header: 'Required Action',
  size: 250,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

export const COL_REQUIRED_CONTROL: ColumnDef<Requirement> = {
  accessorKey: 'requiredControl',
  header: 'Required Control',
  size: 220,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

export const COL_REQUIRED_EVIDENCE: ColumnDef<Requirement> = {
  accessorKey: 'requiredEvidenceDocumentation',
  header: 'Required Evidence',
  size: 250,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

export const COL_LIFECYCLE_STAGE: ColumnDef<Requirement> = {
  accessorKey: 'lifecycleStage',
  header: 'Lifecycle Stage',
  size: 160,
  cell: ({ getValue }) => textXs(getValue<string | null>()),
};

export const COL_OWNER: ColumnDef<Requirement> = {
  accessorKey: 'exampleBusinessOwner',
  header: 'Owner',
  size: 160,
  cell: ({ getValue }) => textXs(getValue<string | null>()),
};

export const COL_ACTION_REQUIRED_STATUS: ColumnDef<Requirement> = {
  accessorKey: 'actionRequired',
  header: 'Action Required',
  size: 220,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

export const COL_OPERATIONAL_PROCESS: ColumnDef<Requirement> = {
  accessorKey: 'operationalProcessImpacted',
  header: 'Process Impacted',
  size: 180,
  cell: ({ getValue }) => textXsClamp2(getValue<string | null>()),
};

/* ── Pre-composed column sets for each view ──────────────── */

/** Default: All Requirements view */
export const COLUMNS_ALL_REQUIREMENTS: ColumnDef<Requirement>[] = [
  COL_ID, COL_DOMAIN, COL_JURISDICTION, COL_LAW, COL_REQUIREMENT_AREA,
  COL_SUMMARY, COL_BUSINESS_FUNCTION, COL_SEVERITY, COL_LAUNCH_CRITICAL,
  COL_NEEDS_REVIEW,
];

/** Supply Chain Leader view */
export const COLUMNS_SUPPLY_CHAIN: ColumnDef<Requirement>[] = [
  COL_ID, COL_DOMAIN, COL_JURISDICTION, COL_LAW, COL_REQUIREMENT_AREA,
  COL_SUMMARY, COL_REQUIRED_ACTION, COL_REQUIRED_EVIDENCE, COL_SEVERITY,
  COL_LAUNCH_CRITICAL, COL_NEEDS_REVIEW,
];

/** Launch-Critical view */
export const COLUMNS_LAUNCH_CRITICAL: ColumnDef<Requirement>[] = [
  COL_ID, COL_DOMAIN, COL_JURISDICTION, COL_LIFECYCLE_STAGE, COL_SUMMARY,
  COL_REQUIRED_ACTION, COL_REQUIRED_CONTROL, COL_REQUIRED_EVIDENCE,
  COL_BUSINESS_FUNCTION, COL_SEVERITY, COL_NEEDS_REVIEW,
];

/** Obligation Matrix — full regulatory chain: law → control → evidence → owner → action */
export const COLUMNS_OBLIGATION_MATRIX: ColumnDef<Requirement>[] = [
  COL_ID, COL_LAW, COL_REQUIREMENT_AREA, COL_SUMMARY,
  COL_REQUIRED_CONTROL, COL_REQUIRED_EVIDENCE,
  COL_BUSINESS_FUNCTION, COL_OWNER, COL_ACTION_REQUIRED_STATUS,
  COL_OPERATIONAL_PROCESS, COL_SEVERITY, COL_LAUNCH_CRITICAL,
];

/** Business Function view — emphasizes owner/action/evidence */
export const COLUMNS_BUSINESS_FUNCTION: ColumnDef<Requirement>[] = [
  COL_ID, COL_LAW, COL_REQUIREMENT_AREA,
  COL_REQUIRED_ACTION, COL_REQUIRED_CONTROL, COL_REQUIRED_EVIDENCE,
  COL_LIFECYCLE_STAGE, COL_SEVERITY, COL_LAUNCH_CRITICAL,
];
