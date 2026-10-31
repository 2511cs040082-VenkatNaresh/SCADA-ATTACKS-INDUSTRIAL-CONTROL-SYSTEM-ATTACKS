import { getDbPool } from '../../backend/src/config/db.js';

export async function insertTelemetryReading(metricId, value, quality = 'GOOD', source = 'SENSOR', timestamp = new Date()) {
  const pool = getDbPool();
  const [result] = await pool.query(`
    INSERT INTO telemetry_readings (metric_id, timestamp, value, quality, source)
    VALUES (?, ?, ?, ?, ?)
  `, [metricId, timestamp, value, quality, source]);
  return result.insertId;
}

export async function getLatestMetricReadings(assetId) {
  const pool = getDbPool();
  const [rows] = await pool.query(`
    SELECT m.metric_name, m.metric_type, m.unit, m.normal_min, m.normal_max,
           r.value, r.quality, r.timestamp
    FROM telemetry_metrics m
    LEFT JOIN telemetry_readings r ON r.id = (
      SELECT id FROM telemetry_readings
      WHERE metric_id = m.id
      ORDER BY timestamp DESC LIMIT 1
    )
    WHERE m.asset_id = ?
  `, [assetId]);
  return rows;
}
