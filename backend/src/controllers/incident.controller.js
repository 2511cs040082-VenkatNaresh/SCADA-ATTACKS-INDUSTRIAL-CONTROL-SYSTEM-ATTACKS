import * as incidentService from '../services/incident.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getIncidents(req, res, next) {
  try {
    const incidents = await incidentService.getIncidents(req.query);
    return successResponse(res, incidents, 'Fetched security incident cases');
  } catch (err) {
    next(err);
  }
}

export async function getIncident(req, res, next) {
  try {
    const incident = await incidentService.getIncidentById(req.params.id);
    if (!incident) return errorResponse(res, 'Incident case not found', 404);
    return successResponse(res, incident, 'Fetched incident details');
  } catch (err) {
    next(err);
  }
}

export async function createIncident(req, res, next) {
  try {
    const userId = req.user?.id;
    const incident = await incidentService.createIncident(req.body, userId);
    return successResponse(res, incident, 'Created incident case successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function createFromAlert(req, res, next) {
  try {
    const userId = req.user?.id;
    const alertId = req.params.alertId;
    const { notes } = req.body || {};
    const incident = await incidentService.createIncidentFromAlert(alertId, userId, notes);
    return successResponse(res, incident, 'Created incident case from alert', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function createFromAlertGroup(req, res, next) {
  try {
    const userId = req.user?.id;
    const groupId = req.params.groupId;
    const { notes } = req.body || {};
    const incident = await incidentService.createIncidentFromAlertGroup(groupId, userId, notes);
    return successResponse(res, incident, 'Created incident case from alert group', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    const userId = req.user?.id;
    const incident = await incidentService.updateIncidentStatus(req.params.id, status, userId, reason);
    return successResponse(res, incident, 'Updated incident status');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function triageIncident(req, res, next) {
  try {
    const userId = req.user?.id;
    const incident = await incidentService.updateIncidentStatus(req.params.id, 'TRIAGED', userId, 'Incident triaged by SOC analyst');
    return successResponse(res, incident, 'Incident triaged');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function assignIncident(req, res, next) {
  try {
    const { assigned_to, role } = req.body;
    const userId = req.user?.id;
    const incident = await incidentService.assignIncident(req.params.id, assigned_to, userId, role);
    return successResponse(res, incident, 'Assigned incident lead investigator');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function recommendContainment(req, res, next) {
  try {
    const { recommendation } = req.body;
    const userId = req.user?.id;
    const incident = await incidentService.updateIncidentStatus(req.params.id, 'CONTAINMENT_RECOMMENDED', userId, recommendation || 'Analyst recommended containment actions');
    return successResponse(res, incident, 'Containment recommended');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function resolveIncident(req, res, next) {
  try {
    const userId = req.user?.id;
    const { reason = 'Incident resolved' } = req.body || {};
    const incident = await incidentService.updateIncidentStatus(req.params.id, 'RESOLVED', userId, reason);
    return successResponse(res, incident, 'Incident case resolved');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function closeIncident(req, res, next) {
  try {
    const userId = req.user?.id;
    const incident = await incidentService.updateIncidentStatus(req.params.id, 'CLOSED', userId, 'Incident case closed');
    return successResponse(res, incident, 'Incident case closed');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function reopenIncident(req, res, next) {
  try {
    const userId = req.user?.id;
    const { reason = 'Reopened for additional investigation' } = req.body || {};
    const incident = await incidentService.updateIncidentStatus(req.params.id, 'INVESTIGATING', userId, reason);
    return successResponse(res, incident, 'Incident case reopened');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getTimeline(req, res, next) {
  try {
    const timeline = await incidentService.getIncidentTimeline(req.params.id);
    return successResponse(res, timeline, 'Fetched incident timeline');
  } catch (err) {
    next(err);
  }
}

export async function getEvidence(req, res, next) {
  try {
    const evidence = await incidentService.getIncidentEvidence(req.params.id);
    return successResponse(res, evidence, 'Fetched incident evidence store');
  } catch (err) {
    next(err);
  }
}

export async function addEvidence(req, res, next) {
  try {
    const userId = req.user?.id;
    const evidence = await incidentService.addIncidentEvidence(req.params.id, req.body, userId);
    return successResponse(res, evidence, 'Evidence item added to incident case', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getNotes(req, res, next) {
  try {
    const notes = await incidentService.getIncidentNotes(req.params.id);
    return successResponse(res, notes, 'Fetched incident notes');
  } catch (err) {
    next(err);
  }
}

export async function addNote(req, res, next) {
  try {
    const userId = req.user?.id;
    const authorUsername = req.user?.username || 'soc_analyst';
    const note = await incidentService.addIncidentNote(req.params.id, { ...req.body, author_username: authorUsername }, userId);
    return successResponse(res, note, 'Note added to incident case', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getTasks(req, res, next) {
  try {
    const tasks = await incidentService.getIncidentTasks(req.params.id);
    return successResponse(res, tasks, 'Fetched incident investigation tasks');
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const userId = req.user?.id;
    const task = await incidentService.createIncidentTask(req.params.id, req.body, userId);
    return successResponse(res, task, 'Created investigation task', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await incidentService.updateIncidentTask(req.params.taskId, req.body);
    return successResponse(res, task, 'Updated investigation task');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getFindings(req, res, next) {
  try {
    const findings = await incidentService.getIncidentFindings(req.params.id);
    return successResponse(res, findings, 'Fetched incident findings');
  } catch (err) {
    next(err);
  }
}

export async function addFinding(req, res, next) {
  try {
    const userId = req.user?.id;
    const finding = await incidentService.addIncidentFinding(req.params.id, req.body, userId);
    return successResponse(res, finding, 'Recorded incident finding', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getHypotheses(req, res, next) {
  try {
    const hypotheses = await incidentService.getIncidentHypotheses(req.params.id);
    return successResponse(res, hypotheses, 'Fetched incident hypotheses');
  } catch (err) {
    next(err);
  }
}

export async function addHypothesis(req, res, next) {
  try {
    const userId = req.user?.id;
    const hypo = await incidentService.addIncidentHypothesis(req.params.id, req.body, userId);
    return successResponse(res, hypo, 'Added incident hypothesis', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}

export async function getMetrics(req, res, next) {
  try {
    const metrics = await incidentService.getIncidentMetrics();
    return successResponse(res, metrics, 'Fetched incident metrics summary');
  } catch (err) {
    next(err);
  }
}

export async function getHealth(req, res, next) {
  try {
    const health = await incidentService.getIncidentHealth();
    return successResponse(res, health, 'Fetched incident health state');
  } catch (err) {
    next(err);
  }
}
