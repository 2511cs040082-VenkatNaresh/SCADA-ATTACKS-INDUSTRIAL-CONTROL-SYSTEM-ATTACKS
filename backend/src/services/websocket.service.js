import logger from '../logging/logger.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';

let wssInstance = null;

export function setWebSocketServer(wss) {
  wssInstance = wss;

  if (wssInstance) {
    wssInstance.on('connection', (ws, req) => {
      try {
        // Authenticate WebSocket connection via token query param or header
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token') || req.headers['sec-websocket-protocol'];

        if (token) {
          try {
            const decoded = jwt.verify(token, env.jwtSecret);
            ws.user = decoded;
            logger.info(`[WS AUTH SUCCESS] Client connected for user '${decoded.username}' (Roles: ${decoded.roles ? decoded.roles.join(',') : 'None'})`);
          } catch (e) {
            logger.warn(`[WS AUTH FAILED] Invalid WebSocket token: ${e.message}`);
          }
        }

        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            // Client message validation: Reject client attempts to mutate server state over WS
            if (data.type && (data.type.startsWith('admin.') || data.type.startsWith('response.') || data.type.startsWith('simulation.'))) {
              logger.warn(`[WS REJECT] Client attempt to send server-only event '${data.type}' rejected.`);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unauthorized. Client state mutation via WebSocket prohibited.',
                timestamp: new Date().toISOString()
              }));
            }
          } catch (err) {
            // Ignore malformed JSON
          }
        });
      } catch (err) {
        logger.error(`[WS CONNECTION ERROR] ${err.message}`);
      }
    });
  }
}

export function broadcastMessage(type, payload = {}) {
  if (!wssInstance) return;

  const timestamp = payload.timestamp || new Date().toISOString();
  const eventId = payload.event_id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Construct Standardized Event Envelope (Section 3 of Real-Time Sync Spec)
  const envelope = {
    event_id: eventId,
    event_type: type,
    type: type, // alias for backwards compatibility
    timestamp: timestamp,
    environment: payload.environment || 'LAB',
    simulation: payload.simulation ?? (payload.simulation_run_id || payload.scenario_id ? true : false),
    simulation_run_id: payload.simulation_run_id || payload.run_id || payload.runId || null,
    scenario_id: payload.scenario_id || payload.scenarioId || null,
    scenario_version: payload.scenario_version || payload.version || 'v1.0',
    asset_id: payload.asset_id || payload.target_asset_id || payload.source_asset || payload.assetId || null,
    asset_ids: payload.asset_ids || (payload.asset_id ? [payload.asset_id] : []),
    source_asset_id: payload.source_asset_id || payload.source_asset || null,
    destination_asset_id: payload.destination_asset_id || payload.target_asset || null,
    zone_id: payload.zone_id || 'ZONE-1',
    protocol: payload.protocol || null,
    session_id: payload.session_id || null,
    event_source: payload.event_source || 'ICS-SHIELD-ENGINE',
    severity: payload.severity || (type.includes('critical') ? 'CRITICAL' : type.includes('alert') ? 'HIGH' : 'LOW'),
    priority: payload.priority || (type.includes('critical') ? 'P1' : 'P2'),
    entity_type: payload.entity_type || type.split('.')[0] || 'entity',
    entity_id: payload.entity_id || payload.id || payload.alert_id || payload.incident_id || null,
    correlation_id: payload.correlation_id || payload.correlationId || null,
    parent_event_id: payload.parent_event_id || null,
    payload: payload.payload || payload,
    data: payload.data || payload,
    metadata: payload.metadata || {}
  };

  const data = JSON.stringify(envelope);

  const isAdminChannel = type.startsWith('admin.') || type.startsWith('audit.');
  const isResponseChannel = type.startsWith('response.');

  let sentCount = 0;
  wssInstance.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      // Channel Authorization Check
      if (client.user && client.user.roles) {
        const roles = Array.isArray(client.user.roles) ? client.user.roles : [client.user.roles];
        
        if (isAdminChannel && !roles.includes('ADMIN')) {
          return; // Skip non-admin clients for admin channel broadcasts
        }
        if (isResponseChannel && !(roles.includes('ADMIN') || roles.includes('SECURITY_ANALYST') || roles.includes('SOC_OPERATOR'))) {
          return; // Skip unauthorized clients for response events
        }
      }

      client.send(data);
      sentCount++;
    }
  });

  logger.debug(`[WS BROADCAST] Event: ${type} (${eventId}) sent to ${sentCount} authorized clients.`);
}
