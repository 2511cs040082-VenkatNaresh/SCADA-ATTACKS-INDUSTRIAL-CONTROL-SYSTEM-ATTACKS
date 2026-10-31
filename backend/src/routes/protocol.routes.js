import { Router } from 'express';
import * as netController from '../controllers/networkMonitoring.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/metrics', authenticate, netController.getMetrics);
router.get('/modbus/transactions', authenticate, netController.getModbusTransactions);
router.get('/modbus/events', authenticate, netController.getModbusTransactions);

export default router;
