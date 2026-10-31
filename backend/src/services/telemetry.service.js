import { query } from '../config/database.js';
import { broadcastMessage } from './websocket.service.js';

export async function getTelemetryMetrics() {
  return await query(`
    SELECT m.id, m.metric_name, m.metric_type, m.unit, m.normal_min, m.normal_max,
           a.id AS asset_id, a.asset_name, a.ip_address
    FROM telemetry_metrics m
    JOIN assets a ON m.asset_id = a.id
    ORDER BY a.asset_name, m.metric_name
  `);
}

export async function addTelemetryReading({ metricId, value, quality = 'GOOD', source = 'SENSOR', timestamp = new Date() }) {
  const result = await query(`
    INSERT INTO telemetry_readings (metric_id, timestamp, value, quality, source)
    VALUES (?, ?, ?, ?, ?)
  `, [metricId, timestamp, value, quality, source]);

  // Broadcast to live WebSocket clients
  broadcastMessage('TELEMETRY_READING', {
    readingId: result.insertId,
    metricId,
    value,
    quality,
    timestamp: new Date(timestamp).toISOString(),
  });

  return { id: result.insertId, metricId, value, quality, timestamp };
}

export async function getLatestReadingsPerMetric() {
  return await query(`
    SELECT m.id AS metric_id, m.metric_name, m.unit, m.normal_min, m.normal_max,
           a.asset_name, r.value, r.quality, r.timestamp
    FROM telemetry_metrics m
    JOIN assets a ON m.asset_id = a.id
    LEFT JOIN telemetry_readings r ON r.id = (
      SELECT id FROM telemetry_readings
      WHERE metric_id = m.id
      ORDER BY timestamp DESC LIMIT 1
    )
  `);
}

export async function getMetricHistory(metricId, limit = 50) {
  return await query(`
    SELECT id, value, quality, source, timestamp
    FROM telemetry_readings
    WHERE metric_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `, [parseInt(metricId, 10), parseInt(limit, 10)]);
}
