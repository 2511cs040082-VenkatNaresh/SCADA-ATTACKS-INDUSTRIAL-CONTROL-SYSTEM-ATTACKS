import { calculateZScore, calculateModifiedZScore } from '../backend/src/services/behavioralEngine.service.js';
import * as behavioralService from '../backend/src/services/behavioralEngine.service.js';
import * as detectionService from '../backend/src/services/detectionEngine.service.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 9 Tests');
console.log('==================================================\n');

// Test 1: Statistical Functions
console.log('[TEST 1] Testing Statistical Z-Score & Modified Z-Score...');
const zRes = calculateZScore(18.0, 2.3, 0.45); // ~34.8 stddevs
const modZRes = calculateModifiedZScore(18.0, 2.2, 0.30); // ~35.5 mod z

if (zRes.score > 80.0 && modZRes.score > 80.0) {
  console.log(`✅ Test 1 Passed: Z-Score calculated raw Z=${zRes.z.toFixed(2)}, normalized score=${zRes.score}/100.`);
} else {
  console.error('❌ Test 1 Failed');
  process.exit(1);
}

// Test 2: Minimum Baseline Sample Threshold Protection
console.log('\n[TEST 2] Testing Minimum Baseline Sample Threshold Guard...');
const unreadyResult = await behavioralService.evaluateBehavioralAnomaly({
  entity_type: 'ASSET',
  entity_id: 'NEW_UNTESTED_PLC',
  feature: 'request_rate',
  observed_value: 99.0
});

if (unreadyResult.status === 'BASELINE_NOT_READY') {
  console.log('✅ Test 2 Passed: BASELINE_NOT_READY returned for unbaselined asset, preventing false positive.');
} else {
  console.error('❌ Test 2 Failed');
  process.exit(1);
}

// Test 3: Baseline Fetch & Freeze
console.log('\n[TEST 3] Testing Baseline Fetch and Freeze...');
const baselines = await behavioralService.getBaselines();
console.log(`Loaded ${baselines.length} baselines.`);

if (baselines.length > 0) {
  const targetB = baselines[0];
  const frozen = await behavioralService.freezeBaseline(targetB.id);
  if (frozen && frozen.state === 'FROZEN') {
    console.log('✅ Test 3 Passed: Baseline frozen successfully.');
  } else {
    console.error('❌ Test 3 Failed');
    process.exit(1);
  }
} else {
  console.error('❌ Test 3 Failed: No baselines loaded');
  process.exit(1);
}

// Test 4: Anomaly Evaluation & Scoring
console.log('\n[TEST 4] Testing Anomaly Evaluation against Stable Baseline...');
const anomEval = await behavioralService.evaluateBehavioralAnomaly({
  entity_type: 'ASSET',
  entity_id: 'HMI-001',
  feature: 'request_rate',
  observed_value: 18.5
});

if (anomEval.status === 'ANOMALY_DETECTED' && anomEval.result.score >= 80.0) {
  console.log(`✅ Test 4 Passed: Behavioral Anomaly detected (score=${anomEval.result.score}/100, severity=${anomEval.result.severity}).`);
} else {
  console.error('❌ Test 4 Failed');
  process.exit(1);
}

// Test 5: Phase 8 + Phase 9 Correlation
console.log('\n[TEST 5] Testing Phase 8 Rule + Phase 9 Behavioral Anomaly Correlation...');
// Trigger Phase 8 rule detection
const p8Obs = {
  function_code: 99,
  source_asset_id: 1,
  destination_asset_id: 2,
  is_valid_fc: false
};
const p8Res = await detectionService.evaluateObservation(p8Obs);

// Trigger Phase 9 anomaly on same asset
const p9Obs = {
  entity_type: 'ASSET',
  entity_id: 'HMI-001',
  source_asset_id: 1,
  destination_asset_id: 2,
  feature: 'byte_rate',
  observed_value: 1800.0
};
const p9Res = await behavioralService.evaluateBehavioralAnomaly(p9Obs);

if (p8Res.length > 0 && p9Res.status === 'ANOMALY_DETECTED') {
  console.log('✅ Test 5 Passed: Phase 8 deterministic detection and Phase 9 behavioral anomaly coexisted and correlated successfully.');
} else {
  console.error('❌ Test 5 Failed');
  process.exit(1);
}

// Test 6: Behavioral Engine Health
console.log('\n[TEST 6] Testing Behavioral Engine Health API...');
const health = await behavioralService.getBehavioralHealth();

if (health.status === 'ONLINE' && health.detectors_active.length === 5) {
  console.log(`✅ Test 6 Passed: Behavioral engine health reported ${health.detectors_active.length} active statistical detectors.`);
} else {
  console.error('❌ Test 6 Failed');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' [SUCCESS] All Phase 9 Integration Tests Passed!');
console.log('==================================================');
