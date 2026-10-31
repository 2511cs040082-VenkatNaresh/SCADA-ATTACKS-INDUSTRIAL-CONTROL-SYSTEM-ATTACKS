import mysql from 'mysql2/promise';
import { config } from './env.js';
import logger from '../logging/logger.js';

let pool;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    logger.info(`MySQL pool configured for ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.name}`);
  }
  return pool;
}

export async function checkDbConnection() {
  try {
    const p = getDbPool();
    const [rows] = await p.query('SELECT 1 + 1 AS result');
    return rows[0].result === 2;
  } catch (error) {
    logger.warn(`Database connection check failed: ${error.message}`);
    return false;
  }
}
