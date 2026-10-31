import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import crypto from 'crypto';
import { OFFICIAL_ICS_V14_DATASET } from './datasetImporter.js';

// In-memory fallback mapping store for offline execution/testing
const memoryMappings = {
  alert_mappings: [
    {
      id: 1,
      mapping_uuid: 'map-alert-001',
      alert_id: 101,
      source_type: 'ALERT',
      technique_id: 1,
      technique_external_id: 'T0855',
      technique_name: 'Unauthorized Command Message',
      tactic_id: 'TA0104',
      tactic_name: 'Execution',
      mapping_status: 'AUTO_SUGGESTED',
      confidence: 'HIGH',
      reason: 'Rule rule-modbus-001 detected unauthorized write coil command to PLC-01.',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  anomaly_mappings: [
    {
      id: 1,
      mapping_uuid: 'map-anom-001',
      anomaly_id: 201,
      source_type: 'BEHAVIORAL_ANOMALY',
      technique_id: 2,
      technique_external_id: 'T0836',
      technique_name: 'Modify Parameter',
      tactic_id: 'TA0102',
      tactic_name: 'Impair Process Control',
      mapping_status: 'AUTO_SUGGESTED',
      confidence: 'MEDIUM',
      reason: 'Z-score anomaly detected in pressure sensor reading deviation (>3.8 sigma).',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  ml_mappings: [
    {
      id: 1,
      mapping_uuid: 'map-ml-001',
      ml_prediction_id: 301,
      source_type: 'ML_ANOMALY',
      technique_id: 3,
      technique_external_id: 'T0886',
      technique_name: 'Remote Services (ICS Protocol Abuse)',
      tactic_id: 'TA0110',
      tactic_name: 'Lateral Movement',
      mapping_status: 'AUTO_SUGGESTED',
      confidence: 'HIGH',
      reason: 'Random Forest model classified high anomaly score (0.94) on Modbus TCP flow sequence.',
      created_at: new Date(Date.now() - 900000).toISOString()
    }
  ],
  detection_mappings: [
    {
      id: 1,
      mapping_uuid: 'map-det-001',
      detection_id: 401,
      source_type: 'RULE_DETECTION',
      technique_id: 4,
      technique_external_id: 'T0843',
      technique_name: 'Program Download',
      tactic_id: 'TA0102',
      tactic_name: 'Impair Process Control',
      mapping_status: 'ANALYST_CONFIRMED',
      confidence: 'HIGH',
      reason: 'PLC firmware transfer packet sequence detected during maintenance window.',
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  incident_mappings: [
    {
      id: 1,
      mapping_uuid: 'map-inc-001',
      incident_id: 1,
      source_type: 'INCIDENT',
      technique_id: 1,
      technique_external_id: 'T0855',
      technique_name: 'Unauthorized Command Message',
      tactic_id: 'TA0104',
      tactic_name: 'Execution',
      mapping_status: 'ANALYST_CONFIRMED',
      confidence: 'HIGH',
      reason: 'Confirmed unauthorized Modbus coil write incident INC-2026-000001.',
      created_at: new Date(Date.now() - 500000).toISOString()
    }
  ],
  evidence: [],
  history: []
};

// Map external technique ID to technique metadata
export function getTechniqueMeta(externalId) {
  const found = OFFICIAL_ICS_V14_DATASET.techniques.find(t => t.external_id === externalId || t.technique_id === externalId);
  if (found) {
    const tactic = OFFICIAL_ICS_V14_DATASET.tactics.find(tac => tac.tactic_id === found.tactic_id);
    return {
      name: found.name,
      tactic_id: found.tactic_id,
      tactic_name: tactic ? tactic.name : found.tactic_id,
      description: found.description
    };
  }
  return { name: externalId, tactic_id: 'UNKNOWN', tactic_name: 'Unknown Tactic', description: '' };
}

// Get all mappings across all sources
export async function getAllMappings(filters = {}) {
  try {
    const pool = getDbPool();
    const alertSql = `
      SELECT amm.id, amm.mapping_uuid, 'ALERT' AS source_type, amm.alert_id AS source_id,
             amm.technique_external_id, t.name AS technique_name, t.tactic_id, tac.name AS tactic_name,
             amm.mapping_status, amm.confidence, amm.reason, amm.created_at, amm.updated_at
      FROM alert_mitre_mappings amm
      LEFT JOIN mitre_techniques t ON (t.external_id = amm.technique_external_id OR t.technique_id = amm.technique_external_id)
      LEFT JOIN mitre_tactics tac ON tac.tactic_id = t.tactic_id
    `;
    const anomalySql = `
      SELECT anmm.id, anmm.mapping_uuid, 'BEHAVIORAL_ANOMALY' AS source_type, anmm.anomaly_id AS source_id,
             anmm.technique_external_id, t.name AS technique_name, t.tactic_id, tac.name AS tactic_name,
             anmm.mapping_status, anmm.confidence, anmm.reason, anmm.created_at, anmm.updated_at
      FROM anomaly_mitre_mappings anmm
      LEFT JOIN mitre_techniques t ON (t.external_id = anmm.technique_external_id OR t.technique_id = anmm.technique_external_id)
      LEFT JOIN mitre_tactics tac ON tac.tactic_id = t.tactic_id
    `;
    const mlSql = `
      SELECT mlmm.id, mlmm.mapping_uuid, 'ML_ANOMALY' AS source_type, mlmm.ml_prediction_id AS source_id,
             mlmm.technique_external_id, t.name AS technique_name, t.tactic_id, tac.name AS tactic_name,
             mlmm.mapping_status, mlmm.confidence, mlmm.reason, mlmm.created_at, mlmm.updated_at
      FROM ml_mitre_mappings mlmm
      LEFT JOIN mitre_techniques t ON (t.external_id = mlmm.technique_external_id OR t.technique_id = mlmm.technique_external_id)
      LEFT JOIN mitre_tactics tac ON tac.tactic_id = t.tactic_id
    `;

    const [alerts] = await pool.query(alertSql);
    const [anomalies] = await pool.query(anomalySql);
    const [mls] = await pool.query(mlSql);

    let combined = [...alerts, ...anomalies, ...mls];

    if (filters.status) combined = combined.filter(m => m.mapping_status === filters.status);
    if (filters.source_type) combined = combined.filter(m => m.source_type === filters.source_type);
    if (filters.technique_id) combined = combined.filter(m => m.technique_external_id === filters.technique_id);

    return combined;
  } catch (err) {
    logger.warn(`[MITRE MAPPING] DB fetch failed, returning in-memory combined mappings: ${err.message}`);
    let combined = [
      ...memoryMappings.alert_mappings,
      ...memoryMappings.anomaly_mappings,
      ...memoryMappings.ml_mappings,
      ...memoryMappings.detection_mappings,
      ...memoryMappings.incident_mappings
    ];
    if (filters.status) combined = combined.filter(m => m.mapping_status === filters.status);
    if (filters.source_type) combined = combined.filter(m => m.source_type === filters.source_type);
    if (filters.technique_id) combined = combined.filter(m => m.technique_external_id === filters.technique_id);
    return combined;
  }
}

// Create or update a technique mapping
export async function createOrUpdateMapping(mappingData, userId = 1) {
  const {
    source_type,
    source_id,
    technique_external_id,
    mapping_status = 'AUTO_SUGGESTED',
    confidence = 'HIGH',
    reason = ''
  } = mappingData;

  const uuid = `map-${source_type.toLowerCase()}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const meta = getTechniqueMeta(technique_external_id);

  try {
    const pool = getDbPool();
    if (source_type === 'ALERT') {
      await pool.query(`
        INSERT INTO alert_mitre_mappings
        (mapping_uuid, alert_id, technique_external_id, mapping_status, confidence, reason, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE mapping_status=VALUES(mapping_status), confidence=VALUES(confidence), reason=VALUES(reason)
      `, [uuid, source_id, technique_external_id, mapping_status, confidence, reason, userId]);
    } else if (source_type === 'BEHAVIORAL_ANOMALY') {
      await pool.query(`
        INSERT INTO anomaly_mitre_mappings
        (mapping_uuid, anomaly_id, technique_external_id, mapping_status, confidence, reason, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE mapping_status=VALUES(mapping_status), confidence=VALUES(confidence), reason=VALUES(reason)
      `, [uuid, source_id, technique_external_id, mapping_status, confidence, reason, userId]);
    } else if (source_type === 'ML_ANOMALY') {
      await pool.query(`
        INSERT INTO ml_mitre_mappings
        (mapping_uuid, ml_prediction_id, technique_external_id, mapping_status, confidence, reason, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE mapping_status=VALUES(mapping_status), confidence=VALUES(confidence), reason=VALUES(reason)
      `, [uuid, source_id, technique_external_id, mapping_status, confidence, reason, userId]);
    } else if (source_type === 'INCIDENT') {
      await pool.query(`
        INSERT INTO incident_mitre_mappings
        (mapping_uuid, incident_id, technique_external_id, mapping_status, confidence, reason, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [uuid, source_id, technique_external_id, mapping_status, confidence, reason, userId]);
    }

    // Audit log
    await pool.query(`
      INSERT INTO mitre_mapping_history
      (mapping_type, mapping_id, previous_status, new_status, previous_confidence, new_confidence, changed_by, change_reason)
      VALUES (?, ?, NULL, ?, NULL, ?, ?, ?)
    `, [source_type, source_id, mapping_status, confidence, userId, `Created new ${source_type} technique mapping to ${technique_external_id}`]);

    return {
      mapping_uuid: uuid,
      source_type,
      source_id,
      technique_external_id,
      technique_name: meta.name,
      tactic_id: meta.tactic_id,
      tactic_name: meta.tactic_name,
      mapping_status,
      confidence,
      reason,
      created_at: new Date().toISOString()
    };
  } catch (err) {
    logger.warn(`[MITRE MAPPING] DB mapping creation failed, adding to memory store: ${err.message}`);
    const newMapping = {
      id: Date.now(),
      mapping_uuid: uuid,
      source_type,
      source_id,
      technique_external_id,
      technique_name: meta.name,
      tactic_id: meta.tactic_id,
      tactic_name: meta.tactic_name,
      mapping_status,
      confidence,
      reason,
      created_at: new Date().toISOString()
    };

    if (source_type === 'ALERT') memoryMappings.alert_mappings.push(newMapping);
    else if (source_type === 'BEHAVIORAL_ANOMALY') memoryMappings.anomaly_mappings.push(newMapping);
    else if (source_type === 'ML_ANOMALY') memoryMappings.ml_mappings.push(newMapping);
    else if (source_type === 'INCIDENT') memoryMappings.incident_mappings.push(newMapping);
    else memoryMappings.detection_mappings.push(newMapping);

    memoryMappings.history.push({
      mapping_type: source_type,
      mapping_id: source_id,
      new_status: mapping_status,
      new_confidence: confidence,
      changed_by: userId,
      change_reason: `Memory created mapping to ${technique_external_id}`,
      created_at: new Date().toISOString()
    });

    return newMapping;
  }
}

// Update Mapping Workflow Status (CONFIRMED / REJECTED / NOT_APPLICABLE)
export async function updateMappingStatus(mappingUuid, newStatus, newConfidence = null, reason = '', userId = 1) {
  try {
    const pool = getDbPool();
    // Try updating alert_mitre_mappings
    let [res] = await pool.query(`
      UPDATE alert_mitre_mappings 
      SET mapping_status = ?, confidence = COALESCE(?, confidence), reason = COALESCE(?, reason), updated_at = NOW()
      WHERE mapping_uuid = ?
    `, [newStatus, newConfidence, reason, mappingUuid]);

    if (res.affectedRows === 0) {
      await pool.query(`
        UPDATE anomaly_mitre_mappings 
        SET mapping_status = ?, confidence = COALESCE(?, confidence), reason = COALESCE(?, reason), updated_at = NOW()
        WHERE mapping_uuid = ?
      `, [newStatus, newConfidence, reason, mappingUuid]);
    }

    await pool.query(`
      INSERT INTO mitre_mapping_history
      (mapping_type, mapping_id, new_status, new_confidence, changed_by, change_reason)
      VALUES ('UUID_UPDATE', 0, ?, ?, ?, ?)
    `, [newStatus, newConfidence, userId, `Status updated to ${newStatus} for ${mappingUuid}`]);

    return { mapping_uuid: mappingUuid, mapping_status: newStatus, confidence: newConfidence, reason };
  } catch (err) {
    logger.warn(`[MITRE MAPPING] DB status update failed, updating memory: ${err.message}`);
    const all = [
      ...memoryMappings.alert_mappings,
      ...memoryMappings.anomaly_mappings,
      ...memoryMappings.ml_mappings,
      ...memoryMappings.detection_mappings,
      ...memoryMappings.incident_mappings
    ];
    const target = all.find(m => m.mapping_uuid === mappingUuid);
    if (target) {
      target.mapping_status = newStatus;
      if (newConfidence) target.confidence = newConfidence;
      if (reason) target.reason = reason;
      return target;
    }
    return { mapping_uuid: mappingUuid, mapping_status: newStatus, confidence: newConfidence || 'HIGH', reason };
  }
}

// Attach evidence hash & metadata to a technique mapping
export async function addEvidence(mappingType, mappingId, evidenceData, userId = 1) {
  const { evidence_type = 'TELEMETRY_PACKET', description = '', raw_payload = '' } = evidenceData;
  const sha256Hash = crypto.createHash('sha256').update(typeof raw_payload === 'string' ? raw_payload : JSON.stringify(raw_payload)).digest('hex');

  try {
    const pool = getDbPool();
    const [res] = await pool.query(`
      INSERT INTO mitre_mapping_evidence
      (mapping_type, mapping_id, evidence_type, evidence_id, description, source_reference, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [mappingType, mappingId, evidence_type, sha256Hash, description, evidenceData.source_reference || null, userId]);

    return {
      id: res.insertId,
      mapping_type: mappingType,
      mapping_id: mappingId,
      evidence_type,
      evidence_id: sha256Hash,
      sha256_hash: sha256Hash,
      description,
      created_at: new Date().toISOString()
    };
  } catch (err) {
    logger.warn(`[MITRE MAPPING] DB addEvidence failed, updating memory: ${err.message}`);
    const ev = {
      id: memoryMappings.evidence.length + 1,
      mapping_type: mappingType,
      mapping_id: mappingId,
      evidence_type,
      evidence_id: sha256Hash,
      sha256_hash: sha256Hash,
      description,
      created_at: new Date().toISOString()
    };
    memoryMappings.evidence.push(ev);
    return ev;
  }
}

// Fetch Mappings specifically for an Alert ID
export async function getAlertMappings(alertId) {
  const mappings = await getAllMappings({ source_type: 'ALERT' });
  return mappings.filter(m => String(m.source_id) === String(alertId));
}

// Fetch Mappings specifically for an Incident ID
export async function getIncidentMappings(incidentId) {
  const mappings = await getAllMappings({ source_type: 'INCIDENT' });
  return mappings.filter(m => String(m.source_id) === String(incidentId));
}

// Fetch Mappings specifically for a Detection ID
export async function getDetectionMappings(detectionId) {
  const mappings = await getAllMappings({ source_type: 'RULE_DETECTION' });
  return mappings.filter(m => String(m.source_id) === String(detectionId));
}
