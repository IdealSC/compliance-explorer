// Quick verification: count how many requirements each persona captures
// Run: npx tsx scripts/verifyPersonaMatching.ts

import { getRequirements } from '../src/lib/data';
import { getRelevantPersonas, getAllPersonaOptions } from '../src/lib/persona-matching';

const reqs = getRequirements();

// Count by primary persona only
const primaryOnly = new Map<string, number>();
for (const req of reqs) {
  const p = req.primaryPersonaViewer || '(none)';
  primaryOnly.set(p, (primaryOnly.get(p) || 0) + 1);
}

console.log('=== PRIMARY PERSONA ONLY (old behavior) ===');
for (const [persona, count] of primaryOnly) {
  console.log(`  ${persona}: ${count}`);
}

// Count by derived personas
const derived = new Map<string, number>();
for (const req of reqs) {
  for (const p of getRelevantPersonas(req)) {
    derived.set(p, (derived.get(p) || 0) + 1);
  }
}

console.log('\n=== DERIVED PERSONA MATCHING (new behavior) ===');
for (const [persona, count] of derived) {
  console.log(`  ${persona}: ${count}`);
}

console.log('\n=== ALL PERSONA OPTIONS ===');
console.log(getAllPersonaOptions(reqs));
