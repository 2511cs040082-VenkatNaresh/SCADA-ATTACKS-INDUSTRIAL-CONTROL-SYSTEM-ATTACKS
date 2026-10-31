import { Router } from 'express';
import * as internalController from '../controllers/internal.controller.js';
import * as netController from '../controllers/networkMonitoring.controller.js';
import { internalAuth } from '../middleware/internalAuth.js';

const router = Router();

router.post('/events', internalAuth, internalController.ingestEvent);
router.post('/events/batch', internalAuth, internalController.ingestBatch);
router.post('/network-update', internalAuth, netController.processNetworkUpdate);

export default router;
