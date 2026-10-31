import { getDbPool } from '../../backend/src/config/db.js';

export async function getAllAssets() {
  const pool = getDbPool();
  const [rows] = await pool.query(`
    SELECT a.id, a.asset_uuid, a.asset_name, a.hostname, a.ip_address, a.mac_address,
           t.code AS asset_type, z.code AS zone_code, z.name AS zone_name,
           a.criticality, a.status, a.vendor, a.model, a.firmware_version, a.last_seen
    FROM assets a
    JOIN asset_types t ON a.asset_type_id = t.id
    LEFT JOIN asset_zones z ON a.zone_id = z.id
    ORDER BY a.created_at DESC
  `);
  return rows;
}

export async function getAssetById(id) {
  const pool = getDbPool();
  const [rows] = await pool.query(`
    SELECT a.*, t.code AS asset_type_code, z.code AS zone_code
    FROM assets a
    JOIN asset_types t ON a.asset_type_id = t.id
    LEFT JOIN asset_zones z ON a.zone_id = z.id
    WHERE a.id = ? OR a.asset_uuid = ?
  `, [id, id]);
  return rows[0] || null;
}
