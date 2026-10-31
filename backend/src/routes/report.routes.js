import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, reportController.getReports);
router.post('/', authenticate, reportController.createReport);
router.get('/schedules', authenticate, reportController.getSchedules);
router.post('/schedules', authenticate, reportController.createSchedule);
router.get('/:id', authenticate, reportController.getReportById);
router.post('/:id/generate', authenticate, reportController.generateReport);
router.post('/:id/export', authenticate, reportController.exportReport);
router.get('/:id/exports', authenticate, reportController.exportReport);

export default router;
