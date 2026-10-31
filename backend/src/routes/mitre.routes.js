import express from 'express';
import * as mitreController from '../controllers/mitre.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Public / Authenticated MITRE Framework Endpoints
router.get('/tactics', mitreController.getTactics);
router.get('/techniques', mitreController.getTechniques);
router.get('/techniques/:id', mitreController.getTechniqueById);
router.get('/coverage', mitreController.getCoverage);

// Multi-Source Mappings Workbench
router.get('/mappings', mitreController.getMappings);
router.post('/mappings', mitreController.createOrUpdateMapping);
router.patch('/mappings/:uuid/status', mitreController.updateMappingStatus);
router.post('/mappings/:mapping_type/:mapping_id/evidence', mitreController.addEvidence);

// Dataset Version Management
router.get('/versions', mitreController.getDatasetVersions);
router.post('/versions/import', mitreController.importVersion);
router.post('/versions/:id/activate', mitreController.activateVersion);
router.post('/versions/:id/rollback', mitreController.rollbackVersion);

// Entity-Specific MITRE Mapping Endpoints
router.get('/detections/:id/mitre', mitreController.getDetectionMitre);
router.get('/alerts/:id/mitre', mitreController.getAlertMitre);
router.get('/incidents/:id/mitre', mitreController.getIncidentMitre);

// Engine Health Check
router.get('/health', mitreController.getMitreHealth);

export default router;
