import * as detectionService from '../services/detectionEngine.service.js';
import { queryDetectionEngineStatus } from '../services/detection.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getRules(_req, res, next) {
  try {
    const rules = await detectionService.getRules();
    return successResponse(res, rules, 'Fetched detection engine rules');
  } catch (err) {
    next(err);
  }
}

export async function getRuleById(req, res, next) {
  try {
    const rule = await detectionService.getRuleById(req.params.id);
    if (!rule) {
      return errorResponse(res, 'Detection rule not found', 404);
    }
    return successResponse(res, rule, 'Fetched detection rule details');
  } catch (err) {
    next(err);
  }
}

export async function createRule(req, res, next) {
  try {
    const rule = await detectionService.createRule(req.body);
    return successResponse(res, rule, 'Detection rule created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateRule(req, res, next) {
  try {
    const rule = await detectionService.updateRule(req.params.id, req.body);
    if (!rule) {
      return errorResponse(res, 'Detection rule not found', 404);
    }
    return successResponse(res, rule, 'Detection rule updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function enableRule(req, res, next) {
  try {
    const rule = await detectionService.toggleRuleStatus(req.params.id, true);
    if (!rule) {
      return errorResponse(res, 'Detection rule not found', 404);
    }
    return successResponse(res, rule, 'Detection rule enabled');
  } catch (err) {
    next(err);
  }
}

export async function disableRule(req, res, next) {
  try {
    const rule = await detectionService.toggleRuleStatus(req.params.id, false);
    if (!rule) {
      return errorResponse(res, 'Detection rule not found', 404);
    }
    return successResponse(res, rule, 'Detection rule disabled');
  } catch (err) {
    next(err);
  }
}

export async function testRule(req, res, next) {
  try {
    const { condition, condition_json, observation, payload } = req.body;
    const cond = condition || condition_json;
    const obs = observation || payload || {};

    if (!cond) {
      return errorResponse(res, 'Missing condition or condition_json in request body', 400);
    }

    const testResult = detectionService.testRule(cond, obs);
    return successResponse(res, testResult, 'Dry-run rule test completed');
  } catch (err) {
    next(err);
  }
}

export async function evaluateObservation(req, res, next) {
  try {
    const observation = req.body.observation || req.body;
    const detections = await detectionService.evaluateObservation(observation);
    return successResponse(res, { matches_count: detections.length, detections }, 'Observation evaluated against detection engine');
  } catch (err) {
    next(err);
  }
}

export async function getDetections(req, res, next) {
  try {
    const { severity, category, protocol, asset_id, status, limit, offset } = req.query;
    const detections = await detectionService.getDetections({ severity, category, protocol, asset_id, status, limit, offset });
    return successResponse(res, detections, 'Fetched security detections');
  } catch (err) {
    next(err);
  }
}

export async function getDetectionById(req, res, next) {
  try {
    const detection = await detectionService.getDetectionById(req.params.id);
    if (!detection) {
      return errorResponse(res, 'Detection record not found', 404);
    }
    return successResponse(res, detection, 'Fetched detection record details');
  } catch (err) {
    next(err);
  }
}

export async function submitFeedback(req, res, next) {
  try {
    const { feedback, comments } = req.body;
    if (!feedback) {
      return errorResponse(res, 'Feedback status (TRUE_POSITIVE, FALSE_POSITIVE, BENIGN, NEEDS_REVIEW) is required', 400);
    }
    const analystId = req.user ? req.user.id : null;
    const updated = await detectionService.submitFeedback(req.params.id, analystId, feedback, comments);
    return successResponse(res, updated, 'Analyst feedback recorded');
  } catch (err) {
    next(err);
  }
}

export async function getMetrics(_req, res, next) {
  try {
    const metrics = await detectionService.getDetectionMetrics();
    return successResponse(res, metrics, 'Fetched detection engine metrics');
  } catch (err) {
    next(err);
  }
}

export async function getTimeline(_req, res, next) {
  try {
    const timeline = await detectionService.getDetectionTimeline();
    return successResponse(res, timeline, 'Fetched detection timeline');
  } catch (err) {
    next(err);
  }
}

export async function getEngineStatus(_req, res, next) {
  try {
    const pyStatus = await queryDetectionEngineStatus();
    const rules = await detectionService.getRules();
    return successResponse(res, {
      status: 'ONLINE',
      engine_type: 'RULE_BASED_ICS_ATTACK_DETECTION_ENGINE',
      phase: 'PHASE_8',
      active_rules_count: rules.filter(r => r.enabled).length,
      total_rules_configured: rules.length,
      python_microservice: pyStatus
    }, 'Fetched detection engine status');
  } catch (err) {
    next(err);
  }
}
