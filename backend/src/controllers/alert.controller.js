import * as alertService from '../services/alert.service.js';
import * as ingestionService from '../services/alertEngine/ingestion.js';
import * as suppressionService from '../services/alertEngine/suppression.js';
import * as correlationService from '../services/alertEngine/correlation.js';
import * as notificationService from '../services/alertEngine/notifications.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getAlerts(req, res, next) {
  try {
    const alerts = await alertService.getAlerts(req.query);
    return successResponse(res, alerts, 'Fetched security alerts');
  } catch (err) {
    next(err);
  }
}

export async function getAlert(req, res, next) {
  try {
    const alert = await alertService.getAlertById(req.params.id);
    if (!alert) return errorResponse(res, 'Alert not found', 404);
    return successResponse(res, alert, 'Fetched alert details');
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    const userId = req.user?.id;
    const alert = await alertService.updateAlertStatus(req.params.id, status, userId, reason);
    return successResponse(res, alert, 'Alert status updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function assignAlert(req, res, next) {
  try {
    const { assigned_to } = req.body;
    const assignerId = req.user?.id;
    const alert = await alertService.assignAlert(req.params.id, assigned_to, assignerId);
    return successResponse(res, alert, 'Alert assigned successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function escalateAlert(req, res, next) {
  try {
    const { priority, reason } = req.body;
    const userId = req.user?.id;
    const alert = await alertService.escalateAlert(req.params.id, priority, userId, reason);
    return successResponse(res, alert, 'Alert escalated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function suppressAlert(req, res, next) {
  try {
    const { reason } = req.body;
    const userId = req.user?.id;
    const alert = await alertService.updateAlertStatus(req.params.id, 'SUPPRESSED', userId, reason);
    return successResponse(res, alert, 'Alert suppressed successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function markFalsePositive(req, res, next) {
  try {
    const { reason } = req.body;
    const userId = req.user?.id;
    const alert = await alertService.updateAlertStatus(req.params.id, 'FALSE_POSITIVE', userId, reason);
    return successResponse(res, alert, 'Alert marked as false positive');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function markDuplicate(req, res, next) {
  try {
    const { primary_alert_id, reason } = req.body;
    const userId = req.user?.id;
    const alert = await alertService.updateAlertStatus(req.params.id, 'DUPLICATE', userId, reason || `Duplicate of Alert #${primary_alert_id}`);
    return successResponse(res, alert, 'Alert marked as duplicate');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function addNote(req, res, next) {
  try {
    const { note } = req.body;
    const userId = req.user?.id;
    const authorUsername = req.user?.username || 'SOC Analyst';
    const noteRecord = await alertService.addAlertNote(req.params.id, userId, authorUsername, note);
    return successResponse(res, noteRecord, 'Analyst note added');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getHistory(req, res, next) {
  try {
    const history = await alertService.getAlertHistory(req.params.id);
    return successResponse(res, history, 'Fetched alert history');
  } catch (err) {
    next(err);
  }
}

export async function getEvidence(req, res, next) {
  try {
    const evidence = await alertService.getAlertEvidence(req.params.id);
    if (!evidence) return errorResponse(res, 'Alert evidence not found', 404);
    return successResponse(res, evidence, 'Fetched alert evidence details');
  } catch (err) {
    next(err);
  }
}

export async function getTimeline(req, res, next) {
  try {
    const timeline = await alertService.getAlertTimeline(req.params.id);
    return successResponse(res, timeline, 'Fetched alert timeline');
  } catch (err) {
    next(err);
  }
}

export async function getMetrics(req, res, next) {
  try {
    const metrics = await alertService.getAlertMetrics();
    return successResponse(res, metrics, 'Fetched alert operations metrics');
  } catch (err) {
    next(err);
  }
}

export async function getGroups(req, res, next) {
  try {
    const groups = await correlationService.getAlertGroups();
    return successResponse(res, groups, 'Fetched alert groups');
  } catch (err) {
    next(err);
  }
}

export async function getSuppressions(req, res, next) {
  try {
    const suppressions = await suppressionService.getSuppressions();
    return successResponse(res, suppressions, 'Fetched alert suppressions');
  } catch (err) {
    next(err);
  }
}

export async function createSuppression(req, res, next) {
  try {
    const suppression = await suppressionService.createSuppression(req.body);
    return successResponse(res, suppression, 'Created suppression rule');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotifications(req.query);
    return successResponse(res, notifications, 'Fetched alert notifications');
  } catch (err) {
    next(err);
  }
}

export async function markNotificationsRead(req, res, next) {
  try {
    const { ids } = req.body || {};
    const result = await notificationService.markNotificationsAsRead(ids);
    return successResponse(res, result, 'Marked notifications read');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getHealth(req, res, next) {
  try {
    const health = await alertService.getAlertHealth();
    return successResponse(res, health, 'Fetched alert engine health');
  } catch (err) {
    next(err);
  }
}

export async function exportAlerts(req, res, next) {
  try {
    const { format = 'json' } = req.query;
    const data = await alertService.exportAlerts(req.query, format);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="alerts_export.csv"');
      return res.send(data);
    }
    return successResponse(res, data, 'Exported security alerts');
  } catch (err) {
    next(err);
  }
}

export async function ingestManualAlert(req, res, next) {
  try {
    const alert = await ingestionService.ingestDetection({
      ...req.body,
      source_type: req.body.source_type || 'MANUAL_ALERT'
    });
    return successResponse(res, alert, 'Manual alert ingested successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}
