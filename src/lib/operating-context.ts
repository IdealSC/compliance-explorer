/* ─── Operating Context — Shared Types & Constants ───────────────────
   Phase 5.1-E: Three-dimension applicability overlay.
   Jurisdiction · Entity Role · Lifecycle Stage
   ──────────────────────────────────────────────────────────────────── */

/* ─── Dimension value types ───────────────────────────────────────── */

export type Jurisdiction = 'us' | 'eu' | 'us-eu';
export type EntityRole =
  | 'nda-holder'
  | 'mah'
  | 'licensed-us-distributor'
  | 'importer'
  | '3pl'
  | 'cdmo-relationship';
export type LifecycleStage =
  | 'preclinical'
  | 'late-stage-clinical'
  | 'pre-commercial'
  | 'launch'
  | 'post-commercial';

/* ─── Operating context shape ─────────────────────────────────────── */

export interface OperatingContext {
  jurisdiction: Jurisdiction;
  entityRole: EntityRole;
  stage: LifecycleStage;
}

/* ─── Defaults ────────────────────────────────────────────────────── */

export const CONTEXT_DEFAULTS: OperatingContext = {
  jurisdiction: 'us-eu',
  entityRole: 'nda-holder',
  stage: 'pre-commercial',
};

/* ─── Option arrays ───────────────────────────────────────────────── */

export interface ContextOption<T extends string> {
  value: T;
  label: string;
}

export const JURISDICTION_OPTIONS: ContextOption<Jurisdiction>[] = [
  { value: 'us', label: 'US' },
  { value: 'eu', label: 'EU' },
  { value: 'us-eu', label: 'US + EU' },
];

export const ENTITY_ROLE_OPTIONS: ContextOption<EntityRole>[] = [
  { value: 'nda-holder', label: 'NDA Holder' },
  { value: 'mah', label: 'MAH' },
  { value: 'licensed-us-distributor', label: 'Licensed US Distributor' },
  { value: 'importer', label: 'Importer' },
  { value: '3pl', label: '3PL' },
  { value: 'cdmo-relationship', label: 'CDMO Relationship' },
];

export const LIFECYCLE_STAGE_OPTIONS: ContextOption<LifecycleStage>[] = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'late-stage-clinical', label: 'Late-stage Clinical' },
  { value: 'pre-commercial', label: 'Pre-commercial' },
  { value: 'launch', label: 'Launch' },
  { value: 'post-commercial', label: 'Post-commercial' },
];

/* ─── Helpers ─────────────────────────────────────────────────────── */

/** Check whether a context matches the product defaults. */
export function isDefaultContext(ctx: OperatingContext): boolean {
  return (
    ctx.jurisdiction === CONTEXT_DEFAULTS.jurisdiction &&
    ctx.entityRole === CONTEXT_DEFAULTS.entityRole &&
    ctx.stage === CONTEXT_DEFAULTS.stage
  );
}

/** Get display label for a jurisdiction value. */
export function jurisdictionLabel(v: Jurisdiction): string {
  return JURISDICTION_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

/** Get display label for an entity role value. */
export function entityRoleLabel(v: EntityRole): string {
  return ENTITY_ROLE_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

/** Get display label for a lifecycle stage value. */
export function stageLabel(v: LifecycleStage): string {
  return LIFECYCLE_STAGE_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

/* ─── URL parameter parsing ───────────────────────────────────────── */

const VALID_JURISDICTIONS = new Set<string>(
  JURISDICTION_OPTIONS.map((o) => o.value)
);
const VALID_ENTITY_ROLES = new Set<string>(
  ENTITY_ROLE_OPTIONS.map((o) => o.value)
);
const VALID_STAGES = new Set<string>(
  LIFECYCLE_STAGE_OPTIONS.map((o) => o.value)
);

/**
 * Parse operating context from URL search params.
 * Invalid or missing values fall back to defaults.
 */
export function parseContextFromParams(
  params: URLSearchParams
): OperatingContext {
  const j = params.get('jurisdiction');
  const e = params.get('entityRole');
  const s = params.get('stage');

  return {
    jurisdiction:
      j && VALID_JURISDICTIONS.has(j)
        ? (j as Jurisdiction)
        : CONTEXT_DEFAULTS.jurisdiction,
    entityRole:
      e && VALID_ENTITY_ROLES.has(e)
        ? (e as EntityRole)
        : CONTEXT_DEFAULTS.entityRole,
    stage:
      s && VALID_STAGES.has(s)
        ? (s as LifecycleStage)
        : CONTEXT_DEFAULTS.stage,
  };
}

/** Encode operating context as URLSearchParams entries. */
export function contextToParams(ctx: OperatingContext): URLSearchParams {
  const params = new URLSearchParams();
  if (ctx.jurisdiction !== CONTEXT_DEFAULTS.jurisdiction) {
    params.set('jurisdiction', ctx.jurisdiction);
  }
  if (ctx.entityRole !== CONTEXT_DEFAULTS.entityRole) {
    params.set('entityRole', ctx.entityRole);
  }
  if (ctx.stage !== CONTEXT_DEFAULTS.stage) {
    params.set('stage', ctx.stage);
  }
  return params;
}

/** localStorage key. */
export const STORAGE_KEY = 'isc-operating-context';
