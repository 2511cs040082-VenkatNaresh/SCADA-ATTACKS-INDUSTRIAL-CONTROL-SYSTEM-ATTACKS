export const ACTION_TYPES = {
  ACKNOWLEDGE_ALERT: 'ACKNOWLEDGE_ALERT',
  ESCALATE_ALERT: 'ESCALATE_ALERT',
  CREATE_INCIDENT: 'CREATE_INCIDENT',
  ADD_INCIDENT_NOTE: 'ADD_INCIDENT_NOTE',
  COLLECT_EVIDENCE: 'COLLECT_EVIDENCE',
  SNAPSHOT_ASSET_STATE: 'SNAPSHOT_ASSET_STATE',
  CAPTURE_PROTOCOL_CONTEXT: 'CAPTURE_PROTOCOL_CONTEXT',
  CAPTURE_TELEMETRY_CONTEXT: 'CAPTURE_TELEMETRY_CONTEXT',
  MARK_ASSET_UNDER_INVESTIGATION: 'MARK_ASSET_UNDER_INVESTIGATION',
  SIMULATE_NETWORK_ISOLATION: 'SIMULATE_NETWORK_ISOLATION',
  SIMULATE_BLOCK_COMMUNICATION: 'SIMULATE_BLOCK_COMMUNICATION',
  SIMULATE_ACCOUNT_DISABLEMENT: 'SIMULATE_ACCOUNT_DISABLEMENT',
  SIMULATE_SERVICE_STOP: 'SIMULATE_SERVICE_STOP',
  SIMULATE_DEVICE_QUARANTINE: 'SIMULATE_DEVICE_QUARANTINE',
  SIMULATE_PROCESS_SAFE_STATE: 'SIMULATE_PROCESS_SAFE_STATE',
  NOTIFY_ANALYST: 'NOTIFY_ANALYST',
  NOTIFY_ADMIN: 'NOTIFY_ADMIN',
  OPEN_INVESTIGATION_TASK: 'OPEN_INVESTIGATION_TASK',
  APPLY_MAINTENANCE_WINDOW: 'APPLY_MAINTENANCE_WINDOW',
  CREATE_RESPONSE_REPORT: 'CREATE_RESPONSE_REPORT'
};

export const ACTION_REGISTRY = {
  ACKNOWLEDGE_ALERT: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  ESCALATE_ALERT: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  CREATE_INCIDENT: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  ADD_INCIDENT_NOTE: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  COLLECT_EVIDENCE: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  SNAPSHOT_ASSET_STATE: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  CAPTURE_PROTOCOL_CONTEXT: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  CAPTURE_TELEMETRY_CONTEXT: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  MARK_ASSET_UNDER_INVESTIGATION: { risk_level: 'LOW_RISK', requires_approval: false, rollback_supported: true, simulation_only: true },
  SIMULATE_NETWORK_ISOLATION: { risk_level: 'HIGH_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  SIMULATE_BLOCK_COMMUNICATION: { risk_level: 'MEDIUM_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  SIMULATE_ACCOUNT_DISABLEMENT: { risk_level: 'MEDIUM_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  SIMULATE_SERVICE_STOP: { risk_level: 'HIGH_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  SIMULATE_DEVICE_QUARANTINE: { risk_level: 'HIGH_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  SIMULATE_PROCESS_SAFE_STATE: { risk_level: 'HIGH_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  NOTIFY_ANALYST: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  NOTIFY_ADMIN: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  OPEN_INVESTIGATION_TASK: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false },
  APPLY_MAINTENANCE_WINDOW: { risk_level: 'LOW_RISK', requires_approval: true, rollback_supported: true, simulation_only: true },
  CREATE_RESPONSE_REPORT: { risk_level: 'SAFE', requires_approval: false, rollback_supported: false, simulation_only: false }
};

export const TARGET_TYPES = {
  ALERT: 'ALERT',
  INCIDENT: 'INCIDENT',
  ASSET: 'ASSET',
  NETWORK_SEGMENT: 'NETWORK_SEGMENT',
  PROTOCOL_SESSION: 'PROTOCOL_SESSION',
  PROCESS: 'PROCESS',
  USER: 'USER',
  SIMULATION: 'SIMULATION',
  SYSTEM: 'SYSTEM'
};

export function getActionMetadata(actionType) {
  return ACTION_REGISTRY[actionType] || { risk_level: 'MEDIUM_RISK', requires_approval: true, rollback_supported: false, simulation_only: true };
}

export function validateActionTarget(targetType, targetId) {
  if (!TARGET_TYPES[targetType]) {
    throw new Error(`Invalid target type '${targetType}'. Target must be a recognized lab resource type.`);
  }
  if (!targetId || String(targetId).trim().length === 0) {
    throw new Error('Target ID cannot be empty.');
  }
  return true;
}

export function detectActionConflicts(activeActions, newAction) {
  const conflicts = [];
  for (const act of activeActions) {
    if (act.target_type === newAction.target_type && String(act.target_id) === String(newAction.target_id)) {
      if (
        (act.action_type === 'SIMULATE_NETWORK_ISOLATION' && newAction.action_type === 'SIMULATE_NETWORK_ISOLATION') ||
        (act.action_type === 'SIMULATE_DEVICE_QUARANTINE' && newAction.action_type === 'SIMULATE_DEVICE_QUARANTINE')
      ) {
        conflicts.push(`Conflict: Action ${act.action_type} is already active on target ${act.target_type} #${act.target_id}`);
      }
    }
  }
  return conflicts;
}
