import logger from '../logging/logger.js';
import { env } from '../config/environment.js';

export function errorHandler(err, req, res, _next) {
  // Always log complete un-truncated error stack to server log
  logger.error(`[UNHANDLED ERROR] ${err.message}\nStack: ${err.stack}`);

  const statusCode = err.status || err.statusCode || 500;
  
  // Production error response hides stack trace and internal database/filesystem details
  const isDev = env.nodeEnv === 'development';
  const clientMessage = isDev
    ? err.message
    : (statusCode === 500 ? 'Internal Server Error' : err.message);

  return res.status(statusCode).json({
    status: 'error',
    message: clientMessage,
    ...(isDev && { details: err.message, stack: err.stack }),
    timestamp: new Date().toISOString()
  });
}
