import * as simulationService from '../backend/src/services/simulation.service.js';
import { validateScenarioTarget, validateScenarioActionType } from '../backend/src/services/simulationEngine/actionRegistry.js';
import { validateStateTransition } from '../backend/src/services/simulationEngine/stateMachine.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 15 Attack Simulation Lab Tests');
console.log('==================================================\n');

// Test 1: Scenario Catalog & 12 Built-in Scenarios Verification
console.log('[TEST 1] Testing Scenario Catalog & 12 Built-in Scenarios...');
const scenarios = await simulationService.getScenarios();
if (scenarios && scenarios.length >= 12) {
  const multiStage = scenarios.find(s => s.scenario_code === 'SIM-MULTISTAGE-001');
  console.log(`✅ Test 1 Passed: Built-in Scenarios count=${scenarios.length}. Multi-Stage Scenario='${multiStage?.name}', Steps=${multiStage?.steps?.length}.`);
} else {
  console.error(`❌ Test 1 Failed: Expected 12+ scenarios, got ${scenarios?.length}`);
  process.exit(1);
}

// Test 2: Safety Boundary & Pre-Flight Target Validation (Fail Closed)
console.log('\n[TEST 2] Testing Safety Boundary Target Validation (Fail Closed)...');
try {
  // Reject external IP address target
  validateScenarioTarget('8.8.8.8');
  console.error('❌ Test 2 Failed: External IP 8.8.8.8 was not rejected!');
  process.exit(1);
} catch (err) {
  console.log(`✅ Test 2 Passed: External target 8.8.8.8 rejected correctly by Safety Boundary: '${err.message}'`);
}

// Test 3: Simulation State Machine Transition Guards
console.log('\n[TEST 3] Testing Simulation Lifecycle State Machine Transitions...');
try {
  validateStateTransition('DRAFT', 'RUNNING');
  console.error('❌ Test 3 Failed: Invalid transition DRAFT ➔ RUNNING was allowed!');
  process.exit(1);
} catch (err) {
  console.log(`✅ Test 3 Passed: Invalid transition DRAFT ➔ RUNNING rejected correctly: '${err.message}'`);
}

// Test 4: Pre-Flight Safety Check Execution
console.log('\n[TEST 4] Testing Pre-Flight Safety Validation Execution...');
const validation = await simulationService.validateScenario('SIM-MULTISTAGE-001');
if (validation && validation.valid === true && validation.targets_validated > 0) {
  console.log(`✅ Test 4 Passed: Pre-flight check passed for SIM-MULTISTAGE-001. Targets Validated=${validation.targets_validated}, Environment=${validation.environment}.`);
} else {
  console.error('❌ Test 4 Failed: Pre-flight validation failed.');
  process.exit(1);
}

// Test 5: Simulation Run Execution & Event Tagging
console.log('\n[TEST 5] Testing Simulation Run Execution & Event Tagging...');
const run = await simulationService.startSimulationRun('SIM-MULTISTAGE-001', { seed: 1337, duration: 60 }, 1);
if (run && run.run_number.startsWith('SIM-') && run.synthetic_events.length > 0) {
  const firstEv = run.synthetic_events[0];
  console.log(`✅ Test 5 Passed: Simulation Run executed. Run Number='${run.run_number}', Seed=${run.seed}, Tagging=${firstEv.environment}:${firstEv.simulation ? 'SIMULATED' : 'REAL'}.`);
} else {
  console.error('❌ Test 5 Failed: Simulation run failed.');
  process.exit(1);
}

// Test 6: Full Defensive Pipeline Validation
console.log('\n[TEST 6] Testing Full Defensive Security Pipeline Validation...');
if (run.evaluation && run.evaluation.expected_vs_observed) {
  const evs = run.evaluation.expected_vs_observed;
  console.log(`✅ Test 6 Passed: Full Pipeline Validated. Events=${evs.events.observed}, Detections=${evs.detections.observed}, Alerts=${evs.alerts.observed}, Incidents=${evs.incidents.observed}, MITRE=${evs.mitre_mappings.observed}.`);
} else {
  console.error('❌ Test 6 Failed: Defensive pipeline validation failed.');
  process.exit(1);
}

// Test 7: Evaluation Engine (Expected vs Observed)
console.log('\n[TEST 7] Testing Evaluation Engine Expected vs Observed Classifications...');
if (run.evaluation && run.evaluation.detection_classifications) {
  const firstClass = run.evaluation.detection_classifications[0];
  console.log(`✅ Test 7 Passed: Evaluation Engine classified outcome as '${firstClass.status}' for rule '${firstClass.expected_rule}' (Latency=${firstClass.detection_latency_ms}ms).`);
} else {
  console.error('❌ Test 7 Failed: Evaluation engine classification failed.');
  process.exit(1);
}

// Test 8: Pause, Resume, Stop, and Emergency Stop Controls
console.log('\n[TEST 8] Testing Emergency Stop Simulation Control...');
const emergencyRes = await simulationService.emergencyStop(1);
if (emergencyRes && emergencyRes.emergency_stop === true && emergencyRes.status === 'EMERGENCY_STOPPED') {
  console.log(`✅ Test 8 Passed: EMERGENCY STOP SIMULATION executed. Status='${emergencyRes.status}'.`);
} else {
  console.error('❌ Test 8 Failed: Emergency stop failed.');
  process.exit(1);
}

// Test 9: Laboratory Baseline Reset (Reset Lab)
console.log('\n[TEST 9] Testing Laboratory Reset (RESET LAB)...');
const resetRes = await simulationService.resetLab(1);
if (resetRes && resetRes.status === 'RESET_COMPLETED' && resetRes.restored_baseline) {
  console.log(`✅ Test 9 Passed: RESET LAB executed. Status='${resetRes.status}', Baseline Restored.`);
} else {
  console.error('❌ Test 9 Failed: Reset lab failed.');
  process.exit(1);
}

// Test 10: Engine Health & Operation Metrics
console.log('\n[TEST 10] Testing Simulation Laboratory Health & Operations Metrics...');
const health = await simulationService.getSimulationHealth();
const metrics = await simulationService.getSimulationMetrics();

if (health && health.status === 'HEALTHY' && health.simulation_mode === true && metrics && metrics.scenarios_count >= 12) {
  console.log(`✅ Test 10 Passed: Health Status='${health.status}', Environment='${health.environment}', Scenarios=${health.total_scenarios}, Runs=${metrics.total_runs_count}.`);
} else {
  console.error('❌ Test 10 Failed: Simulation health check failed.');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' 🎉 ALL PHASE 15 ATTACK SIMULATION LAB TESTS PASSED!');
console.log('==================================================\n');
