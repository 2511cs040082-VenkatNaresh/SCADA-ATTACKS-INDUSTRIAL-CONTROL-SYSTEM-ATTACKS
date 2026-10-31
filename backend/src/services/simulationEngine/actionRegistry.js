export const ALLOWED_SCENARIO_ACTIONS = {
  GENERATE_TELEMETRY_VALUE: { risk_level: 'SAFE', simulation_only: true, max_rate: 100 },
  CHANGE_SIMULATED_SENSOR_VALUE: { risk_level: 'LOW_RISK', simulation_only: true, max_rate: 50 },
  CHANGE_SIMULATED_DEVICE_STATE: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 10 },
  GENERATE_PROTOCOL_READ: { risk_level: 'SAFE', simulation_only: true, max_rate: 200 },
  GENERATE_SIMULATED_PROTOCOL_WRITE: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 20 },
  GENERATE_REQUEST_BURST: { risk_level: 'HIGH_RISK', simulation_only: true, max_rate: 500 },
  GENERATE_EXCEPTION_RESPONSE: { risk_level: 'LOW_RISK', simulation_only: true, max_rate: 50 },
  GENERATE_UNKNOWN_ASSET_EVENT: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 5 },
  GENERATE_NEW_COMMUNICATION_PAIR: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 10 },
  GENERATE_AUTH_FAILURE: { risk_level: 'LOW_RISK', simulation_only: true, max_rate: 30 },
  GENERATE_CONFIGURATION_CHANGE: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 5 },
  SIMULATE_DEVICE_OFFLINE: { risk_level: 'HIGH_RISK', simulation_only: true, max_rate: 5 },
  SIMULATE_NETWORK_LATENCY: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 10 },
  SIMULATE_PACKET_LOSS: { risk_level: 'MEDIUM_RISK', simulation_only: true, max_rate: 10 },
  SIMULATE_PROCESS_ANOMALY: { risk_level: 'HIGH_RISK', simulation_only: true, max_rate: 5 },
  SIMULATE_COMMUNICATION_BLOCK: { risk_level: 'HIGH_RISK', simulation_only: true, max_rate: 5 },
  SIMULATE_UNEXPECTED_PROTOCOL_USAGE: { risk_level: 'HIGH_RISK', simulation_only: true, max_rate: 10 }
};

export const ALLOWED_LAB_TARGETS = [
  'PLC-001',
  'PLC-002',
  'RTU-001',
  'HMI-001',
  'ENG-WS-001',
  'HISTORIAN-001',
  'UNKNOWN-DEVICE-001',
  '1', '2', '3', '4', '5', '6'
];

export function validateScenarioTarget(targetAssetId) {
  if (!targetAssetId || typeof targetAssetId !== 'string' && typeof targetAssetId !== 'number') {
    throw new Error('Safety Boundary Violation: Target asset ID is missing.');
  }

  const targetStr = String(targetAssetId).trim();

  // Check for external IP or hostname patterns
  if (
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(targetStr) &&
    !targetStr.startsWith('192.168.1.') &&
    !targetStr.startsWith('10.10.') &&
    !targetStr.startsWith('127.0.0.1')
  ) {
    throw new Error(`Safety Boundary Violation: External target IP '${targetStr}' rejected. Simulations are restricted strictly to ICS-SHIELD laboratory subnets.`);
  }

  if (targetStr.includes('http://') || targetStr.includes('https://') || targetStr.includes('.com') || targetStr.includes('.org')) {
    throw new Error(`Safety Boundary Violation: External target hostname '${targetStr}' rejected.`);
  }

  const isAllowed = ALLOWED_LAB_TARGETS.includes(targetStr) || targetStr.startsWith('PLC-') || targetStr.startsWith('HMI-') || targetStr.startsWith('ENG-');
  if (!isAllowed) {
    throw new Error(`Safety Boundary Violation: Target '${targetStr}' is not registered in the laboratory simulator inventory.`);
  }

  return true;
}

export function validateScenarioActionType(actionType) {
  if (!ALLOWED_SCENARIO_ACTIONS[actionType]) {
    throw new Error(`Safety Boundary Violation: Action '${actionType}' is not in the allowlisted scenario action registry. Arbitrary code/command execution is strictly forbidden.`);
  }
  return ALLOWED_SCENARIO_ACTIONS[actionType];
}
