import logger from '../logging/logger.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden. User identity or role information missing.',
        timestamp: new Date().toISOString()
      });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
    const hasRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      logger.warn(`Forbidden access attempt by user '${req.user.username}' (Roles: ${userRoles.join(',')}) to endpoint ${req.originalUrl}. Required: ${allowedRoles.join(',')}`);
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. Required role: [${allowedRoles.join(', ')}]`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}
