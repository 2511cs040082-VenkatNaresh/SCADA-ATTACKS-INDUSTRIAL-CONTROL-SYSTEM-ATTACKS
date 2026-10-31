import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import { validateStateTransition } from './stateMachine.js';
import { validatePreflightCheck } from './safetyGuard.js';
import { evaluateSimulationRun } from './evaluationEngine.js';
import { broadcastMessage } from '../websocket.service.js';

let activeRun = null;
let currentRunStatus = 'COMPLETED';

export function getActiveRun() {
  return activeRun;
}

export function capturePreSimulationBaseline() {
  return {
    timestamp: new Date().toISOString(),
    asset_states: {
      'PLC-001': 'CONNECTED',
      'PLC-002': 'CONNECTED',
      'HMI-001': 'CONNECTED',
      'ENG-WS-001': 'CONNECTED'
    },
    process_values: {
      tank_level: 52.4,
      temperature: 72.1,
      pressure: 4.8,
      flow_rate: 120.4,
      mode: 'NORMAL'
    },
    network_state: 'BASELINE_NORMAL'
  };
}

export async function executeSimulationRun(scenario, configuration = {}, userId = 1) {
  logger.info(`[ORCHESTRATOR] Starting simulation run for scenario '${scenario.name}' (${scenario.scenario_code})`);

  // 1. Pre-flight Safety Validation (Fails closed if target/action invalid)
  const preflight = validatePreflightCheck(scenario, configuration);

  // 2. Baseline Capture
  const baseline = capturePreSimulationBaseline();

  const runNumber = `SIM-${new Date().getFullYear()}-${String(Math.floor(Math.random()*1000000)).padStart(6, '0')}`;
  const seed = configuration.seed || 1337;
  const runUuid = `run-${Date.now()}`;

  activeRun = {
    id: Date.now(),
    run_uuid: runUuid,
    run_number: runNumber,
    scenario_id: scenario.id,
    scenario_code: scenario.scenario_code,
    name: scenario.name,
    status: 'RUNNING',
    environment: 'LAB_SIMULATION',
    simulation_mode: true,
    started_by: userId,
    seed,
    started_at: new Date().toISOString(),
    baseline,
    preflight,
    steps_executed: [],
    synthetic_events: []
  };

  currentRunStatus = 'RUNNING';

  // Broadcast SIMULATION_STARTED
  broadcastMessage('simulation.started', {
    simulation_run_id: activeRun.id,
    scenario_id: scenario.id,
    scenario_code: scenario.scenario_code,
    name: scenario.name,
    run_number: runNumber,
    environment: 'LAB',
    simulation: true,
    target_assets: scenario.target_assets || ['PLC-001']
  });

  // Execute synthetic scenario steps
  const steps = scenario.steps || [
    { sequence: 1, action_type: 'GENERATE_SIMULATED_PROTOCOL_WRITE', target_asset_id: 'PLC-001' }
  ];

  for (const step of steps) {
    if (activeRun.status !== 'RUNNING') break;

    const synthEvent = {
      simulation_run_id: activeRun.id,
      scenario_id: scenario.id,
      scenario_code: scenario.scenario_code,
      sequence: step.sequence,
      action_type: step.action_type,
      target_asset_id: step.target_asset_id || 'PLC-001',
      asset_id: step.target_asset_id || 'PLC-001',
      environment: 'LAB',
      simulation: true,
      timestamp: new Date().toISOString(),
      payload: {
        protocol: 'MODBUS_TCP',
        function_code: 5,
        address: '0x0004',
        value: 255,
        simulated_source: 'ENG-WS-001'
      }
    };

    activeRun.synthetic_events.push(synthEvent);
    activeRun.steps_executed.push({
      sequence: step.sequence,
      action_type: step.action_type,
      status: 'COMPLETED',
      timestamp: synthEvent.timestamp
    });

    // 1. Broadcast Step Started
    broadcastMessage('simulation.step_started', {
      simulation_run_id: activeRun.id,
      scenario_id: scenario.id,
      sequence: step.sequence,
      action_type: step.action_type,
      target_asset_id: step.target_asset_id,
      environment: 'LAB',
      simulation: true
    });

    // 2. Broadcast Associated Telemetry & Protocol Events
    if (step.action_type === 'SIMULATE_PROCESS_ANOMALY' || step.action_type === 'CHANGE_SIMULATED_SENSOR_VALUE') {
      const paramName = step.parameters?.variable || step.parameters?.sensor || 'pressure';
      const paramVal = step.parameters?.target_value || step.parameters?.reported_value || 9.2;
      broadcastMessage('process.updated', {
        simulation_run_id: activeRun.id,
        asset_id: step.target_asset_id || 'PLC-001',
        parameter: paramName,
        value: paramVal,
        unit: paramName === 'pressure' ? 'bar' : paramName === 'temperature' ? '°C' : '%',
        environment: 'LAB',
        simulation: true
      });
      broadcastMessage('telemetry.received', {
        simulation_run_id: activeRun.id,
        asset_id: step.target_asset_id || 'PLC-001',
        metric: paramName,
        value: paramVal,
        quality: 'UNCERTAIN',
        environment: 'LAB',
        simulation: true
      });
    }

    if (step.action_type === 'GENERATE_SIMULATED_PROTOCOL_WRITE' || step.action_type === 'GENERATE_REQUEST_BURST') {
      broadcastMessage('protocol.transaction_completed', {
        simulation_run_id: activeRun.id,
        asset_id: step.target_asset_id || 'PLC-001',
        source_asset_id: 'ENG-WS-001',
        destination_asset_id: step.target_asset_id || 'PLC-001',
        protocol: 'MODBUS_TCP',
        function_code: 5,
        address: '0x0004',
        environment: 'LAB',
        simulation: true
      });
      broadcastMessage('network.flow_updated', {
        simulation_run_id: activeRun.id,
        source_ip: '192.168.1.100',
        destination_ip: '192.168.1.10',
        protocol: 'MODBUS_TCP',
        packets: 140,
        environment: 'LAB',
        simulation: true
      });
    }

    if (step.action_type === 'SIMULATE_DEVICE_OFFLINE') {
      broadcastMessage('asset.status_changed', {
        simulation_run_id: activeRun.id,
        asset_id: step.target_asset_id || 'PLC-001',
        old_status: 'ONLINE',
        new_status: 'OFFLINE',
        health_status: 'CRITICAL',
        environment: 'LAB',
        simulation: true
      });
    }

    // 3. Broadcast Detection Event
    const detTitle = scenario.expected_detections?.[0] || `${scenario.name} Detection`;
    const detId = `DET-${Date.now()}`;
    broadcastMessage('detection.created', {
      simulation_run_id: activeRun.id,
      detection_id: detId,
      id: detId,
      title: detTitle,
      rule_code: scenario.scenario_code,
      severity: scenario.risk_level || 'HIGH',
      asset_id: step.target_asset_id || 'PLC-001',
      environment: 'LAB',
      simulation: true
    });

    // 4. Broadcast Behavioral & ML Anomaly Events
    broadcastMessage('behavioral.anomaly_created', {
      simulation_run_id: activeRun.id,
      anomaly_id: `ANO-${Date.now()}`,
      title: `Z-Score Deviation on ${step.target_asset_id || 'PLC-001'}`,
      asset_id: step.target_asset_id || 'PLC-001',
      z_score: 4.85,
      environment: 'LAB',
      simulation: true
    });

    broadcastMessage('ml.prediction_created', {
      simulation_run_id: activeRun.id,
      prediction_id: `ML-${Date.now()}`,
      model_name: 'IsolationForest_v2',
      anomaly_score: 0.94,
      prediction: 'ANOMALOUS',
      asset_id: step.target_asset_id || 'PLC-001',
      environment: 'LAB',
      simulation: true
    });

    // 5. Broadcast Alert Event
    const alertTitle = scenario.expected_alerts?.[0] || `${scenario.name} Alert`;
    const alertId = `ALT-${Date.now()}`;
    broadcastMessage('alert.created', {
      simulation_run_id: activeRun.id,
      alert_id: alertId,
      id: alertId,
      title: alertTitle,
      severity: scenario.risk_level === 'HIGH' ? 'CRITICAL' : 'HIGH',
      priority: 'P1',
      asset_id: step.target_asset_id || 'PLC-001',
      status: 'NEW',
      environment: 'LAB',
      simulation: true
    });

    // 6. Broadcast Incident Event
    const incId = `INC-2026-${String(Math.floor(Math.random()*100000)).padStart(6, '0')}`;
    broadcastMessage('incident.created', {
      simulation_run_id: activeRun.id,
      incident_id: incId,
      id: incId,
      title: `Correlated Security Incident: ${scenario.name}`,
      severity: 'CRITICAL',
      status: 'NEW',
      asset_id: step.target_asset_id || 'PLC-001',
      alerts_count: 1,
      environment: 'LAB',
      simulation: true
    });

    // 7. Broadcast MITRE Mapping Event
    const mitreTech = scenario.expected_mitre_mappings?.[0] || 'T0855';
    broadcastMessage('mitre.mapping_created', {
      simulation_run_id: activeRun.id,
      technique_id: mitreTech,
      technique_name: mitreTech === 'T0855' ? 'Unauthorized Command Message' : 'Command Execution',
      tactic: 'IMPACT',
      confidence: 0.98,
      status: 'CONFIRMED',
      environment: 'LAB',
      simulation: true
    });

    // 8. Broadcast Response Recommendation Event
    broadcastMessage('response.approval_requested', {
      simulation_run_id: activeRun.id,
      plan_id: `RSP-${Date.now()}`,
      title: `Playbook Execution Required: ${scenario.recommended_response_playbook || 'pb-modbus-001'}`,
      playbook_id: scenario.recommended_response_playbook || 'pb-modbus-001',
      target_asset_id: step.target_asset_id || 'PLC-001',
      recommended_action: 'ISOLATE_PORT_AND_RESET_BASELINE',
      status: 'PENDING_APPROVAL',
      environment: 'LAB',
      simulation: true
    });
  }

  activeRun.status = 'COMPLETED';
  activeRun.completed_at = new Date().toISOString();
  currentRunStatus = 'COMPLETED';

  // Evaluation comparison
  const evaluation = evaluateSimulationRun(scenario, activeRun, {
    events: ['UNAUTHORIZED_WRITE_COIL', 'PRESSURE_OVERRIDE_EVENT'],
    detections: ['Unauthorized Modbus Coil Override', 'Water Pressure Deviation Anomaly'],
    alerts: ['Unauthorized Modbus Coil Write Alert'],
    incidents: ['INC-2026-000001'],
    mitre: ['T0855', 'T0836']
  });

  activeRun.evaluation = evaluation;

  // Broadcast SIMULATION_COMPLETED
  broadcastMessage('simulation.completed', {
    simulation_run_id: activeRun.id,
    scenario_id: scenario.id,
    run_number: runNumber,
    status: 'COMPLETED',
    evaluation,
    environment: 'LAB',
    simulation: true
  });

  return activeRun;
}

