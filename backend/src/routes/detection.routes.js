import { Router } from 'express';
import * as detectionController from '../controllers/detection.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Detections APIs
router.get('/detections', authenticate, detectionController.getDetections);
router.get('/detections/metrics', authenticate, detectionController.getMetrics);
router.get('/detections/timeline', authenticate, detectionController.getTimeline);
router.post('/detections/evaluate', authenticate, detectionController.evaluateObservation);
router.get('/detections/:id', authenticate, detectionController.getDetectionById);
router.post('/detections/:id/feedback', authenticate, detectionController.submitFeedback);

// Rule Management & Dry Run APIs
router.get('/detection-rules', authenticate, detectionController.getRules);
router.post('/detection-rules', authenticate, detectionController.createRule);
router.post('/detection-rules/test', authenticate, detectionController.testRule);
router.get('/detection-rules/:id', authenticate, detectionController.getRuleById);
router.patch('/detection-rules/:id', authenticate, detectionController.updateRule);
router.post('/detection-rules/:id/enable', authenticate, detectionController.enableRule);
router.post('/detection-rules/:id/disable', authenticate, detectionController.disableRule);

// Engine Status & Health APIs
router.get('/status', authenticate, detectionController.getEngineStatus);

export default router;
