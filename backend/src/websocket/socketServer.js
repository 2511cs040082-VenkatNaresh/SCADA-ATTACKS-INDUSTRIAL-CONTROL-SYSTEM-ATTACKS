import { WebSocketServer } from 'ws';
import logger from '../logging/logger.js';

let wss;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  logger.info('WebSocket Server attached to HTTP server');

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    logger.info(`WebSocket client connected from ${ip}`);

    // Send initial handshake message
    ws.send(JSON.stringify({
      type: 'CONNECTION_ACK',
      message: 'Connected to ICS-SHIELD Real-Time Telemetry Feed',
      timestamp: new Date().toISOString(),
    }));

    // Periodic heartbeat/telemetry simulator
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'TELEMETRY_TICK',
          systemStatus: 'HEALTHY',
          activeAlertsCount: 2,
          packetRate: Math.floor(120 + Math.random() * 45),
          timestamp: new Date().toISOString(),
        }));
      }
    }, 5000);

    ws.on('close', () => {
      logger.info(`WebSocket client disconnected from ${ip}`);
      clearInterval(interval);
    });

    ws.on('error', (err) => {
      logger.error(`WebSocket client error: ${err.message}`);
    });
  });

  return wss;
}
