import { calculateHealthScore } from '../backend/src/services/assetHealth.service.js';
import { calculateRiskScore } from '../backend/src/services/assetRisk.service.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 5 & 6 Tests');
console.log('==================================================\n');

// Test 1: Health Score Calculation
console.log('[TEST 1] Testing Health Score Calculation...');
const freshHealth = calculateHealthScore(new Date().toISOString(), 'ONLINE');
console.log(`Fresh Online Health: Score=${freshHealth.score}, State=${freshHealth.state}`);
if (freshHealth.score === 100 && freshHealth.state === 'HEALTHY') {
  console.log('✅ Test 1 Passed: Fresh online asset health is 100% HEALTHY');
} else {
  console.error('❌ Test 1 Failed');
  process.exit(1);
}

// Test 2: Offline Asset Health
console.log('\n[TEST 2] Testing Offline Asset Health...');
const offlineDate = new Date(Date.now() - 60000).toISOString();
const offlineHealth = calculateHealthScore(offlineDate, 'OFFLINE');
console.log(`Offline Health: Score=${offlineHealth.score}, State=${offlineHealth.state}`);
if (offlineHealth.score === 0 && offlineHealth.state === 'OFFLINE') {
  console.log('✅ Test 2 Passed: Offline asset health is 0% OFFLINE');
} else {
  console.error('❌ Test 2 Failed');
  process.exit(1);
}

// Test 3: Risk Score Calculation
console.log('\n[TEST 3] Testing Risk Score Calculation...');
const criticalRisk = calculateRiskScore('CRITICAL', 2, 'HEALTHY');
console.log(`Critical Risk: Score=${criticalRisk.score}, Level=${criticalRisk.level}`);
if (criticalRisk.level === 'HIGH' || criticalRisk.level === 'CRITICAL') {
  console.log('✅ Test 3 Passed: Critical asset with anomalies assigned HIGH/CRITICAL risk posture');
} else {
  console.error('❌ Test 3 Failed');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' [SUCCESS] All Phase 5 & 6 Logic Tests Passed!');
console.log('==================================================');