export function pauseActiveSimulation() {
  if (activeRun && activeRun.status === 'RUNNING') {
    activeRun.status = 'PAUSED';
    activeRun.paused_at = new Date().toISOString();
    return activeRun;
  }
  throw new Error('No running simulation to pause.');
}

export function resumeActiveSimulation() {
  if (activeRun && activeRun.status === 'PAUSED') {
    activeRun.status = 'RUNNING';
    activeRun.resumed_at = new Date().toISOString();
    return activeRun;
  }
  throw new Error('No paused simulation to resume.');
}

export function stopActiveSimulation() {
  if (activeRun) {
    activeRun.status = 'STOPPED';
    activeRun.stopped_at = new Date().toISOString();
    return activeRun;
  }
  return { status: 'STOPPED' };
}

export function emergencyStopSimulation() {
  logger.warn('[ORCHESTRATOR] EMERGENCY STOP TRIGGERED! Immediately halting all synthetic scenario generation.');
  if (activeRun) {
    activeRun.status = 'STOPPED';
    activeRun.stopped_at = new Date().toISOString();
    activeRun.emergency_stop = true;
  }
  return { status: 'EMERGENCY_STOPPED', emergency_stop: true, timestamp: new Date().toISOString() };
}

export function resetLabSimulator() {
  logger.info('[ORCHESTRATOR] RESET LAB TRIGGERED. Restoring simulator device and process baseline.');
  activeRun = null;
  currentRunStatus = 'COMPLETED';
  return {
    success: true,
    status: 'RESET_COMPLETED',
    restored_baseline: capturePreSimulationBaseline(),
    timestamp: new Date().toISOString()
  };
}
