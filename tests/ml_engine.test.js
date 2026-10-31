import * as mlService from '../backend/src/services/mlEngine.service.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 10 ML Tests');
console.log('==================================================\n');

// Test 1: Real-Time Prediction & Score Calibration (Normal Baseline Observation)
console.log('[TEST 1] Testing ML Inference & Calibration (Normal Telemetry)...');
const normalObs = {
  source_asset_id: 1,
  destination_asset_id: 2,
  protocol: 'MODBUS_TCP',
  request_rate_per_sec: 2.3,
  latency_ms: 12.5,
  process_value: 50.2,
  is_write_function: false
};

const normalPred = await mlService.predict(normalObs);

if (normalPred && normalPred.status === 'NORMAL' && normalPred.normalized_score < 45.0) {
  console.log(`✅ Test 1 Passed: Normal telemetry correctly classified as ${normalPred.status} with calibrated score ${normalPred.normalized_score}/100.`);
} else {
  console.error(`❌ Test 1 Failed: Expected NORMAL status with score < 45, got status=${normalPred?.status}, score=${normalPred?.normalized_score}`);
  process.exit(1);
}

// Test 2: Real-Time Prediction & Score Calibration (Anomalous Observation)
console.log('\n[TEST 2] Testing ML Inference & Calibration (Anomalous Telemetry Spike)...');
const anomalyObs = {
  source_asset_id: 1,
  destination_asset_id: 2,
  protocol: 'MODBUS_TCP',
  request_rate_per_sec: 45.0, // High request rate anomaly
  latency_ms: 250.0,          // High latency anomaly
  process_value: 99.8,
  is_write_function: true
};

const anomalyPred = await mlService.predict(anomalyObs);

if (anomalyPred && anomalyPred.status === 'ANOMALOUS' && anomalyPred.normalized_score >= 60.0) {
  console.log(`✅ Test 2 Passed: Anomalous telemetry correctly classified as ${anomalyPred.status} with calibrated score ${anomalyPred.normalized_score}/100.`);
} else {
  console.error(`❌ Test 2 Failed: Expected ANOMALOUS status with score >= 60, got status=${anomalyPred?.status}, score=${anomalyPred?.normalized_score}`);
  process.exit(1);
}

// Test 3: Model Registry Lifecycle State Transitions (Activate, Retire, Rollback)
console.log('\n[TEST 3] Testing Model Registry State Transitions...');
const models = await mlService.getModels();
if (models.length >= 2) {
  const model1 = models[0];
  const model2 = models[1];
  
  // Activate Model 2
  const activated = await mlService.activateModel(model2.id);
  if (activated && activated.status === 'ACTIVE') {
    console.log(`   Sub-test 3a Passed: Model ID ${model2.id} (${model2.model_name}) activated.`);
  } else {
    console.error(`❌ Test 3a Failed: Model ID ${model2.id} status is not ACTIVE`);
    process.exit(1);
  }

  // Rollback / Re-activate Model 1
  const rolledBack = await mlService.rollbackModel(model1.id);
  if (rolledBack && rolledBack.status === 'ACTIVE') {
    console.log(`   Sub-test 3b Passed: Model ID ${model1.id} (${model1.model_name}) successfully restored to ACTIVE.`);
  } else {
    console.error(`❌ Test 3b Failed: Model ID ${model1.id} rollback failed`);
    process.exit(1);
  }
  
  console.log('✅ Test 3 Passed: Model registry lifecycle state transitions verified.');
} else {
  console.error('❌ Test 3 Failed: Insufficient models in registry');
  process.exit(1);
}

// Test 4: Model Training Workflow Simulation
console.log('\n[TEST 4] Testing Model Training Workflow & Dataset Linkage...');
const trainResult = await mlService.trainModel(1, 'ISOLATION_FOREST', { n_estimators: 100, contamination: 0.02 });
if (trainResult && trainResult.job && trainResult.job.status === 'COMPLETED' && trainResult.model) {
  console.log(`✅ Test 4 Passed: Model training completed. Job ID: ${trainResult.job.job_uuid}, New Model: ${trainResult.model.model_name}.`);
} else {
  console.error('❌ Test 4 Failed');
  process.exit(1);
}

// Test 5: ML Engine Health & SOC Metrics Reporting
console.log('\n[TEST 5] Testing ML Engine Health & Metrics Summary...');
const health = await mlService.getMLHealth();
const metrics = await mlService.getMLMetrics();

if (health && health.status === 'ONLINE' && metrics && metrics.total_predictions > 0) {
  console.log(`✅ Test 5 Passed: Health=${health.status} (${health.active_model}), Total Predictions recorded=${metrics.total_predictions}.`);
} else {
  console.error('❌ Test 5 Failed');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' 🎉 ALL PHASE 10 ML ENGINE INTEGRATION TESTS PASSED!');
console.log('==================================================\n');
process.exit(0);
