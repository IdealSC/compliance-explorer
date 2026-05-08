/**
 * Schema barrel export — all tables and enums from all tiers.
 */

// Tier 0: Identity & Access
export * from './identity';

// Tier 1: Controlled Regulatory Reference
export * from './reference';

// Tier 2: Source Registry
export * from './sources';

// Tier 2B: Source File Metadata
export * from './source-files';

// Tier 2C: Source Intake Workflow
export * from './source-intake';

// Tier 2D: AI Suggestion & Prompt Governance (Phase 3.6)
export * from './ai-suggestions';

// Tier 3: Draft / Staging
export * from './staging';

// Tier 3B: Draft Validation (Phase 3.10)
export * from './validation';

// Tier 4: Operational Compliance
export * from './operational';

// Tier 5: Audit / Historical
export * from './audit';

// Diagnostic
export * from './quality';

// Legacy workbook data (pre-governance)
export * from './legacy';
