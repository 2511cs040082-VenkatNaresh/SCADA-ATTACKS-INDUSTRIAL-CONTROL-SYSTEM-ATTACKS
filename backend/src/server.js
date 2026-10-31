import http from 'http';
import app from './app.js';
import { env } from './config/environment.js';
import logger from './logging/logger.js';
import { initWebSocketServer } from './websocket/server.js';

const server = http.createServer(app);

// Attach WebSocket Server
initWebSocketServer(server);

const PORT = env.port;

server.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(` ICS-SHIELD Backend Service running on port ${PORT}`);
  logger.info(` System Health: http://localhost:${PORT}/api/system/health`);
  logger.info(` DB Health:     http://localhost:${PORT}/api/system/health/database`);
  logger.info(` Environment:   ${env.nodeEnv}`);
  logger.info(`==================================================`);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});
