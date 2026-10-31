import { securityConfig } from '../config/security.js';
import logger from '../logging/logger.js';

const requestCounts = new Map();

// Clean up expired buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.startTime > securityConfig.rateLimitWindowMs) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let record = requestCounts.get(ip);
  if (!record || now - record.startTime > securityConfig.rateLimitWindowMs) {
    record = { count: 1, startTime: now };
    requestCounts.set(ip, record);
    return next();
  }

  record.count++;
  if (record.count > securityConfig.rateLimitMaxRequests) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }

  next();
}
