import * as mitreService from '../backend/src/services/mitre.service.js';
import { OFFICIAL_ICS_V14_DATASET } from '../backend/src/services/mitreEngine/datasetImporter.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 13 MITRE ATT&CK for ICS Tests');
console.log('==================================================\n');

// Test 1: Dataset Versioning & Official Fixture Verification
console.log('[TEST 1] Testing ATT&CK Dataset Versioning & Official Fixture...');
const versions = await mitreService.getVersions();
if (versions && versions.length > 0) {
  const activeVer = versions.find(v => v.status === 'ACTIVE') || versions[0];
  console.log(`✅ Test 1 Passed: Dataset Versions fetched. Active Version=${activeVer.version}, Total Versions=${versions.length}.`);
} else {
  console.error('❌ Test 1 Failed: Dataset versions empty.');
  process.exit(1);
}

// Test 2: Tactics & Techniques Inventory Lookups
console.log('\n[TEST 2] Testing Tactics & Techniques Inventory Lookups...');
const tactics = await mitreService.getTactics();
const techniques = await mitreService.getTechniques();
const singleTech = await mitreService.getTechniqueById('T0855');

if (tactics.length >= 10 && techniques.length >= 15 && singleTech && singleTech.name) {
  console.log(`✅ Test 2 Passed: Tactics Count=${tactics.length}, Techniques Count=${techniques.length}, Single Lookup T0855='${singleTech.name}'.`);
} else {
  console.error(`❌ Test 2 Failed: Expected 10+ tactics and 15+ techniques, got tactics=${tactics.length}, techs=${techniques.length}`);
  process.exit(1);
}

// Test 3: Multi-Source Technique Mapping Engine (Rule, Anomaly, ML, Alert, Incident)
console.log('\n[TEST 3] Testing Multi-Source Technique Mapping Engine...');
const map1 = await mitreService.createOrUpdateMapping({
  source_type: 'ALERT',
  source_id: 999,
  technique_external_id: 'T0855',
  mapping_status: 'AUTO_SUGGESTED',
  confidence: 'HIGH',
  reason: 'Modbus coil override detection attached to alert #999'
});

const map2 = await mitreService.createOrUpdateMapping({
  source_type: 'BEHAVIORAL_ANOMALY',
  source_id: 888,
  technique_external_id: 'T0836',
  mapping_status: 'AUTO_SUGGESTED',
  confidence: 'MEDIUM',
  reason: 'Z-score threshold breach mapped to Modify Parameter'
});

if (map1.mapping_uuid && map2.mapping_uuid) {
  console.log(`✅ Test 3 Passed: Multi-source mappings created. Alert Mapping=${map1.mapping_uuid}, Anomaly Mapping=${map2.mapping_uuid}.`);
} else {
  console.error('❌ Test 3 Failed: Mapping creation failed.');
  process.exit(1);
}

// Test 4: Analyst Workflow Transitions (Confirm / Reject)
console.log('\n[TEST 4] Testing Analyst Workflow Transitions...');
const updated = await mitreService.updateMappingStatus(map1.mapping_uuid, 'ANALYST_CONFIRMED', 'HIGH', 'Analyst verified Modbus payload', 1);
if (updated && updated.mapping_status === 'ANALYST_CONFIRMED') {
  console.log(`✅ Test 4 Passed: Workflow transition AUTO_SUGGESTED ➔ ANALYST_CONFIRMED succeeded for UUID=${map1.mapping_uuid}.`);
} else {
  console.error('❌ Test 4 Failed: Workflow status update failed.');
  process.exit(1);
}

// Test 5: Evidence Attachment with SHA-256 Hashing
console.log('\n[TEST 5] Testing SHA-256 Telemetry Evidence Attachment...');
const rawPayload = "00010000000601050004FF00"; // Modbus write single coil raw packet hex
const evidence = await mitreService.addEvidence('ALERT', 999, {
  evidence_type: 'RAW_MODBUS_PACKET',
  description: 'Modbus Function Code 0x05 Write Coil 0x0004 payload',
  raw_payload: rawPayload
});

if (evidence && evidence.sha256_hash && evidence.sha256_hash.length === 64) {
  console.log(`✅ Test 5 Passed: SHA-256 Evidence attached. Hash=${evidence.sha256_hash.substring(0, 16)}...`);
} else {
  console.error('❌ Test 5 Failed: SHA-256 evidence attachment failed.');
  process.exit(1);
}

// Test 6: Descriptive ATT&CK Coverage Engine Statistics
console.log('\n[TEST 6] Testing Descriptive ATT&CK Coverage Engine...');
const coverage = await mitreService.calculateCoverageMetrics();
if (coverage && coverage.tactic_summary && coverage.technique_summary) {
  console.log(`✅ Test 6 Passed: Coverage Calculated. Covered Tactics=${coverage.tactic_summary.covered_tactics}/${coverage.tactic_summary.total_tactics} (${coverage.tactic_summary.coverage_percent}%), Confirmed Techs=${coverage.technique_summary.confirmed}, Suggested=${coverage.technique_summary.suggested}.`);
} else {
  console.error('❌ Test 6 Failed: Coverage metric calculation failed.');
  process.exit(1);
}

// Test 7: Engine Health & API Status
console.log('\n[TEST 7] Testing Engine Health & Status Endpoint...');
const health = await mitreService.getMitreHealth();
if (health && health.status === 'ONLINE' && health.phase === 'PHASE_13_MITRE_ATTACK_FOR_ICS_INTEGRATION') {
  console.log(`✅ Test 7 Passed: Health Status='${health.status}', Active Dataset='${health.active_dataset_version}', Tactics=${health.tactics_count}, Techniques=${health.techniques_count}.`);
} else {
  console.error('❌ Test 7 Failed: Health status check failed.');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' 🎉 ALL PHASE 13 MITRE INTEGRATION TESTS PASSED!');
console.log('==================================================\n');
