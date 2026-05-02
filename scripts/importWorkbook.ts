/**
 * Workbook Import Script
 * 
 * Reads the source Excel workbook and outputs 12 static JSON files
 * into src/data/ for use by the app.
 * 
 * Usage: npx tsx scripts/importWorkbook.ts [path-to-workbook]
 * Default: C:\Users\brian\Downloads\regulatory_compliance_matrix_app_ready_source_model.xlsx
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ── Configuration ───────────────────────────────────────────
const DEFAULT_WORKBOOK_PATH = String.raw`C:\Users\brian\Downloads\regulatory_compliance_matrix_app_ready_source_model.xlsx`;
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'data');

// ── Column header → camelCase mapping ───────────────────────
// Explicit mapping for the 61 Compliance Matrix columns to ensure stability.
// This avoids fragile auto-conversion and preserves readable field names.

const COMPLIANCE_MATRIX_FIELD_MAP: Record<string, string> = {
  'Matrix Row ID': 'matrixRowId',
  'Row Type': 'rowType',
  'Regulatory Domain': 'regulatoryDomain',
  'Jurisdiction / Region': 'jurisdictionRegion',
  'Regulator / Authority': 'regulatorAuthority',
  'Law / Regulation / Framework / Standard Name': 'lawRegulationFrameworkStandardName',
  'Specific Citation / Section / Clause': 'specificCitationSectionClause',
  'Source Type': 'sourceType',
  'Regulatory Tier': 'regulatoryTier',
  'SCOR Phase': 'scorPhase',
  'Level 1 Category': 'level1Category',
  'Level 2 Subcategory': 'level2Subcategory',
  'Level 3 Requirement Area': 'level3RequirementArea',
  'Level 4 Detailed Requirement': 'level4DetailedRequirement',
  'Level 5 Granular Obligation / Control / Action': 'level5GranularObligation',
  'Exact Requirement or Source Language': 'exactRequirementOrSourceLanguage',
  'Plain-English Interpretation': 'plainEnglishInterpretation',
  'Who Must Comply': 'whoMustComply',
  'Business Function Impacted': 'businessFunctionImpacted',
  'Example Business Owner': 'exampleBusinessOwner',
  'Operational Process Impacted': 'operationalProcessImpacted',
  'Required Action': 'requiredAction',
  'Required Control': 'requiredControl',
  'Required Evidence / Documentation': 'requiredEvidenceDocumentation',
  'Reporting Requirement': 'reportingRequirement',
  'Monitoring Requirement': 'monitoringRequirement',
  'Frequency / Timing': 'frequencyTiming',
  'Triggering Event': 'triggeringEvent',
  'Applicability Conditions': 'applicabilityConditions',
  'Exceptions / Exemptions': 'exceptionsExemptions',
  'Related Standards': 'relatedStandards',
  'Related Laws / Regulations': 'relatedLawsRegulations',
  'Related Internal Policies or Procedures': 'relatedInternalPoliciesOrProcedures',
  'Dependencies': 'dependencies',
  'Potential Conflicts or Ambiguities': 'potentialConflictsOrAmbiguities',
  'Risk of Non-Compliance': 'riskOfNonCompliance',
  'Severity / Priority': 'severityPriority',
  'Implementation Notes': 'implementationNotes',
  'Practical Example for a Business Leader': 'practicalExampleForBusinessLeader',
  'Source Note / Source Reference': 'sourceNoteSourceReference',
  'Source File': 'sourceFile',
  'Confidence Level': 'confidenceLevel',
  'Open Questions / Missing Information': 'openQuestionsMissingInformation',
  'Review Status': 'reviewStatus',
  'Accuracy / Enhancement Note': 'accuracyEnhancementNote',
  'External Verification URL': 'externalVerificationUrl',
  'Recommended Enhancement / Control Gap': 'recommendedEnhancementControlGap',
  'Target Remediation Owner': 'targetRemediationOwner',
  'Action Required': 'actionRequired',
  'Validation Date': 'validationDate',
  'Primary Persona / Viewer': 'primaryPersonaViewer',
  'Lifecycle Stage': 'lifecycleStage',
  'Process Type': 'processType',
  'Status': 'status',
  'Actionability': 'actionability',
  'Digital System Owner': 'digitalSystemOwner',
  'Control Type': 'controlType',
  'Evidence Criticality': 'evidenceCriticality',
  'UI Display Summary': 'uiDisplaySummary',
  'Needs Review Flag': 'needsReviewFlag',
  'Launch-Critical Flag': 'launchCriticalFlag',
};

// Boolean fields that should be parsed from "TRUE"/"FALSE"
const BOOLEAN_FIELDS = new Set(['needsReviewFlag', 'launchCriticalFlag', 'active']);

// ── Helpers ─────────────────────────────────────────────────

function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '' || str === 'None') return null;
  return str;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  const str = String(value).trim().toUpperCase();
  return str === 'TRUE' || str === '1' || str === 'YES';
}

/** Tracking structure for unmapped columns per sheet */
interface SheetReadResult {
  rows: Record<string, unknown>[];
  unmappedColumns: string[];
  mappedColumnCount: number;
  totalColumnCount: number;
}

