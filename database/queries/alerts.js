import { getDbPool } from '../../backend/src/config/db.js';

export async function getActiveAlerts() {
  const pool = getDbPool();
  const [rows] = await pool.query(`
    SELECT al.id, al.alert_uuid, al.severity, al.title, al.description,
           al.confidence, al.risk_score, al.status, al.created_at,
           a.asset_name, a.ip_address
    FROM alerts al
    LEFT JOIN assets a ON al.asset_id = a.id
    WHERE al.status IN ('NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED')
    ORDER BY al.created_at DESC
  `);
  return rows;
}
