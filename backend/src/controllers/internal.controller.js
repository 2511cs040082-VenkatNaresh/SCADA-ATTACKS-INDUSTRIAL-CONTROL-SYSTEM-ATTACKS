import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { telemetryPipelineBackendService } from '../services/telemetryPipeline.service.js';

export async function ingestEvent(req, res, next) {
  try {
    const event = req.body;
    if (!event || !event.event_type || !event.source) {
      return errorResponse(res, 'Invalid event payload structure', 400);
    }
    const result = await telemetryPipelineBackendService.processEvent(event);
    return successResponse(res, result, 'Ingested event successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function ingestBatch(req, res, next) {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return errorResponse(res, 'Batch payload must contain an events array', 400);
    }
    const results = await telemetryPipelineBackendService.processBatch(events);
    return successResponse(res, { processed: results.length, results }, 'Processed batch events', 201);
  } catch (err) {
    next(err);
  }
}

export async function getPipelineHealth(_req, res) {
  const health = telemetryPipelineBackendService.getHealth();
  return successResponse(res, health, 'Telemetry pipeline health metrics');
}
