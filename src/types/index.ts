// Central re-exports for all types
export type { Requirement } from './requirement';
export type { Risk } from './risk';
export type { Evidence } from './evidence';
export type { Source } from './source';
export type { Gap } from './gap';
export type { Crosswalk } from './crosswalk';
export type { FunctionImpact } from './functionImpact';
export type {
  ListItem,
  DecisionNode,
  RoadmapItem,
  VerificationSource,
  ImportMetadata,
} from './lists';

// Governance workflow types
export type { RegulatoryUpdate } from './regulatoryUpdate';
export type { DraftRegulatoryChange } from './draftChange';
export type { RegulatoryVersion } from './regulatoryVersion';
export type { AuditEvent } from './auditEvent';

// Impact analysis types
export type {
  RegulatoryImpactAnalysis,
  ImpactedStandard,
  ImpactedControl,
  ImpactedEvidence,
  BusinessFunctionImpact,
  OwnerAction,
  ImpactedRisk,
  GovernanceReview,
} from './impactAnalysis';

// Operational compliance types (Controls & Evidence layer)
export type { ComplianceControl, ControlType, ControlStatus } from './complianceControl';
export type { EvidenceRequirement, EvidenceType, EvidenceStatus } from './evidenceRequirement';
export type { OwnerActionItem, ActionStatus, ActionPriority } from './ownerAction';

// Source registry types
export type { SourceRecord, SourceValidationChecklistItem, SourceType, SourceStatus, ValidationStatus, ChecklistItemStatus } from './sourceRecord';

// Data quality types
export type { DataQualityIssue, DataQualityIssueType, DataQualitySeverity, DataQualityStatus, AffectedEntityType, DataQualityCategory } from './dataQualityIssue';

// Source intake workflow types
export type { SourceIntakeRequest, SourceIntakeChecklistItem, IntakeType, IntakeStatus, IntakePriority, MetadataCompletenessStatus, IntakeChecklistItemStatus } from './sourceIntake';

// AI suggestion types (Phase 3.6)
export type { AiExtractionSuggestion, AiPromptVersion, AiSuggestionType, AiSuggestionStatus, AiReviewerDecision, AiPromptStatus } from './aiSuggestion';

// Draft validation types (Phase 3.10)
export type { DraftValidationReview } from './draftValidationReview';
