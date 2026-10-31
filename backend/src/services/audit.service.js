import { query } from '../config/database.js';
import logger from '../logging/logger.js';
import { cryptoUUID } from '../utils/uuid.js';

export async function createAuditLog({ userId, action, resourceType, resourceId, ipAddress, userAgent, result = 'SUCCESS', details = null }) {
  try {
    const logUuid = cryptoUUID();
    const detailsJson = details ? JSON.stringify(details) : null;

    await query(`
      INSERT INTO audit_logs (log_uuid, user_id, action, resource_type, resource_id, ip_address, user_agent, result, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [logUuid, userId || null, action, resourceType, resourceId || null, ipAddress || null, userAgent || null, result, detailsJson]);

    logger.debug(`[AUDIT] Action: ${action} | Resource: ${resourceType} (${resourceId}) | User: ${userId}`);
  } catch (err) {
    // Fallback to in-memory audit log
    try {
      const { pushInMemoryAuditLog } = await import('./adminService/audit.js');
      pushInMemoryAuditLog({ userId, action, resourceType, resourceId, ipAddress, userAgent, result, details });
    } catch (e) {
      // Ignore
    }
  }
}

export async function getAuditLogs(limit = 50) {
  return await query(`
    SELECT al.id, al.log_uuid, al.action, al.resource_type, al.resource_id,
           al.ip_address, al.result, al.details, al.timestamp,
           u.username, u.full_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.timestamp DESC
    LIMIT ?
  `, [parseInt(limit, 10)]);
}
