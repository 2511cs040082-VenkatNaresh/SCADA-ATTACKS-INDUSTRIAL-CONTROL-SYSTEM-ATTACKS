import * as analyticsService from '../services/analytics.service.js';

export async function getOverview(req, res, next) {
  try {
    const data = await analyticsService.getAnalyticsOverview(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req, res, next) {
  try {
    const data = await analyticsService.getAlertAnalyticsData(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getIncidents(req, res, next) {
  try {
    const data = await analyticsService.getIncidentAnalyticsData(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getDetections(req, res, next) {
  try {
    const data = await analyticsService.getDetectionAnalyticsData(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAssets(req, res, next) {
  try {
    const data = await analyticsService.getAssetAnalyticsData(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSimulation(req, res, next) {
  try {
    const runId = req.params.runId || req.query.runId;
    const data = await analyticsService.getSimulationAnalyticsData(runId, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
