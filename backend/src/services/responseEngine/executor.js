import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import { validateStateTransition } from './stateMachine.js';
import { getActionMetadata, validateActionTarget, detectActionConflicts } from './actionRegistry.js';
import { validateApprovalPermissions, determineApprovalRequirement } from './approvalEngine.js';
import { executeLabSimulatedAction, rollbackLabSimulatedAction, getLabSimulatedState } from './labAdapter.js';
import { calculateEvidenceHash } from './numberGenerator.js';

export async function validatePlanForExecution(plan, actions = []) {
  if (!plan) throw new Error('Response Plan not found.');

  if (plan.simulation_mode !== true && plan.simulation_mode !== 1) {
    throw new Error('Safety Block: Response Engine execution is strictly restricted to LAB_SIMULATION mode.');
  }

  if (plan.status !== 'APPROVED' && plan.status !== 'RECOMMENDED' && plan.status !== 'DRAFT') {
    throw new Error(`Plan cannot be validated for execution in current status '${plan.status}'. Must be APPROVED.`);
  }

  for (const act of actions) {
    validateActionTarget(act.target_type, act.target_id);
  }

  const conflicts = detectActionConflicts([], actions[0] || {});
  if (conflicts.length > 0) {
    throw new Error(`Action Conflict Detected: ${conflicts.join('; ')}`);
  }

  return { valid: true, plan_id: plan.id, actions_count: actions.length };
}

export async function previewDryRun(plan, actions = []) {
  await validatePlanForExecution(plan, actions);

  const dryRunResults = actions.map(act => {
    const currentState = getLabSimulatedState(act.target_id)?.state || 'CONNECTED';
    let expectedState = currentState;

    if (act.action_type === 'SIMULATE_NETWORK_ISOLATION' || act.action_type === 'SIMULATE_BLOCK_COMMUNICATION') {
      expectedState = 'SIMULATED_ISOLATED';
    } else if (act.action_type === 'SIMULATE_DEVICE_QUARANTINE') {
      expectedState = 'QUARANTINED';
    } else if (act.action_type === 'SIMULATE_PROCESS_SAFE_STATE') {
      expectedState = 'SAFE_STATE';
    }

    return {
      action_type: act.action_type,
      target_type: act.target_type,
      target_id: act.target_id,
      current_state: currentState,
      expected_state: expectedState,
      risk_level: act.risk_level,
      rollback_supported: act.rollback_supported !== false,
      dry_run_mode: true
    };
  });

  return {
    plan_number: plan.response_number,
    dry_run: true,
    simulation_mode: true,
    expected_actions: dryRunResults,
    timestamp: new Date().toISOString()
  };
}

export async function executeResponsePlan(plan, actions = [], user = { id: 1, role: 'SECURITY_ANALYST' }) {
  logger.info(`[EXECUTOR] Executing Response Plan ${plan.response_number} (${actions.length} actions)`);

  validateStateTransition(plan.status, 'EXECUTING');

  const executionResults = [];
  let planStatus = 'COMPLETED';

  for (let i = 0; i < actions.length; i++) {
    const act = actions[i];
    try {
      const result = await executeLabSimulatedAction(act.action_type, act.target_type, act.target_id);

      const sha256Evidence = calculateEvidenceHash({
        plan_number: plan.response_number,
        action_type: act.action_type,
        target: `${act.target_type}:${act.target_id}`,
        result
      });

      executionResults.push({
        action_id: act.id || i + 1,
        action_type: act.action_type,
        status: result.success ? 'SUCCEEDED' : 'FAILED',
        target: `${act.target_type}:${act.target_id}`,
        previous_state: result.previous_state,
        new_state: result.new_state,
        sha256_hash: sha256Evidence
      });

      if (!result.success) planStatus = 'PARTIALLY_COMPLETED';
    } catch (err) {
      logger.error(`[EXECUTOR] Action execution failed for ${act.action_type}: ${err.message}`);
      executionResults.push({
        action_id: act.id || i + 1,
        action_type: act.action_type,
        status: 'FAILED',
        error: err.message
      });
      planStatus = 'FAILED';
    }
  }

  plan.status = planStatus;
  plan.completed_at = new Date().toISOString();

  // Try updating DB incident status if linked
  if (plan.incident_id) {
    try {
      const pool = getDbPool();
      await pool.query(
        "UPDATE incidents SET status = 'CONTAINMENT_IN_PROGRESS', updated_at = NOW() WHERE id = ?",
        [plan.incident_id]
      );
    } catch (err) {
      logger.warn(`[EXECUTOR] DB incident status update skipped: ${err.message}`);
    }
  }

  return {
    plan_number: plan.response_number,
    status: planStatus,
    actions_executed: executionResults.length,
    results: executionResults,
    executed_at: plan.completed_at
  };
}

export async function rollbackResponsePlan(plan, actions = [], user = { id: 1, role: 'SECURITY_ANALYST' }) {
  logger.info(`[EXECUTOR] Rolling back Response Plan ${plan.response_number}`);

  validateStateTransition(plan.status, 'ROLLING_BACK');

  const rollbackResults = [];

  for (const act of actions) {
    if (act.rollback_supported !== false) {
      const res = await rollbackLabSimulatedAction(act.action_type, act.target_type, act.target_id);
      rollbackResults.push(res);
    }
  }

  plan.status = 'ROLLED_BACK';
  plan.rollback_status = 'ROLLED_BACK';

  return {
    plan_number: plan.response_number,
    status: 'ROLLED_BACK',
    rollback_results: rollbackResults,
    rolled_back_at: new Date().toISOString()
  };
}
