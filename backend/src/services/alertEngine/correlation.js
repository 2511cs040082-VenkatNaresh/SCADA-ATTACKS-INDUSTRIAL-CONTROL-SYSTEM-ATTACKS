import { query } from '../../config/database.js';
import logger from '../../logging/logger.js';
import { broadcastMessage } from '../websocket.service.js';

let inMemoryCorrelations = [];
let inMemoryGroups = [];

export async function correlateAlert(newAlert) {
  const windowMs = 300 * 1000; // 5 minutes
  const now = new Date(newAlert.first_seen || Date.now()).getTime();

  try {
    // Search for candidates matching source/dest asset, protocol or recent window
    const candidates = await query(`
      SELECT * FROM alerts
      WHERE id != ?
      AND (
        source_asset_id = ?
        OR destination_asset_id = ?
        OR (source_asset_id = ? AND destination_asset_id = ?)
      )
      AND first_seen >= NOW() - INTERVAL 5 MINUTE
      ORDER BY id DESC LIMIT 5
    `, [
      newAlert.id || 0,
      newAlert.source_asset_id || 0,
      newAlert.destination_asset_id || 0,
      newAlert.destination_asset_id || 0,
      newAlert.source_asset_id || 0
    ]);

    if (candidates && candidates.length > 0) {
      for (const target of candidates) {
        const timeDiffSec = Math.abs(Math.round((now - new Date(target.first_seen).getTime()) / 1000));
        const correlationType = determineCorrelationType(newAlert, target);
        
        const explanation = `Correlated ${newAlert.source_type} and ${target.source_type} because: ` +
          `Primary Source: Asset ID ${newAlert.source_asset_id || 'N/A'}, Destination: Asset ID ${newAlert.destination_asset_id || 'N/A'}, ` +
          `Protocol: ${newAlert.protocol || 'MODBUS_TCP'}, Time delta: ${timeDiffSec}s.`;

        const corrRecord = {
          correlation_uuid: `CORR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          primary_alert_id: newAlert.id,
          related_alert_id: target.id,
          correlation_type: correlationType,
          strength: calculateCorrelationStrength(newAlert, target, timeDiffSec),
          explanation: explanation,
          created_at: new Date().toISOString()
        };

        await storeCorrelationRecord(corrRecord);
        await groupAlerts(newAlert, target, correlationType);

        broadcastMessage('alert.correlated', corrRecord);
        return corrRecord;
      }
    }
  } catch (err) {
    logger.debug(`Alert correlation DB fallback: ${err.message}`);
  }

  return null;
}

function determineCorrelationType(a, b) {
  if (a.source_type !== b.source_type) return 'MULTI_LAYER_DETECTION_CORRELATION';
  if (a.source_asset_id === b.source_asset_id && a.destination_asset_id === b.destination_asset_id) return 'COMMUNICATION_PAIR_CORRELATION';
  if (a.protocol === b.protocol) return 'PROTOCOL_CORRELATION';
  return 'TIME_ASSET_CORRELATION';
}

function calculateCorrelationStrength(a, b, timeDiffSec) {
  let score = 0.5;
  if (a.source_asset_id === b.source_asset_id) score += 0.2;
  if (a.destination_asset_id === b.destination_asset_id) score += 0.15;
  if (a.protocol === b.protocol) score += 0.1;
  if (timeDiffSec <= 10) score += 0.15;
  else if (timeDiffSec <= 60) score += 0.1;
  return Math.min(1.0, score);
}

async function storeCorrelationRecord(corr) {
  try {
    await query(`
      INSERT INTO alert_correlations
      (correlation_uuid, primary_alert_id, related_alert_id, correlation_type, strength, explanation, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      corr.correlation_uuid, corr.primary_alert_id, corr.related_alert_id,
      corr.correlation_type, corr.strength, corr.explanation
    ]);
  } catch (err) {
    logger.debug(`Store correlation DB fallback: ${err.message}`);
  }
  inMemoryCorrelations.unshift(corr);
}

async function groupAlerts(alertA, alertB, corrType) {
  const groupKey = `GRP-ASSET-${alertA.source_asset_id || 0}-${alertA.destination_asset_id || 0}`;
  let existingGroup = inMemoryGroups.find(g => g.group_key === groupKey);

  if (!existingGroup) {
    existingGroup = {
      id: inMemoryGroups.length + 1,
      group_uuid: `GRP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      group_key: groupKey,
      title: `Correlated Security Group (${alertA.protocol || 'ICS'} Asset Scope)`,
      severity: alertA.severity === 'CRITICAL' || alertB.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      priority: alertA.priority === 'P1' || alertB.priority === 'P1' ? 'P1' : 'P2',
      status: 'NEW',
      asset_scope: `Asset ${alertA.source_asset_id || 'A'} -> Asset ${alertA.destination_asset_id || 'B'}`,
      first_seen: alertA.first_seen || new Date().toISOString(),
      last_seen: new Date().toISOString(),
      alert_count: 2
    };

    try {
      await query(`
        INSERT INTO alert_groups
        (group_uuid, group_key, title, severity, priority, status, asset_scope, first_seen, last_seen, alert_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        existingGroup.group_uuid, existingGroup.group_key, existingGroup.title,
        existingGroup.severity, existingGroup.priority, existingGroup.status,
        existingGroup.asset_scope, existingGroup.first_seen, existingGroup.last_seen,
        existingGroup.alert_count
      ]);
    } catch (err) {
      logger.debug(`Store group DB fallback: ${err.message}`);
    }

    inMemoryGroups.unshift(existingGroup);
  } else {
    existingGroup.alert_count += 1;
    existingGroup.last_seen = new Date().toISOString();
  }

  return existingGroup;
}

export async function getCorrelations(alertId) {
  try {
    const rows = await query(`
      SELECT c.*, a1.title AS primary_title, a2.title AS related_title
      FROM alert_correlations c
      JOIN alerts a1 ON c.primary_alert_id = a1.id
      JOIN alerts a2 ON c.related_alert_id = a2.id
      WHERE c.primary_alert_id = ? OR c.related_alert_id = ?
      ORDER BY c.id DESC
    `, [alertId, alertId]);

    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.debug(`Get correlations DB fallback: ${err.message}`);
  }

  return inMemoryCorrelations.filter(c => String(c.primary_alert_id) === String(alertId) || String(c.related_alert_id) === String(alertId));
}

export async function getAlertGroups() {
  try {
    const rows = await query(`SELECT * FROM alert_groups ORDER BY id DESC`);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.debug(`Get alert groups DB fallback: ${err.message}`);
  }
  return inMemoryGroups;
}
