import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';

// In-memory lab state store for simulated assets
const simulatedLabState = {
  assets: {
    1: { id: 1, name: 'PLC-001 (Water Pressure Controller)', ip: '192.168.1.10', state: 'CONNECTED', previous_state: 'CONNECTED' },
    2: { id: 2, name: 'PLC-002 (Chemical Dosing Controller)', ip: '192.168.1.11', state: 'CONNECTED', previous_state: 'CONNECTED' },
    3: { id: 3, name: 'HMI-001 (SCADA Operator Station)', ip: '192.168.1.50', state: 'CONNECTED', previous_state: 'CONNECTED' },
    4: { id: 4, name: 'ENG-WS-001 (Engineering Workstation)', ip: '192.168.1.200', state: 'CONNECTED', previous_state: 'CONNECTED' }
  },
  processState: 'NORMAL',
  previousProcessState: 'NORMAL'
};

export async function executeLabSimulatedAction(actionType, targetType, targetId, options = {}) {
  logger.info(`[LAB ADAPTER] Executing lab simulated action '${actionType}' on ${targetType} #${targetId}`);

  const assetKey = targetId;
  const asset = simulatedLabState.assets[assetKey] || {
    id: targetId,
    name: `Lab Asset #${targetId}`,
    ip: `192.168.1.${targetId}`,
    state: 'CONNECTED',
    previous_state: 'CONNECTED'
  };

  const previousState = asset.state;
  let newState = previousState;
  let verificationSuccess = true;

  switch (actionType) {
    case 'MARK_ASSET_UNDER_INVESTIGATION':
      newState = 'UNDER_INVESTIGATION';
      break;

    case 'SIMULATE_NETWORK_ISOLATION':
    case 'SIMULATE_BLOCK_COMMUNICATION':
      newState = 'SIMULATED_ISOLATED';
      break;

    case 'SIMULATE_DEVICE_QUARANTINE':
    case 'SIMULATE_ACCOUNT_DISABLEMENT':
      newState = 'QUARANTINED';
      break;

    case 'SIMULATE_PROCESS_SAFE_STATE':
      newState = 'SAFE_STATE';
      simulatedLabState.previousProcessState = simulatedLabState.processState;
      simulatedLabState.processState = 'SAFE_STATE';
      break;

    case 'SIMULATE_SERVICE_STOP':
      newState = 'SERVICE_STOPPED';
      break;

    default:
      newState = previousState;
      break;
  }

  // Update lab state
  asset.previous_state = previousState;
  asset.state = newState;
  simulatedLabState.assets[assetKey] = asset;

  // Perform post-execution state verification
  if (simulatedLabState.assets[assetKey].state !== newState) {
    verificationSuccess = false;
  }

  try {
    const pool = getDbPool();
    await pool.query(
      'UPDATE assets SET status = ? WHERE id = ? OR asset_name = ?',
      [newState, targetId, targetId]
    );
  } catch (err) {
    logger.warn(`[LAB ADAPTER] DB asset status update skipped: ${err.message}`);
  }

  return {
    success: verificationSuccess,
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    previous_state: previousState,
    new_state: newState,
    verified_at: new Date().toISOString(),
    environment: 'LAB_SIMULATION'
  };
}

export async function rollbackLabSimulatedAction(actionType, targetType, targetId) {
  logger.info(`[LAB ADAPTER] Rolling back lab action '${actionType}' on ${targetType} #${targetId}`);

  const assetKey = targetId;
  const asset = simulatedLabState.assets[assetKey] || {
    id: targetId,
    name: `Lab Asset #${targetId}`,
    state: 'SIMULATED_ISOLATED',
    previous_state: 'CONNECTED'
  };

  const currentState = asset.state;
  const restoredState = asset.previous_state || 'CONNECTED';

  asset.state = restoredState;
  asset.previous_state = currentState;
  simulatedLabState.assets[assetKey] = asset;

  if (actionType === 'SIMULATE_PROCESS_SAFE_STATE') {
    simulatedLabState.processState = 'NORMAL';
  }

  try {
    const pool = getDbPool();
    await pool.query(
      'UPDATE assets SET status = ? WHERE id = ? OR asset_name = ?',
      [restoredState, targetId, targetId]
    );
  } catch (err) {
    logger.warn(`[LAB ADAPTER] DB asset rollback update skipped: ${err.message}`);
  }

  return {
    success: true,
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    rolled_back_from: currentState,
    restored_state: restoredState,
    rolled_back_at: new Date().toISOString()
  };
}

export function getLabSimulatedState(targetId = null) {
  if (targetId && simulatedLabState.assets[targetId]) {
    return simulatedLabState.assets[targetId];
  }
  return simulatedLabState;
}
