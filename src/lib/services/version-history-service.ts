/**
 * Version History Service — Database-backed version history and as-of lookup.
 *
 * GOVERNANCE: This service is READ-ONLY. It does not create, update, or delete
 * any records. It queries the regulatory_versions and publication_events tables
 * to provide historical lookups and publication provenance.
 *
 * Phase 2.6: Enables "as-of" traceability — lookup what version of a regulatory
 * record was active at any given point in time.
 */
import { getDb } from '@/db';
import { eq, and, lte, or, isNull, desc, gt } from 'drizzle-orm';
import {
  regulatoryVersions,
  auditEvents,
} from '@/db/schema';
import { publicationEvents } from '@/db/schema';
import { requirePermission } from '@/auth/rbac';
import { PERMISSIONS } from '@/auth/permissions';
import { isDatabaseMode } from '@/lib/data-source';

// ── Result Types ────────────────────────────────────────────────

export interface VersionHistoryEntry {
  versionId: string;
  stableReferenceId: string;
  versionNumber: string;
  recordStatus: string;
  effectiveDate: string | null;
  supersededDate: string | null;
  changeSummary: string;
  approvedBy: string | null;
  approvedAt: string | null;
  previousVersionId: string | null;
  sourceReference: string | null;
  // Publication provenance (enriched from publication_events)
  publishedAt: string | null;
  publishedByName: string | null;
  publicationEventId: string | null;
}

export interface AsOfResult {
  version: VersionHistoryEntry | null;
  asOfDate: string;
  stableReferenceId: string;
  allVersionsCount: number;
}

export interface VersionProvenanceChain {
  version: VersionHistoryEntry;
  publicationEvent: PublicationEventSummary | null;
  auditTrail: AuditEventSummary[];
}

interface PublicationEventSummary {
  stableReferenceId: string;
  publishedByName: string | null;
  publishedByEmail: string | null;
  publishedAt: string;
  publicationStatus: string;
  publicationSummary: string | null;
  sourceReference: string | null;
  approvalReference: string | null;
}

interface AuditEventSummary {
  stableReferenceId: string;
  action: string;
  changedBy: string;
  changedAt: string;
  reason: string | null;
  sourceReference: string | null;
}

// ── 1. Get Version History ──────────────────────────────────────

/**
 * Get version history from the database.
 * Optionally filtered by stableReferenceId.
 * Enriches results with publication event data when available.
 *
 * Requires: version.view
 */
export async function getVersionHistoryFromDb(
  stableReferenceId?: string,
): Promise<VersionHistoryEntry[]> {
  if (!isDatabaseMode()) return [];
  requirePermission(PERMISSIONS.VERSION_VIEW);

  const db = getDb();

  // Fetch versions
  const whereClause = stableReferenceId
    ? eq(regulatoryVersions.stableReferenceId, stableReferenceId)
    : undefined;

  const versions = await db
    .select()
    .from(regulatoryVersions)
    .where(whereClause)
    .orderBy(desc(regulatoryVersions.approvedAt));

  // Fetch all publication events for enrichment
  const pubEvents = await db
    .select()
    .from(publicationEvents);

  // Build a lookup: newVersionId → publication event
  const pubByVersionId = new Map<string, typeof pubEvents[number]>();
  for (const pe of pubEvents) {
    if (pe.newVersionId) {
      pubByVersionId.set(pe.newVersionId, pe);
    }
  }

  // Map and enrich
  return versions.map((v) => {
    const pub = pubByVersionId.get(v.versionId);
    return {
      versionId: v.versionId,
      stableReferenceId: v.stableReferenceId,
      versionNumber: v.versionNumber,
      recordStatus: v.recordStatus,
      effectiveDate: v.effectiveDate,
      supersededDate: v.supersededDate,
      changeSummary: v.changeSummary,
      approvedBy: v.approvedBy,
      approvedAt: v.approvedAt?.toISOString() ?? null,
      previousVersionId: v.previousVersionId,
      sourceReference: v.sourceReference,
      // Publication provenance
      publishedAt: pub?.publishedAt?.toISOString() ?? null,
      publishedByName: pub?.publishedByName ?? null,
      publicationEventId: pub?.stableReferenceId ?? null,
    };
  });
}

// ── 2. As-Of Lookup ─────────────────────────────────────────────

/**
 * Find the active version of a regulatory record as of a given date.
 *
 * Logic:
 * 1. Find versions with effectiveDate ≤ asOfDate
 * 2. Among those, find the one that was NOT superseded before asOfDate
 *    (supersededDate IS NULL or supersededDate > asOfDate)
 * 3. If multiple matches, take the highest versionNumber
 *
 * Requires: version.view
 */
