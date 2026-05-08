/**
 * Report definitions for all 10 report types.
 *
 * Each definition is a static configuration object that describes:
 * - What the report is
 * - What category it belongs to
 * - What columns it includes
 * - What data sources it reads from
 *
 * Reports are READ-ONLY output views. They do not mutate any data.
 */

import {
  ClipboardCheck,
  FileWarning,
  ShieldAlert,
  BarChart3,
  Network,
  Truck,
  TrendingUp,
  BookCheck,
  Database,
  ActivitySquare,
  Gauge,
  FileCheck,
  Inbox,
} from 'lucide-react';
import type { ElementType } from 'react';

// ── Category Enum ───────────────────────────────────────────────

export const REPORT_CATEGORIES = [
  'All',
  'Owner Actions',
  'Evidence',
  'Controls',
  'Regulatory Impact',
  'Obligations',
  'Business Function',
  'Executive',
  'Audit',
  'Source Validation',
  'Source Intake',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

// ── Column Definition ───────────────────────────────────────────

export interface ReportColumn {
  key: string;
  label: string;
}

// ── Report Definition ───────────────────────────────────────────

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  purpose: string;
  category: ReportCategory;
  icon: ElementType;
  columns: ReportColumn[];
  sourceDatasets: string[];
  /** Route to cross-link for context */
  crossLinkHref: string;
}

