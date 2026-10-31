import { validateScenarioTarget, validateScenarioActionType } from './actionRegistry.js';

export function validatePreflightCheck(scenario, configuration = {}) {
  if (!scenario) throw new Error('Pre-flight Check Failed: Scenario definition is missing.');

  if (scenario.status !== 'ACTIVE' && scenario.status !== 'APPROVED') {
    throw new Error(`Pre-flight Check Failed: Scenario '${scenario.name}' is in status '${scenario.status}'. Only APPROVED/ACTIVE scenarios may execute.`);
  }

  // 1. Validate Target Assets
  const targets = scenario.target_assets || ['PLC-001'];
  for (const tgt of targets) {
    validateScenarioTarget(tgt);
  }

  // 2. Validate Action Types in Scenario Steps
  const steps = scenario.steps || [];
  for (const step of steps) {
    validateScenarioActionType(step.action_type);
    if (step.target_asset_id) {
      validateScenarioTarget(step.target_asset_id);
    }
  }

  // 3. Validate Duration Limits (Max 300s = 5 mins)
  const duration = configuration.duration || scenario.duration || 60;
  if (duration > 300) {
    throw new Error(`Pre-flight Check Failed: Requested duration (${duration}s) exceeds maximum lab safety limit of 300s.`);
  }

  return {
    valid: true,
    scenario_code: scenario.scenario_code,
    targets_validated: targets.length,
    steps_validated: steps.length,
    environment: 'LAB_SIMULATION',
    simulation_mode: true,
    checked_at: new Date().toISOString()
  };
}
