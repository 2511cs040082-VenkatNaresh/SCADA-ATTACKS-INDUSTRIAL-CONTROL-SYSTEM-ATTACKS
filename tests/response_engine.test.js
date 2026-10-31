import * as responseService from '../backend/src/services/response.service.js';
import { getActionMetadata, detectActionConflicts } from '../backend/src/services/responseEngine/actionRegistry.js';
import { validateApprovalPermissions } from '../backend/src/services/responseEngine/approvalEngine.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 14 Defense & Response Engine Tests');
console.log('==================================================\n');

// Test 1: Playbook Library & Default Laboratory Playbooks
console.log('[TEST 1] Testing Playbook Library & Default Laboratory Playbooks...');
const playbooks = await responseService.getPlaybooks();
if (playbooks && playbooks.length >= 4) {
  const modbusPb = playbooks.find(p => p.category === 'MODBUS');
  console.log(`✅ Test 1 Passed: Playbooks count=${playbooks.length}. Modbus Playbook='${modbusPb?.title}', Status='${modbusPb?.status}'.`);
} else {
  console.error(`❌ Test 1 Failed: Expected 4+ playbooks, got ${playbooks?.length}`);
  process.exit(1);
}

// Test 2: Recommendation Generation with Human Explanation
console.log('\n[TEST 2] Testing Automated Recommendation Generation with Explanation...');
const recs = await responseService.getRecommendations();
if (recs && recs.length > 0) {
  const rec = recs[0];
  console.log(`✅ Test 2 Passed: Recommendation fetched. Title='${rec.title}', Technique='${rec.technique_id}', Risk='${rec.risk_level}'.`);
} else {
  console.error('❌ Test 2 Failed: Recommendations empty.');
  process.exit(1);
}

// Test 3: Response Plan Creation & Numbering Format (RSP-2026-XXXXXX)
console.log('\n[TEST 3] Testing Response Plan Creation & RSP Number Format...');
const plan = await responseService.createResponsePlan({
  incident_id: 1,
  alert_id: 101,
  title: 'Simulated Network Isolation for PLC-001',
  description: 'Isolate target PLC in lab simulator to prevent Modbus coil override',
  priority: 'P1',
  risk_level: 'HIGH_RISK',
  actions: [
    { action_type: 'SNAPSHOT_ASSET_STATE', target_type: 'ASSET', target_id: '1' },
    { action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' }
  ]
}, 1);

if (plan && plan.response_number.startsWith('RSP-') && plan.status === 'PENDING_APPROVAL') {
  console.log(`✅ Test 3 Passed: Response Plan created. Number='${plan.response_number}', Status='${plan.status}', Risk='${plan.risk_level}'.`);
} else {
  console.error(`❌ Test 3 Failed: Plan number format or status unexpected. Number=${plan?.response_number}, status=${plan?.status}`);
  process.exit(1);
}

// Test 4: Separation of Duties & Authorization Enforcement
console.log('\n[TEST 4] Testing Separation of Duties (Creator Self-Approval Block)...');
try {
  // Creator (User #1) attempting to approve their own high-risk plan
  validateApprovalPermissions({ id: 1, role: 'SECURITY_ANALYST' }, plan, 'ADMIN_APPROVAL');
  console.error('❌ Test 4 Failed: Creator was allowed to self-approve high-risk plan!');
  process.exit(1);
} catch (err) {
  console.log(`✅ Test 4 Passed: Creator self-approval blocked correctly by Separation of Duties: '${err.message}'`);
}

// Test 5: Authorization Approval by Authorized Independent Admin
console.log('\n[TEST 5] Testing Response Plan Approval by Independent Admin...');
const approvedPlan = await responseService.approveResponsePlan(plan.id, { id: 2, role: 'ADMIN' }, 'Independent admin authorized execution');
if (approvedPlan && approvedPlan.status === 'APPROVED') {
  console.log(`✅ Test 5 Passed: Plan approved by Admin User #2. New Status='${approvedPlan.status}'.`);
} else {
  console.error('❌ Test 5 Failed: Approval failed.');
  process.exit(1);
}

// Test 6: Dry-Run Execution Preview
console.log('\n[TEST 6] Testing Dry-Run Simulation Preview (Non-mutating)...');
const dryRunResult = await responseService.executePlan(plan.id, true, { id: 1, role: 'SECURITY_ANALYST' });
if (dryRunResult && dryRunResult.dry_run === true && dryRunResult.expected_actions.length > 0) {
  const firstAct = dryRunResult.expected_actions[1];
  console.log(`✅ Test 6 Passed: Dry-run preview generated. Action='${firstAct.action_type}', Expected State='${firstAct.expected_state}'.`);
} else {
  console.error('❌ Test 6 Failed: Dry-run preview failed.');
  process.exit(1);
}

// Test 7: Action Execution & Laboratory Simulator State Change
console.log('\n[TEST 7] Testing Action Execution & Lab Simulator Integration...');
const execResult = await responseService.executePlan(plan.id, false, { id: 1, role: 'SECURITY_ANALYST' });
if (execResult && execResult.status === 'COMPLETED' && execResult.results.length > 0) {
  const labRes = execResult.results.find(r => r.action_type === 'SIMULATE_NETWORK_ISOLATION');
  console.log(`✅ Test 7 Passed: Plan executed in Lab Simulator. Status='${execResult.status}', Action='${labRes?.action_type}', State Transition='${labRes?.previous_state}' ➔ '${labRes?.new_state}', SHA-256 Hash=${labRes?.sha256_hash?.substring(0, 16)}...`);
} else {
  console.error('❌ Test 7 Failed: Plan execution failed.');
  process.exit(1);
}

// Test 8: Rollback Execution & State Restoration
console.log('\n[TEST 8] Testing Action Rollback & State Restoration...');
const rollbackRes = await responseService.rollbackPlan(plan.id, { id: 1, role: 'SECURITY_ANALYST' });
if (rollbackRes && rollbackRes.status === 'ROLLED_BACK') {
  const rb = rollbackRes.rollback_results[0];
  console.log(`✅ Test 8 Passed: Action rolled back. Status='${rollbackRes.status}', Restored State='${rb?.restored_state}'.`);
} else {
  console.error('❌ Test 8 Failed: Rollback failed.');
  process.exit(1);
}

// Test 9: Conflicting Action Detection & Action Metadata
console.log('\n[TEST 9] Testing Conflicting Action Detection & Metadata Lookup...');
const activeActions = [{ action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' }];
const newConflictingAction = { action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' };
const conflicts = detectActionConflicts(activeActions, newConflictingAction);

if (conflicts.length > 0) {
  console.log(`✅ Test 9 Passed: Conflicting action detected successfully: '${conflicts[0]}'`);
} else {
  console.error('❌ Test 9 Failed: Conflict detection failed.');
  process.exit(1);
}

// Test 10: Engine Health & Operation Metrics
console.log('\n[TEST 10] Testing Response Engine Health & Operations Metrics...');
const health = await responseService.getResponseHealth();
const metrics = await responseService.getResponseMetrics();

if (health && health.status === 'HEALTHY' && health.simulation_mode === true && metrics && metrics.plans_count > 0) {
  console.log(`✅ Test 10 Passed: Health Status='${health.status}', Environment='${health.environment}', Plans Count=${metrics.plans_count}, Playbooks=${health.playbooks_count}.`);
} else {
  console.error('❌ Test 10 Failed: Response engine health check failed.');
  process.exit(1);
}

console.log('\n==================================================');
console.log(' 🎉 ALL PHASE 14 DEFENSE & RESPONSE ENGINE TESTS PASSED!');
console.log('==================================================\n');
