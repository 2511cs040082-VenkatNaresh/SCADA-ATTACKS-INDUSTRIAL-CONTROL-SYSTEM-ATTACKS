import { ALERT_CONFIG } from './config.js';
import { query } from '../../config/database.js';
import logger from '../../logging/logger.js';
import { broadcastMessage } from '../websocket.service.js';

export function calculateSLADeadlines(priority, createdAtDate = new Date()) {
  const targets = ALERT_CONFIG.sla_targets[priority] || ALERT_CONFIG.sla_targets.P3;
  
  const ackDeadline = new Date(createdAtDate.getTime() + targets.ack_minutes * 60000);
  const resolveDeadline = new Date(createdAtDate.getTime() + targets.resolve_minutes * 60000);

  return {
    priority,
    target_ack_minutes: targets.ack_minutes,
    target_resolve_minutes: targets.resolve_minutes,
    ack_deadline: ackDeadline.toISOString(),
    resolution_deadline: resolveDeadline.toISOString()
  };
}

export async function createSLARecord(alertId, priority) {
  const slaData = calculateSLADeadlines(priority);
  try {
    await query(`
      INSERT INTO alert_sla (alert_id, priority, target_ack_minutes, target_resolve_minutes, ack_deadline, resolution_deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
      ON DUPLICATE KEY UPDATE priority = VALUES(priority), ack_deadline = VALUES(ack_deadline), resolution_deadline = VALUES(resolution_deadline)
    `, [
      alertId, priority, slaData.target_ack_minutes, slaData.target_resolve_minutes,
      slaData.ack_deadline, slaData.resolution_deadline
    ]);
  } catch (err) {
    logger.debug(`Create SLA DB fallback: ${err.message}`);
  }
  return slaData;
}

export async function updateSLAStatus(alertId, newStatus, timestamp = new Date()) {
  try {
    if (newStatus === 'ACKNOWLEDGED' || newStatus === 'IN_PROGRESS') {
      await query(`
        UPDATE alert_sla SET acknowledged_at = ? WHERE alert_id = ? AND acknowledged_at IS NULL
      `, [timestamp.toISOString(), alertId]);
    } else if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      await query(`
        UPDATE alert_sla SET resolved_at = ? WHERE alert_id = ? AND resolved_at IS NULL
      `, [timestamp.toISOString(), alertId]);
    }
  } catch (err) {
    logger.debug(`Update SLA status DB fallback: ${err.message}`);
  }
}

export async function checkSLABreaches() {
  const nowStr = new Date().toISOString();
  try {
    const breached = await query(`
      SELECT s.*, a.title, a.severity, a.priority
      FROM alert_sla s
      JOIN alerts a ON s.alert_id = a.id
      WHERE s.status = 'PENDING'
      AND (
        (s.acknowledged_at IS NULL AND s.ack_deadline < ?)
        OR (s.resolved_at IS NULL AND s.resolution_deadline < ?)
      )
    `, [nowStr, nowStr]);

    if (breached && breached.length > 0) {
      for (const row of breached) {
        await query(`UPDATE alert_sla SET status = 'BREACHED' WHERE id = ?`, [row.id]);
        broadcastMessage('alert.sla_breach', { alert_id: row.alert_id, title: row.title, priority: row.priority });
      }
    }
    return breached || [];
  } catch (err) {
    logger.debug(`Check SLA breaches DB fallback: ${err.message}`);
    return [];
  }
}
