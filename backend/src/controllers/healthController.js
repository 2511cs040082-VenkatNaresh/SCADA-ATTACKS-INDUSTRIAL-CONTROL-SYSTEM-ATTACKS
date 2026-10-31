import { checkDbConnection } from '../config/db.js';

const startTime = Date.now();

export async function getHealth(_req, res) {
  const dbConnected = await checkDbConnection();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const healthData = {
    service: 'ICS-SHIELD Backend API',
    status: 'ONLINE',
    phase: 'PHASE_1_FOUNDATION',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-phase1',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    components: {
      api: { status: 'HEALTHY' },
      database: {
        status: dbConnected ? 'HEALTHY' : 'DISCONNECTED_OR_PENDING',
        type: 'MySQL',
      },
      websocket: { status: 'OPERATIONAL' },
      detectionEngine: { status: 'STANDBY', url: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000' }
    }
  };

  return res.status(200).json(healthData);
}
