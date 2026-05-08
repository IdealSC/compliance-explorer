# AI-Assisted Citation Governance — End-to-End Traceability Matrix

> **Phase 3.11 — Pilot Readiness**
>
> This document traces the complete governed chain from source intake through controlled publishing for AI-assisted citation suggestions. Each workflow stage is documented with its source entity, target entity, API route, service function, RBAC permission, audit event, governance boundary, and failure mode.
>
> **Disclaimer:** AI citation suggestions are draft-only governance records. They do NOT represent legal advice, approved interpretations, or active regulatory reference data.

---

## Chain Overview

```
Source Intake → Source Registry → Source File Metadata
    → AI Citation Suggestion Generation
    → AI Suggestion Review (human triage)
    → Human Conversion to Draft (citation-only)
    → Legal/Compliance Validation (advisory)
    → Review & Approval Readiness (formal)
    → Controlled Publishing → Version History
    → Audit Trail → Report Snapshot
```

---

## Stage 1: Source Intake Request

| Attribute | Value |
|---|---|
| **Entity** | `SourceIntakeRequest` |
| **Schema** | `src/db/schema/sources.ts` (sourceIntakeRequests) |
| **Service** | `src/lib/services/intake-writes.ts` |
| **API Route** | `POST /api/sources/intake` |
| **RBAC Permission** | `source.intake` (submit/metadata), `source.validate` (triage/status) |
| **Zod Validation** | `CreateIntakeRequestSchema`, `UpdateIntakeRequestSchema` |
| **Audit Events** | `intake_request_created`, `intake_status_changed`, `intake_metadata_updated`, `intake_assigned`, `intake_rejected`, `intake_checklist_updated` |
| **Status Lifecycle** | submitted → triage → metadata_review → assigned → validation_pending → legal_review_required → ready_for_source_record → converted_to_source_record → closed |
| **Governance Boundary** | Intake requests create metadata-only records. No file content is parsed, extracted, or stored. No obligations or draft records are auto-created. |
| **Failure Mode** | Invalid transitions return HTTP 409 (ALLOWED_TRANSITIONS enforced server-side) |
| **Traceability Evidence** | Audit event with `entityType: 'source_intake_request'`, `changedBy`, `roles`, `checksum` |

---

## Stage 2: Source Record (Registry)

| Attribute | Value |
|---|---|
| **Entity** | `SourceRecord` |
| **Schema** | `src/db/schema/sources.ts` (sourceRecords) |
| **Service** | `src/lib/services/source-writes.ts` |
| **API Route** | `GET/POST /api/sources/registry`, `GET/PATCH /api/sources/registry/[id]` |
| **RBAC Permission** | `source.intake` (create), `source.validate` (validate/reject/status), `source.view` (read) |
| **Zod Validation** | `CreateSourceRecordSchema`, `UpdateSourceRecordSchema` |
| **Audit Events** | `source_record_created`, `source_status_changed`, `source_metadata_updated`, `source_validated`, `source_rejected`, `source_legal_review_flagged` |
| **Status Lifecycle** | intake → pending_validation → validated → needs_revision → rejected |
| **Governance Boundary** | Source records track metadata and validation state. They do not directly create obligations or active reference data. Source validation is a prerequisite gate for AI citation generation. |
| **Failure Mode** | Invalid status transitions return appropriate HTTP errors. Source record must be `validated` for AI citation generation (configurable gate). |
| **Traceability Evidence** | Audit event with `entityType: 'source_record'`, source reference ID links to intake request |

---

## Stage 3: Source File Metadata

| Attribute | Value |
|---|---|
| **Entity** | `SourceFile` (metadata-only) |
| **Schema** | `src/db/schema/sources.ts` (sourceFiles) |
| **Service** | `src/lib/services/source-file-writes.ts` |
| **API Route** | `GET/POST /api/sources/registry/[id]/files`, `PATCH /api/sources/registry/[id]/files/[fileId]` |
| **RBAC Permission** | `source.intake` (register/update), `source.validate` (status changes), `source.view` (read) |
| **Zod Validation** | `RegisterSourceFileSchema`, `UpdateSourceFileSchema` (22 protected fields rejected) |
| **Audit Events** | `source_file_registered`, `source_file_updated`, `source_file_status_changed`, `source_file_verified`, `source_file_archived` |
| **Status Lifecycle** | registered → pending_upload → uploaded → verified → archived |
| **Governance Boundary** | Metadata-only. No file content is stored, parsed, extracted, or analyzed within this application. File hashes captured for integrity tracking. |
| **Failure Mode** | Parent record ownership validation prevents cross-record file access. Protected fields rejected at API boundary via Zod `.strict()`. |
| **Traceability Evidence** | Audit event with `entityType: 'source_file'`, parent `sourceRecordId` linkage |

