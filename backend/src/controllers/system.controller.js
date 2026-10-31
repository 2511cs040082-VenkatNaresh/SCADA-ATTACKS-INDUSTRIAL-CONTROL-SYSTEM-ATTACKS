import { query } from '../config/database.js';
import { getAuditLogs } from '../services/audit.service.js';
import { successResponse } from '../utils/responseHandler.js';

export async function getSettings(_req, res, next) {
  try {
    const settings = await query('SELECT setting_key, setting_value, setting_type, description FROM system_settings');
    return successResponse(res, settings, 'Fetched system settings');
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogsController(req, res, next) {
  try {
    const logs = await getAuditLogs(req.query.limit || 50);
    return successResponse(res, logs, 'Fetched system audit log trail');
  } catch (err) {
    next(err);
  }
}
