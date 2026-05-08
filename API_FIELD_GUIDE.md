# API Field Guide

> **Phase 4.3 — Operator Reference (OPS-01)**
>
> **Created:** 2026-05-07
> **Source:** Phase 4.1 Pilot Lessons Learned (LL-01, LL-03)
> **Purpose:** Prevent operator errors caused by incorrect API field names

---

## Quick Reference: Common Mistakes

> [!WARNING]
> These field name mistakes were observed during the pilot. The API will silently ignore unknown fields in some PATCH handlers, making errors hard to detect.

| ❌ Wrong | ✅ Correct | Endpoint |
|---|---|---|
| `sourceSupport` | `sourceSupportStatus` | `PATCH /api/validation/reviews/[id]` |
| `citationAccuracy` | `citationAccuracyStatus` | `PATCH /api/validation/reviews/[id]` |
| `reviewerDecision` (in review body) | `action` (with value) | `PATCH /api/ai/suggestions/[id]/review` |
| `selectedText` | `sourceExcerpt` | `POST /api/ai/citation-suggestions/generate` |
| `regulatoryDomain` | `regulator` | `POST /api/ai/citation-suggestions/generate` |
| `suggestionType` | *(not a generate field)* | `POST /api/ai/citation-suggestions/generate` |

---

## 1. AI Citation Generation

### `POST /api/ai/citation-suggestions/generate`

| Field | Type | Required | Description |
|---|---|---|---|
| `sourceRecordId` | string | ✅ | Registry source ID (e.g., `SRC-002`) |
| `sourceExcerpt` | string (max 12000) | ✅ | Text excerpt from source document |
| `sourceReference` | string | ✅ | Citation reference string (e.g., `21 CFR 211.100(a)`) |
| `sourceFileId` | string | ❌ | Optional file ID within source |
| `intakeRequestId` | string | ❌ | Optional intake request reference |
| `sourceLocation` | string | ❌ | Page/section within source |
| `regulator` | string | ❌ | Regulatory body (e.g., `FDA`) |
| `jurisdiction` | string | ❌ | Jurisdiction (e.g., `US`) |
| `sourceTitle` | string | ❌ | Source document title |
| `maxSuggestions` | number (1–20) | ❌ | Max suggestions to return |

### Example Valid Payload

```json
{
  "sourceRecordId": "SRC-002",
  "sourceExcerpt": "211.100(a) There shall be written procedures for production and process control",
  "sourceReference": "21 CFR 211.100(a)"
}
```

### Example Invalid Payloads

```json
// ❌ Missing required sourceExcerpt
{
  "sourceRecordId": "SRC-002",
  "sourceReference": "21 CFR 211.100(a)"
}
// → 400 VALIDATION_ERROR: sourceExcerpt is required

// ❌ Wrong field name
{
  "sourceRecordId": "SRC-002",
  "selectedText": "...",
  "sourceReference": "21 CFR 211.100(a)"
}
// → 400 VALIDATION_ERROR: sourceExcerpt required (selectedText ignored due to strict schema)
```

---

## 2. AI Suggestion Review

### `PATCH /api/ai/suggestions/[id]/review`

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | ✅ | One of: `reject`, `expire`, `mark_for_review`, `update_notes`, `toggle_legal_review` |
| `reviewerNotes` | string (max 2000) | Conditional | Required for `reject` and `update_notes` actions |
| `reason` | string | ❌ | Optional reason for `expire` and `mark_for_review` |
| `legalReviewRequired` | boolean | Conditional | Required for `toggle_legal_review` |

### Example: Reject

```json
{
  "action": "reject",
  "reviewerNotes": "Citation does not match source text"
}
```

### Example: Expire

```json
{
  "action": "expire",
  "reason": "Superseded by updated regulation"
}
```

---

## 3. Accept-to-Draft Conversion

### `POST /api/ai/suggestions/[id]/accept-to-draft`

| Field | Type | Required | Description |
|---|---|---|---|
| `relatedUpdateId` | string | ✅ | Reference to related update/context |
| `changeReason` | string | ❌ | Optional reason for draft creation |

