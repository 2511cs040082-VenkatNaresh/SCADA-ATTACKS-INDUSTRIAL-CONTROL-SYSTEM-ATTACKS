import { query } from '../../config/database.js';
import logger from '../../logging/logger.js';

let inMemoryTimelineStore = [];

export async function buildIncidentTimeline(incidentId) {
  const timelineEvents = [];

  try {
    // 1. Fetch DB Timeline Records
    const dbTimeline = await query(`
      SELECT * FROM incident_timeline
      WHERE incident_id = ?
      ORDER BY timestamp ASC, id ASC
    `, [incidentId]);

    if (dbTimeline && dbTimeline.length > 0) {
      dbTimeline.forEach(row => {
        timelineEvents.push({
          id: row.id,
          timestamp: row.timestamp,
          event_type: row.event_type,
          source_type: row.source_type,
          source_id: row.source_id,
          title: row.title,
          description: row.description,
          severity: row.severity,
          asset_id: row.asset_id,
          protocol: row.protocol,
          metadata: typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json
        });
      });
      return timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  } catch (err) {
    logger.debug(`Timeline DB fetch fallback: ${err.message}`);
  }

  // Fallback in-memory timeline
  const inMem = inMemoryTimelineStore.filter(t => String(t.incident_id) === String(incidentId));
  inMem.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return inMem;
}

export async function addTimelineRecord(incidentId, eventRecord) {
  const timestamp = eventRecord.timestamp || new Date().toISOString();
  const record = {
    id: inMemoryTimelineStore.length + 1,
    incident_id: incidentId,
    timestamp,
    event_type: eventRecord.event_type || 'INCIDENT_EVENT',
    source_type: eventRecord.source_type || 'ANALYST',
    source_id: eventRecord.source_id || null,
    title: eventRecord.title || 'Timeline Observation',
    description: eventRecord.description || '',
    severity: eventRecord.severity || 'MEDIUM',
    asset_id: eventRecord.asset_id || null,
    protocol: eventRecord.protocol || 'MODBUS_TCP',
    metadata_json: eventRecord.metadata || {}
  };

  try {
    const res = await query(`
      INSERT INTO incident_timeline
      (incident_id, timestamp, event_type, source_type, source_id, title, description, severity, asset_id, protocol, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      record.incident_id, record.timestamp, record.event_type, record.source_type,
      record.source_id, record.title, record.description, record.severity,
      record.asset_id, record.protocol, JSON.stringify(record.metadata_json)
    ]);
    if (res && res.insertId) record.id = res.insertId;
  } catch (err) {
    logger.debug(`Add timeline record DB fallback: ${err.message}`);
  }

  inMemoryTimelineStore.push(record);
  return record;
}
