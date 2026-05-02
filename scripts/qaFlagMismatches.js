/**
 * QA Script: Flag content mismatches in requirements.json
 * 
 * Identifies rows where interpretation/action text was clearly
 * copy-pasted from an unrelated source row. Sets needsReviewFlag=true
 * and adds a review note to openQuestionsMissingInformation.
 * 
 * Does NOT invent new regulatory content.
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'requirements.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Clinical IMP fallback text appearing in non-clinical rows
const CLINICAL_FALLBACK = 'Clinical supply processes must protect participants, trial integrity, blinding, and investigational product control.';

// Supplier/API action appearing in recall/complaint rows
const SUPPLIER_ACTION_FALLBACK = 'Qualify API suppliers, control receipt/quarantine, and maintain material/lab control evidence.';

// Rows where clinical IMP interpretation is legitimate (actual clinical regulations)
const CLINICAL_LEGITIMATE = ['CM-0030', 'CM-0033', 'CM-0053'];

// Rows where supplier/API action is legitimate (actual API/supplier oversight regulations)
const SUPPLIER_LEGITIMATE = ['CM-0007', 'CM-0044'];

const NOTE_CLINICAL = 'Potential content mapping mismatch — the plain-English interpretation references clinical supply/IMP processes, but this row covers a non-clinical regulation. Needs regulatory/content review.';
const NOTE_SUPPLIER = 'Potential content mapping mismatch — the required action references API supplier qualification, but this row covers complaint/recall obligations. Needs regulatory/content review.';

let changeCount = 0;

data.forEach(row => {
  const id = row.matrixRowId;
  let flagged = false;
  let note = null;

  // Check for clinical IMP fallback in non-clinical rows
  if (
    row.plainEnglishInterpretation === CLINICAL_FALLBACK &&
    !CLINICAL_LEGITIMATE.includes(id)
  ) {
    flagged = true;
    note = NOTE_CLINICAL;
    console.log(`[CLINICAL MISMATCH] ${id}: ${row.lawRegulationFrameworkStandardName} → "${row.level3RequirementArea}"`);
  }

  // Check for supplier/API action in recall/complaint rows
  if (
    row.requiredAction === SUPPLIER_ACTION_FALLBACK &&
    !SUPPLIER_LEGITIMATE.includes(id)
  ) {
    flagged = true;
    note = NOTE_SUPPLIER;
    console.log(`[ACTION MISMATCH] ${id}: ${row.lawRegulationFrameworkStandardName} → "${row.level3RequirementArea}"`);
  }

  if (flagged) {
    row.needsReviewFlag = true;

    // Append review note if not already present
    const existingNotes = row.openQuestionsMissingInformation || '';
    if (!existingNotes.includes('content mapping mismatch')) {
      row.openQuestionsMissingInformation = existingNotes === 'Not specified in source'
        ? note
        : existingNotes + ' | ' + note;
    }

    changeCount++;
  }
});

console.log(`\n--- Total rows flagged: ${changeCount} ---`);

// Write updated JSON
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log('Updated requirements.json written.');

// Print final Needs Review count
const reviewCount = data.filter(r => r.needsReviewFlag === true).length;
console.log(`Total Needs Review rows: ${reviewCount} / ${data.length}`);
