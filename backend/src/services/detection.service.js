import { query } from '../config/database.js';
import { env } from '../config/environment.js';
import logger from '../logging/logger.js';

export async function getDetectionRules() {
  return await query(`
    SELECT r.id, r.rule_uuid, r.rule_name, r.description, r.category, r.severity,
           r.enabled, r.version, u.username AS creator
    FROM detection_rules r
    LEFT JOIN users u ON r.created_by = u.id
    ORDER BY r.created_at DESC
  `);
}

export async function queryDetectionEngineStatus() {
  try {
    const res = await fetch(`${env.pythonServiceUrl}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    logger.debug(`Python detection engine reachability check: ${err.message}`);
  }
  return { status: 'STANDBY_OR_UNREACHABLE', target: env.pythonServiceUrl };
}
