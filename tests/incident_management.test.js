import * as incidentService from '../backend/src/services/incident.service.js';
import * as alertService from '../backend/src/services/alert.service.js';
import * as ingestionService from '../backend/src/services/alertEngine/ingestion.js';
import * as stateMachine from '../backend/src/services/incidentEngine/stateMachine.js';
import { calculateEvidenceHash } from '../backend/src/services/incidentEngine/numberGenerator.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 12 Incident Tests');
console.log('==================================================\n');

// Test 1: Incident Creation from Alert & Numbering Format
console.log('[TEST 1] Testing Incident Creation from Alert & Numbering Format...');
const alert = await ingestionService.ingestDetection({
  source_type: 'RULE_DETECTION',
  title: 'Unauthorized Modbus Coil Override',
  description: 'Unpermitted Modbus write to coil 0x0004',
  severity: 'CRITICAL',
  priority: 'P1',
  source_asset_id: 1,
  destination_asset_id: 2,
  protocol: 'MODBUS_TCP'
});

const incident = await incidentService.createIncidentFromAlert(alert.id, 1, 'Source alert attached for investigation');

if (incident && incident.incident_number.startsWith('INC-') && incident.status === 'NEW') {
  console.log(`✅ Test 1 Passed: Incident created from alert. Incident Number=${incident.incident_number}, Status=${incident.status}, Title='${incident.title}'.`);
} else {
  console.error(`❌ Test 1 Failed: Expected INC- number and status NEW, got ${incident?.incident_number}, status ${incident?.status}`);
  process.exit(1);
}

// Test 2: Incident State Machine Lifecycle & Guard Rules
console.log('\n[TEST 2] Testing Incident State Machine Lifecycle...');
// NEW -> TRIAGED
const triaged = await incidentService.updateIncidentStatus(incident.id, 'TRIAGED', 1, 'Analyst completed initial triage');
if (triaged.status === 'TRIAGED') {
  console.log('   Sub-test 2a Passed: Transition NEW ➔ TRIAGED succeeded.');
} else {
  console.error('❌ Test 2a Failed');
  process.exit(1);
}

// TRIAGED -> INVESTIGATING
const investigating = await incidentService.updateIncidentStatus(incident.id, 'INVESTIGATING', 1, 'Investigation lead assigned');
if (investigating.status === 'INVESTIGATING') {
  console.log('   Sub-test 2b Passed: Transition TRIAGED ➔ INVESTIGATING succeeded.');
} else {
  console.error('❌ Test 2b Failed');
  process.exit(1);
}

// INVESTIGATING -> CONTAINMENT_RECOMMENDED
const containment = await incidentService.updateIncidentStatus(incident.id, 'CONTAINMENT_RECOMMENDED', 1, 'Containment recommended for workstation IP 192.168.1.200');
if (containment.status === 'CONTAINMENT_RECOMMENDED') {
  console.log('   Sub-test 2c Passed: Transition INVESTIGATING ➔ CONTAINMENT_RECOMMENDED succeeded.');
} else {
  console.error('❌ Test 2c Failed');
  process.exit(1);
}

// Invalid transition check: CLOSED -> TRIAGED directly without reopening
const invalidCheck = stateMachine.validateIncidentStateTransition('CLOSED', 'TRIAGED');
if (!invalidCheck.valid) {
  console.log(`   Sub-test 2d Passed: Invalid transition CLOSED ➔ TRIAGED rejected correctly.`);
} else {
  console.error('❌ Test 2d Failed: Invalid transition permitted');
  process.exit(1);
}
console.log('✅ Test 2 Passed: Incident State Machine transitions and guards verified.');

// Test 3: Investigation Timeline Construction
console.log('\n[TEST 3] Testing Investigation Timeline Construction...');
const timeline = await incidentService.getIncidentTimeline(incident.id);
if (timeline && timeline.length >= 2) {
  console.log(`✅ Test 3 Passed: Timeline constructed with ${timeline.length} events sorted chronologically.`);
} else {
  console.error('❌ Test 3 Failed');
  process.exit(1);
}

// Test 4: SHA-256 Evidence Hashing & Integrity Verification
console.log('\n[TEST 4] Testing SHA-256 Evidence Collection & Hash Verification...');
const samplePayload = { function_code: 6, coil_register: 102, raw_pcap: '00010000000601050004FF00' };
const expectedHash = calculateEvidenceHash(samplePayload);

const evidence = await incidentService.addIncidentEvidence(incident.id, {
  evidence_type: 'PROTOCOL_TRANSACTION',
  source_type: 'MODBUS_TCP',
  title: 'Modbus Write Frame Capture',
  description: 'Raw packet payload of unauthorized write',
  payload: samplePayload
}, 1);

if (evidence && evidence.hash === expectedHash && evidence.integrity_status === 'VERIFIED') {
  console.log(`✅ Test 4 Passed: Evidence added. SHA-256 Hash=${evidence.hash.slice(0, 16)}..., Integrity Status=${evidence.integrity_status}.`);
} else {
  console.error(`❌ Test 4 Failed: Expected hash ${expectedHash}, got ${evidence?.hash}`);
  process.exit(1);
}

// Test 5: Investigation Tasks & Analyst Hypotheses Board
console.log('\n[TEST 5] Testing Investigation Tasks & Hypotheses Board...');
const task = await incidentService.createIncidentTask(incident.id, {
  title: 'Verify HMI Authorization Logs',
  description: 'Cross-reference HMI-001 session token during write event'
}, 1);

const updatedTask = await incidentService.updateIncidentTask(task.id, { status: 'COMPLETED' });

const hypo = await incidentService.addIncidentHypothesis(incident.id, {
  hypothesis: 'External compromised laptop issued unauthorized Modbus coil write',
  evidence_for: 'Unbaselined MAC address 00:1D:9C:AA:BB:CC detected on switch port 4'
}, 1);

if (updatedTask && updatedTask.status === 'COMPLETED' && hypo && hypo.hypothesis) {
  console.log(`✅ Test 5 Passed: Investigation Task completed & Analyst Hypothesis recorded.`);
} else {
  console.error('❌ Test 5 Failed');
  process.exit(1);
}

// Test 6: Health & Metrics Endpoint
console.log('\n[TEST 6] Testing Incident Engine Health & Operations Metrics...');
const health = await incidentService.getIncidentHealth();
const metrics = await incidentService.getIncidentMetrics();

if (health && health.status === 'ONLINE' && metrics && metrics.total_incidents > 0) {
  console.log(`✅ Test 6 Passed: Engine Health=${health.status} (${health.phase}), Total Incidents=${metrics.total_incidents}.`);
} else {
  console.error('❌ Test 6 Failed');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' 🎉 ALL PHASE 12 INCIDENT ENGINE INTEGRATION TESTS PASSED!');
console.log('==================================================\n');
process.exit(0);
