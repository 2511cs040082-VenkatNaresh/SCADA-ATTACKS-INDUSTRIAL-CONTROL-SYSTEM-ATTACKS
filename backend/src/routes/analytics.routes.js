import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/overview', authenticate, analyticsController.getOverview);
router.get('/security', authenticate, analyticsController.getOverview);
router.get('/alerts', authenticate, analyticsController.getAlerts);
router.get('/incidents', authenticate, analyticsController.getIncidents);
router.get('/detection', authenticate, analyticsController.getDetections);
router.get('/assets', authenticate, analyticsController.getAssets);
router.get('/network', authenticate, analyticsController.getOverview);
router.get('/protocol', authenticate, analyticsController.getOverview);
router.get('/process', authenticate, analyticsController.getOverview);
router.get('/ml', authenticate, analyticsController.getDetections);
router.get('/mitre', authenticate, analyticsController.getOverview);
router.get('/response', authenticate, analyticsController.getIncidents);
router.get('/simulation', authenticate, analyticsController.getSimulation);
router.get('/simulation/:runId', authenticate, analyticsController.getSimulation);

export default router;
