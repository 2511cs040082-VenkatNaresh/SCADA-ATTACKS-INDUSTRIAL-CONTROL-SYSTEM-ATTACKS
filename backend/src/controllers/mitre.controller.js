import * as mitreService from '../services/mitre.service.js';
import logger from '../logging/logger.js';

export async function getTactics(_req, res, next) {
  try {
    const tactics = await mitreService.getTactics();
    res.json({ success: true, count: tactics.length, data: tactics });
  } catch (err) {
    next(err);
  }
}

export async function getTechniques(req, res, next) {
  try {
    const filters = { tactic_id: req.query.tactic_id };
    const techniques = await mitreService.getTechniques(filters);
    res.json({ success: true, count: techniques.length, data: techniques });
  } catch (err) {
    next(err);
  }
}

export async function getTechniqueById(req, res, next) {
  try {
    const tech = await mitreService.getTechniqueById(req.params.id);
    if (!tech) {
      return res.status(404).json({ success: false, error: 'Technique not found' });
    }
    res.json({ success: true, data: tech });
  } catch (err) {
    next(err);
  }
}

export async function getCoverage(_req, res, next) {
  try {
    const metrics = await mitreService.calculateCoverageMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}

export async function getMappings(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      source_type: req.query.source_type,
      technique_id: req.query.technique_id
    };
    const mappings = await mitreService.getAllMappings(filters);
    res.json({ success: true, count: mappings.length, data: mappings });
  } catch (err) {
    next(err);
  }
}

export async function createOrUpdateMapping(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const mapping = await mitreService.createOrUpdateMapping(req.body, userId);
    res.status(201).json({ success: true, data: mapping });
  } catch (err) {
    next(err);
  }
}

export async function updateMappingStatus(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { status, confidence, reason } = req.body;
    const updated = await mitreService.updateMappingStatus(req.params.uuid, status, confidence, reason, userId);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function addEvidence(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { mapping_type, mapping_id } = req.params;
    const evidence = await mitreService.addEvidence(mapping_type, mapping_id, req.body, userId);
    res.status(201).json({ success: true, data: evidence });
  } catch (err) {
    next(err);
  }
}

export async function getDatasetVersions(_req, res, next) {
  try {
    const versions = await mitreService.getVersions();
    res.json({ success: true, count: versions.length, data: versions });
  } catch (err) {
    next(err);
  }
}

export async function importVersion(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const version = await mitreService.importDatasetVersion(req.body, userId);
    res.status(201).json({ success: true, data: version });
  } catch (err) {
    next(err);
  }
}

export async function activateVersion(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const activated = await mitreService.activateVersion(req.params.id, userId);
    res.json({ success: true, data: activated });
  } catch (err) {
    next(err);
  }
}

export async function rollbackVersion(req, res, next) {
  try {
    const userId = req.user ? req.user.id : 1;
    const rolledBack = await mitreService.rollbackVersion(req.params.id, userId);
    res.json({ success: true, data: rolledBack });
  } catch (err) {
    next(err);
  }
}

export async function getDetectionMitre(req, res, next) {
  try {
    const mappings = await mitreService.getDetectionMappings(req.params.id);
    res.json({ success: true, count: mappings.length, data: mappings });
  } catch (err) {
    next(err);
  }
}

export async function getAlertMitre(req, res, next) {
  try {
    const mappings = await mitreService.getAlertMappings(req.params.id);
    res.json({ success: true, count: mappings.length, data: mappings });
  } catch (err) {
    next(err);
  }
}

export async function getIncidentMitre(req, res, next) {
  try {
    const mappings = await mitreService.getIncidentMappings(req.params.id);
    res.json({ success: true, count: mappings.length, data: mappings });
  } catch (err) {
    next(err);
  }
}

export async function getMitreHealth(_req, res, next) {
  try {
    const health = await mitreService.getMitreHealth();
    res.json(health);
  } catch (err) {
    next(err);
  }
}
