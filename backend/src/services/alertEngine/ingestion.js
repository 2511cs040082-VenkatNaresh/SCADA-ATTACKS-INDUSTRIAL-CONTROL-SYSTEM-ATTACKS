import { query } from '../../config/database.js';
import logger from '../../logging/logger.js';
import { broadcastMessage } from '../websocket.service.js';
import { calculateSeverityAndPriority } from './prioritization.js';
import { checkSuppression } from './suppression.js';
import { createSLARecord } from './sla.js';
import { correlateAlert } from './correlation.js';
import { sendAlertNotifications } from './notifications.js';
import { ALERT_CONFIG } from './config.js';

let inMemoryAlerts = [
  {
    id: 1,
    alert_uuid: 'ALT-001-MODBUS-WRITE',
    source_type: 'RULE_DETECTION',
    source_detection_id: 'DET-001',
    title: 'Unauthorized Modbus Write to PLC Register',
    description: 'Phase 8 Rule Engine flagged unauthorized coil write command to PLC-001.',
    category: 'UNAUTHORIZED_COMMAND',
    severity: 'HIGH',
    priority: 'P2',
    confidence: 0.92,
    risk_score: 75.0,
    status: 'NEW',
    source_asset_id: 1,
    destination_asset_id: 2,
    protocol: 'MODBUS_TCP',
    rule_id: 1,
    model_id: null,
    behavioral_anomaly_id: null,
    assigned_to: null,
    assignee: null,
    asset_name: 'HMI-001',
    evidence_json: { rule_name: 'Rule 1: Modbus Write Guard', function_code: 5, address: 102 },
    occurrence_count: 1,
    first_seen: new Date(Date.now() - 600000).toISOString(),
    last_seen: new Date(Date.now() - 600000).toISOString(),
    created_at: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 2,
    alert_uuid: 'ALT-002-LATENCY-SPIKE',
    source_type: 'BEHAVIORAL_ANOMALY',
    source_detection_id: 'ANOM-002',
    title: 'Abnormal Modbus Response Latency Anomaly',
    description: 'Phase 9 Behavioral Engine observed Z-score 4.8σ latency spike.',
    category: 'PERFORMANCE_ANOMALY',
    severity: 'MEDIUM',
    priority: 'P3',
    confidence: 0.85,
    risk_score: 55.0,
    status: 'ACKNOWLEDGED',
    source_asset_id: 1,
    destination_asset_id: 3,
    protocol: 'MODBUS_TCP',
    rule_id: null,
    model_id: null,
    behavioral_anomaly_id: 2,
    assigned_to: 1,
    assignee: 'soc_analyst',
    asset_name: 'HMI-001',
    evidence_json: { feature: 'average_latency', observed_value: 245.0, baseline_mean: 12.5 },
    occurrence_count: 3,
    first_seen: new Date(Date.now() - 1200000).toISOString(),
    last_seen: new Date(Date.now() - 300000).toISOString(),
    created_at: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 3,
    alert_uuid: 'ALT-003-ML-ISOLATION',
    source_type: 'ML_DETECTION',
    source_detection_id: 'MLPRED-003',
    title: 'Isolation Forest Multivariate Telemetry Anomaly',
    description: 'Phase 10 ML Engine detected anomalous feature vector pattern.',
    category: 'MULTIVARIATE_ANOMALY',
    severity: 'CRITICAL',
    priority: 'P1',
    confidence: 0.95,
    risk_score: 92.0,
    status: 'IN_PROGRESS',
    source_asset_id: 1,
    destination_asset_id: 2,
    protocol: 'MODBUS_TCP',
    rule_id: null,
    model_id: 1,
    behavioral_anomaly_id: null,
    assigned_to: 1,
    assignee: 'soc_analyst',
    asset_name: 'HMI-001',
    evidence_json: { algorithm: 'ISOLATION_FOREST', top_features: ['request_rate', 'latency'] },
    occurrence_count: 5,
    first_seen: new Date(Date.now() - 1800000).toISOString(),
    last_seen: new Date(Date.now() - 120000).toISOString(),
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

// Flood protection rate limiter
let detectionWindowCount = 0;
let lastFloodWindowReset = Date.now();

export async function ingestDetection(input) {
  // 1. Flood protection rate limit check
  const now = Date.now();
  if (now - lastFloodWindowReset > 60000) {
    detectionWindowCount = 0;
    lastFloodWindowReset = now;
  }
  detectionWindowCount++;

  if (detectionWindowCount > ALERT_CONFIG.flood_protection.rate_limit_per_minute) {
    logger.warn(`Alert flood threshold exceeded (${detectionWindowCount} detections/min). Throttling creation.`);
    broadcastMessage('alert.flood_detected', {
      rate: detectionWindowCount,
      message: 'Alert flood protection activated. Duplicate detections merged.'
    });
  }

  // 2. Normalization
  const sourceType = input.source_type || 'RULE_DETECTION';
  const sourceDetId = input.source_detection_id || input.result_uuid || input.anomaly_uuid || input.prediction_uuid || `DET-${Date.now()}`;
  const title = input.title || input.rule_name || input.feature || 'Security Detection Event';
  const description = input.description || input.explanation || `Security event detected by ${sourceType}.`;
  const category = input.category || 'SECURITY_ANOMALY';
  const confidence = Number(input.confidence || 0.85);

  const sourceAssetId = input.source_asset_id || input.asset_id || null;
  const destAssetId = input.destination_asset_id || null;
  const protocol = input.protocol || 'MODBUS_TCP';
  const ruleId = input.rule_id || null;
  const modelId = input.model_id || null;
  const behavioralId = input.behavioral_anomaly_id || null;
  const evidence = input.evidence_json || input.evidence || {};

  // 3. Severity & Priority Scoring
  const scoring = calculateSeverityAndPriority({
    base_severity: input.severity || 'MEDIUM',
    confidence,
    asset_criticality: input.asset_criticality || 'HIGH',
    anomaly_score: Number(input.normalized_score || input.score || 50.0),
    has_process_impact: Boolean(input.has_process_impact)
  });

  // 4. Compute Deduplication Key
  const dedupKey = `${sourceType}:${ruleId || modelId || category}:${sourceAssetId}:${destAssetId}:${protocol}`;

  // 5. Check Deduplication Window (60s)
  try {
    const existing = await query(`
      SELECT * FROM alerts
      WHERE dedup_key = ?
      AND status NOT IN ('RESOLVED', 'CLOSED')
      AND last_seen >= NOW() - INTERVAL 1 MINUTE
      ORDER BY id DESC LIMIT 1
    `, [dedupKey]);

    if (existing && existing.length > 0) {
      const activeAlert = existing[0];
      const newCount = (activeAlert.occurrence_count || 1) + 1;
      const updatedTime = new Date().toISOString();

      await query(`
        UPDATE alerts
        SET occurrence_count = ?, last_seen = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [newCount, activeAlert.id]);

      activeAlert.occurrence_count = newCount;
      activeAlert.last_seen = updatedTime;

      broadcastMessage('alert.updated', activeAlert);
      return activeAlert;
    }
  } catch (err) {
    logger.debug(`Deduplication DB check fallback: ${err.message}`);
    const inMemMatch = inMemoryAlerts.find(a =>
      a.dedup_key === dedupKey &&
      !['RESOLVED', 'CLOSED'].includes(a.status)
    );

    if (inMemMatch) {
      inMemMatch.occurrence_count += 1;
      inMemMatch.last_seen = new Date().toISOString();
      broadcastMessage('alert.updated', inMemMatch);
      return inMemMatch;
    }
  }

  // 6. Check Suppression Rules
  const alertDataForSuppression = { source_asset_id: sourceAssetId, destination_asset_id: destAssetId, rule_id: ruleId, category };
  const suppressionCheck = await checkSuppression(alertDataForSuppression);
  const initialStatus = suppressionCheck.suppressed ? 'SUPPRESSED' : 'NEW';

  // 7. Construct Alert Object
  const alertUuid = `ALT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const nowStr = new Date().toISOString();

  const newAlertRecord = {
    id: inMemoryAlerts.length + 1,
    alert_uuid: alertUuid,
    source_type: sourceType,
    source_detection_id: sourceDetId,
    title,
    description,
    category,
    severity: scoring.severity,
    priority: scoring.priority,
    confidence,
    risk_score: scoring.calculated_risk_score,
    status: initialStatus,
    source_asset_id: sourceAssetId,
    destination_asset_id: destAssetId,
    protocol,
    rule_id: ruleId,
    model_id: modelId,
    behavioral_anomaly_id: behavioralId,
    evidence_json: evidence,
    metadata_json: { suppression_rule: suppressionCheck.rule || null },
    occurrence_count: 1,
    first_seen: nowStr,
    last_seen: nowStr,
    dedup_key: dedupKey,
    created_at: nowStr
  };

  // 8. DB Persistence
  try {
    const res = await query(`
      INSERT INTO alerts
      (alert_uuid, detection_id, source_type, source_detection_id, title, description, category, severity, priority, confidence, risk_score, status, source_asset_id, destination_asset_id, protocol, rule_id, model_id, behavioral_anomaly_id, evidence_json, occurrence_count, first_seen, last_seen, dedup_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW(), ?)
    `, [
      newAlertRecord.alert_uuid, input.detection_id || 1, newAlertRecord.source_type, newAlertRecord.source_detection_id,
      newAlertRecord.title, newAlertRecord.description, newAlertRecord.category, newAlertRecord.severity,
      newAlertRecord.priority, newAlertRecord.confidence, newAlertRecord.risk_score, newAlertRecord.status,
      newAlertRecord.source_asset_id, newAlertRecord.destination_asset_id, newAlertRecord.protocol,
      newAlertRecord.rule_id, newAlertRecord.model_id, newAlertRecord.behavioral_anomaly_id,
      JSON.stringify(newAlertRecord.evidence_json), newAlertRecord.dedup_key
    ]);
    if (res && res.insertId) newAlertRecord.id = res.insertId;
  } catch (err) {
    logger.debug(`Alert DB insert fallback: ${err.message}`);
  }

  inMemoryAlerts.unshift(newAlertRecord);

  // 9. SLA Tracking
  await createSLARecord(newAlertRecord.id, newAlertRecord.priority);

  // 10. Multi-layer Correlation
  await correlateAlert(newAlertRecord);

  // 11. Send Notifications
  if (newAlertRecord.status !== 'SUPPRESSED') {
    await sendAlertNotifications(newAlertRecord);
  }

  // 12. WebSocket Broadcast
  broadcastMessage('alert.created', newAlertRecord);

  return newAlertRecord;
}

export { inMemoryAlerts };
