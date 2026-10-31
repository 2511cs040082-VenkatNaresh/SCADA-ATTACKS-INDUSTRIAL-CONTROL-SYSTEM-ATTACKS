import { getDbPool } from '../config/db.js';
import logger from '../logging/logger.js';
import {
  OFFICIAL_ICS_V14_DATASET,
  seedDefaultDatasetIfEmpty,
  getVersions,
  importDatasetVersion,
  activateVersion,
  rollbackVersion
} from './mitreEngine/datasetImporter.js';
import {
  getAllMappings,
  createOrUpdateMapping,
  updateMappingStatus,
  addEvidence,
  getAlertMappings,
  getIncidentMappings,
  getDetectionMappings,
  getTechniqueMeta
} from './mitreEngine/mappingService.js';
import { calculateCoverageMetrics } from './mitreEngine/coverageService.js';

// Auto-seed dataset on startup
seedDefaultDatasetIfEmpty().catch(err => {
  logger.warn(`[MITRE SERVICE] Seed trigger failed: ${err.message}`);
});

export async function getTactics() {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM mitre_tactics ORDER BY display_order ASC, tactic_id ASC');
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[MITRE SERVICE] DB getTactics failed, returning fixture: ${err.message}`);
  }
  return OFFICIAL_ICS_V14_DATASET.tactics;
}

export async function getTechniques(filters = {}) {
  try {
    const pool = getDbPool();
    let sql = 'SELECT * FROM mitre_techniques';
    const params = [];
    if (filters.tactic_id) {
      sql += ' WHERE tactic_id = ?';
      params.push(filters.tactic_id);
    }
    sql += ' ORDER BY external_id ASC';
    const [rows] = await pool.query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[MITRE SERVICE] DB getTechniques failed, returning fixture: ${err.message}`);
  }
  let techs = OFFICIAL_ICS_V14_DATASET.techniques;
  if (filters.tactic_id) {
    techs = techs.filter(t => t.tactic_id === filters.tactic_id);
  }
  return techs;
}

export async function getTechniqueById(idOrExternalId) {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      'SELECT * FROM mitre_techniques WHERE technique_id = ? OR external_id = ?',
      [idOrExternalId, idOrExternalId]
    );
    if (rows && rows.length > 0) return rows[0];
  } catch (err) {
    logger.warn(`[MITRE SERVICE] DB getTechniqueById failed, using fixture lookup: ${err.message}`);
  }
  const found = OFFICIAL_ICS_V14_DATASET.techniques.find(
    t => t.technique_id === idOrExternalId || t.external_id === idOrExternalId
  );
  if (found) {
    const tactic = OFFICIAL_ICS_V14_DATASET.tactics.find(tac => tac.tactic_id === found.tactic_id);
    const subtechniques = OFFICIAL_ICS_V14_DATASET.subtechniques.filter(s => s.parent_technique_id === found.technique_id);
    return {
      ...found,
      tactic_name: tactic ? tactic.name : found.tactic_id,
      subtechniques
    };
  }
  return null;
}

export async function getMitreHealth() {
  const versions = await getVersions();
  const activeVer = versions.find(v => v.status === 'ACTIVE') || versions[0];
  return {
    status: 'ONLINE',
    phase: 'PHASE_13_MITRE_ATTACK_FOR_ICS_INTEGRATION',
    active_dataset_version: activeVer ? activeVer.version : 'v14.1',
    total_versions: versions.length,
    tactics_count: OFFICIAL_ICS_V14_DATASET.tactics.length,
    techniques_count: OFFICIAL_ICS_V14_DATASET.techniques.length,
    mapping_engine_status: 'ACTIVE',
    evidence_validation_mode: 'SHA256_STRICT'
  };
}

export {
  getVersions,
  importDatasetVersion,
  activateVersion,
  rollbackVersion,
  getAllMappings,
  createOrUpdateMapping,
  updateMappingStatus,
  addEvidence,
  getAlertMappings,
  getIncidentMappings,
  getDetectionMappings,
  calculateCoverageMetrics
};
