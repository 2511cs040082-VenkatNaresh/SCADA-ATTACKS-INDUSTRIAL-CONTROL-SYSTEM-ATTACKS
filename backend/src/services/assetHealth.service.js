import { query } from '../config/database.js';
import logger from '../logging/logger.js';
import { broadcastMessage } from './websocket.service.js';

export function calculateHealthScore(lastSeenDate, currentStatus) {
  let score = 100;
  let state = 'HEALTHY';

  // 1. Freshness / Connectivity score
  const now = new Date();
  const diffSeconds = lastSeenDate ? Math.floor((now - new Date(lastSeenDate)) / 1000) : 999;

  if (diffSeconds > 45 || currentStatus === 'OFFLINE') {
    score = 0;
    state = 'OFFLINE';
  } else if (diffSeconds > 15 || currentStatus === 'WARNING' || currentStatus === 'DEGRADED') {
    score = 60;
    state = currentStatus === 'DEGRADED' ? 'DEGRADED' : 'WARNING';
  } else {
    score = 100;
    state = 'HEALTHY';
  }

  return { score, state };
}

export async function updateAssetHealth(assetId, status, lastSeen) {
  try {
    const { score, state } = calculateHealthScore(lastSeen, status);

    // Fetch previous health
    const existing = await query('SELECT health_state, health_score FROM asset_health WHERE asset_id = ?', [assetId]);

    if (existing && existing.length > 0) {
      const prev = existing[0];
      if (prev.health_state !== state || prev.health_score !== score) {
        await query(
          `UPDATE asset_health 
           SET health_score = ?, health_state = ?, calculated_at = NOW() 
           WHERE asset_id = ?`,
          [score, state, assetId]
        );

        // Record history
        await query(
          `INSERT INTO asset_health_history (asset_id, previous_state, new_state, health_score, reason)
           VALUES (?, ?, ?, ?, ?)`,
          [assetId, prev.health_state, state, score, `Health updated based on telemetry freshness & status (${status})`]
        );

        broadcastMessage('asset.health_changed', {
          asset_id: assetId,
          previous_state: prev.health_state,
          health_state: state,
          health_score: score
        });
      }
    } else {
      await query(
        `INSERT INTO asset_health (asset_id, health_score, health_state)
         VALUES (?, ?, ?)`,
        [assetId, score, state]
      );
    }
  } catch (err) {
    logger.debug(`Failed to update asset health for asset ${assetId}: ${err.message}`);
  }
}
