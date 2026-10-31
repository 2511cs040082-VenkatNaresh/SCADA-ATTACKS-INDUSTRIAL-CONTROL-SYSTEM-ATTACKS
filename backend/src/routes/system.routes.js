import { Router } from 'express';
import * as systemController from '../controllers/system.controller.js';
import { getHealth } from '../controllers/healthController.js';
import { getDbHealth } from '../controllers/dbHealthController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { securityConfig } from '../config/security.js';

const router = Router();

router.get('/health', getHealth);
router.get('/health/database', getDbHealth);
router.get('/settings', authenticate, systemController.getSettings);
router.get('/audit-logs', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), systemController.getAuditLogsController);

export default router;
