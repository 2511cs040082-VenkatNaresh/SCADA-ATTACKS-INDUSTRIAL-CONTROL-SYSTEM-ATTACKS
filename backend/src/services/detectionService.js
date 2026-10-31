import { config } from '../config/env.js';
import logger from '../logging/logger.js';

export async function queryDetectionEngineStatus() {
  try {
    const res = await fetch(`${config.pythonServiceUrl}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    logger.debug(`Detection engine reachability check: ${err.message}`);
  }
  return { status: 'OFFLINE_OR_UNREACHABLE', target: config.pythonServiceUrl };
}