### Example

```json
{
  "relatedUpdateId": "pilot-day-1-citation-test",
  "changeReason": "Day-1 controlled pilot — first citation conversion"
}
```

### Response

```json
{
  "success": true,
  "draftChangeId": "DRC-xxxxx-xxxx",
  "suggestionId": "AIS-xxxxx-xxxx",
  "auditEventId": "AE-xxxxx-xxxx"
}
```

> [!IMPORTANT]
> The draft ID is in `draftChangeId` (top-level), NOT `draftChange.stableReferenceId`.

---

## 4. Validation Review Fields

### `POST /api/validation/drafts/[draftId]/reviews` — Create Review

No body required (empty `{}` is valid).

### `PATCH /api/validation/reviews/[id]` — Update Assessments

| Field | Type | Values | Description |
|---|---|---|---|
| `sourceSupportStatus` | string | `supported`, `unsupported`, `partial`, `not_assessed` | Source support assessment |
| `citationAccuracyStatus` | string | `accurate`, `inaccurate`, `needs_correction`, `not_assessed` | Citation accuracy assessment |
| `legalReviewStatus` | string | `completed`, `pending`, `not_required`, `flagged` | Legal review status |
| `regulatoryAlignmentStatus` | string | `aligned`, `misaligned`, `needs_review`, `not_assessed` | Regulatory alignment |
| `completenessStatus` | string | `complete`, `incomplete`, `needs_supplement`, `not_assessed` | Completeness assessment |

### Example: Assess Source Support

```json
{
  "sourceSupportStatus": "supported"
}
```

> [!CAUTION]
> Use `sourceSupportStatus`, NOT `sourceSupport`. The API may silently accept the wrong field name without updating the record.

### `PATCH /api/validation/reviews/[id]/status` — Change Status

| Field | Type | Values |
|---|---|---|
| `newStatus` | string | `in_validation`, `validated_for_review`, `validation_failed` |

### Precondition for `validated_for_review`

All of the following must be assessed (not `not_assessed`):
- `sourceSupportStatus`
- `citationAccuracyStatus`
- `legalReviewStatus`
- `regulatoryAlignmentStatus`
- `completenessStatus`

If any gate is unassessed: **422 — Source support status must be assessed before validation.**

---

## 5. Approval Review Fields

### `POST /api/review/approval-reviews` — Create Review

| Field | Type | Required |
|---|---|---|
| `reviewTargetId` | string | ✅ |
| `reviewTargetType` | string | ✅ |

### `PATCH /api/review/approval-reviews/[id]/decision` — Decision

| Field | Type | Values |
|---|---|---|
| `action` | string | `start_review`, `approve_for_publication`, `request_changes`, `reject` |

---

## 6. Publishing Fields

### `POST /api/publishing/draft-changes/[id]/publish`

| Field | Type | Required |
|---|---|---|
| `publicationSummary` | string | ✅ |

### Pre-Publish Validation

`GET /api/publishing/draft-changes/[id]/publish/validate` — returns 7 precondition checks.

---

## Status Code Reference

| Code | Meaning | Common Causes |
|---|---|---|
| 200 | Success | GET, PATCH succeeded |
| 201 | Created | POST created new record |
| 400 | Validation Error | Missing/invalid fields, wrong field names |
| 403 | Forbidden | RBAC — user lacks required permission |
| 404 | Not Found | Invalid ID or no endpoint exists |
| 409 | Conflict | Duplicate action, terminal state, invalid source |
| 422 | Precondition Failed | Validation gate unmet, duplicate publish |
| 500 | Server Error | Internal error |
| 502 | Provider Error | AI provider (Azure) returned error |
| 503 | Service Unavailable | AI feature disabled, wrong mode |

---

> **Governance Notice:** This guide documents API field conventions only. It does not authorize scope expansion or new capabilities. All operations remain within the boundaries defined in PROJECT_CONTROL_BASELINE.md.
