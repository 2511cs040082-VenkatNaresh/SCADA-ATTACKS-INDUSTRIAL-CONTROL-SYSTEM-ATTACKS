import * as behavioralService from '../services/behavioralEngine.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getAnomalies(req, res, next) {
  try {
    const { severity, status, limit, offset } = req.query;
    const anomalies = await behavioralService.getAnomalies({ severity, status, limit, offset });
    return successResponse(res, anomalies, 'Fetched behavioral anomalies');
  } catch (err) {
    next(err);
  }
}

export async function getAnomalyById(req, res, next) {
  try {
    const anomaly = await behavioralService.getAnomalyById(req.params.id);
    if (!anomaly) {
      return errorResponse(res, 'Behavioral anomaly record not found', 404);
    }
    return successResponse(res, anomaly, 'Fetched behavioral anomaly record details');
  } catch (err) {
    next(err);
  }
}

export async function evaluateObservation(req, res, next) {
  try {
    const observation = req.body.observation || req.body;
    const result = await behavioralService.evaluateBehavioralAnomaly(observation);
    return successResponse(res, result, 'Observation evaluated against behavioral baselines');
  } catch (err) {
    next(err);
  }
}

export async function getBaselines(req, res, next) {
  try {
    const { entity_type, entity_id, feature, state } = req.query;
    const baselines = await behavioralService.getBaselines({ entity_type, entity_id, feature, state });
    return successResponse(res, baselines, 'Fetched behavioral baselines');
  } catch (err) {
    next(err);
  }
}

export async function getBaselineById(req, res, next) {
  try {
    const baseline = await behavioralService.getBaselineById(req.params.id);
    if (!baseline) {
      return errorResponse(res, 'Behavioral baseline record not found', 404);
    }
    return successResponse(res, baseline, 'Fetched baseline record details');
  } catch (err) {
    next(err);
  }
}

export async function freezeBaseline(req, res, next) {
  try {
    const frozen = await behavioralService.freezeBaseline(req.params.id);
    if (!frozen) {
      return errorResponse(res, 'Behavioral baseline record not found', 404);
    }
    return successResponse(res, frozen, 'Behavioral baseline status set to FROZEN');
  } catch (err) {
    next(err);
  }
}

export async function rebuildBaseline(req, res, next) {
  try {
    const { entity_type, entity_id, feature, samples } = req.body;
    if (!entity_id || !feature) {
      return errorResponse(res, 'entity_id and feature parameters are required', 400);
    }
    const rebuilt = await behavioralService.rebuildBaseline(entity_type || 'ASSET', entity_id, feature, samples);
    return successResponse(res, rebuilt, 'Behavioral baseline rebuilt successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMetrics(_req, res, next) {
  try {
    const metrics = await behavioralService.getBehavioralMetrics();
    return successResponse(res, metrics, 'Fetched behavioral engine metrics');
  } catch (err) {
    next(err);
  }
}

export async function getHealth(_req, res, next) {
  try {
    const health = await behavioralService.getBehavioralHealth();
    return successResponse(res, health, 'Fetched behavioral engine health');
  } catch (err) {
    next(err);
  }
}
