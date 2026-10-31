import * as telemetryService from '../services/telemetry.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getMetrics(_req, res, next) {
  try {
    const metrics = await telemetryService.getTelemetryMetrics();
    return successResponse(res, metrics, 'Fetched telemetry metrics');
  } catch (err) {
    next(err);
  }
}

export async function addReading(req, res, next) {
  try {
    const reading = await telemetryService.addTelemetryReading(req.body);
    return successResponse(res, reading, 'Recorded telemetry reading', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getLatestReadings(_req, res, next) {
  try {
    const readings = await telemetryService.getLatestReadingsPerMetric();
    return successResponse(res, readings, 'Fetched latest metric readings');
  } catch (err) {
    next(err);
  }
}

export async function getMetricHistory(req, res, next) {
  try {
    const history = await telemetryService.getMetricHistory(req.params.id, req.query.limit);
    return successResponse(res, history, 'Fetched metric historical readings');
  } catch (err) {
    next(err);
  }
}
