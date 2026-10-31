import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';

export const DEFAULT_PLAYBOOKS = [
  {
    id: 1,
    playbook_uuid: 'pb-modbus-001',
    title: 'Suspicious Modbus Activity Response',
    description: 'Investigate and simulate communication isolation for unauthorized Modbus write command attempts.',
    version: 'v1.0',
    category: 'MODBUS',
    severity: 'CRITICAL',
    trigger_condition: { protocol: 'MODBUS_TCP', event_type: 'UNAUTHORIZED_WRITE_COIL' },
    applicable_incident_types: ['MODBUS_OVERRIDE', 'UNAUTHORIZED_COMMAND'],
    applicable_asset_types: ['PLC', 'RTU'],
    applicable_mitre_techniques: ['T0855', 'T0836'],
    required_role: 'SECURITY_ANALYST',
    approval_type: 'SINGLE_APPROVAL',
    is_simulation_only: true,
    status: 'ACTIVE',
    steps: [
      { step_order: 1, action_type: 'ACKNOWLEDGE_ALERT', description: 'Acknowledge triggered Modbus alert' },
      { step_order: 2, action_type: 'OPEN_INVESTIGATION_TASK', description: 'Create investigation task for assigned SOC lead' },
      { step_order: 3, action_type: 'CAPTURE_PROTOCOL_CONTEXT', description: 'Extract Modbus function code and register payload' },
      { step_order: 4, action_type: 'CAPTURE_TELEMETRY_CONTEXT', description: 'Capture process sensor trends around event time' },
      { step_order: 5, action_type: 'SNAPSHOT_ASSET_STATE', description: 'Save current state of target PLC' },
      { step_order: 6, action_type: 'MARK_ASSET_UNDER_INVESTIGATION', description: 'Tag PLC status as UNDER_INVESTIGATION' },
      { step_order: 7, action_type: 'SIMULATE_NETWORK_ISOLATION', description: 'Simulate network isolation of target PLC in laboratory' }
    ]
  },
  {
    id: 2,
    playbook_uuid: 'pb-device-comm-002',
    title: 'Abnormal Device Communication Response',
    description: 'Contain unexpected cross-zone communication between unauthorized field devices.',
    version: 'v1.0',
    category: 'NETWORK',
    severity: 'HIGH',
    trigger_condition: { event_type: 'ANOMALOUS_FLOW' },
    applicable_incident_types: ['LATERAL_MOVEMENT', 'UNAPPROVED_PAIR'],
    applicable_asset_types: ['PLC', 'HMI', 'GATEWAY'],
    applicable_mitre_techniques: ['T0886', 'T0812'],
    required_role: 'SECURITY_ANALYST',
    approval_type: 'SINGLE_APPROVAL',
    is_simulation_only: true,
    status: 'ACTIVE',
    steps: [
      { step_order: 1, action_type: 'COLLECT_EVIDENCE', description: 'Capture PCAP and flow sequence' },
      { step_order: 2, action_type: 'SIMULATE_BLOCK_COMMUNICATION', description: 'Simulate blocking communication between source and target' },
      { step_order: 3, action_type: 'NOTIFY_ANALYST', description: 'Send alert notification to on-duty analyst' }
    ]
  },
  {
    id: 3,
    playbook_uuid: 'pb-workstation-003',
    title: 'Compromised Engineering Workstation Containment',
    description: 'Isolate compromised engineering workstation ENG-WS-001 in laboratory simulation.',
    version: 'v1.0',
    category: 'WORKSTATION',
    severity: 'HIGH',
    trigger_condition: { asset_type: 'WORKSTATION', threat_level: 'HIGH' },
    applicable_incident_types: ['WORKSTATION_COMPROMISE', 'MALWARE'],
    applicable_asset_types: ['WORKSTATION', 'HMI'],
    applicable_mitre_techniques: ['T0807', 'T0815'],
    required_role: 'SECURITY_ANALYST',
    approval_type: 'ADMIN_APPROVAL',
    is_simulation_only: true,
    status: 'ACTIVE',
    steps: [
      { step_order: 1, action_type: 'SNAPSHOT_ASSET_STATE', description: 'Snapshot workstation disk and memory telemetry' },
      { step_order: 2, action_type: 'SIMULATE_DEVICE_QUARANTINE', description: 'Simulate quarantine of ENG-WS-001 in lab environment' },
      { step_order: 3, action_type: 'NOTIFY_ADMIN', description: 'Alert OT administrator' }
    ]
  },
  {
    id: 4,
    playbook_uuid: 'pb-process-safe-004',
    title: 'Process Anomaly Safe-State Mitigation',
    description: 'Transition process model into simulated SAFE_STATE following sensor deviation.',
    version: 'v1.0',
    category: 'PROCESS',
    severity: 'CRITICAL',
    trigger_condition: { anomaly_type: 'STATISTICAL_ZSCORE' },
    applicable_incident_types: ['PROCESS_ANOMALY', 'PHYSICAL_DEVIATION'],
    applicable_asset_types: ['PLC', 'SENSOR'],
    applicable_mitre_techniques: ['T0836', 'T0826'],
    required_role: 'ADMIN',
    approval_type: 'ADMIN_APPROVAL',
    is_simulation_only: true,
    status: 'ACTIVE',
    steps: [
      { step_order: 1, action_type: 'CAPTURE_TELEMETRY_CONTEXT', description: 'Record pressure/temperature sensor readings' },
      { step_order: 2, action_type: 'SIMULATE_PROCESS_SAFE_STATE', description: 'Simulate safe-state transition in laboratory process model' }
    ]
  }
];

export async function getPlaybooks(filters = {}) {
  try {
    const pool = getDbPool();
    let sql = 'SELECT * FROM response_playbooks';
    const params = [];
    if (filters.status) {
      sql += ' WHERE status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY id ASC';
    const [rows] = await pool.query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[PLAYBOOK MGR] DB query failed, returning fixture playbooks: ${err.message}`);
  }
  let pbs = DEFAULT_PLAYBOOKS;
  if (filters.status) pbs = pbs.filter(p => p.status === filters.status);
  return pbs;
}

export async function getPlaybookById(id) {
  const pbs = await getPlaybooks();
  return pbs.find(p => String(p.id) === String(id) || p.playbook_uuid === id) || null;
}
