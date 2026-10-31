import express from 'express';
import * as responseController from '../controllers/response.controller.js';

const router = express.Router();

// Response Recommendations
router.get('/recommendations', responseController.getRecommendations);
router.get('/recommendations/:id', responseController.getRecommendationById);
router.post('/recommendations/:id/accept', responseController.acceptRecommendation);
router.post('/recommendations/:id/reject', responseController.rejectRecommendation);

// Response Plans
router.get('/plans', responseController.getResponsePlans);
router.post('/plans', responseController.createResponsePlan);
router.get('/plans/:id', responseController.getResponsePlanById);
router.post('/plans/:id/approve', responseController.approvePlan);
router.post('/plans/:id/reject', responseController.rejectPlan);
router.post('/plans/:id/execute', responseController.executePlan);
router.post('/plans/:id/rollback', responseController.rollbackPlan);

// Playbooks
router.get('/playbooks', responseController.getPlaybooks);
router.get('/playbooks/:id', responseController.getPlaybookById);

// Approvals & Analytics
router.get('/approvals', responseController.getApprovals);
router.get('/metrics', responseController.getResponseMetrics);

// Engine Health Check
router.get('/health', responseController.getResponseHealth);

export default router;
