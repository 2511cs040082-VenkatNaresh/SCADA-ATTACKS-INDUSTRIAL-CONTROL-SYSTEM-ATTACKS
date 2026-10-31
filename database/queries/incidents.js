import { getDbPool } from '../../backend/src/config/db.js';

export async function getOpenIncidents() {
  const pool = getDbPool();
  const [rows] = await pool.query(`
    SELECT inc.id, inc.incident_number, inc.title, inc.description, inc.severity,
           inc.status, inc.priority, inc.created_at,
           u.full_name AS assignee_name
    FROM incidents inc
    LEFT JOIN users u ON inc.assigned_to = u.id
    WHERE inc.status NOT IN ('RESOLVED', 'CLOSED')
    ORDER BY inc.created_at DESC
  `);
  return rows;
}
