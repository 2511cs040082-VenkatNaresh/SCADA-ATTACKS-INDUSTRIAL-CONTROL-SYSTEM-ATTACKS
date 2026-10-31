import { getDbPool } from '../config/db.js';
import logger from '../logging/logger.js';

export async function getDbHealth(_req, res) {
  try {
    const pool = getDbPool();
    const startTime = Date.now();
    
    // 1. Connection ping
    const [pingRows] = await pool.query('SELECT VERSION() AS db_version, NOW() AS server_time');
    const latencyMs = Date.now() - startTime;

    // 2. Fetch table list in current database
    const [tables] = await pool.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    const tableNames = tables.map(t => t.TABLE_NAME);

    return res.status(200).json({
      status: 'success',
      message: 'Database connection operational',
      database: {
        name: process.env.DATABASE_NAME || 'ics_shield',
        version: pingRows[0].db_version,
        serverTime: pingRows[0].server_time,
        latencyMs,
        tableCount: tableNames.length,
        tables: tableNames,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log internal error details server-side safely
    logger.error(`[DB HEALTH ERROR] ${error.message}\n${error.stack}`);
    
    // Return sanitized response to client without exposing credentials or internal traces
    return res.status(500).json({
      status: 'error',
      message: 'Database connection health check failed',
      details: 'Unable to connect to MySQL database server',
      timestamp: new Date().toISOString()
    });
  }
}
