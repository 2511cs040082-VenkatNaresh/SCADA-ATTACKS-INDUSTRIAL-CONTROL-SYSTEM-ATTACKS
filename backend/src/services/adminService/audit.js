import { query } from '../../config/database.js';

let inMemoryAuditLogs = [];

export async function searchAuditLogs({ userId, resourceType, action, result, startDate, endDate, search, limit = 50, offset = 0 }) {
  try {
    let sql = `
      SELECT al.id, al.log_uuid AS logUuid, al.user_id AS userId, al.action,
             al.resource_type AS resourceType, al.resource_id AS resourceId,
             al.ip_address AS ipAddress, al.user_agent AS userAgent,
             al.result, al.details, al.timestamp,
             u.username, u.full_name AS fullName
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      sql += ' AND al.user_id = ?';
      params.push(userId);
    }
    if (resourceType) {
      sql += ' AND al.resource_type = ?';
      params.push(resourceType);
    }
    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }
    if (result) {
      sql += ' AND al.result = ?';
      params.push(result);
    }
    if (startDate) {
      sql += ' AND al.timestamp >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND al.timestamp <= ?';
      params.push(endDate);
    }
    if (search) {
      sql += ' AND (al.action LIKE ? OR al.resource_type LIKE ? OR al.resource_id LIKE ? OR u.username LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      return rows.map(r => ({
        ...r,
        details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
      }));
    }
  } catch (err) {
    // Fallback
  }

  // Filter in-memory audit logs if DB query fails or empty
  let filtered = [...inMemoryAuditLogs];
  if (userId) filtered = filtered.filter(l => String(l.userId) === String(userId));
  if (resourceType) filtered = filtered.filter(l => l.resourceType === resourceType);
  if (action) filtered = filtered.filter(l => l.action === action);
  if (result) filtered = filtered.filter(l => l.result === result);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.action.toLowerCase().includes(s) ||
      l.resourceType.toLowerCase().includes(s) ||
      (l.resourceId && l.resourceId.toLowerCase().includes(s)) ||
      (l.username && l.username.toLowerCase().includes(s))
    );
  }

  return filtered.slice(offset, offset + limit);
}

export function pushInMemoryAuditLog(logEntry) {
  inMemoryAuditLogs.unshift({
    id: inMemoryAuditLogs.length + 1,
    logUuid: logEntry.logUuid || `audit-${Date.now()}`,
    userId: logEntry.userId || null,
    username: logEntry.username || 'system',
    action: logEntry.action,
    resourceType: logEntry.resourceType,
    resourceId: logEntry.resourceId || null,
    ipAddress: logEntry.ipAddress || '127.0.0.1',
    result: logEntry.result || 'SUCCESS',
    details: logEntry.details || null,
    timestamp: new Date().toISOString()
  });
}
