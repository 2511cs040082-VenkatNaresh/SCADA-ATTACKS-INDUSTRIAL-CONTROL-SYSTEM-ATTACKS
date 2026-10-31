import { Router } from 'express';
import * as behavioralController from '../controllers/behavioral.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Anomalies APIs
router.get('/anomalies', authenticate, behavioralController.getAnomalies);
router.get('/anomalies/:id', authenticate, behavioralController.getAnomalyById);
router.post('/evaluate', authenticate, behavioralController.evaluateObservation);

// Baselines APIs
router.get('/baselines', authenticate, behavioralController.getBaselines);
router.get('/baselines/:id', authenticate, behavioralController.getBaselineById);
router.post('/baselines/:id/freeze', authenticate, behavioralController.freezeBaseline);
router.post('/baselines/rebuild', authenticate, behavioralController.rebuildBaseline);

// Metrics & Health APIs
router.get('/metrics', authenticate, behavioralController.getMetrics);
router.get('/health', authenticate, behavioralController.getHealth);

export default router;
