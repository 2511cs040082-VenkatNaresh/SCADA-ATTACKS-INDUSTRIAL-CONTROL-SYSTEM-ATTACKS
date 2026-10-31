export const BUILTIN_SCENARIOS = [
  {
    id: 1,
    scenario_code: 'SIM-MODBUS-RATE-001',
    scenario_uuid: 'scen-modbus-rate-001',
    name: 'Abnormal Modbus Request Rate',
    description: 'HMI-001 generates an unusually high frequency of synthetic Modbus read polling requests toward PLC-001.',
    category: 'PROTOCOL_ANOMALY',
    difficulty: 'BEGINNER',
    risk_level: 'MEDIUM',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['HMI-001', 'PLC-001'],
    target_protocols: ['MODBUS_TCP'],
    expected_events: ['HIGH_POLLING_RATE', 'MODBUS_READ_BURST'],
    expected_detections: ['RULE_MODBUS_BURST_001'],
    expected_alerts: ['ALT-MODBUS-BURST'],
    expected_incidents: [],
    expected_mitre_mappings: ['T0855'],
    recommended_response_playbook: 'pb-modbus-001',
    steps: [
      { sequence: 1, action_type: 'GENERATE_REQUEST_BURST', target_asset_id: 'PLC-001', parameters: { rate_pps: 250, duration: 15 } }
    ]
  },
  {
    id: 2,
    scenario_code: 'SIM-MODBUS-WRITE-001',
    scenario_uuid: 'scen-modbus-write-001',
    name: 'Unexpected Modbus Write Operation',
    description: 'Generates a controlled synthetic Modbus FC05 write coil operation to a simulated PLC output register.',
    category: 'PROTOCOL_ANOMALY',
    difficulty: 'BEGINNER',
    risk_level: 'HIGH',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['ENG-WS-001', 'PLC-001'],
    target_protocols: ['MODBUS_TCP'],
    expected_events: ['UNAUTHORIZED_WRITE_COIL'],
    expected_detections: ['Unauthorized Modbus Coil Override'],
    expected_alerts: ['Unauthorized Modbus Coil Write Alert'],
    expected_incidents: ['INC-2026-000001'],
    expected_mitre_mappings: ['T0855'],
    recommended_response_playbook: 'pb-modbus-001',
    steps: [
      { sequence: 1, action_type: 'GENERATE_SIMULATED_PROTOCOL_WRITE', target_asset_id: 'PLC-001', parameters: { function_code: 5, address: '0x0004', value: 255 } }
    ]
  },
  {
    id: 3,
    scenario_code: 'SIM-UNKNOWN-ASSET-001',
    scenario_uuid: 'scen-unknown-asset-001',
    name: 'Unknown Asset Appearance',
    description: 'Synthetic unrecognized device UNKNOWN-DEVICE-001 appears in the laboratory communication graph.',
    category: 'DEVICE_ANOMALY',
    difficulty: 'BEGINNER',
    risk_level: 'LOW',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['UNKNOWN-DEVICE-001'],
    target_protocols: ['ETHERNET_IP'],
    expected_events: ['UNKNOWN_DEVICE_DISCOVERED'],
    expected_detections: ['New Unregistered Asset Observed'],
    expected_alerts: ['Unrecognized Device Alert'],
    expected_mitre_mappings: ['T0886'],
    recommended_response_playbook: 'pb-device-comm-002',
    steps: [
      { sequence: 1, action_type: 'GENERATE_UNKNOWN_ASSET_EVENT', target_asset_id: 'UNKNOWN-DEVICE-001', parameters: { mac: '00:11:22:33:44:55', ip: '192.168.1.199' } }
    ]
  },
  {
    id: 4,
    scenario_code: 'SIM-COMM-PAIR-001',
    scenario_uuid: 'scen-comm-pair-001',
    name: 'Unexpected Communication Pair',
    description: 'Generates unapproved protocol session between ENG-WS-001 and PLC-002 outside learned baseline.',
    category: 'COMMUNICATION_ANOMALY',
    difficulty: 'INTERMEDIATE',
    risk_level: 'MEDIUM',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 40,
    target_assets: ['ENG-WS-001', 'PLC-002'],
    target_protocols: ['MODBUS_TCP'],
    expected_events: ['UNAPPROVED_PAIR_SESSION'],
    expected_detections: ['Cross-Zone Baseline Violation'],
    expected_alerts: ['Unapproved Pair Session Alert'],
    expected_mitre_mappings: ['T0886', 'T0812'],
    recommended_response_playbook: 'pb-device-comm-002',
    steps: [
      { sequence: 1, action_type: 'GENERATE_NEW_COMMUNICATION_PAIR', target_asset_id: 'PLC-002', parameters: { source_ip: '192.168.1.200', target_ip: '192.168.1.11' } }
    ]
  },
  {
    id: 5,
    scenario_code: 'SIM-DEVICE-OFFLINE-001',
    scenario_uuid: 'scen-device-offline-001',
    name: 'Simulated Device Offline',
    description: 'Transitions PLC-001 simulated state from ONLINE to OFFLINE to test missing telemetry alarms.',
    category: 'AVAILABILITY_ANOMALY',
    difficulty: 'BEGINNER',
    risk_level: 'MEDIUM',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['PLC-001'],
    target_protocols: ['SYSTEM'],
    expected_events: ['DEVICE_OFFLINE_EVENT'],
    expected_detections: ['Controller Heartbeat Missing'],
    expected_alerts: ['PLC Outage Alert'],
    expected_mitre_mappings: ['T0826'],
    recommended_response_playbook: 'pb-workstation-003',
    steps: [
      { sequence: 1, action_type: 'SIMULATE_DEVICE_OFFLINE', target_asset_id: 'PLC-001', parameters: { duration_seconds: 20 } }
    ]
  },
  {
    id: 6,
    scenario_code: 'SIM-PROCESS-ANOMALY-001',
    scenario_uuid: 'scen-process-anomaly-001',
    name: 'Process Value Anomaly (Drift)',
    description: 'Modifies synthetic water reactor tank pressure beyond normal safety baseline (Pressure > 8.5 bar).',
    category: 'PROCESS_ANOMALY',
    difficulty: 'INTERMEDIATE',
    risk_level: 'HIGH',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 45,
    target_assets: ['PLC-001'],
    target_protocols: ['TELEMETRY'],
    expected_events: ['PRESSURE_OVERRIDE_EVENT'],
    expected_detections: ['Water Pressure Deviation Anomaly'],
    expected_alerts: ['Tank Overpressure Critical Alert'],
    expected_incidents: ['INC-2026-000002'],
    expected_mitre_mappings: ['T0836'],
    recommended_response_playbook: 'pb-process-safe-004',
    steps: [
      { sequence: 1, action_type: 'SIMULATE_PROCESS_ANOMALY', target_asset_id: 'PLC-001', parameters: { variable: 'pressure', target_value: 9.2 } }
    ]
  },
  {
    id: 7,
    scenario_code: 'SIM-SENSOR-INTEGRITY-001',
    scenario_uuid: 'scen-sensor-integrity-001',
    name: 'Sensor Value Manipulation (Mismatch)',
    description: 'Creates a synthetic mismatch between physical process model value (60%) and reported sensor value (88%).',
    category: 'INTEGRITY_ANOMALY',
    difficulty: 'INTERMEDIATE',
    risk_level: 'HIGH',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 45,
    target_assets: ['PLC-001'],
    target_protocols: ['TELEMETRY'],
    expected_events: ['SENSOR_MISMATCH_EVENT'],
    expected_detections: ['Sensor Value Integrity Mismatch'],
    expected_alerts: ['Sensor Integrity Deviation Alert'],
    expected_mitre_mappings: ['T0836', 'T0886'],
    recommended_response_playbook: 'pb-process-safe-004',
    steps: [
      { sequence: 1, action_type: 'CHANGE_SIMULATED_SENSOR_VALUE', target_asset_id: 'PLC-001', parameters: { sensor: 'tank_level', reported_value: 88, actual_value: 60 } }
    ]
  },
  {
    id: 8,
    scenario_code: 'SIM-PROTOCOL-EXCEPTION-001',
    scenario_uuid: 'scen-protocol-exception-001',
    name: 'Protocol Exception Spike',
    description: 'Generates controlled synthetic Modbus exception responses (Illegal Data Address 0x02).',
    category: 'PROTOCOL_ANOMALY',
    difficulty: 'BEGINNER',
    risk_level: 'LOW',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['PLC-001'],
    target_protocols: ['MODBUS_TCP'],
    expected_events: ['MODBUS_EXCEPTION_SPIKE'],
    expected_detections: ['Protocol Exception Threshold Exceeded'],
    expected_alerts: ['Modbus Exception Burst Alert'],
    expected_mitre_mappings: ['T0855'],
    recommended_response_playbook: 'pb-modbus-001',
    steps: [
      { sequence: 1, action_type: 'GENERATE_EXCEPTION_RESPONSE', target_asset_id: 'PLC-001', parameters: { exception_code: 2, count: 40 } }
    ]
  },
  {
    id: 9,
    scenario_code: 'SIM-AUTH-FAIL-001',
    scenario_uuid: 'scen-auth-fail-001',
    name: 'Authentication Failure Burst',
    description: 'Generates synthetic authentication failures against laboratory SCADA HMI management login.',
    category: 'AUTHENTICATION_ANOMALY',
    difficulty: 'BEGINNER',
    risk_level: 'MEDIUM',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['HMI-001'],
    target_protocols: ['HTTP_AUTH'],
    expected_events: ['AUTH_FAILURE_BURST'],
    expected_detections: ['Brute Force Login Attempt'],
    expected_alerts: ['HMI Auth Failure Burst Alert'],
    expected_mitre_mappings: ['T0806'],
    recommended_response_playbook: 'pb-workstation-003',
    steps: [
      { sequence: 1, action_type: 'GENERATE_AUTH_FAILURE', target_asset_id: 'HMI-001', parameters: { attempts: 25, username: 'admin' } }
    ]
  },
  {
    id: 10,
    scenario_code: 'SIM-CONFIG-CHANGE-001',
    scenario_uuid: 'scen-config-change-001',
    name: 'Unscheduled Configuration Change',
    description: 'Generates controlled configuration-change event recording PLC operating mode shift from RUN to PROGRAM.',
    category: 'CONFIGURATION_ANOMALY',
    difficulty: 'INTERMEDIATE',
    risk_level: 'HIGH',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 30,
    target_assets: ['PLC-001'],
    target_protocols: ['S7COMM'],
    expected_events: ['PLC_KEYS_WITCH_MODE_CHANGE'],
    expected_detections: ['PLC Operating Mode Shifted to PROGRAM'],
    expected_alerts: ['Unscheduled Mode Change Alert'],
    expected_mitre_mappings: ['T0858'],
    recommended_response_playbook: 'pb-modbus-001',
    steps: [
      { sequence: 1, action_type: 'GENERATE_CONFIGURATION_CHANGE', target_asset_id: 'PLC-001', parameters: { previous_mode: 'RUN', new_mode: 'PROGRAM' } }
    ]
  },
  {
    id: 11,
    scenario_code: 'SIM-NETWORK-DEGRADE-001',
    scenario_uuid: 'scen-network-degrade-001',
    name: 'Simulated Network Degradation',
    description: 'Simulates network latency increase (+250ms) and 15% packet loss on control subnet.',
    category: 'NETWORK_ANOMALY',
    difficulty: 'INTERMEDIATE',
    risk_level: 'MEDIUM',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 45,
    target_assets: ['PLC-001', 'HMI-001'],
    target_protocols: ['SYSTEM'],
    expected_events: ['NETWORK_LATENCY_SPIKE'],
    expected_detections: ['Industrial Network Response Latency Degradation'],
    expected_alerts: ['Control Network Latency Warning'],
    expected_mitre_mappings: ['T0814'],
    recommended_response_playbook: 'pb-device-comm-002',
    steps: [
      { sequence: 1, action_type: 'SIMULATE_NETWORK_LATENCY', target_asset_id: 'PLC-001', parameters: { latency_ms: 250, packet_loss_percent: 15 } }
    ]
  },
  {
    id: 12,
    scenario_code: 'SIM-MULTISTAGE-001',
    scenario_uuid: 'scen-multistage-001',
    name: 'Multi-Stage Lab Cyber Incident',
    description: 'Full multi-stage attack simulation: Unknown device appears -> Unapproved pair session -> Modbus request burst -> Unauthorized coil write -> Pressure overpressure drift.',
    category: 'MULTI_STAGE_SIMULATION',
    difficulty: 'ADVANCED',
    risk_level: 'HIGH',
    version: 'v1.0',
    status: 'ACTIVE',
    duration: 90,
    target_assets: ['UNKNOWN-DEVICE-001', 'ENG-WS-001', 'PLC-001'],
    target_protocols: ['MODBUS_TCP', 'ETHERNET_IP'],
    expected_events: ['UNKNOWN_DEVICE_DISCOVERED', 'UNAPPROVED_PAIR_SESSION', 'UNAUTHORIZED_WRITE_COIL', 'PRESSURE_OVERRIDE_EVENT'],
    expected_detections: ['Unauthorized Modbus Coil Override', 'Water Pressure Deviation Anomaly'],
    expected_alerts: ['Multi-Stage SCADA Compromise Alert'],
    expected_incidents: ['INC-2026-000001'],
    expected_mitre_mappings: ['T0886', 'T0855', 'T0836', 'T0826'],
    recommended_response_playbook: 'pb-modbus-001',
    steps: [
      { sequence: 1, action_type: 'GENERATE_UNKNOWN_ASSET_EVENT', target_asset_id: 'UNKNOWN-DEVICE-001', delay_seconds: 2 },
      { sequence: 2, action_type: 'GENERATE_NEW_COMMUNICATION_PAIR', target_asset_id: 'PLC-001', delay_seconds: 5 },
      { sequence: 3, action_type: 'GENERATE_REQUEST_BURST', target_asset_id: 'PLC-001', delay_seconds: 5 },
      { sequence: 4, action_type: 'GENERATE_SIMULATED_PROTOCOL_WRITE', target_asset_id: 'PLC-001', delay_seconds: 5 },
      { sequence: 5, action_type: 'SIMULATE_PROCESS_ANOMALY', target_asset_id: 'PLC-001', delay_seconds: 5 }
    ]
  }
];

export function getBuiltinScenarios() {
  return BUILTIN_SCENARIOS;
}

export function getScenarioByCodeOrId(identifier) {
  return BUILTIN_SCENARIOS.find(
    s => String(s.id) === String(identifier) || s.scenario_code === identifier || s.scenario_uuid === identifier
  ) || null;
}
