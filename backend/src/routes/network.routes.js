import { Router } from 'express';
import * as netController from '../controllers/networkMonitoring.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/flows', authenticate, netController.getFlows);
router.get('/sessions', authenticate, netController.getSessions);
router.get('/metrics', authenticate, netController.getMetrics);

export default router;
