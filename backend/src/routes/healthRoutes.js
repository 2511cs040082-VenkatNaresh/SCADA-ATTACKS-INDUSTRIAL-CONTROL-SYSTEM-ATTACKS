import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import { getDbHealth } from '../controllers/dbHealthController.js';

const router = Router();

router.get('/health', getHealth);
router.get('/health/database', getDbHealth);

export default router;
