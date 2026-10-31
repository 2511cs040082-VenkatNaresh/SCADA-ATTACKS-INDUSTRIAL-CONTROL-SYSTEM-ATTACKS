import { WebSocketServer } from 'ws';
import logger from '../logging/logger.js';
import { setWebSocketServer } from '../services/websocket.service.js';

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  setWebSocketServer(wss);
  logger.info('WebSocket Server initialized and attached to HTTP server');

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    logger.info(`WebSocket client connected from ${ip}`);

    ws.send(JSON.stringify({
      type: 'CONNECTION_ACK',
      message: 'Connected to ICS-SHIELD Real-Time Feed',
      timestamp: new Date().toISOString(),
    }));

    // Heartbeat simulator tick
    const interval = setInterval(() => {
      if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify({
          type: 'TELEMETRY_TICK',
          systemStatus: 'HEALTHY',
          packetRate: Math.floor(125 + Math.random() * 40),
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
