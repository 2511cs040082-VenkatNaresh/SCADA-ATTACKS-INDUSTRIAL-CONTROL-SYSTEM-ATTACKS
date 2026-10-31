import { Router } from 'express';
import * as mlController from '../controllers/ml.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Predictions & Inference APIs
router.get('/predictions', authenticate, mlController.getPredictions);
router.get('/predictions/:id', authenticate, mlController.getPredictionById);
router.post('/predict', authenticate, mlController.predict);

// Model Registry APIs
router.get('/models', authenticate, mlController.getModels);
router.get('/models/:id', authenticate, mlController.getModelById);
router.post('/models/train', authenticate, mlController.trainModel);
router.post('/models/:id/activate', authenticate, mlController.activateModel);
router.post('/models/:id/retire', authenticate, mlController.retireModel);
router.post('/models/:id/rollback', authenticate, mlController.rollbackModel);

// Datasets & Drift APIs
router.get('/datasets', authenticate, mlController.getDatasets);
router.get('/drift', authenticate, mlController.getDriftMetrics);

// Metrics & Health APIs
router.get('/metrics', authenticate, mlController.getMetrics);
router.get('/health', authenticate, mlController.getHealth);

export default router;