---

## Stage 4: AI Citation Suggestion Generation

| Attribute | Value |
|---|---|
| **Entity** | `AiExtractionSuggestion` (citation-only) |
| **Schema** | `src/db/schema/ai-suggestions.ts` |
| **Service** | `src/ai/citation-suggestion-service.ts` |
| **API Route** | `POST /api/ai/citation-suggestions/generate` |
| **RBAC Permission** | `ai.suggestion.generate` (Compliance Editor, Admin) |
| **Zod Validation** | `GenerateCitationSuggestionsSchema` |
| **Audit Events** | `ai_citation_generation_requested`, `ai_citation_suggestion_created` (per citation), `ai_citation_generation_completed` or `ai_citation_generation_failed` |
| **Governance Boundary** | Citation-only. No obligations, interpretations, controls, evidence, or mappings extracted. Feature disabled by default (`AI_FEATURE_CITATION_SUGGESTIONS_ENABLED=false`). AI provider secrets are server-only. AI output is NOT legal advice. `legalReviewRequired: true` set on all generated citations. |
| **Failure Modes** | Feature disabled → 503 `FEATURE_DISABLED`; Provider not configured → 503 `PROVIDER_NOT_CONFIGURED`; Source not validated → 409 `SOURCE_NOT_VALIDATED`; Provider error → 502 `GENERATION_FAILED`; JSON mode → 503 `JSON_MODE` |
| **Traceability Evidence** | Audit events with `entityType: 'ai_extraction_suggestion'`, `sourceReference` linking to source record, prompt version recorded |

---

## Stage 5: AI Suggestion Review (Human Triage)

| Attribute | Value |
|---|---|
| **Entity** | `AiExtractionSuggestion` (status change) |
| **Schema** | `src/db/schema/ai-suggestions.ts` |
| **Service** | `src/lib/services/ai-suggestion-writes.ts` |
| **API Routes** | `GET /api/ai/suggestions`, `GET /api/ai/suggestions/[id]`, `PATCH /api/ai/suggestions/[id]/review` |
| **RBAC Permission** | `ai.suggestion.review` (mark-for-review, notes, legal flag), `ai.suggestion.reject` (reject, expire) |
| **Zod Validation** | `ReviewActionSchema` (action-specific refinements) |
| **Audit Events** | `ai_suggestion_rejected`, `ai_suggestion_expired`, `ai_suggestion_marked_for_review`, `ai_suggestion_notes_updated`, `ai_suggestion_legal_review_toggled` |
| **Status Lifecycle** | pending_review → marked_for_review → rejected / expired / accepted_to_draft |
| **Governance Boundary** | Human-only triage. No automatic acceptance. Review actions do not create draft records. Reject/expire are terminal states. Legal review flag is advisory. |
| **Failure Mode** | Invalid status transitions return 409. Missing required fields per action return 400. |
| **Traceability Evidence** | Audit event with `entityType: 'ai_extraction_suggestion'`, reviewer identity, review notes |

---

## Stage 6: Human Conversion to Draft (Citation-Only)

