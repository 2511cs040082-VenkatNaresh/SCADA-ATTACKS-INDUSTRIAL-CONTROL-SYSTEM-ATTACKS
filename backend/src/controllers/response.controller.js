import * as responseService from '../services/response.service.js';

export async function getRecommendations(req, res, next) {
  try {
    const filters = { incident_id: req.query.incident_id };
    const recs = await responseService.getRecommendations(filters);
    res.json({ success: true, count: recs.length, data: recs });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendationById(req, res, next) {
  try {
    const rec = await responseService.getRecommendationById(req.params.id);
    if (!rec) return res.status(404).json({ success: false, error: 'Recommendation not found' });
    res.json({ success: true, data: rec });
  } catch (err) {
    next(err);
  }
}

export async function acceptRecommendation(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const result = await responseService.acceptRecommendation(req.params.id, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function rejectRecommendation(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const rec = await responseService.rejectRecommendation(req.params.id, req.body.reason, userId);
    res.json({ success: true, data: rec });
  } catch (err) {
    next(err);
  }
}

export async function getResponsePlans(req, res, next) {
  try {
    const filters = { status: req.query.status };
    const plans = await responseService.getResponsePlans(filters);
    res.json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    next(err);
  }
}

export async function createResponsePlan(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const plan = await responseService.createResponsePlan(req.body, userId);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function getResponsePlanById(req, res, next) {
  try {
    const plan = await responseService.getResponsePlanById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Response Plan not found' });
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function approvePlan(req, res, next) {
  try {
    const user = req.user || { id: 2, role: 'ADMIN' };
    const plan = await responseService.approveResponsePlan(req.params.id, user, req.body.reason);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function rejectPlan(req, res, next) {
  try {
    const user = req.user || { id: 2, role: 'ADMIN' };
    const plan = await responseService.rejectResponsePlan(req.params.id, user, req.body.reason);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function executePlan(req, res, next) {
  try {
    const user = req.user || { id: 1, role: 'SECURITY_ANALYST' };
    const isDryRun = req.body.dry_run === true || req.query.dry_run === 'true';
    const result = await responseService.executePlan(req.params.id, isDryRun, user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function rollbackPlan(req, res, next) {
  try {
    const user = req.user || { id: 1, role: 'SECURITY_ANALYST' };
    const result = await responseService.rollbackPlan(req.params.id, user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPlaybooks(req, res, next) {
  try {
    const pbs = await responseService.getPlaybooks(req.query);
    res.json({ success: true, count: pbs.length, data: pbs });
  } catch (err) {
    next(err);
  }
}

export async function getPlaybookById(req, res, next) {
  try {
    const pb = await responseService.getPlaybookById(req.params.id);
    if (!pb) return res.status(404).json({ success: false, error: 'Playbook not found' });
    res.json({ success: true, data: pb });
  } catch (err) {
    next(err);
  }
}

export async function getApprovals(req, res, next) {
  try {
    const apprs = await responseService.getApprovals(req.query);
    res.json({ success: true, count: apprs.length, data: apprs });
  } catch (err) {
    next(err);
  }
}

export async function getResponseHealth(_req, res, next) {
  try {
    const health = await responseService.getResponseHealth();
    res.json(health);
  } catch (err) {
    next(err);
  }
}

export async function getResponseMetrics(_req, res, next) {
  try {
    const metrics = await responseService.getResponseMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}
