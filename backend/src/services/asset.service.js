import { query } from '../config/database.js';
import { cryptoUUID } from '../utils/uuid.js';

export async function getAssets({ type, zone, status }) {
  let sql = `
    SELECT a.id, a.asset_uuid, a.asset_name, a.hostname, a.ip_address, a.mac_address,
           t.code AS asset_type, z.code AS zone_code, z.name AS zone_name,
           a.criticality, a.status, a.vendor, a.model, a.firmware_version, a.last_seen
    FROM assets a
    JOIN asset_types t ON a.asset_type_id = t.id
    LEFT JOIN asset_zones z ON a.zone_id = z.id
    WHERE 1=1
  `;
  const params = [];

  if (type) {
    sql += ' AND t.code = ?';
    params.push(type);
  }
  if (zone) {
    sql += ' AND z.code = ?';
    params.push(zone);
  }
  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.created_at DESC';
  return await query(sql, params);
}

export async function getAssetById(id) {
  const rows = await query(`
    SELECT a.*, t.code AS asset_type_code, t.name AS asset_type_name, z.code AS zone_code
    FROM assets a
    JOIN asset_types t ON a.asset_type_id = t.id
    LEFT JOIN asset_zones z ON a.zone_id = z.id
    WHERE a.id = ? OR a.asset_uuid = ?
  `, [id, id]);

  if (rows.length === 0) return null;
  const asset = rows[0];

  const interfaces = await query('SELECT * FROM asset_interfaces WHERE asset_id = ?', [asset.id]);
  const protocols = await query('SELECT * FROM asset_protocols WHERE asset_id = ?', [asset.id]);

  asset.interfaces = interfaces;
  asset.protocols = protocols;
  return asset;
}

export async function createAsset(data) {
  const assetUuid = cryptoUUID();

  // 1. Resolve type id
  const types = await query('SELECT id FROM asset_types WHERE code = ?', [data.assetType]);
  if (types.length === 0) throw new Error(`Invalid asset type code: ${data.assetType}`);
  const typeId = types[0].id;

  // 2. Resolve zone id if provided
  let zoneId = null;
  if (data.zoneCode) {
    const zones = await query('SELECT id FROM asset_zones WHERE code = ?', [data.zoneCode]);
    if (zones.length > 0) zoneId = zones[0].id;
  }

  const result = await query(`
    INSERT INTO assets (asset_uuid, asset_name, hostname, ip_address, mac_address, asset_type_id, vendor, model, firmware_version, zone_id, criticality, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    assetUuid, data.assetName, data.hostname || null, data.ipAddress, data.macAddress || null,
    typeId, data.vendor || null, data.model || null, data.firmwareVersion || null, zoneId,
    data.criticality || 'MEDIUM', data.status || 'ONLINE', data.description || null
  ]);

  return await getAssetById(result.insertId);
}
