import { query } from '../config/database.js';
import logger from '../logging/logger.js';

export async function getAssets({ search, status, type, zone, criticality, health, risk, tag, page = 1, limit = 25 }) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 25, 100);
  const offset = (pageNum - 1) * limitNum;

  let baseSql = `
    FROM assets a
    LEFT JOIN asset_types at ON a.asset_type_id = at.id
    LEFT JOIN asset_zones az ON a.zone_id = az.id
    LEFT JOIN asset_health ah ON a.id = ah.asset_id
    LEFT JOIN asset_risk ar ON a.id = ar.asset_id
    LEFT JOIN asset_tags tg ON a.id = tg.asset_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    baseSql += ' AND (a.asset_name LIKE ? OR a.hostname LIKE ? OR a.ip_address LIKE ? OR a.vendor LIKE ? OR a.model LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }

  if (status) {
    baseSql += ' AND a.status = ?';
    params.push(status);
  }

  if (type) {
    baseSql += ' AND at.code = ?';
    params.push(type);
  }

  if (zone) {
    baseSql += ' AND az.code = ?';
    params.push(zone);
  }

  if (criticality) {
    baseSql += ' AND a.criticality = ?';
    params.push(criticality);
  }

  if (health) {
    baseSql += ' AND ah.health_state = ?';
    params.push(health);
  }

  if (risk) {
    baseSql += ' AND ar.risk_level = ?';
    params.push(risk);
  }

  if (tag) {
    baseSql += ' AND tg.tag_name = ?';
    params.push(tag);
  }

  const countRes = await query(`SELECT COUNT(DISTINCT a.id) as total ${baseSql}`, params);
  const total = countRes[0]?.total || 0;

  const dataSql = `
    SELECT DISTINCT a.id, a.asset_uuid, a.asset_name, a.hostname, a.ip_address, a.mac_address,
           at.code as asset_type, az.code as zone, a.vendor, a.model, a.firmware_version,
           a.criticality, a.status, a.first_seen, a.last_seen,
           COALESCE(ah.health_score, 100) as health_score, COALESCE(ah.health_state, 'HEALTHY') as health_state,
           COALESCE(ar.risk_score, 10) as risk_score, COALESCE(ar.risk_level, 'LOW') as risk_level
    ${baseSql}
    ORDER BY a.last_seen DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limitNum, offset);

  const assets = await query(dataSql, params);

  // Attach protocols & tags
  for (const ast of assets) {
    const protos = await query('SELECT protocol_name FROM asset_protocols_observed WHERE asset_id = ?', [ast.id]);
    ast.protocols = protos.map(p => p.protocol_name);

    const tags = await query('SELECT tag_name FROM asset_tags WHERE asset_id = ?', [ast.id]);
    ast.tags = tags.map(t => t.tag_name);
  }

  return {
    data: assets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
}

export async function getAssetById(id) {
  const assets = await query(
    `SELECT a.*, at.code as asset_type_code, at.name as asset_type_name, az.code as zone_code, az.name as zone_name,
            COALESCE(ah.health_score, 100) as health_score, COALESCE(ah.health_state, 'HEALTHY') as health_state,
            COALESCE(ar.risk_score, 10) as risk_score, COALESCE(ar.risk_level, 'LOW') as risk_level, ar.risk_factors
     FROM assets a
     LEFT JOIN asset_types at ON a.asset_type_id = at.id
     LEFT JOIN asset_zones az ON a.zone_id = az.id
     LEFT JOIN asset_health ah ON a.id = ah.asset_id
     LEFT JOIN asset_risk ar ON a.id = ar.asset_id
     WHERE a.id = ? OR a.asset_name = ?`,
    [id, id]
  );

  if (!assets || assets.length === 0) return null;
  const asset = assets[0];

  const protocols = await query('SELECT protocol_name, first_seen, last_seen, observation_count FROM asset_protocols_observed WHERE asset_id = ?', [asset.id]);
  asset.protocols = protocols;

  const communications = await query(
    `SELECT acb.*, sa.asset_name as source_name, da.asset_name as destination_name
     FROM asset_communication_baseline acb
     JOIN assets sa ON acb.source_asset_id = sa.id
     JOIN assets da ON acb.destination_asset_id = da.id
     WHERE acb.source_asset_id = ? OR acb.destination_asset_id = ?`,
    [asset.id, asset.id]
  );
  asset.communications = communications;

  const tags = await query('SELECT tag_name FROM asset_tags WHERE asset_id = ?', [asset.id]);
  asset.tags = tags.map(t => t.tag_name);

  const notes = await query('SELECT * FROM asset_notes WHERE asset_id = ? ORDER BY created_at DESC', [asset.id]);
  asset.notes = notes;

  return asset;
}