| Attribute | Value |
|---|---|
| **Source Entity** | `AiExtractionSuggestion` (must be eligible) |
| **Target Entity** | `DraftRegulatoryChange` (created at draft/staging status) |
| **Service** | `src/lib/services/ai-suggestion-writes.ts` → `acceptAiSuggestionToDraft()` |
| **API Route** | `POST /api/ai/suggestions/[id]/accept-to-draft` |
| **RBAC Permission** | `ai.suggestion.acceptToDraft` + `draft.edit` (Compliance Editor, Admin) |
| **Zod Validation** | `AcceptToDraftSchema` |
| **Audit Events** | `ai_suggestion_accepted_to_draft` |
| **Eligibility Gates** | 8-gate validation: (1) suggestion exists, (2) citation type only, (3) eligible status, (4) not already converted, (5) linked source valid, (6) suggestion not expired, (7) mandatory fields present, (8) duplicate conversion guard |
| **Governance Boundary** | Creates draft/staging record ONLY. Does NOT create active reference data. Does NOT modify controlled regulatory data. Provenance stamp `[AI Citation Suggestion: {id}]` embedded in `changeReason`. The draft must proceed through review → approval → publishing. |
| **Failure Mode** | Ineligible → 422 `NOT_ELIGIBLE`; Already converted → 409 `INVALID_TRANSITION`; Not found → 404 |
| **Traceability Evidence** | Audit event with `entityType: 'ai_extraction_suggestion'`, `sourceReference` linking suggestion to draft, provenance stamp in changeReason |

---

## Stage 7: Legal/Compliance Validation (Advisory)

| Attribute | Value |
|---|---|
| **Entity** | `DraftValidationReview` (advisory metadata) |
| **Schema** | `src/db/schema/validation.ts` |
| **Service** | `src/lib/services/validation-writes.ts` |
| **API Routes** | `GET/POST /api/validation/reviews`, `PATCH /api/validation/reviews/[id]`, `PATCH /api/validation/reviews/[id]/status` |
| **RBAC Permissions** | `validation.review` (create, assess), `validation.legalReview` (legal completion), `validation.markReadyForReview` (mark ready), `validation.return` (return for revision), `validation.reject` (reject), `validation.view` (read) |
| **Zod Validation** | `CreateValidationReviewSchema`, `UpdateSourceSupportSchema`, `UpdateCitationAccuracySchema`, `UpdateValidationNotesSchema`, `UpdateValidationStatusSchema` |
| **Audit Events** | `validation_review_created`, `validation_status_changed`, `source_support_updated`, `citation_accuracy_updated`, `validation_notes_updated` |
| **Status Lifecycle** | not_started → in_validation → legal_review_required / validated_for_review / returned_for_revision / rejected. Terminal: rejected, validated_for_review. |
| **Precondition Gates** | 5-gate system for `validated_for_review`: (1) source support assessed, (2) citation accuracy assessed (AI-linked), (3) legal review completed (if required), (4) reviewer notes present (if partial/unsupported), (5) draft not in terminal status |
| **Governance Boundary** | Advisory ONLY. `validated_for_review` ≠ approved. Does NOT approve, publish, or activate reference data. Does NOT call AI providers. Validated drafts still require formal review → approval → publishing. |
| **Failure Mode** | Invalid transitions per `VALID_TRANSITIONS` map. Precondition failures return `PRECONDITION_FAILED`. Legal review completion requires `VALIDATION_LEGAL_REVIEW` permission (C2 FIX). |
| **Traceability Evidence** | Audit event with `entityType: 'draft_validation_review'`, `sourceReference: draftChangeId`, reviewer identity |

---

## Stage 8: Review & Approval Readiness

| Attribute | Value |
|---|---|
| **Entity** | `ApprovalReview` |
| **Schema** | `src/db/schema/review.ts` |
| **Service** | `src/lib/services/review-writes.ts` |
| **API Routes** | `GET/POST /api/review/approval-reviews`, `PATCH /api/review/approval-reviews/[id]` |
| **RBAC Permission** | `review.approve` (submit, approve, reject, revise) |
| **Audit Events** | `approval_review_created`, `approval_review_status_changed`, `approval_decision_made` |
| **Status Lifecycle** | pending → in_review → approved / rejected / needs_revision |
| **Governance Boundary** | SoD enforced: editors cannot approve their own drafts. Approval alone does not publish — publishing is a separate step. |
| **Failure Mode** | SoD violation returns 403. Invalid transitions return appropriate errors. |
| **Traceability Evidence** | Audit event with `entityType: 'approval_review'`, approver identity, decision rationale |

---

## Stage 9: Controlled Publishing

