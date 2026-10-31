import * as alertService from '../backend/src/services/alert.service.js';
import * as ingestionService from '../backend/src/services/alertEngine/ingestion.js';
import * as suppressionService from '../backend/src/services/alertEngine/suppression.js';
import * as stateMachine from '../backend/src/services/alertEngine/stateMachine.js';
import * as slaService from '../backend/src/services/alertEngine/sla.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 11 Alert Tests');
console.log('==================================================\n');

// Test 1: Ingestion & Normalization of Detections (Phase 8 Rule, Phase 9 Behavioral, Phase 10 ML)
console.log('[TEST 1] Testing Multi-Source Detection Ingestion & Normalization...');
const p8Detection = await ingestionService.ingestDetection({
  source_type: 'RULE_DETECTION',
  title: 'Unauthorized Modbus Write to Register 102',
  description: 'Phase 8 Rule 1 matched coil write without auth token',
  category: 'COMMAND_ANOMALY',
  severity: 'HIGH',
  source_asset_id: 1,
  destination_asset_id: 2,
  protocol: 'MODBUS_TCP',
  rule_id: 1
});

if (p8Detection && p8Detection.status === 'NEW' && p8Detection.priority === 'P2') {
  console.log(`✅ Test 1a Passed: Phase 8 Rule Ingested. Title='${p8Detection.title}', Priority=${p8Detection.priority}, Status=${p8Detection.status}`);
} else {
  console.error('❌ Test 1a Failed');
  process.exit(1);
}

const p9Anomaly = await ingestionService.ingestDetection({
  source_type: 'BEHAVIORAL_ANOMALY',
  title: 'Behavioral Anomaly: request_rate',
  description: 'Phase 9 Behavioral Engine observed Z-score 5.2σ request spike',
  category: 'BEHAVIORAL_ANOMALY',
  severity: 'MEDIUM',
  source_asset_id: 1,
  destination_asset_id: 2,
  protocol: 'MODBUS_TCP',
  behavioral_anomaly_id: 2
});

if (p9Anomaly && p9Anomaly.status === 'NEW') {
  console.log(`✅ Test 1b Passed: Phase 9 Behavioral Anomaly Ingested. Title='${p9Anomaly.title}'`);
} else {
  console.error('❌ Test 1b Failed');
  process.exit(1);
}

// Test 2: Deduplication Logic (Repeated identical detection within 60s window)
console.log('\n[TEST 2] Testing Deduplication Engine (Occurrence Counter)...');
const repeatDetection = await ingestionService.ingestDetection({
  source_type: 'RULE_DETECTION',
  title: 'Unauthorized Modbus Write to Register 102',
  description: 'Phase 8 Rule 1 matched coil write without auth token',
  category: 'COMMAND_ANOMALY',
  severity: 'HIGH',
  source_asset_id: 1,
  destination_asset_id: 2,
  protocol: 'MODBUS_TCP',
  rule_id: 1
});

if (repeatDetection.id === p8Detection.id && repeatDetection.occurrence_count >= 2) {
  console.log(`✅ Test 2 Passed: Deduplication verified. Occurrence count incremented to ${repeatDetection.occurrence_count} without duplicating alert record.`);
} else {
  console.error(`❌ Test 2 Failed: Expected existing alert ID ${p8Detection.id}, got ID ${repeatDetection.id} with occurrence ${repeatDetection.occurrence_count}`);
  process.exit(1);
}

// Test 3: Alert Lifecycle State Machine & Invalid Transition Prevention
console.log('\n[TEST 3] Testing Alert Lifecycle State Machine...');
// Valid transition: NEW -> ACKNOWLEDGED
const ackAlert = await alertService.updateAlertStatus(p8Detection.id, 'ACKNOWLEDGED', 1, 'Analyst acknowledged alert');
if (ackAlert.status === 'ACKNOWLEDGED') {
  console.log('   Sub-test 3a Passed: Transition NEW ➔ ACKNOWLEDGED succeeded.');
} else {
  console.error('❌ Test 3a Failed');
  process.exit(1);
}

// Valid transition: ACKNOWLEDGED -> ESCALATED
const escAlert = await alertService.escalateAlert(p8Detection.id, 'P1', 1, 'Critical process asset impacted');
if (escAlert.priority === 'P1' && escAlert.status === 'ESCALATED') {
  console.log('   Sub-test 3b Passed: Escalated priority to P1.');
} else {
  console.error('❌ Test 3b Failed');
  process.exit(1);
}

// Invalid transition check: CLOSED -> ACKNOWLEDGED directly without reopening
const invalidCheck = stateMachine.validateStateTransition('CLOSED', 'ACKNOWLEDGED');
if (!invalidCheck.valid) {
  console.log(`   Sub-test 3c Passed: Invalid transition CLOSED ➔ ACKNOWLEDGED rejected correctly.`);
} else {
  console.error('❌ Test 3c Failed: Invalid transition was permitted');
  process.exit(1);
}
console.log('✅ Test 3 Passed: State Machine transitions and guards verified.');

// Test 4: SLA Deadlines Calculation
console.log('\n[TEST 4] Testing SLA Target Deadlines...');
const p1Sla = slaService.calculateSLADeadlines('P1');
const p3Sla = slaService.calculateSLADeadlines('P3');

if (p1Sla.target_ack_minutes === 5 && p3Sla.target_ack_minutes === 30) {
  console.log(`✅ Test 4 Passed: SLA deadlines calculated correctly. P1 Ack Target=${p1Sla.target_ack_minutes}m, P3 Ack Target=${p3Sla.target_ack_minutes}m.`);
} else {
  console.error('❌ Test 4 Failed');
  process.exit(1);
}

// Test 5: Analyst Notes Append-Only Tracking
console.log('\n[TEST 5] Testing Analyst Notes...');
const note = await alertService.addAlertNote(p8Detection.id, 1, 'soc_analyst', 'Inspected PLC-001 coil register 102. Value restored.');
const notes = await alertService.getAlertNotes(p8Detection.id);

if (notes && notes.length > 0 && notes[0].note.includes('Inspected PLC-001')) {
  console.log(`✅ Test 5 Passed: Analyst note appended successfully.`);
} else {
  console.error('❌ Test 5 Failed');
  process.exit(1);
}

// Test 6: Alert Health & Metrics
console.log('\n[TEST 6] Testing Alert Operations Health & Metrics Summary...');
const health = await alertService.getAlertHealth();
const metrics = await alertService.getAlertMetrics();

if (health && health.status === 'ONLINE' && metrics && metrics.total_alerts > 0) {
  console.log(`✅ Test 6 Passed: Alert Engine Health=${health.status} (${health.phase}), Total Alerts=${metrics.total_alerts}.`);
} else {
  console.error('❌ Test 6 Failed');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' 🎉 ALL PHASE 11 ALERT ENGINE INTEGRATION TESTS PASSED!');
console.log('==================================================\n');
process.exit(0);
