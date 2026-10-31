import { Router } from 'express';
import * as incidentController from '../controllers/incident.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { securityConfig } from '../config/security.js';

const router = Router();

const ANALYST_ROLES = [
  securityConfig.roles.ADMIN,
  securityConfig.roles.SECURITY_ANALYST,
  securityConfig.roles.SOC_OPERATOR
];

// Incident Case List & Creation
router.get('/', authenticate, incidentController.getIncidents);
router.post('/', authenticate, authorize(...ANALYST_ROLES), incidentController.createIncident);
router.post('/from-alert/:alertId', authenticate, authorize(...ANALYST_ROLES), incidentController.createFromAlert);
router.post('/from-alert-group/:groupId', authenticate, authorize(...ANALYST_ROLES), incidentController.createFromAlertGroup);
router.get('/metrics', authenticate, incidentController.getMetrics);

// Single Incident Detail & Action Handlers
router.get('/:id', authenticate, incidentController.getIncident);
router.patch('/:id/status', authenticate, authorize(...ANALYST_ROLES), incidentController.updateStatus);
router.post('/:id/triage', authenticate, authorize(...ANALYST_ROLES), incidentController.triageIncident);
router.post('/:id/assign', authenticate, authorize(...ANALYST_ROLES), incidentController.assignIncident);
router.post('/:id/recommend-containment', authenticate, authorize(...ANALYST_ROLES), incidentController.recommendContainment);
router.post('/:id/resolve', authenticate, authorize(...ANALYST_ROLES), incidentController.resolveIncident);
router.post('/:id/close', authenticate, authorize(...ANALYST_ROLES), incidentController.closeIncident);
router.post('/:id/reopen', authenticate, authorize(...ANALYST_ROLES), incidentController.reopenIncident);

// Sub-resource Investigation Inspectors
router.get('/:id/timeline', authenticate, incidentController.getTimeline);
router.get('/:id/evidence', authenticate, incidentController.getEvidence);
router.post('/:id/evidence', authenticate, authorize(...ANALYST_ROLES), incidentController.addEvidence);
router.get('/:id/notes', authenticate, incidentController.getNotes);
router.post('/:id/notes', authenticate, authorize(...ANALYST_ROLES), incidentController.addNote);
router.get('/:id/tasks', authenticate, incidentController.getTasks);
router.post('/:id/tasks', authenticate, authorize(...ANALYST_ROLES), incidentController.createTask);
router.patch('/:id/tasks/:taskId', authenticate, authorize(...ANALYST_ROLES), incidentController.updateTask);
router.get('/:id/findings', authenticate, incidentController.getFindings);
router.post('/:id/findings', authenticate, authorize(...ANALYST_ROLES), incidentController.addFinding);
router.get('/:id/hypotheses', authenticate, incidentController.getHypotheses);
router.post('/:id/hypotheses', authenticate, authorize(...ANALYST_ROLES), incidentController.addHypothesis);

export default router;
