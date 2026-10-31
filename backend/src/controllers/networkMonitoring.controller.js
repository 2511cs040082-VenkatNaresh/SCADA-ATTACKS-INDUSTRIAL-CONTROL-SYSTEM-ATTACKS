import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { networkMonitoringBackendService } from '../services/networkMonitoring.service.js';

export async function processNetworkUpdate(req, res, next) {
  try {
    const result = await networkMonitoringBackendService.processNetworkUpdate(req.body);
    return successResponse(res, result, 'Network update processed', 201);
  } catch (err) {
    next(err);
  }
}

export async function getFlows(req, res, next) {
  try {
    const flows = await networkMonitoringBackendService.getFlows(req.query);
    return successResponse(res, flows, 'Fetched network flows');
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req, res, next) {
  try {
    const sessions = await networkMonitoringBackendService.getSessions(req.query);
    return successResponse(res, sessions, 'Fetched protocol sessions');
  } catch (err) {
    next(err);
  }
}

export async function getModbusTransactions(req, res, next) {
  try {
    const transactions = await networkMonitoringBackendService.getModbusTransactions(req.query);
    return successResponse(res, transactions, 'Fetched Modbus transactions');
  } catch (err) {
    next(err);
  }
}

export async function getMetrics(_req, res, next) {
  try {
    const metrics = await networkMonitoringBackendService.getMetrics();
    return successResponse(res, metrics, 'Fetched network & protocol metrics');
  } catch (err) {
    next(err);
  }
}
