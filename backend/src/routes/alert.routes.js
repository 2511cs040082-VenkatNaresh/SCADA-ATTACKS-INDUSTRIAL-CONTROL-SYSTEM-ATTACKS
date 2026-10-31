import { Router } from 'express';
import * as alertController from '../controllers/alert.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { securityConfig } from '../config/security.js';

const router = Router();

const ANALYST_ROLES = [
  securityConfig.roles.ADMIN,
  securityConfig.roles.SECURITY_ANALYST,
  securityConfig.roles.SOC_OPERATOR
];

// Operational & General endpoints
router.get('/', authenticate, alertController.getAlerts);
router.get('/metrics', authenticate, alertController.getMetrics);
router.get('/groups', authenticate, alertController.getGroups);
router.get('/export', authenticate, alertController.exportAlerts);

// Suppressions
router.get('/suppressions', authenticate, alertController.getSuppressions);
router.post('/suppressions', authenticate, authorize(...ANALYST_ROLES), alertController.createSuppression);

// Notifications
router.get('/notifications', authenticate, alertController.getNotifications);
router.post('/notifications/read', authenticate, alertController.markNotificationsRead);

// Manual Alert Ingestion
router.post('/manual', authenticate, authorize(...ANALYST_ROLES), alertController.ingestManualAlert);

// Single Alert Details & Timeline
router.get('/:id', authenticate, alertController.getAlert);
router.get('/:id/history', authenticate, alertController.getHistory);
router.get('/:id/evidence', authenticate, alertController.getEvidence);
router.get('/:id/timeline', authenticate, alertController.getTimeline);

// Alert Workflow Action Endpoints
router.patch('/:id/status', authenticate, authorize(...ANALYST_ROLES), alertController.updateStatus);
router.post('/:id/acknowledge', authenticate, authorize(...ANALYST_ROLES), (req, res, next) => {
  req.body.status = 'ACKNOWLEDGED';
  alertController.updateStatus(req, res, next);
});
router.post('/:id/assign', authenticate, authorize(...ANALYST_ROLES), alertController.assignAlert);
router.post('/:id/escalate', authenticate, authorize(...ANALYST_ROLES), alertController.escalateAlert);
router.post('/:id/suppress', authenticate, authorize(...ANALYST_ROLES), alertController.suppressAlert);
router.post('/:id/false-positive', authenticate, authorize(...ANALYST_ROLES), alertController.markFalsePositive);
router.post('/:id/duplicate', authenticate, authorize(...ANALYST_ROLES), alertController.markDuplicate);
router.post('/:id/notes', authenticate, authorize(...ANALYST_ROLES), alertController.addNote);

export default router;
