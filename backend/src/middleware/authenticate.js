import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import logger from '../logging/logger.js';
import { getUserById } from '../services/adminService/users.js';
import { getActiveSessions } from '../services/adminService/sessions.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access. Missing or invalid Authorization header.',
      timestamp: new Date().toISOString()
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify JWT Token Signature & Expiration
    const decoded = jwt.verify(token, env.jwtSecret);

    // 2. User Status & Account Lock Verification
    if (decoded && decoded.id) {
      const user = await getUserById(decoded.id);
      if (user && user.status === 'DISABLED') {
        logger.warn(`[SECURITY AUTH BLOCK] Disabled user ID ${decoded.id} attempted API access.`);
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized access. Account is deactivated.',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 3. Active Session & Revocation Check
    const activeSessions = await getActiveSessions();
    const isRevoked = activeSessions.some(
      s => String(s.userId) === String(decoded.id) && s.status === 'REVOKED'
    );

    if (isRevoked) {
      logger.warn(`[SECURITY AUTH BLOCK] Revoked session access attempt by user ID ${decoded.id}.`);
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized access. Session has been revoked.',
        timestamp: new Date().toISOString()
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access. Token expired, malformed, or invalid.',
      timestamp: new Date().toISOString()
    });
  }
}
