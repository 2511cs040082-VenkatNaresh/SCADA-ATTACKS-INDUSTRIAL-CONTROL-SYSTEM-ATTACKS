import { Router } from 'express';
import * as simulatorController from '../controllers/simulator.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/status', authenticate, simulatorController.getStatus);
router.get('/process', authenticate, simulatorController.getProcess);
router.get('/scenarios', authenticate, simulatorController.getScenarios);
router.post('/scenarios/:id/start', authenticate, simulatorController.startScenario);
router.post('/reset', authenticate, simulatorController.resetSimulator);

export default router;