// ── Report Definitions ──────────────────────────────────────────

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  // A. Business Owner Action Report
  {
    id: 'owner-actions',
    name: 'Business Owner Action Report',
    description: 'Assigned actions by owner or business function with priority, status, due dates, and regulatory linkage.',
    purpose: 'Shows assigned actions by owner or business function.',
    category: 'Owner Actions',
    icon: ClipboardCheck,
    columns: [
      { key: 'id', label: 'Action ID' },
      { key: 'owner', label: 'Owner' },
      { key: 'businessFunction', label: 'Business Function' },
      { key: 'actionTitle', label: 'Action Title' },
      { key: 'priority', label: 'Priority' },
      { key: 'actionStatus', label: 'Status' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'relatedControlIds', label: 'Related Controls' },
      { key: 'relatedEvidenceIds', label: 'Related Evidence' },
      { key: 'relatedObligationIds', label: 'Related Obligations' },
      { key: 'relatedImpactAnalysisIds', label: 'Related Impact Analyses' },
      { key: 'riskIfNotCompleted', label: 'Risk if Not Completed' },
      { key: 'recommendedNextStep', label: 'Recommended Next Step' },
    ],
    sourceDatasets: ['ownerActions.json'],
    crossLinkHref: '/action-center',
  },

  // B. Evidence Gap Report
  {
    id: 'evidence-gaps',
    name: 'Evidence Gap Report',
    description: 'Missing, expired, rejected, under-review, and due-soon evidence requirements.',
    purpose: 'Shows evidence that needs attention — missing, expired, rejected, under review, or due soon.',
    category: 'Evidence',
    icon: FileWarning,
    columns: [
      { key: 'id', label: 'Evidence ID' },
      { key: 'evidenceName', label: 'Evidence Name' },
      { key: 'evidenceType', label: 'Evidence Type' },
      { key: 'evidenceOwner', label: 'Owner' },
      { key: 'businessFunction', label: 'Business Function' },
      { key: 'evidenceStatus', label: 'Status' },
      { key: 'relatedControlIds', label: 'Related Controls' },
      { key: 'relatedObligationIds', label: 'Related Obligations' },
      { key: 'requiredFrequency', label: 'Required Frequency' },
      { key: 'retentionRequirement', label: 'Retention Requirement' },
      { key: 'lastCollectedDate', label: 'Last Collected' },
      { key: 'nextDueDate', label: 'Next Due Date' },
      { key: 'riskIfMissing', label: 'Risk if Missing' },
      { key: 'sourceReference', label: 'Source Reference' },
    ],
    sourceDatasets: ['evidenceRequirements.json'],
    crossLinkHref: '/controls-evidence',
  },

  // C. Deficient Controls Report
  {
    id: 'deficient-controls',
    name: 'Deficient Controls Report',
    description: 'Controls that are deficient, need review, not started, or high risk.',
    purpose: 'Shows controls that need attention due to status or risk level.',
    category: 'Controls',
    icon: ShieldAlert,
    columns: [
      { key: 'id', label: 'Control ID' },
      { key: 'controlName', label: 'Control Name' },
      { key: 'controlType', label: 'Control Type' },
      { key: 'controlOwner', label: 'Owner' },
      { key: 'businessFunction', label: 'Business Function' },
      { key: 'controlStatus', label: 'Status' },
      { key: 'riskLevel', label: 'Risk Level' },
      { key: 'frequency', label: 'Frequency' },
      { key: 'lastReviewedDate', label: 'Last Reviewed' },
      { key: 'nextReviewDate', label: 'Next Review' },
      { key: 'relatedObligationIds', label: 'Related Obligations' },
      { key: 'relatedEvidenceIds', label: 'Related Evidence' },
      { key: 'sourceReference', label: 'Source Reference' },
      { key: 'confidenceLevel', label: 'Confidence Level' },
    ],
    sourceDatasets: ['controls.json'],
    crossLinkHref: '/controls-evidence',
  },

  // D. Regulatory Impact Summary
  {
    id: 'regulatory-impact',
    name: 'Regulatory Impact Summary',
    description: 'Regulatory changes and their operational impact across obligations, controls, evidence, and business functions.',
    purpose: 'Shows regulatory changes and their operational impact.',
    category: 'Regulatory Impact',
    icon: BarChart3,
    columns: [
      { key: 'updateTitle', label: 'Update Title' },
      { key: 'sourceName', label: 'Source' },
      { key: 'regulator', label: 'Regulator' },
      { key: 'jurisdiction', label: 'Jurisdiction' },
      { key: 'changeType', label: 'Change Type' },
      { key: 'effectiveDate', label: 'Effective Date' },
      { key: 'impactSeverity', label: 'Severity' },
      { key: 'impactStatus', label: 'Status' },
      { key: 'impactedObligationCount', label: 'Obligations Affected' },
      { key: 'impactedControlCount', label: 'Controls Affected' },
      { key: 'impactedEvidenceCount', label: 'Evidence Affected' },
      { key: 'impactedFunctionCount', label: 'Functions Affected' },
      { key: 'requiredActionCount', label: 'Required Actions' },
      { key: 'legalReviewRequired', label: 'Legal Review Required' },
      { key: 'confidenceLevel', label: 'Confidence Level' },
      { key: 'sourceReference', label: 'Source Reference' },
    ],
    sourceDatasets: ['impactAnalyses.json'],
    crossLinkHref: '/impact-analysis',
  },

  // E. Obligation Matrix Export
  {
    id: 'obligation-matrix',
    name: 'Obligation Matrix Export',
    description: 'Full obligation matrix with regulatory references, controls, evidence, owners, and version data.',
    purpose: 'Exports the core obligation matrix.',
    category: 'Obligations',
    icon: Network,
    columns: [
      { key: 'matrixRowId', label: 'Obligation ID' },
      { key: 'regulatoryDomain', label: 'Regulatory Domain' },
      { key: 'lawRegulationFrameworkStandardName', label: 'Law / Regulation / Standard' },
      { key: 'specificCitationSectionClause', label: 'Citation' },
      { key: 'exactRequirementOrSourceLanguage', label: 'Source Language' },
      { key: 'plainEnglishInterpretation', label: 'Plain-English Interpretation' },
      { key: 'businessFunctionImpacted', label: 'Business Function' },
      { key: 'requiredControl', label: 'Required Control' },
      { key: 'requiredEvidenceDocumentation', label: 'Required Evidence' },
      { key: 'exampleBusinessOwner', label: 'Owner' },
      { key: 'severityPriority', label: 'Risk Level' },
      { key: 'frequencyTiming', label: 'Frequency' },
      { key: 'status', label: 'Status' },
      { key: 'sourceNoteSourceReference', label: 'Source Reference' },
      { key: 'versionNumber', label: 'Version' },
      { key: 'recordStatus', label: 'Record Status' },
      { key: 'effectiveDate', label: 'Effective Date' },
      { key: 'confidenceLevel', label: 'Confidence Level' },
    ],
    sourceDatasets: ['requirements.json'],
    crossLinkHref: '/obligations',
  },

  // F. Supply Chain Compliance Snapshot
  {
    id: 'supply-chain-snapshot',
    name: 'Supply Chain Compliance Snapshot',
    description: 'Comprehensive supply-chain-focused report: regulations, obligations, impacts, controls, evidence gaps, actions, risks, and next steps.',
    purpose: 'A business-readable report focused on Supply Chain compliance posture.',
    category: 'Business Function',
    icon: Truck,
    columns: [
      { key: 'section', label: 'Section' },
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title / Name' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority / Severity' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'owner', label: 'Owner' },
      { key: 'detail', label: 'Detail' },
    ],
    sourceDatasets: [
      'requirements.json',
      'impactAnalyses.json',
      'controls.json',
      'evidenceRequirements.json',
      'ownerActions.json',
      'risks.json',
    ],
    crossLinkHref: '/supply-chain',
  },

  // G. Executive Risk Summary
  {
    id: 'executive-risk',
    name: 'Executive Risk Summary',
    description: 'Concise executive-facing overview: high-risk obligations, critical impacts, deficient controls, missing evidence, and top recommended actions.',
    purpose: 'A concise executive-facing compliance risk overview.',
    category: 'Executive',
    icon: TrendingUp,
    columns: [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'detail', label: 'Detail' },
    ],
    sourceDatasets: [
      'requirements.json',
      'impactAnalyses.json',
      'controls.json',
      'evidenceRequirements.json',
      'ownerActions.json',
    ],
    crossLinkHref: '/',
  },

  // H. Audit-Ready Reference Data Snapshot
  {
    id: 'audit-reference',
    name: 'Audit-Ready Reference Data Snapshot',
    description: 'Controlled reference-data state for audit review: source records, versions, effective dates, confidence levels, and governance status.',
    purpose: 'Shows controlled reference-data state for audit review.',
    category: 'Audit',
    icon: BookCheck,
    columns: [
      { key: 'matrixRowId', label: 'Obligation ID' },
      { key: 'lawRegulationFrameworkStandardName', label: 'Source Record' },
      { key: 'versionNumber', label: 'Version' },
      { key: 'recordStatus', label: 'Record Status' },
      { key: 'effectiveDate', label: 'Effective Date' },
      { key: 'sourceNoteSourceReference', label: 'Source Reference' },
      { key: 'confidenceLevel', label: 'Confidence Level' },
      { key: 'validationDate', label: 'Last Reviewed' },
      { key: 'relatedVersionHistory', label: 'Version History' },
      { key: 'relatedAuditEvents', label: 'Audit Events' },
      { key: 'reviewStatus', label: 'Governance Status' },
      // Phase 2.6: Publication traceability columns
      { key: 'publishedAt', label: 'Published At' },
      { key: 'publishedBy', label: 'Published By' },
      { key: 'publicationEventId', label: 'Publication Event' },
    ],
    sourceDatasets: ['requirements.json', 'versionHistory.json', 'auditEvents.json', 'publicationEvents'],
    crossLinkHref: '/audit-log',
  },

  // I. Source Registry Validation Report
  {
    id: 'source-registry',
    name: 'Source Registry Validation Report',
    description: 'Source records pending validation, missing metadata, requiring legal review, or linked to active obligations.',
    purpose: 'Shows source intake status and validation readiness.',
    category: 'Audit',
    icon: Database,
    columns: [
      { key: 'id', label: 'Source ID' },
      { key: 'sourceTitle', label: 'Title' },
      { key: 'sourceType', label: 'Type' },
      { key: 'regulator', label: 'Regulator' },
      { key: 'jurisdiction', label: 'Jurisdiction' },
      { key: 'sourceStatus', label: 'Status' },
      { key: 'validationStatus', label: 'Validation' },
      { key: 'missingMetadata', label: 'Missing Metadata' },
      { key: 'legalReviewRequired', label: 'Legal Review' },
      { key: 'relatedObligationIds', label: 'Obligations' },
      { key: 'relatedDraftChangeIds', label: 'Draft Changes' },
      { key: 'confidenceLevel', label: 'Confidence' },
      { key: 'reviewedAt', label: 'Last Reviewed' },
      { key: 'sourceReference', label: 'Reference' },
    ],
    sourceDatasets: ['governance/sourceRegistry.json'],
    crossLinkHref: '/source-registry',
  },
  {
    id: 'data-quality',
    name: 'Data Quality & Validation Report',
    description: 'Diagnostic findings: missing source references, low-confidence mappings, stale reviews, evidence gaps, deficient controls, and records needing legal review.',
    purpose: 'Read-only diagnostic audit of data completeness and quality across the compliance operating map.',
    category: 'Audit',
    icon: ActivitySquare,
    columns: [
      { key: 'id', label: 'Issue ID' },
      { key: 'issueTitle', label: 'Title' },
      { key: 'issueType', label: 'Issue Type' },
      { key: 'category', label: 'Category' },
      { key: 'severity', label: 'Severity' },
      { key: 'status', label: 'Status' },
      { key: 'affectedEntityType', label: 'Entity Type' },
      { key: 'affectedEntityId', label: 'Entity ID' },
      { key: 'businessFunction', label: 'Function' },
      { key: 'owner', label: 'Owner' },
      { key: 'confidenceLevel', label: 'Confidence' },
      { key: 'legalReviewRequired', label: 'Legal Review' },
      { key: 'recommendedAction', label: 'Recommended Action' },
      { key: 'riskIfUnresolved', label: 'Risk If Unresolved' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'detectedAt', label: 'Detected' },
      { key: 'sourceReference', label: 'Source Ref' },
    ],
    sourceDatasets: ['governance/dataQualityIssues.json'],
    crossLinkHref: '/data-quality',
  },
  {
    id: 'executive-health',
    name: 'Executive Compliance Health Summary',
    description:
      'Exports the executive dashboard summary including health scores, risk indicators, business function exposure, and recommended actions. Sample/demo data only — not a legal compliance determination.',
    purpose: 'Provides leadership with a single exportable snapshot of compliance health across all dimensions.',
    icon: Gauge,
    category: 'Executive',
    columns: [
      { key: 'section', label: 'Section' },
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'status', label: 'Status' },
      { key: 'businessFunction', label: 'Business Function' },
      { key: 'priority', label: 'Priority' },
      { key: 'description', label: 'Description' },
      { key: 'nextStep', label: 'Recommended Next Step' },
    ],
    sourceDatasets: ['requirements.json', 'risks.json', 'governance/controls.json', 'governance/evidenceRequirements.json', 'governance/ownerActions.json', 'governance/impactAnalyses.json', 'governance/sourceRegistry.json', 'governance/dataQualityIssues.json'],
    crossLinkHref: '/executive-dashboard',
  },
  // L. Source Validation & Publishing Readiness
  {
    id: 'source-validation-readiness',
    name: 'Source Validation & Publishing Readiness',
    description:
      'Source record validation status, checklist completeness, legal review requirements, and publishing readiness assessment. Sample/demo data only — not a legal compliance determination.',
    purpose: 'Provides governance visibility into source registry readiness for controlled publishing.',
    icon: FileCheck,
    category: 'Source Validation',
    columns: [
      { key: 'id', label: 'Source ID' },
      { key: 'sourceTitle', label: 'Title' },
      { key: 'sourceType', label: 'Type' },
      { key: 'regulator', label: 'Regulator' },
      { key: 'jurisdiction', label: 'Jurisdiction' },
      { key: 'sourceStatus', label: 'Source Status' },
      { key: 'validationStatus', label: 'Validation Status' },
      { key: 'checklistComplete', label: 'Checklist Complete' },
      { key: 'checklistIncomplete', label: 'Checklist Incomplete' },
      { key: 'legalReviewRequired', label: 'Legal Review' },
      { key: 'confidenceLevel', label: 'Confidence' },
      { key: 'missingMetadata', label: 'Missing Metadata' },
      { key: 'relatedDraftChanges', label: 'Related Draft Changes' },
      { key: 'relatedRegulatoryUpdates', label: 'Related Regulatory Updates' },
      { key: 'sourceReference', label: 'Source Reference' },
      { key: 'recommendedAction', label: 'Recommended Action' },
    ],
    sourceDatasets: ['governance/sourceRegistry.json'],
    crossLinkHref: '/source-registry',
  },
  // M. Source Intake Workflow
  {
    id: 'source-intake-workflow',
    name: 'Source Intake Workflow',
    description:
      'Intake request status, triage, assignment, checklist progress, and conversion readiness. Tracks the controlled intake pipeline for new regulatory materials.',
    purpose: 'Provides governance visibility into the source intake pipeline and identifies bottlenecks in triage and validation.',
    icon: Inbox,
    category: 'Source Intake',
    columns: [
      { key: 'id', label: 'Intake ID' },
      { key: 'intakeTitle', label: 'Title' },
      { key: 'intakeType', label: 'Intake Type' },
      { key: 'intakeStatus', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'sourceType', label: 'Source Type' },
      { key: 'regulator', label: 'Regulator' },
      { key: 'jurisdiction', label: 'Jurisdiction' },
      { key: 'assignedToName', label: 'Assigned To' },
      { key: 'submittedByName', label: 'Submitted By' },
      { key: 'legalReviewRequired', label: 'Legal Review' },
      { key: 'checklistComplete', label: 'Checklist Complete' },
      { key: 'checklistTotal', label: 'Checklist Total' },
      { key: 'relatedSourceRecordId', label: 'Related Source Record' },
      { key: 'submittedAt', label: 'Submitted Date' },
      { key: 'updatedAt', label: 'Last Updated' },
    ],
    sourceDatasets: ['governance/sourceIntakeRequests.json'],
    crossLinkHref: '/source-intake',
  },
];

export function getReportById(id: string): ReportDefinition | undefined {
  return REPORT_DEFINITIONS.find((r) => r.id === id);
}

export function getReportsByCategory(category: ReportCategory): ReportDefinition[] {
  if (category === 'All') return REPORT_DEFINITIONS;
  return REPORT_DEFINITIONS.filter((r) => r.category === category);
}
