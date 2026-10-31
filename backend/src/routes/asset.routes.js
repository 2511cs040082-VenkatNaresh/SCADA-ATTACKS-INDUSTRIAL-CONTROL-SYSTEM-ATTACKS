import { Router } from 'express';
import { z } from 'zod';
import * as assetController from '../controllers/asset.controller.js';
import * as assetIntelController from '../controllers/assetIntelligence.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { securityConfig } from '../config/security.js';

const router = Router();

const createAssetSchema = {
  body: z.object({
    assetName: z.string().min(1, 'Asset name is required'),
    assetType: z.string().min(1, 'Asset type code is required'),
    ipAddress: z.string().min(1, 'IP address is required'),
    hostname: z.string().optional(),
    macAddress: z.string().optional(),
    vendor: z.string().optional(),
    model: z.string().optional(),
    firmwareVersion: z.string().optional(),
    zoneCode: z.string().optional(),
    criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    status: z.string().optional(),
    description: z.string().optional(),
  }),
};

router.get('/topology', authenticate, assetIntelController.getTopology);
router.get('/', authenticate, assetIntelController.getAssets);
router.post('/', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.OT_OPERATOR), validate(createAssetSchema), assetController.createAsset);
router.get('/:id', authenticate, assetIntelController.getAssetById);
router.post('/:id/notes', authenticate, assetIntelController.addNote);
router.post('/:id/tags', authenticate, assetIntelController.addTag);

export default router;
