import { evaluateCondition } from '../backend/src/services/conditionEvaluator.js';
import * as detectionService from '../backend/src/services/detectionEngine.service.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 8 Tests');
console.log('==================================================\n');

// Test 1: Condition Evaluator Operators
console.log('[TEST 1] Testing Structured Condition Evaluator Operators...');
const eqTest = evaluateCondition({ field: 'function_code', operator: '==', value: 5 }, { function_code: 5 });
const neqTest = evaluateCondition({ field: 'source_role', operator: '!=', value: 'HMI' }, { source_role: 'ATTACKER' });
const gtTest = evaluateCondition({ field: 'rate', operator: '>', value: 50 }, { rate: 75 });
const inTest = evaluateCondition({ field: 'status', operator: 'IN', value: ['CRITICAL', 'DEGRADED'] }, { status: 'CRITICAL' });
const notInTest = evaluateCondition({ field: 'fc', operator: 'NOT_IN', value: [1, 2, 3] }, { fc: 99 });

if (eqTest && neqTest && gtTest && inTest && notInTest) {
  console.log('✅ Test 1 Passed: All condition operators evaluated correctly (no eval used).');
} else {
  console.error('❌ Test 1 Failed');
  process.exit(1);
}

// Test 2: Logical AND & OR Conditions
console.log('\n[TEST 2] Testing Logical Groups (AND / OR)...');
const andCond = {
  logical: 'AND',
  conditions: [
    { field: 'is_write_function', operator: '==', value: true },
    { field: 'source_role', operator: '!=', value: 'HMI' }
  ]
};
const andMatch = evaluateCondition(andCond, { is_write_function: true, source_role: 'ENGINEERING_STATION' });
const andNoMatch = evaluateCondition(andCond, { is_write_function: true, source_role: 'HMI' });

if (andMatch && !andNoMatch) {
  console.log('✅ Test 2 Passed: Logical AND conditions evaluated correctly.');
} else {
  console.error('❌ Test 2 Failed');
  process.exit(1);
}

// Test 3: Verify the 13 Initial Detection Rules
console.log('\n[TEST 3] Testing 13 Initial Detection Rules Setup...');
const rules = await detectionService.getRules();
console.log(`Loaded ${rules.length} rules from Detection Service.`);

if (rules.length === 13) {
  console.log('✅ Test 3 Passed: All 13 Phase 8 defensive rules loaded successfully.');
} else {
  console.error(`❌ Test 3 Failed: Expected 13 rules, got ${rules.length}`);
  process.exit(1);
}

// Test 4: Dry Run Test Execution
console.log('\n[TEST 4] Testing Dry-Run Rule Evaluator...');
const testCond = { field: 'function_code', operator: 'NOT_IN', value: [1, 2, 3, 4, 5, 6, 15, 16] };
const dryRunRes = detectionService.testRule(testCond, { function_code: 99 });

if (dryRunRes.matched && dryRunRes.evidence.result === 'MATCH') {
  console.log('✅ Test 4 Passed: Dry-run evaluator returned correct match response.');
} else {
  console.error('❌ Test 4 Failed');
  process.exit(1);
}

// Test 5: Live Observation Pipeline Evaluation & Deduplication
console.log('\n[TEST 5] Testing Live Observation Evaluation & Deduplication Cooldown...');
const testObservation = {
  function_code: 99,
  source_ip: '192.168.1.200',
  destination_ip: '192.168.1.10',
  is_valid_fc: false
};

const firstPass = await detectionService.evaluateObservation(testObservation);
console.log(`First evaluation trigger count: ${firstPass.length} detections.`);

// Immediate re-evaluation should be suppressed due to cooldown window
const secondPass = await detectionService.evaluateObservation(testObservation);
console.log(`Second evaluation (cooldown active) trigger count: ${secondPass.length} detections.`);

if (firstPass.length > 0 && secondPass.length === 0) {
  console.log('✅ Test 5 Passed: Detection generated on first trigger and correctly suppressed during cooldown window.');
} else {
  console.error('❌ Test 5 Failed');
  process.exit(1);
}

// Test 6: Analyst Feedback Submission
console.log('\n[TEST 6] Testing Analyst Feedback Submission...');
const detections = await detectionService.getDetections();
if (detections.length > 0) {
  const targetDet = detections[0];
  const updatedDet = await detectionService.submitFeedback(targetDet.id, 1, 'TRUE_POSITIVE', 'Verified malicious Modbus FC 99 scan');
  if (updatedDet && (updatedDet.status === 'TRUE_POSITIVE' || updatedDet.analyst_feedback === 'TRUE_POSITIVE')) {
    console.log('✅ Test 6 Passed: Analyst feedback recorded successfully.');
  } else {
    console.error('❌ Test 6 Failed');
    process.exit(1);
  }
} else {
  console.log('⚠️ Test 6 Skipped (no detections created)');
}

console.log('\n==================================================');
console.log(' [SUCCESS] All Phase 8 Integration Tests Passed!');
console.log('==================================================');
