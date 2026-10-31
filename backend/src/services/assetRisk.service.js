import { query } from '../config/database.js';
import logger from '../logging/logger.js';
import { broadcastMessage } from './websocket.service.js';

export function calculateRiskScore(criticality, securityEventCount = 0, healthState = 'HEALTHY') {
  let score = 10;
  const factors = [];

  // 1. Criticality weight
  switch (criticality?.toUpperCase()) {
    case 'CRITICAL':
      score += 40;
      factors.push({ name: 'Asset Criticality', weight: 40, detail: 'Purdue Level 1/3 Mission-Critical Asset' });
      break;
    case 'HIGH':
      score += 30;
      factors.push({ name: 'Asset Criticality', weight: 30, detail: 'High Priority Asset' });
      break;
    case 'MEDIUM':
      score += 15;
      factors.push({ name: 'Asset Criticality', weight: 15, detail: 'Medium Priority Asset' });
      break;
    default:
      score += 5;
      factors.push({ name: 'Asset Criticality', weight: 5, detail: 'Standard Priority Asset' });
  }

  // 2. Security Events / Anomalies
  if (securityEventCount > 0) {
    const evWeight = Math.min(securityEventCount * 15, 45);
    score += evWeight;
    factors.push({ name: 'Security Anomalies', weight: evWeight, detail: `${securityEventCount} recent security/anomaly events` });
  }

  // 3. Health State Risk Impact
  if (healthState === 'DEGRADED' || healthState === 'WARNING') {
    score += 10;
    factors.push({ name: 'Health Instability', weight: 10, detail: `Asset health state is ${healthState}` });
  } else if (healthState === 'OFFLINE') {
    score += 20;
    factors.push({ name: 'Availability Loss', weight: 20, detail: 'Asset is currently OFFLINE' });
  }

  score = Math.min(Math.max(score, 0), 100);

  let level = 'LOW';
  if (score >= 75) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MEDIUM';

  return { score, level, factors };
}

export async function updateAssetRisk(assetId) {
  try {
    const assets = await query('SELECT criticality, status FROM assets WHERE id = ?', [assetId]);
    if (!assets || assets.length === 0) return;

    const asset = assets[0];
    const events = await query('SELECT COUNT(*) as cnt FROM security_events WHERE source_asset_id = ? OR destination_asset_id = ?', [assetId, assetId]);
    const secCount = events[0]?.cnt || 0;

    const healths = await query('SELECT health_state FROM asset_health WHERE asset_id = ?', [assetId]);
    const healthState = healths[0]?.health_state || 'HEALTHY';

    const { score, level, factors } = calculateRiskScore(asset.criticality, secCount, healthState);

    const existing = await query('SELECT risk_score, risk_level FROM asset_risk WHERE asset_id = ?', [assetId]);
    if (existing && existing.length > 0) {
      await query(
        `UPDATE asset_risk 
         SET risk_score = ?, risk_level = ?, risk_factors = ?, calculated_at = NOW() 
         WHERE asset_id = ?`,
        [score, level, JSON.stringify(factors), assetId]
      );
    } else {
      await query(
        `INSERT INTO asset_risk (asset_id, risk_score, risk_level, risk_factors) 
         VALUES (?, ?, ?, ?)`,
        [assetId, score, level, JSON.stringify(factors)]
      );
    }

    // Insert into history
    await query(
      `INSERT INTO asset_risk_history (asset_id, risk_score, risk_level, risk_factors) 
       VALUES (?, ?, ?, ?)`,
      [assetId, score, level, JSON.stringify(factors)]
    );
  } catch (err) {
    logger.debug(`Failed to update asset risk for asset ${assetId}: ${err.message}`);
  }
}
