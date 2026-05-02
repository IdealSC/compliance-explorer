/**
 * Source — From the "Source Inventory" sheet.
 * 14 fields.
 */
export interface Source {
  sourceId: string;                      // SRC-001 …
  sourceFileSourceName: string | null;
  roleInMatrix: string | null;
  jurisdiction: string | null;
  regulatorAuthority: string | null;
  sourceType: string | null;
  documentDate: string | null;
  versionRevision: string | null;
  primaryTopic: string | null;
  reliabilityAuthorityLevel: string | null;
  keyExtractedContent: string | null;
  rowsCreatedSupported: string | null;
  notes: string | null;
  url: string | null;
}
