import { query } from '../config/database.js';
import logger from '../logging/logger.js';
import { broadcastMessage } from './websocket.service.js';

export async function recordProtocolObservation(assetId, protocolName) {
  try {
    const existing = await query(
      'SELECT id, observation_count FROM asset_protocols_observed WHERE asset_id = ? AND protocol_name = ?',
      [assetId, protocolName]
    );

    if (existing && existing.length > 0) {
      await query(
        `UPDATE asset_protocols_observed 
         SET last_seen = NOW(), observation_count = observation_count + 1 
         WHERE id = ?`,
        [existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO asset_protocols_observed (asset_id, protocol_name, first_seen, last_seen, observation_count)
         VALUES (?, ?, NOW(), NOW(), 1)`,
        [assetId, protocolName]
      );
    }
  } catch (err) {
    logger.debug(`Failed to record protocol observation for asset ${assetId}: ${err.message}`);
  }
}

export async function recordCommunicationBaseline(sourceAssetId, destinationAssetId, protocol = 'MODBUS/TCP', port = 502) {
  try {
    const existing = await query(
      `SELECT id, count FROM asset_communication_baseline 
       WHERE source_asset_id = ? AND destination_asset_id = ? AND protocol = ? AND port = ?`,
      [sourceAssetId, destinationAssetId, protocol, port]
    );

    if (existing && existing.length > 0) {
      await query(
        `UPDATE asset_communication_baseline 
         SET last_seen = NOW(), count = count + 1 
         WHERE id = ?`,
        [existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO asset_communication_baseline 
         (source_asset_id, destination_asset_id, protocol, port, first_seen, last_seen, count)
         VALUES (?, ?, ?, ?, NOW(), NOW(), 1)`,
        [sourceAssetId, destinationAssetId, protocol, port]
      );

      broadcastMessage('asset.communication_observed', {
        source_asset_id: sourceAssetId,
        destination_asset_id: destinationAssetId,
        protocol,
        port
      });
    }
  } catch (err) {
    logger.debug(`Failed to record communication baseline: ${err.message}`);
  }
}

export async function getAssetCommunicationGraph() {
  const nodesSql = `
    SELECT a.id, a.asset_uuid, a.asset_name, a.ip_address, at.name as asset_type, az.name as zone_name,
           a.status, COALESCE(ah.health_state, 'HEALTHY') as health_state,
           COALESCE(ar.risk_level, 'LOW') as risk_level
    FROM assets a
    LEFT JOIN asset_types at ON a.asset_type_id = at.id
    LEFT JOIN asset_zones az ON a.zone_id = az.id
    LEFT JOIN asset_health ah ON a.id = ah.asset_id
    LEFT JOIN asset_risk ar ON a.id = ar.asset_id
  `;

  const edgesSql = `
    SELECT acb.id, acb.source_asset_id, acb.destination_asset_id, acb.protocol, acb.port, acb.count,
           acb.first_seen, acb.last_seen, sa.asset_name as source_name, da.asset_name as destination_name
    FROM asset_communication_baseline acb
    JOIN assets sa ON acb.source_asset_id = sa.id
    JOIN assets da ON acb.destination_asset_id = da.id
  `;

  const nodes = await query(nodesSql);
  const edges = await query(edgesSql);

  return { nodes, edges };
}
