// ICS-SHIELD Phase 20 Deterministic Test Fixtures

export const TEST_USERS = [
  { id: 1, userUuid: 'usr-test-admin-001', username: 'admin_test', email: 'admin_test@icsshield.internal', fullName: 'Test System Administrator', roles: ['ADMIN'], status: 'ACTIVE' },
  { id: 2, userUuid: 'usr-test-analyst-002', username: 'analyst_test', email: 'analyst_test@icsshield.internal', fullName: 'Test Lead Analyst', roles: ['SECURITY_ANALYST'], status: 'ACTIVE' },
  { id: 3, userUuid: 'usr-test-soc-003', username: 'soc_test', email: 'soc_test@icsshield.internal', fullName: 'Test SOC Operator', roles: ['SOC_OPERATOR'], status: 'ACTIVE' },
  { id: 4, userUuid: 'usr-test-ot-004', username: 'ot_test', email: 'ot_test@icsshield.internal', fullName: 'Test OT Engineer', roles: ['OT_OPERATOR'], status: 'ACTIVE' },
  { id: 5, userUuid: 'usr-test-viewer-005', username: 'viewer_test', email: 'viewer_test@icsshield.internal', fullName: 'Test Auditor Viewer', roles: ['VIEWER'], status: 'ACTIVE' }
];

export const TEST_ASSETS = [
  { id: 1, assetUuid: 'ast-plc-001', asset_name: 'PLC-001', asset_type: 'PLC', ip_address: '192.168.1.10', mac_address: '00:1A:2B:3C:4D:5E', vendor: 'Siemens', model: 'S7-1500', status: 'ACTIVE', criticality: 'CRITICAL', health_score: 95 },
  { id: 2, assetUuid: 'ast-rtu-001', asset_name: 'RTU-001', asset_type: 'RTU', ip_address: '192.168.1.20', mac_address: '00:1A:2B:3C:4D:6F', vendor: 'Schneider', model: 'ScadaPack', status: 'ACTIVE', criticality: 'HIGH', health_score: 90 },
  { id: 3, assetUuid: 'ast-hmi-001', asset_name: 'HMI-001', asset_type: 'HMI', ip_address: '192.168.1.50', mac_address: '00:1A:2B:3C:4D:7A', vendor: 'Wonderware', model: 'InTouch', status: 'ACTIVE', criticality: 'HIGH', health_score: 98 }
];

export const TEST_TELEMETRY_BATCH = [
  { sensor_id: 'SENS-PRESS-001', asset_id: 'PLC-001', metric_name: 'WATER_PRESSURE_PSI', value: 42.5, status: 'NORMAL', timestamp: new Date().toISOString() },
  { sensor_id: 'SENS-TEMP-001', asset_id: 'PLC-001', metric_name: 'COOLANT_TEMP_C', value: 68.2, status: 'NORMAL', timestamp: new Date().toISOString() },
  { sensor_id: 'SENS-FLOW-001', asset_id: 'RTU-001', metric_name: 'FLOW_RATE_GPM', value: 120.0, status: 'NORMAL', timestamp: new Date().toISOString() }
];

export const TEST_NETWORK_FLOWS = [
  { flow_id: 'flow-001', source_ip: '192.168.1.50', destination_ip: '192.168.1.10', protocol: 'MODBUS_TCP', src_port: 49152, dst_port: 502, bytes_sent: 512, packets_sent: 8, status: 'ACTIVE' },
  { flow_id: 'flow-002', source_ip: '192.168.1.100', destination_ip: '192.168.1.10', protocol: 'MODBUS_TCP', src_port: 52110, dst_port: 502, bytes_sent: 1024, packets_sent: 16, status: 'NEW' }
];

export const TEST_MODBUS_EVENTS = [
  { id: 1, unit_id: 1, function_code: 3, function_name: 'READ_HOLDING_REGISTERS', start_address: 0, quantity: 10, response_time_ms: 12, is_error: false },
  { id: 2, unit_id: 1, function_code: 5, function_name: 'WRITE_SINGLE_COIL', start_address: 100, write_value: 1, response_time_ms: 18, is_error: false }
];

export const TEST_DETECTIONS = [
  { id: 1, detection_uuid: 'det-001', rule_id: 'RULE_MODBUS_WRITE_001', rule_name: 'Unauthorized Modbus Coil Override', severity: 'HIGH', asset_id: 'PLC-001', details: { coil_address: 100 } }
];

export const TEST_ALERTS = [
  { id: 1, alert_number: 'ALT-2026-000001', title: 'Unauthorized Modbus Write to PLC Register', severity: 'HIGH', status: 'NEW', asset_id: 'PLC-001', created_at: new Date().toISOString() }
];

export const TEST_INCIDENTS = [
  { id: 1, incident_number: 'INC-2026-000001', title: 'Unauthorized Modbus Control Override on PLC-001', severity: 'HIGH', status: 'TRIAGED', priority: 'P1', assignee_id: 2 }
];

export const TEST_RESPONSE_PLANS = [
  { id: 1, plan_number: 'RSP-2026-000001', incident_id: 'INC-2026-000001', status: 'PENDING_APPROVAL', approval_policy: 'ADMIN_APPROVAL', created_by: 2 }
];

export const TEST_SIMULATION_SCENARIOS = [
  { id: 12, scenario_code: 'SIM-MULTISTAGE-001', name: 'Multi-Stage Lab Cyber Incident', category: 'MULTI_STAGE', difficulty: 'ADVANCED', risk_level: 'HIGH', duration: 120, steps_count: 5 }
];
