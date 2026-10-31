import { query } from '../config/database.js';
import logger from '../logging/logger.js';
import { updateAssetHealth } from './assetHealth.service.js';
import { updateAssetRisk } from './assetRisk.service.js';
import { recordProtocolObservation, recordCommunicationBaseline } from './assetBaseline.service.js';
import { handleUnknownAssetDiscovery } from './assetDiscovery.service.js';
import { broadcastMessage } from './websocket.service.js';

class TelemetryPipelineBackendService {
  constructor() {
    self_stats = {
      events_received: 0,
      events_processed: 0,
      events_duplicate: 0,
      events_failed: 0,
      start_time: Date.now()
    };
  }

  async resolveAssetId(assetNameOrIp) {
    if (!assetNameOrIp) return null;
    const res = await query(
      'SELECT id FROM assets WHERE asset_name = ? OR ip_address = ? LIMIT 1',
      [assetNameOrIp, assetNameOrIp]
    );
    return res && res.length > 0 ? res[0].id : null;
  }

  async processEvent(event) {
    this.events_received++;
    const { event_id, event_type, timestamp, source, payload, metadata } = event;

    // 1. Asset Resolution
    let assetId = await this.resolveAssetId(source?.asset_id);

    if (!assetId) {
      // Record Unknown Asset Discovery
      await handleUnknownAssetDiscovery({
        ip_address: source?.asset_id || '10.10.0.0',
        protocol: payload?.protocol || 'MODBUS/TCP',
        source: 'TELEMETRY_OBSERVATION',
        evidence: { event_type, payload }
      });
      return { status: 'quarantined', reason: 'Unknown asset recorded in discoveries' };
    }

    // 2. Update Asset Last Seen & Status
    const status = payload?.status || 'ONLINE';
    await query('UPDATE assets SET last_seen = NOW(), status = ? WHERE id = ?', [status, assetId]);
    await updateAssetHealth(assetId, status, timestamp);
    await updateAssetRisk(assetId);

    // 3. Process Event Type Specific Persistence & Baseline Recording
    if (event_type === 'TELEMETRY' || event_type === 'PROCESS') {
      const metricName = payload?.metric || payload?.parameter || 'generic_value';
      const value = payload?.value !== undefined ? payload.value : 0;
      const unit = payload?.unit || '';
      const quality = payload?.quality || 'GOOD';

      // Resolve metric ID
      let mRes = await query('SELECT id FROM telemetry_metrics WHERE asset_id = ? AND metric_name = ?', [assetId, metricName]);
      let metricId;
      if (mRes && mRes.length > 0) {
        metricId = mRes[0].id;
      } else {
        const ins = await query(
          'INSERT INTO telemetry_metrics (asset_id, metric_name, metric_type, unit) VALUES (?, ?, ?, ?)',
          [assetId, metricName, 'GAUGE', unit]
        );
        metricId = ins.insertId;
      }

      await query(
        'INSERT INTO telemetry_readings (metric_id, timestamp, value, quality, source) VALUES (?, ?, ?, ?, ?)',
        [metricId, new Date(timestamp), value, quality, source?.asset_type || 'SENSOR']
      );

      broadcastMessage('telemetry.received', {
        asset_id: source?.asset_id,
        metric: metricName,
        value,
        unit,
        quality
      });

      if (event_type === 'PROCESS') {
        broadcastMessage('process.updated', {
          asset_id: source?.asset_id,
          parameter: metricName,
          value,
          unit,
          quality
        });
      }
    } else if (event_type === 'PROTOCOL') {
      const protocolName = payload?.protocol || 'MODBUS/TCP';
      await recordProtocolObservation(assetId, protocolName);

      if (payload?.destination_asset) {
        const dstId = await this.resolveAssetId(payload.destination_asset);
        if (dstId) {
          await recordCommunicationBaseline(assetId, dstId, protocolName, payload.port || 502);
        }
      }

      broadcastMessage('protocol.event', {
        source_asset: source?.asset_id,
        destination_asset: payload?.destination_asset,
        protocol: protocolName,
        operation: payload?.operation,
        status: payload?.status
      });
    } else if (event_type === 'NETWORK') {
      if (payload?.destination_asset) {
        const dstId = await this.resolveAssetId(payload.destination_asset);
        if (dstId) {
          await recordCommunicationBaseline(assetId, dstId, payload.protocol || 'MODBUS/TCP', payload.destination_port || 502);
        }
      }

      broadcastMessage('network.event', {
        source_asset: source?.asset_id,
        destination_asset: payload?.destination_asset,
        protocol: payload?.protocol,
        bytes: payload?.bytes,
        status: payload?.status
      });
    } else if (event_type === 'SECURITY') {
      const severity = payload?.severity || 'MEDIUM';
      const eventTypeId = 1; // Default Security Anomaly Type

      let dstAssetId = null;
      if (payload?.destination_asset) {
        dstAssetId = await this.resolveAssetId(payload.destination_asset);
      }

      await query(
        `INSERT INTO security_events (event_uuid, timestamp, event_type_id, source_asset_id, destination_asset_id, severity, description, evidence, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNPROCESSED')`,
        [event_id, new Date(timestamp), eventTypeId, assetId, dstAssetId, severity, payload?.policy_violation || 'Security Anomaly Detected', JSON.stringify(payload || {})]
      );

      broadcastMessage('security.event', {
        event_id,
        severity,
        source_asset: source?.asset_id,
        destination_asset: payload?.destination_asset,
        description: payload?.policy_violation
      });
    }

    this.events_processed++;
    return { status: 'success', event_id };
  }

  async processBatch(events) {
    const results = [];
    for (const ev of events) {
      try {
        const res = await this.processEvent(ev);
        results.push(res);
      } catch (err) {
        this.events_failed++;
        logger.error(`Failed to process event ${ev.event_id}: ${err.message}`);
        results.push({ status: 'failed', event_id: ev.event_id, error: err.message });
      }
    }
    return results;
  }

  getHealth() {
    const elapsedSec = Math.max((Date.now() - this.start_time) / 1000, 1.0);
    return {
      status: 'HEALTHY',
      events_received: this.events_received,
      events_processed: this.events_processed,
      events_failed: this.events_failed,
      events_duplicate: this.events_duplicate,
      events_per_second: Number((this.events_processed / elapsedSec).toFixed(2)),
      uptime_seconds: Number(elapsedSec.toFixed(2))
    };
  }
}

let self_stats = {};
export const telemetryPipelineBackendService = new TelemetryPipelineBackendService();
