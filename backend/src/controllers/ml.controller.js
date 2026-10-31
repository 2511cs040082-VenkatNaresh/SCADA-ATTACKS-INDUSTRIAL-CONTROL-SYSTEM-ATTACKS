import * as mlService from '../services/mlEngine.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getModels(_req, res, next) {
  try {
    const models = await mlService.getModels();
    return successResponse(res, models, 'Fetched registered ML models');
  } catch (err) {
    next(err);
  }
}

export async function getModelById(req, res, next) {
  try {
    const model = await mlService.getModelById(req.params.id);
    if (!model) {
      return errorResponse(res, 'ML model record not found', 404);
    }
    return successResponse(res, model, 'Fetched ML model record details');
  } catch (err) {
    next(err);
  }
}

export async function activateModel(req, res, next) {
  try {
    const model = await mlService.activateModel(req.params.id);
    if (!model) {
      return errorResponse(res, 'ML model record not found', 404);
    }
    return successResponse(res, model, 'ML model set to ACTIVE');
  } catch (err) {
    next(err);
  }
}

export async function retireModel(req, res, next) {
  try {
    const model = await mlService.retireModel(req.params.id);
    if (!model) {
      return errorResponse(res, 'ML model record not found', 404);
    }
    return successResponse(res, model, 'ML model status set to RETIRED');
  } catch (err) {
    next(err);
  }
}

export async function rollbackModel(req, res, next) {
  try {
    const model = await mlService.rollbackModel(req.params.id);
    return successResponse(res, model, 'Rolled back to previous ML model version');
  } catch (err) {
    next(err);
  }
}

export async function getDatasets(_req, res, next) {
  try {
    const datasets = await mlService.getDatasets();
    return successResponse(res, datasets, 'Fetched ML datasets');
  } catch (err) {
    next(err);
  }
}

export async function trainModel(req, res, next) {
  try {
    const { dataset_id, algorithm, parameters } = req.body;
    const result = await mlService.trainModel(dataset_id || 1, algorithm || 'ISOLATION_FOREST', parameters || {});
    return successResponse(res, result, 'ML model training job initiated and completed successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function predict(req, res, next) {
  try {
    const observation = req.body.observation || req.body;
    const prediction = await mlService.predict(observation);
    return successResponse(res, prediction, 'ML inference prediction completed');
  } catch (err) {
    next(err);
  }
}

export async function getPredictions(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const predictions = await mlService.getPredictions({ status, limit, offset });
    return successResponse(res, predictions, 'Fetched ML predictions');
  } catch (err) {
    next(err);
  }
}

export async function getPredictionById(req, res, next) {
  try {
    const prediction = await mlService.getPredictionById(req.params.id);
    if (!prediction) {
      return errorResponse(res, 'ML prediction record not found', 404);
    }
    return successResponse(res, prediction, 'Fetched ML prediction record details');
  } catch (err) {
    next(err);
  }
}

export async function getDriftMetrics(_req, res, next) {
  try {
    const drift = await mlService.getDriftMetrics();
    return successResponse(res, drift, 'Fetched ML data and model drift metrics');
  } catch (err) {
    next(err);
  }
}

export async function getMetrics(_req, res, next) {
  try {
    const metrics = await mlService.getMLMetrics();
    return successResponse(res, metrics, 'Fetched ML engine metrics');
  } catch (err) {
    next(err);
  }
}

export async function getHealth(_req, res, next) {
  try {
    const health = await mlService.getMLHealth();
    return successResponse(res, health, 'Fetched ML engine health');
  } catch (err) {
    next(err);
  }
}
