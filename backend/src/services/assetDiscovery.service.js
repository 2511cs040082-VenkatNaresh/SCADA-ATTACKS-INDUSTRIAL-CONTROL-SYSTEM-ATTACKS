import { query } from '../config/database.js';
import logger from '../logging/logger.js';
import { broadcastMessage } from './websocket.service.js';
import crypto from 'crypto';

export async function handleUnknownAssetDiscovery({ ip_address, mac_address, hostname, protocol, source, evidence }) {
  try {
    const existing = await query('SELECT * FROM asset_discoveries WHERE ip_address = ?', [ip_address]);

    if (existing && existing.length > 0) {
      const disc = existing[0];
      await query(
        `UPDATE asset_discoveries 
         SET last_seen = NOW(), protocol = COALESCE(?, protocol), evidence = COALESCE(?, evidence)
         WHERE id = ?`,
        [protocol, JSON.stringify(evidence || {}), disc.id]
      );
      return disc;
    }

    const discovery_uuid = crypto.randomUUID();
    const result = await query(
      `INSERT INTO asset_discoveries 
       (discovery_uuid, discovery_source, timestamp, ip_address, mac_address, hostname, protocol, identification_status, evidence)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, 'UNKNOWN', ?)`,
      [discovery_uuid, source || 'TELEMETRY', ip_address, mac_address || null, hostname || null, protocol || 'MODBUS/TCP', JSON.stringify(evidence || {})]
    );

    const newDisc = {
      id: result.insertId,
      discovery_uuid,
      ip_address,
      protocol,
      identification_status: 'UNKNOWN'
    };

    broadcastMessage('asset.discovered', newDisc);
    logger.info(`[ASSET DISCOVERY] Recorded unknown laboratory asset: IP ${ip_address}, Protocol ${protocol}`);
    return newDisc;
  } catch (err) {
    logger.error(`Failed to record asset discovery: ${err.message}`);
    return null;
  }
}

export async function getDiscoveries(status = null) {
  let sql = 'SELECT * FROM asset_discoveries';
  const params = [];
  if (status) {
    sql += ' WHERE identification_status = ?';
    params.push(status);
  }
  sql += ' ORDER BY last_seen DESC';
  return await query(sql, params);
}

export async function identifyOrApproveDiscovery(discoveryId, action, { asset_name, asset_type_id, zone_id, criticality = 'MEDIUM' } = {}) {
  const discRes = await query('SELECT * FROM asset_discoveries WHERE id = ?', [discoveryId]);
  if (!discRes || discRes.length === 0) {
    throw new Error('Discovery record not found');
  }

  const disc = discRes[0];

  if (action === 'APPROVE' || action === 'IDENTIFY') {
    // Check if asset already exists by IP or Name
    const existingAsset = await query('SELECT * FROM assets WHERE ip_address = ? OR asset_name = ?', [disc.ip_address, asset_name || `ASSET-${disc.ip_address}`]);

    let assetId;
    if (existingAsset && existingAsset.length > 0) {
      assetId = existingAsset[0].id;
    } else {
      const asset_uuid = crypto.randomUUID();
      const name = asset_name || `LAB-ASSET-${disc.ip_address.replace(/\./g, '-')}`;
      const typeId = asset_type_id || 1; // Default to PLC/Field Device type

      const res = await query(
        `INSERT INTO assets (asset_uuid, asset_name, hostname, ip_address, mac_address, asset_type_id, zone_id, criticality, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ONLINE')`,
        [asset_uuid, name, disc.hostname || name, disc.ip_address, disc.mac_address || null, typeId, zone_id || null, criticality]
      );
      assetId = res.insertId;
    }

    await query(
      `UPDATE asset_discoveries 
       SET identification_status = 'APPROVED', asset_id = ? 
       WHERE id = ?`,
      [assetId, discoveryId]
    );

    broadcastMessage('asset.updated', { discoveryId, action: 'APPROVED', assetId });
    return { status: 'APPROVED', assetId };
  } else if (action === 'IGNORE') {
    await query(
      `UPDATE asset_discoveries 
       SET identification_status = 'IGNORED' 
       WHERE id = ?`,
      [discoveryId]
    );
    broadcastMessage('asset.updated', { discoveryId, action: 'IGNORED' });
    return { status: 'IGNORED' };
  }

  throw new Error('Invalid discovery resolution action');
}
