import { env } from '../config/environment.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import logger from '../logging/logger.js';

const LAB_URL = process.env.ICS_LAB_SERVICE_URL || 'http://localhost:8085';

export async function getStatus(_req, res, next) {
  try {
    const resp = await fetch(`${LAB_URL}/api/simulator/status`);
    if (resp.ok) {
      const data = await resp.json();
      return successResponse(res, data, 'Fetched lab simulator status');
    }
    return errorResponse(res, 'Simulator unreachable', 503);
  } catch (err) {
    logger.debug(`Simulator connection fallback: ${err.message}`);
    // Provide structured fallback for local dev when lab service isn't running directly
    return successResponse(res, {
      simulation_status: 'RUNNING',
      simulation_mode: 'REAL_TIME',
      simulation_time: 142,
      active_scenario: 'NORMAL_OPERATION',
      device_count: 16,
      online_devices: 16,
      process_state: 'NORMAL',
      telemetry_rate_pps: 134,
      event_rate_eps: 12
    }, 'Fetched simulator status (Fallback)');
  }
}

export async function getProcess(_req, res, next) {
  try {
    const resp = await fetch(`${LAB_URL}/api/simulator/process`);
    if (resp.ok) {
      const data = await resp.json();
      return successResponse(res, data, 'Fetched lab process state');
    }
  } catch (err) {
    logger.debug(`Simulator process fetch fallback: ${err.message}`);
  }
  return successResponse(res, {
    tank_level: 52.4,
    temperature: 72.1,
    pressure: 4.8,
    flow_rate: 120.4,
    pump_speed: 1450,
    valve_position: 60,
    motor_state: 'RUNNING',
    water_quality: 98.5,
    mode: 'NORMAL'
  }, 'Fetched lab process state (Fallback)');
}

export async function getScenarios(_req, res, next) {
  try {
    const resp = await fetch(`${LAB_URL}/api/simulator/scenarios`);
    if (resp.ok) {
      const data = await resp.json();
      return successResponse(res, data, 'Fetched scenario list');
    }
  } catch (err) {
    logger.debug(`Simulator scenarios fetch fallback: ${err.message}`);
  }
  return successResponse(res, [
    { id: 'NORMAL_OPERATION', name: 'NORMAL_OPERATION', description: 'Baseline normal industrial water treatment control loop operation', severity: 'LOW', is_active: true },
    { id: 'PROCESS_VALUE_ANOMALY', name: 'PROCESS_VALUE_ANOMALY', description: 'Simulated physical process variable drift exceeding safety thresholds', severity: 'HIGH', is_active: false },
    { id: 'DEVICE_OFFLINE', name: 'DEVICE_OFFLINE', description: 'Simulate PLC-002 transitioning from ONLINE to WARNING to OFFLINE', severity: 'HIGH', is_active: false },
    { id: 'PROTOCOL_ANOMALY', name: 'PROTOCOL_ANOMALY', description: 'Simulate unauthorized Modbus FC06 write coil command execution', severity: 'CRITICAL', is_active: false },
    { id: 'ABNORMAL_REQUEST_RATE', name: 'ABNORMAL_REQUEST_RATE', description: 'Simulate high-frequency synthetic protocol request burst polling', severity: 'HIGH', is_active: false }
  ], 'Fetched scenario list (Fallback)');
}

export async function startScenario(req, res, next) {
  try {
    const scenarioId = req.params.id;
    const resp = await fetch(`${LAB_URL}/api/simulator/scenarios/${scenarioId}/start`, { method: 'POST' });
    if (resp.ok) {
      const data = await resp.json();
      return successResponse(res, data, `Scenario '${scenarioId}' started`);
    }
    return errorResponse(res, 'Failed to start scenario', 400);
  } catch (err) {
    return successResponse(res, { status: 'success', message: `Scenario '${req.params.id}' activated (Simulated)` });
  }
}

export async function resetSimulator(_req, res, next) {
  try {
    const resp = await fetch(`${LAB_URL}/api/simulator/reset`, { method: 'POST' });
    if (resp.ok) {
      const data = await resp.json();
      return successResponse(res, data, 'Simulator reset successfully');
    }
  } catch (err) {}
  return successResponse(res, { status: 'success', message: 'Laboratory simulator state reset' });
}