/**
 * Generic sheet reader: reads a sheet into an array of objects
 * using the provided field map (or auto-camelCase if not provided).
 * Also tracks unmapped columns for validation reporting.
 */
function readSheetWithValidation(
  workbook: XLSX.WorkBook,
  sheetName: string,
  fieldMap?: Record<string, string>,
  booleanFields: Set<string> = BOOLEAN_FIELDS,
): SheetReadResult {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`⚠ Sheet "${sheetName}" not found in workbook.`);
    return { rows: [], unmappedColumns: [], mappedColumnCount: 0, totalColumnCount: 0 };
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  const results: Record<string, unknown>[] = [];

  // Track unmapped columns (detected from first row headers)
  const unmappedColumns: string[] = [];
  let mappedCount = 0;
  let totalCount = 0;
  if (rawRows.length > 0) {
    const headers = Object.keys(rawRows[0]);
    totalCount = headers.length;
    for (const header of headers) {
      const fieldName = fieldMap ? fieldMap[header] : autoCamelCase(header);
      if (!fieldName && fieldMap) {
        unmappedColumns.push(header);
      } else {
        mappedCount++;
      }
    }
  }

  for (const raw of rawRows) {
    const mapped: Record<string, unknown> = {};
    for (const [header, value] of Object.entries(raw)) {
      const fieldName = fieldMap ? fieldMap[header] : autoCamelCase(header);
      if (!fieldName) continue; // Skip unmapped columns

      if (booleanFields.has(fieldName)) {
        mapped[fieldName] = parseBoolean(value);
      } else if (fieldName === 'sortOrder') {
        mapped[fieldName] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
      } else {
        mapped[fieldName] = normalizeValue(value);
      }
    }
    results.push(mapped);
  }

  return { rows: results, unmappedColumns, mappedColumnCount: mappedCount, totalColumnCount: totalCount };
}

/** Legacy wrapper for backward compatibility */
function readSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  fieldMap?: Record<string, string>,
  booleanFields: Set<string> = BOOLEAN_FIELDS,
): Record<string, unknown>[] {
  return readSheetWithValidation(workbook, sheetName, fieldMap, booleanFields).rows;
}