| Attribute | Value |
|---|---|
| **Source Entity** | `DraftRegulatoryChange` (approved) |
| **Target Entity** | Active reference record (regulatory requirement / crosswalk) |
| **Service** | `src/lib/services/publishing-writes.ts` |
| **API Route** | `POST /api/publishing/draft-changes/[id]` |
| **RBAC Permission** | `reference.publish` (Compliance Approver, Admin) |
| **Audit Events** | `draft_change_published`, `reference_record_created`, `prior_version_superseded`, `publication_event_created` |
| **Governance Boundary** | This is the ONLY path to active reference data. Requires approved draft, valid approval chain, SoD verification. Prior versions are superseded (not deleted). Publishes within a database transaction. |
| **Failure Mode** | Unapproved draft → 409. SoD violation → 403. Transaction rollback on partial failure. |
| **Traceability Evidence** | Multiple audit events with `entityType: 'publication_event'`, `approvalReference`, `sourceReference`, checksums |

---

## Stage 10: Version History

| Attribute | Value |
|---|---|
| **Entity** | `RegulatoryVersion` |
| **Schema** | `src/db/schema/versioning.ts` |
| **Service** | `src/lib/services/version-history-service.ts` |
| **API Route** | `GET /api/publishing/history` |
| **RBAC Permission** | `version.view` (read), `audit.view` (integrity verification) |
| **Governance Boundary** | Read-only views. Version records created during publishing (Stage 9). Cannot be modified independently. Supports as-of traceability queries. |
| **Traceability Evidence** | Publication provenance chain: draft → approval → publication → version → supersession |

---

## Stage 11: Audit Trail & Report Snapshots

| Attribute | Value |
|---|---|
| **Entity** | `AuditEvent` + `ReportSnapshot` |
| **Schema** | `src/db/schema/audit.ts` |
| **Service** | `src/lib/services/audit-writer.ts`, `src/lib/services/snapshot-writes.ts` |
| **API Route** | `GET /api/audit`, `POST /api/reports/snapshots` |
| **RBAC Permission** | `audit.view`, `reports.export`, `reports.snapshot` |
| **Immutability** | Both tables are in `IMMUTABLE_TABLES` — no UPDATE or DELETE permitted. `ImmutabilityViolationError` thrown on violation attempt. `assertAppendOnly()` enforced at runtime. |
| **SHA-256 Checksums** | Computed at INSERT time via `computeAuditChecksum()` for tamper detection |
| **Audit Event Fields** | `stableReferenceId`, `entityType`, `entityId`, `action`, `previousValue`, `newValue`, `changedBy`, `changedByUserId`, `changedByEmail`, `roles`, `changedAt`, `reason`, `approvalReference`, `sourceReference`, `checksum`, `sessionId` |
| **Governance Boundary** | Final evidence layer. Append-only, tamper-detectable. Supports integrity verification via `/api/audit/verify-integrity`. Reports include metadata envelopes with snapshot ID, checksum, governance disclaimers. |

---

## Cross-Cutting Governance Controls

| Control | Implementation | Enforcement Point |
|---|---|---|
| **RBAC** | `requirePermission()` on every service write | Server-side, synchronous |
| **Session Resolution** | `resolveSession()` wrapping every API route | API route handler |
| **Zod Validation** | `.strict()` schemas rejecting unknown fields | API route + service layer |
| **Audit Trail** | `insertAuditEvent()` after every successful write | Service layer |
| **Immutability Guard** | `assertAppendOnly()` on audit/snapshot tables | Service layer |
| **Database Mode Gate** | `isDatabaseMode()` check before all writes | Service layer |
| **SoD Enforcement** | Editors ≠ Approvers, creator ≠ publisher | Publishing service |
| **Feature Flags** | `AI_FEATURE_CITATION_SUGGESTIONS_ENABLED` | AI config layer |
| **Secret Protection** | Predeploy + smoke-test detection of `NEXT_PUBLIC_AI_*` | Build pipeline |

---

## Revision History

| Date | Change | Phase |
|---|---|---|
| Phase 3.11 | Initial traceability matrix created | 3.11 |

---

> **To update this matrix:** Add new rows when new workflow stages are implemented. Update existing rows when API routes, permissions, or audit events change.