export async function getActiveVersionAsOf(
  stableReferenceId: string,
  asOfDate: Date,
): Promise<AsOfResult> {
  if (!isDatabaseMode()) {
    return { version: null, asOfDate: asOfDate.toISOString(), stableReferenceId, allVersionsCount: 0 };
  }
  requirePermission(PERMISSIONS.VERSION_VIEW);

  const db = getDb();
  const asOfDateStr = asOfDate.toISOString().slice(0, 10); // YYYY-MM-DD

  // Get all versions for this reference
  const allVersions = await db
    .select()
    .from(regulatoryVersions)
    .where(eq(regulatoryVersions.stableReferenceId, stableReferenceId));

  // Filter: effectiveDate ≤ asOfDate AND (supersededDate IS NULL OR supersededDate > asOfDate)
  const candidates = allVersions.filter((v) => {
    if (!v.effectiveDate) return false;
    if (v.effectiveDate > asOfDateStr) return false;
    if (v.supersededDate && v.supersededDate <= asOfDateStr) return false;
    return true;
  });

  // Sort by version number descending to get the latest
  candidates.sort((a, b) => {
    const va = a.versionNumber.split('.').map(Number);
    const vb = b.versionNumber.split('.').map(Number);
    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
      if ((vb[i] || 0) !== (va[i] || 0)) return (vb[i] || 0) - (va[i] || 0);
    }
    return 0;
  });

  const match = candidates[0] ?? null;

  // Enrich with publication event data if found
  let enriched: VersionHistoryEntry | null = null;
  if (match) {
    const pubEvents = await db
      .select()
      .from(publicationEvents)
      .where(eq(publicationEvents.newVersionId, match.versionId))
      .limit(1);

    const pub = pubEvents[0];
    enriched = {
      versionId: match.versionId,
      stableReferenceId: match.stableReferenceId,
      versionNumber: match.versionNumber,
      recordStatus: match.recordStatus,
      effectiveDate: match.effectiveDate,
      supersededDate: match.supersededDate,
      changeSummary: match.changeSummary,
      approvedBy: match.approvedBy,
      approvedAt: match.approvedAt?.toISOString() ?? null,
      previousVersionId: match.previousVersionId,
      sourceReference: match.sourceReference,
      publishedAt: pub?.publishedAt?.toISOString() ?? null,
      publishedByName: pub?.publishedByName ?? null,
      publicationEventId: pub?.stableReferenceId ?? null,
    };
  }

  return {
    version: enriched,
    asOfDate: asOfDateStr,
    stableReferenceId,
    allVersionsCount: allVersions.length,
  };
}

// ── 3. Version Timeline ─────────────────────────────────────────

/**
 * Get the full version chain for a stableReferenceId.
 * Enriched with publication provenance for each version.
 *
 * Requires: version.view
 */
export async function getVersionTimeline(
  stableReferenceId: string,
): Promise<VersionHistoryEntry[]> {
  return getVersionHistoryFromDb(stableReferenceId);
}

// ── 4. Publication Provenance Chain ─────────────────────────────

/**
 * Get the full provenance chain for a specific version.
 * Joins version → publication event → related audit events.
 *
 * Requires: version.view + audit.view
 */
export async function getPublicationTraceForVersion(
  versionId: string,
): Promise<VersionProvenanceChain | null> {
  if (!isDatabaseMode()) return null;
  requirePermission(PERMISSIONS.VERSION_VIEW);
  requirePermission(PERMISSIONS.AUDIT_VIEW);

  const db = getDb();

  // Get the version
  const [version] = await db
    .select()
    .from(regulatoryVersions)
    .where(eq(regulatoryVersions.versionId, versionId));

  if (!version) return null;

  // Get publication event
  const pubEvents = await db
    .select()
    .from(publicationEvents)
    .where(eq(publicationEvents.newVersionId, versionId));

  const pub = pubEvents[0] ?? null;

  // Get related audit events (for the version entity or the publication event)
  const versionAudits = await db
    .select()
    .from(auditEvents)
    .where(
      or(
        eq(auditEvents.entityId, versionId),
        eq(auditEvents.entityId, version.stableReferenceId),
      ),
    )
    .orderBy(desc(auditEvents.changedAt));

  const enrichedVersion: VersionHistoryEntry = {
    versionId: version.versionId,
    stableReferenceId: version.stableReferenceId,
    versionNumber: version.versionNumber,
    recordStatus: version.recordStatus,
    effectiveDate: version.effectiveDate,
    supersededDate: version.supersededDate,
    changeSummary: version.changeSummary,
    approvedBy: version.approvedBy,
    approvedAt: version.approvedAt?.toISOString() ?? null,
    previousVersionId: version.previousVersionId,
    sourceReference: version.sourceReference,
    publishedAt: pub?.publishedAt?.toISOString() ?? null,
    publishedByName: pub?.publishedByName ?? null,
    publicationEventId: pub?.stableReferenceId ?? null,
  };

  const pubSummary: PublicationEventSummary | null = pub
    ? {
        stableReferenceId: pub.stableReferenceId,
        publishedByName: pub.publishedByName,
        publishedByEmail: pub.publishedByEmail,
        publishedAt: pub.publishedAt?.toISOString() ?? '',
        publicationStatus: pub.publicationStatus,
        publicationSummary: pub.publicationSummary,
        sourceReference: pub.sourceReference,
        approvalReference: pub.approvalReference,
      }
    : null;

  const auditTrail: AuditEventSummary[] = versionAudits.map((ae) => ({
    stableReferenceId: ae.stableReferenceId,
    action: ae.action,
    changedBy: ae.changedBy,
    changedAt: ae.changedAt?.toISOString() ?? '',
    reason: ae.reason,
    sourceReference: ae.sourceReference,
  }));

  return {
    version: enrichedVersion,
    publicationEvent: pubSummary,
    auditTrail,
  };
}

// ── 5. Get Unique Stable Reference IDs ──────────────────────────

/**
 * Get all unique stableReferenceIds from the version history.
 * Useful for populating dropdowns in the as-of trace UI.
 *
 * Requires: version.view
 */
export async function getVersionedReferenceIds(): Promise<string[]> {
  if (!isDatabaseMode()) return [];
  requirePermission(PERMISSIONS.VERSION_VIEW);

  const db = getDb();
  const rows = await db
    .select({ stableReferenceId: regulatoryVersions.stableReferenceId })
    .from(regulatoryVersions);

  const ids = new Set(rows.map((r) => r.stableReferenceId));
  return Array.from(ids).sort();
}
