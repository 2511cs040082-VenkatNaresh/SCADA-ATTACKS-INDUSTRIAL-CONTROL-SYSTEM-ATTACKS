import { errorResponse } from '../utils/responseHandler.js';

const SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'ics_shield_internal_telemetry_secret_token_2026';

export function internalAuth(req, res, next) {
  const tokenHeader = req.headers['x-internal-service-key'];
  const authHeader = req.headers['authorization'];

  let token = tokenHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token === SERVICE_TOKEN) {
    return next();
  }

  return errorResponse(res, 'Unauthorized internal ingestion request', 401);
}