/** Fallback auto-camelCase for sheets without explicit field maps */
function autoCamelCase(header: string): string {
  return header
    .replace(/[\/\-\(\)&]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

function writeJson(filename: string, data: unknown): void {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  const count = Array.isArray(data) ? data.length : 'object';
  console.log(`  ✓ ${filename} (${count} records)`);
}

// ── Sheet-Specific Field Maps ───────────────────────────────

const RISK_FIELD_MAP: Record<string, string> = {
  'Risk ID': 'riskId',
  'Linked Matrix Row ID': 'linkedMatrixRowId',
  'Matrix Row ID': 'matrixRowId',
  'Severity / Priority': 'severityPriority',
  'Risk Theme': 'riskTheme',
  'Obligation': 'obligation',
  'Why High Risk': 'whyHighRisk',
  'Owner': 'owner',
  'Evidence': 'evidence',
  'Source': 'source',
  'Risk Theme Category': 'riskThemeCategory',
  'Primary Function': 'primaryFunction',
  'Primary SCOR Phase': 'primaryScorPhase',
  'Primary Jurisdiction': 'primaryJurisdiction',
  'Review Status': 'reviewStatus',
  'Mitigation Status': 'mitigationStatus',
  'App Dashboard Use': 'appDashboardUse',
};

const EVIDENCE_FIELD_MAP: Record<string, string> = {
  'Evidence ID': 'evidenceId',
  'Evidence Artifact': 'evidenceArtifact',
  'Regulatory Driver': 'regulatoryDriver',
  'Primary Process': 'primaryProcess',
  'Evidence Owner': 'evidenceOwner',
  'System / Repository': 'systemRepository',
  'Minimum Review Cadence': 'minimumReviewCadence',
  'Inspection Use': 'inspectionUse',
  'Related Matrix Rows / Notes': 'relatedMatrixRowsNotes',
  'Evidence Criticality': 'evidenceCriticality',
  'App Use': 'appUse',
};

const SOURCE_FIELD_MAP: Record<string, string> = {
  'Source ID': 'sourceId',
  'Source File / Source Name': 'sourceFileSourceName',
  'Role in Matrix': 'roleInMatrix',
  'Jurisdiction': 'jurisdiction',
  'Regulator / Authority': 'regulatorAuthority',
  'Source Type': 'sourceType',
  'Document Date': 'documentDate',
  'Version / Revision': 'versionRevision',
  'Primary Topic': 'primaryTopic',
  'Reliability / Authority Level': 'reliabilityAuthorityLevel',
  'Key Extracted Content': 'keyExtractedContent',
  'Rows Created / Supported': 'rowsCreatedSupported',
  'Notes': 'notes',
  'URL': 'url',
};

const GAP_FIELD_MAP: Record<string, string> = {
  'Gap ID': 'gapId',
  'Gap / Question': 'gapQuestion',
  'Why It Matters': 'whyItMatters',
  'Suggested Owner': 'suggestedOwner',
  'Source Basis': 'sourceBasis',
  'Priority': 'priority',
  'Gap Category': 'gapCategory',
  'Status': 'status',
  'Linked Matrix Row ID / Filter': 'linkedMatrixRowIdFilter',
  'App Treatment': 'appTreatment',
};

const CROSSWALK_FIELD_MAP: Record<string, string> = {
  'Crosswalk ID': 'crosswalkId',
  'Crosswalk Area': 'crosswalkArea',
  'Linked Laws / Standards / Guidance': 'linkedLawsStandardsGuidance',
  'Business Meaning': 'businessMeaning',
  'Primary Evidence / Control': 'primaryEvidenceControl',
  'Source Coverage': 'sourceCoverage',
  'Primary SCOR Phase': 'primaryScorPhase',
  'Primary Persona / Viewer': 'primaryPersonaViewer',
  'Related App View': 'relatedAppView',
  'Linked Matrix Row IDs / Filter Logic': 'linkedMatrixRowIdsFilterLogic',
};

const FUNCTION_IMPACT_FIELD_MAP: Record<string, string> = {
  'Function Impact ID': 'functionImpactId',
  'Business Function': 'businessFunction',
  'What They Need to Understand': 'whatTheyNeedToUnderstand',
  'What They Need to Act On': 'whatTheyNeedToActOn',
  'Primary Controls / Evidence': 'primaryControlsEvidence',
  'Highest-Risk Questions': 'highestRiskQuestions',
  'Primary Persona / Viewer': 'primaryPersonaViewer',
  'Primary SCOR Phase(s)': 'primaryScorPhases',
  'Digital System / Evidence Dependencies': 'digitalSystemEvidenceDependencies',
  'Linked Matrix Row ID Filter': 'linkedMatrixRowIdFilter',
};

const LIST_FIELD_MAP: Record<string, string> = {
  'List ID': 'listId',
  'List Category': 'listCategory',
  'List Value': 'listValue',
  'Display Label': 'displayLabel',
  'Definition': 'definition',
  'Sort Order': 'sortOrder',
  'Active Flag': 'active',
};

const DECISION_TREE_FIELD_MAP: Record<string, string> = {
  'Decision ID': 'decisionId',
  'Decision Area': 'decisionArea',
  'Question': 'question',
  'If Yes': 'ifYes',
  'If No': 'ifNo',
  'Likely Owner': 'likelyOwner',
  'Matrix Use': 'matrixUse',
  'App Use': 'appUse',
};

const ROADMAP_FIELD_MAP: Record<string, string> = {
  'Roadmap ID': 'roadmapId',
  'Priority': 'priority',
  'Workstream': 'workstream',
  'Enhancement': 'enhancement',
  'Why It Matters': 'whyItMatters',
  'Owner': 'owner',
  'Suggested Timing': 'suggestedTiming',
  'Deliverable': 'deliverable',
  'Success Measure': 'successMeasure',
  'Linked Gap / Risk Theme': 'linkedGapRiskTheme',
  'Status': 'status',
};

const VERIFICATION_SOURCE_FIELD_MAP: Record<string, string> = {
  'Verification Source ID': 'verificationSourceId',
  'Source Name': 'sourceName',
  'Type': 'type',
  'Why Used': 'whyUsed',
  'URL': 'url',
  'Review Note': 'reviewNote',
  'Linked Source ID': 'linkedSourceId',
};

// ── ID Validation Helper ────────────────────────────────────

function validateIds(
  data: Record<string, unknown>[],
  idField: string,
  sheetName: string,
  warnings: string[],
): { total: number; present: number; missing: number; duplicates: string[] } {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  let missing = 0;

  for (const row of data) {
    const id = row[idField] as string | null;
    if (!id) {
      missing++;
      warnings.push(`[${sheetName}] Row missing ${idField}`);
      continue;
    }
    if (ids.has(id)) {
      duplicates.push(id);
      warnings.push(`[${sheetName}] Duplicate ${idField}: ${id}`);
    }
    ids.add(id);
  }

  return { total: data.length, present: data.length - missing, missing, duplicates };
}

// ── Main ────────────────────────────────────────────────────

function main(): void {
  const workbookPath = process.argv[2] || DEFAULT_WORKBOOK_PATH;

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Compliance Matrix Workbook → JSON Importer (v1.1)     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nSource: ${workbookPath}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read workbook
  if (!fs.existsSync(workbookPath)) {
    console.error(`✗ Workbook not found: ${workbookPath}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(workbookPath);
  const expectedSheets = [
    'Compliance Matrix', 'Source Inventory', 'Crosswalk Summary',
    'Function Impact', 'Highest Risk', 'Gaps & Questions',
    'Data Dictionary', 'Lists', 'Review Dashboard',
    'Verification Sources', 'Applicability Decision Tree',
    'Evidence Register', 'Implementation Roadmap', 'Metadata & Governance',
  ];

  console.log(`Sheets found (${workbook.SheetNames.length}): ${workbook.SheetNames.join(', ')}`);
  
  // Check for missing expected sheets
  const missingSheets = expectedSheets.filter(s => !workbook.SheetNames.includes(s));
  if (missingSheets.length > 0) {
    console.warn(`\n⚠ Missing expected sheets: ${missingSheets.join(', ')}`);
  }
  
  // Check for unexpected sheets
  const unexpectedSheets = workbook.SheetNames.filter(s => !expectedSheets.includes(s));
  if (unexpectedSheets.length > 0) {
    console.log(`ℹ Additional sheets (not mapped): ${unexpectedSheets.join(', ')}`);
  }

  console.log('\n── Processing Sheets ────────────────────────────\n');

  const warnings: string[] = [];
  const sheetReports: { name: string; rows: number; mapped: number; total: number; unmapped: string[] }[] = [];

  // ── 1. Compliance Matrix ──────────────────────────────────
  const reqResult = readSheetWithValidation(workbook, 'Compliance Matrix', COMPLIANCE_MATRIX_FIELD_MAP);
  const requirements = reqResult.rows;
  sheetReports.push({ name: 'Compliance Matrix', rows: requirements.length, mapped: reqResult.mappedColumnCount, total: reqResult.totalColumnCount, unmapped: reqResult.unmappedColumns });
  
  const reqIdValidation = validateIds(requirements, 'matrixRowId', 'Compliance Matrix', warnings);
  writeJson('requirements.json', requirements);

  // ── 2. Highest Risk ───────────────────────────────────────
  const riskResult = readSheetWithValidation(workbook, 'Highest Risk', RISK_FIELD_MAP);
  const risks = riskResult.rows;
  sheetReports.push({ name: 'Highest Risk', rows: risks.length, mapped: riskResult.mappedColumnCount, total: riskResult.totalColumnCount, unmapped: riskResult.unmappedColumns });
  
  const riskIdValidation = validateIds(risks, 'riskId', 'Highest Risk', warnings);
  writeJson('risks.json', risks);

  // ── 3. Evidence Register ──────────────────────────────────
  const evidenceResult = readSheetWithValidation(workbook, 'Evidence Register', EVIDENCE_FIELD_MAP);
  const evidence = evidenceResult.rows;
  sheetReports.push({ name: 'Evidence Register', rows: evidence.length, mapped: evidenceResult.mappedColumnCount, total: evidenceResult.totalColumnCount, unmapped: evidenceResult.unmappedColumns });
  
  const evidenceIdValidation = validateIds(evidence, 'evidenceId', 'Evidence Register', warnings);
  writeJson('evidence.json', evidence);

  // ── 4. Source Inventory ───────────────────────────────────
  const sourceResult = readSheetWithValidation(workbook, 'Source Inventory', SOURCE_FIELD_MAP);
  const sources = sourceResult.rows;
  sheetReports.push({ name: 'Source Inventory', rows: sources.length, mapped: sourceResult.mappedColumnCount, total: sourceResult.totalColumnCount, unmapped: sourceResult.unmappedColumns });
  
  const sourceIdValidation = validateIds(sources, 'sourceId', 'Source Inventory', warnings);
  writeJson('sources.json', sources);

  // ── 5. Gaps & Questions ───────────────────────────────────
  const gapResult = readSheetWithValidation(workbook, 'Gaps & Questions', GAP_FIELD_MAP);
  const gaps = gapResult.rows;
  sheetReports.push({ name: 'Gaps & Questions', rows: gaps.length, mapped: gapResult.mappedColumnCount, total: gapResult.totalColumnCount, unmapped: gapResult.unmappedColumns });
  
  const gapIdValidation = validateIds(gaps, 'gapId', 'Gaps & Questions', warnings);
  writeJson('gaps.json', gaps);

  // ── 6. Crosswalk Summary ──────────────────────────────────
  const crosswalkResult = readSheetWithValidation(workbook, 'Crosswalk Summary', CROSSWALK_FIELD_MAP);
  const crosswalks = crosswalkResult.rows;
  sheetReports.push({ name: 'Crosswalk Summary', rows: crosswalks.length, mapped: crosswalkResult.mappedColumnCount, total: crosswalkResult.totalColumnCount, unmapped: crosswalkResult.unmappedColumns });
  
  const crosswalkIdValidation = validateIds(crosswalks, 'crosswalkId', 'Crosswalk Summary', warnings);
  writeJson('crosswalks.json', crosswalks);

  // ── 7. Function Impact ────────────────────────────────────
  const functionImpactResult = readSheetWithValidation(workbook, 'Function Impact', FUNCTION_IMPACT_FIELD_MAP);
  const functionImpact = functionImpactResult.rows;
  sheetReports.push({ name: 'Function Impact', rows: functionImpact.length, mapped: functionImpactResult.mappedColumnCount, total: functionImpactResult.totalColumnCount, unmapped: functionImpactResult.unmappedColumns });
  
  const functionImpactIdValidation = validateIds(functionImpact, 'functionImpactId', 'Function Impact', warnings);
  writeJson('functionImpact.json', functionImpact);

  // ── 8. Lists ──────────────────────────────────────────────
  const listResult = readSheetWithValidation(workbook, 'Lists', LIST_FIELD_MAP);
  const lists = listResult.rows;
  sheetReports.push({ name: 'Lists', rows: lists.length, mapped: listResult.mappedColumnCount, total: listResult.totalColumnCount, unmapped: listResult.unmappedColumns });
  
  const listIdValidation = validateIds(lists, 'listId', 'Lists', warnings);
  writeJson('lists.json', lists);

  // ── 9. Applicability Decision Tree ────────────────────────
  const decisionTreeResult = readSheetWithValidation(workbook, 'Applicability Decision Tree', DECISION_TREE_FIELD_MAP);
  const decisionTree = decisionTreeResult.rows;
  sheetReports.push({ name: 'Applicability Decision Tree', rows: decisionTree.length, mapped: decisionTreeResult.mappedColumnCount, total: decisionTreeResult.totalColumnCount, unmapped: decisionTreeResult.unmappedColumns });
  
  const decisionIdValidation = validateIds(decisionTree, 'decisionId', 'Applicability Decision Tree', warnings);
  writeJson('decisionTree.json', decisionTree);

  // ── 10. Implementation Roadmap ────────────────────────────
  const roadmapResult = readSheetWithValidation(workbook, 'Implementation Roadmap', ROADMAP_FIELD_MAP);
  const roadmap = roadmapResult.rows;
  sheetReports.push({ name: 'Implementation Roadmap', rows: roadmap.length, mapped: roadmapResult.mappedColumnCount, total: roadmapResult.totalColumnCount, unmapped: roadmapResult.unmappedColumns });
  
  const roadmapIdValidation = validateIds(roadmap, 'roadmapId', 'Implementation Roadmap', warnings);
  writeJson('roadmap.json', roadmap);

  // ── 11. Verification Sources ──────────────────────────────
  const verificationResult = readSheetWithValidation(workbook, 'Verification Sources', VERIFICATION_SOURCE_FIELD_MAP);
  const verificationSources = verificationResult.rows;
  sheetReports.push({ name: 'Verification Sources', rows: verificationSources.length, mapped: verificationResult.mappedColumnCount, total: verificationResult.totalColumnCount, unmapped: verificationResult.unmappedColumns });
  
  const verificationIdValidation = validateIds(verificationSources, 'verificationSourceId', 'Verification Sources', warnings);
  writeJson('verificationSources.json', verificationSources);

  // ── 12. Data Dictionary (auto-mapped, no explicit field map) ─
  const dataDictionary = readSheet(workbook, 'Data Dictionary');
  writeJson('dataDictionary.json', dataDictionary);

  // ── 13. Review Dashboard (auto-mapped) ────────────────────
  const reviewDashboard = readSheet(workbook, 'Review Dashboard');
  writeJson('reviewDashboard.json', reviewDashboard);

  // ── 14. Metadata & Governance ─────────────────────────────
  const metadataSheet = readSheet(workbook, 'Metadata & Governance');
  const metadataObj: Record<string, unknown> = {
    workbookVersion: 'v3.0',
    revisionDate: '2026-05-02',
    importedAt: new Date().toISOString(),
    sourceFile: path.basename(workbookPath),
    rowCounts: {
      requirements: requirements.length,
      risks: risks.length,
      evidence: evidence.length,
      sources: sources.length,
      gaps: gaps.length,
      crosswalks: crosswalks.length,
      functionImpact: functionImpact.length,
      lists: lists.length,
      decisionTree: decisionTree.length,
      roadmap: roadmap.length,
      verificationSources: verificationSources.length,
      dataDictionary: dataDictionary.length,
      reviewDashboard: reviewDashboard.length,
    },
    warnings,
    governanceRaw: metadataSheet,
  };
  writeJson('metadata.json', metadataObj);

  // ══════════════════════════════════════════════════════════
  //  COMPREHENSIVE IMPORT REPORT
  // ══════════════════════════════════════════════════════════

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  IMPORT VALIDATION REPORT');
  console.log('══════════════════════════════════════════════════════════\n');

  // ── Sheet-by-sheet row counts ─────────────────────────────
  console.log('── Row Counts ────────────────────────────────────');
  console.log(`  ${'Sheet'.padEnd(35)} ${'Rows'.padStart(5)}  ${'Mapped'.padStart(6)}  ${'Total'.padStart(5)}  Coverage`);
  console.log(`  ${'─'.repeat(35)} ${'─'.repeat(5)}  ${'─'.repeat(6)}  ${'─'.repeat(5)}  ────────`);
  for (const r of sheetReports) {
    const coverage = r.total > 0 ? `${Math.round((r.mapped / r.total) * 100)}%` : 'N/A';
    console.log(`  ${r.name.padEnd(35)} ${String(r.rows).padStart(5)}  ${String(r.mapped).padStart(6)}  ${String(r.total).padStart(5)}  ${coverage}`);
  }
  console.log(`  ${'─'.repeat(35)} ${'─'.repeat(5)}`);
  console.log(`  ${'Auto-mapped (no field map):'.padEnd(35)}`);
  console.log(`    Data Dictionary                    ${dataDictionary.length}`);
  console.log(`    Review Dashboard                   ${reviewDashboard.length}`);
  console.log(`    Metadata & Governance              ${metadataSheet.length}`);

  // ── ID Validation ─────────────────────────────────────────
  console.log('\n── ID Validation ─────────────────────────────────');
  const idResults = [
    { name: 'Compliance Matrix (matrixRowId)', ...reqIdValidation },
    { name: 'Highest Risk (riskId)', ...riskIdValidation },
    { name: 'Evidence Register (evidenceId)', ...evidenceIdValidation },
    { name: 'Source Inventory (sourceId)', ...sourceIdValidation },
    { name: 'Gaps & Questions (gapId)', ...gapIdValidation },
    { name: 'Crosswalk Summary (crosswalkId)', ...crosswalkIdValidation },
    { name: 'Function Impact (functionImpactId)', ...functionImpactIdValidation },
    { name: 'Lists (listId)', ...listIdValidation },
    { name: 'Decision Tree (decisionId)', ...decisionIdValidation },
    { name: 'Roadmap (roadmapId)', ...roadmapIdValidation },
    { name: 'Verification Sources (verificationSourceId)', ...verificationIdValidation },
  ];

  console.log(`  ${'Sheet (ID field)'.padEnd(50)} ${'Total'.padStart(5)}  ${'OK'.padStart(4)}  ${'Miss'.padStart(4)}  ${'Dupes'.padStart(5)}  Status`);
  console.log(`  ${'─'.repeat(50)} ${'─'.repeat(5)}  ${'─'.repeat(4)}  ${'─'.repeat(4)}  ${'─'.repeat(5)}  ──────`);
  for (const r of idResults) {
    const status = r.missing === 0 && r.duplicates.length === 0 ? '✓' : '⚠';
    console.log(`  ${r.name.padEnd(50)} ${String(r.total).padStart(5)}  ${String(r.present).padStart(4)}  ${String(r.missing).padStart(4)}  ${String(r.duplicates.length).padStart(5)}  ${status}`);
  }

  // ── Unmapped Columns ──────────────────────────────────────
  const sheetsWithUnmapped = sheetReports.filter(r => r.unmapped.length > 0);
  if (sheetsWithUnmapped.length > 0) {
    console.log('\n── Unmapped Columns (not in field map) ───────────');
    for (const r of sheetsWithUnmapped) {
      console.log(`  ${r.name}:`);
      for (const col of r.unmapped) {
        console.log(`    - "${col}"`);
      }
    }
  } else {
    console.log('\n── Unmapped Columns ──────────────────────────────');
    console.log('  ✓ All workbook columns mapped for all explicitly-mapped sheets.');
  }

  // ── Warnings ──────────────────────────────────────────────
  if (warnings.length > 0) {
    console.log(`\n── Warnings (${warnings.length}) ──────────────────────────────`);
    for (const w of warnings) {
      console.log(`  ⚠ ${w}`);
    }
  } else {
    console.log('\n── Warnings ──────────────────────────────────────');
    console.log('  ✓ No warnings.');
  }

  // ── File Output Summary ───────────────────────────────────
  console.log('\n── Generated Files ───────────────────────────────');
  const jsonFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
  for (const f of jsonFiles) {
    const stat = fs.statSync(path.join(OUTPUT_DIR, f));
    console.log(`  ✓ ${f.padEnd(30)} ${(stat.size / 1024).toFixed(1)} KB`);
  }

  // ── Spot Check: CM-0001 ───────────────────────────────────
  console.log('\n── Spot Check: CM-0001 ───────────────────────────');
  const cm0001 = requirements.find(r => r.matrixRowId === 'CM-0001') as Record<string, unknown> | undefined;
  if (cm0001) {
    console.log(`  matrixRowId:                ${cm0001.matrixRowId}`);
    console.log(`  lawName:                    ${(cm0001.lawRegulationFrameworkStandardName as string || '').substring(0, 60)}`);
    console.log(`  severityPriority:           ${cm0001.severityPriority}`);
    console.log(`  launchCriticalFlag:         ${cm0001.launchCriticalFlag} (type: ${typeof cm0001.launchCriticalFlag})`);
    console.log(`  needsReviewFlag:            ${cm0001.needsReviewFlag} (type: ${typeof cm0001.needsReviewFlag})`);
    console.log(`  primaryPersonaViewer:       ${cm0001.primaryPersonaViewer}`);
    console.log(`  lifecycleStage:             ${cm0001.lifecycleStage}`);
    console.log(`  regulatoryDomain:           ${cm0001.regulatoryDomain}`);
    console.log(`  jurisdictionRegion:         ${cm0001.jurisdictionRegion}`);
    console.log(`  uiDisplaySummary (first 80): ${(cm0001.uiDisplaySummary as string || '').substring(0, 80)}...`);
    const fieldCount = Object.keys(cm0001).length;
    const nullCount = Object.values(cm0001).filter(v => v === null).length;
    console.log(`  Total fields:               ${fieldCount}`);
    console.log(`  Null fields:                ${nullCount}`);
    console.log(`  Populated fields:           ${fieldCount - nullCount}`);
  } else {
    console.log('  ⚠ CM-0001 not found!');
  }

  // ── Final Status ──────────────────────────────────────────
  const totalFiles = jsonFiles.length;
  const totalRows = sheetReports.reduce((sum, r) => sum + r.rows, 0) + dataDictionary.length + reviewDashboard.length + metadataSheet.length;
  const hasErrors = warnings.length > 0;
  
  console.log('\n══════════════════════════════════════════════════════════');
  console.log(`  ${hasErrors ? '⚠' : '✓'} IMPORT ${hasErrors ? 'COMPLETE WITH WARNINGS' : 'COMPLETE — ALL VALIDATIONS PASSED'}`);
  console.log(`  ${totalFiles} JSON files generated, ${totalRows} total rows across all sheets`);
  console.log('══════════════════════════════════════════════════════════\n');
}

main();
