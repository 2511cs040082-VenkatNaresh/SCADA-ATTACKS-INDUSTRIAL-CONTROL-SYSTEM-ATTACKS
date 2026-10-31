import { Router } from 'express';
import * as assetIntelController from '../controllers/assetIntelligence.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { securityConfig } from '../config/security.js';

const router = Router();

router.get('/assets', authenticate, assetIntelController.getDiscoveries);
router.get('/unknown', authenticate, (req, res, next) => {
  req.query.status = 'UNKNOWN';
  assetIntelController.getDiscoveries(req, res, next);
});
router.post('/:id/identify', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.OT_OPERATOR), (req, res, next) => {
  req.body.action = 'IDENTIFY';
  assetIntelController.resolveDiscovery(req, res, next);
});
router.post('/:id/approve', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.OT_OPERATOR), (req, res, next) => {
  req.body.action = 'APPROVE';
  assetIntelController.resolveDiscovery(req, res, next);
});
router.post('/:id/ignore', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.OT_OPERATOR), (req, res, next) => {
  req.body.action = 'IGNORE';
  assetIntelController.resolveDiscovery(req, res, next);
});

export default router;
