import { query } from '../../config/database.js';
import logger from '../../logging/logger.js';

let inMemorySuppressions = [
  {
    id: 1,
    suppression_uuid: 'SUP-001-MAINTENANCE',
    rule_name: 'Scheduled Maintenance PLC-002',
    target_asset_id: 2,
    target_category: 'PROTOCOL_ANOMALY',
    maintenance_window_start: new Date(Date.now() - 3600000).toISOString(),
    maintenance_window_end: new Date(Date.now() + 3600000).toISOString(),
    reason: 'Planned maintenance window for RTU calibration.',
    status: 'ACTIVE'
  }
];

export async function checkSuppression(alertData) {
  try {
    const rows = await query(`
      SELECT * FROM alert_suppressions
      WHERE status = 'ACTIVE'
      AND (target_asset_id IS NULL OR target_asset_id = ? OR target_asset_id = ?)
      AND (target_rule_id IS NULL OR target_rule_id = ?)
      AND (target_category IS NULL OR target_category = ?)
    `, [
      alertData.source_asset_id || 0,
      alertData.destination_asset_id || 0,
      alertData.rule_id || 0,
      alertData.category || ''
    ]);

    if (rows && rows.length > 0) {
      const now = new Date();
      for (const rule of rows) {
        if (rule.maintenance_window_start && rule.maintenance_window_end) {
          const start = new Date(rule.maintenance_window_start);
          const end = new Date(rule.maintenance_window_end);
          if (now >= start && now <= end) {
            return { suppressed: true, rule };
          }
        } else {
          return { suppressed: true, rule };
        }
      }
    }
  } catch (err) {
    logger.debug(`Suppression DB check fallback: ${err.message}`);
  }

  // Fallback in-memory check
  const matched = inMemorySuppressions.find(s => {
    if (s.status !== 'ACTIVE') return false;
    if (s.target_asset_id && s.target_asset_id !== alertData.source_asset_id && s.target_asset_id !== alertData.destination_asset_id) return false;
    if (s.target_category && s.target_category !== alertData.category) return false;
    return true;
  });

  return matched ? { suppressed: true, rule: matched } : { suppressed: false };
}

export async function getSuppressions() {
  try {
    const rows = await query(`SELECT * FROM alert_suppressions ORDER BY id DESC`);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.debug(`Suppressions fetch DB fallback: ${err.message}`);
  }
  return inMemorySuppressions;
}

export async function createSuppression(ruleData) {
  const suppressionUuid = `SUP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const record = {
    id: inMemorySuppressions.length + 1,
    suppression_uuid: suppressionUuid,
    rule_name: ruleData.rule_name || 'Custom Suppression Rule',
    target_asset_id: ruleData.target_asset_id || null,
    target_rule_id: ruleData.target_rule_id || null,
    target_category: ruleData.target_category || null,
    maintenance_window_start: ruleData.maintenance_window_start || null,
    maintenance_window_end: ruleData.maintenance_window_end || null,
    reason: ruleData.reason || 'SOC Analyst defined suppression',
    created_by: ruleData.created_by || null,
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  try {
    await query(`
      INSERT INTO alert_suppressions
      (suppression_uuid, rule_name, target_asset_id, target_rule_id, target_category, maintenance_window_start, maintenance_window_end, reason, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      record.suppression_uuid, record.rule_name, record.target_asset_id, record.target_rule_id,
      record.target_category, record.maintenance_window_start, record.maintenance_window_end,
      record.reason, record.created_by, record.status
    ]);
  } catch (err) {
    logger.debug(`Create suppression DB fallback: ${err.message}`);
  }

  inMemorySuppressions.unshift(record);
  return record;
}
