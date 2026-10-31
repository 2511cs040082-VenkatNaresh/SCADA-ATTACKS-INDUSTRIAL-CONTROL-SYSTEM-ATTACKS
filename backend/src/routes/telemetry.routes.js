import { Router } from 'express';
import { z } from 'zod';
import * as telemetryController from '../controllers/telemetry.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { securityConfig } from '../config/security.js';

const router = Router();

const addReadingSchema = {
  body: z.object({
    metricId: z.number().int().positive('Valid metric ID is required'),
    value: z.number('Numeric reading value is required'),
    quality: z.string().optional(),
    source: z.string().optional(),
  }),
};

router.get('/metrics', authenticate, telemetryController.getMetrics);
router.post('/readings', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.OT_OPERATOR, securityConfig.roles.SOC_OPERATOR), validate(addReadingSchema), telemetryController.addReading);
router.get('/readings/latest', authenticate, telemetryController.getLatestReadings);
router.get('/metrics/:id/history', authenticate, telemetryController.getMetricHistory);

export default router;
