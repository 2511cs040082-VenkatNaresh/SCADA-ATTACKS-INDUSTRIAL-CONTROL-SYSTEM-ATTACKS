import mysql from 'mysql2/promise';
import { env } from './environment.js';
import logger from '../logging/logger.js';

let pool;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      multipleStatements: true,
    });
    logger.info(`MySQL connection pool initialized for ${env.db.user}@${env.db.host}:${env.db.port}/${env.db.name}`);
  }
  return pool;
}

export async function query(sql, params) {
  const p = getDbPool();
  try {
    const [rows] = await p.query(sql, params);
    return rows;
  } catch (error) {
    logger.error(`[DB QUERY ERROR] ${error.message} (SQL: ${sql.substring(0, 100)}...)`);
    throw error;
  }
}

export async function checkDbConnection() {
  try {
    const p = getDbPool();
    const [rows] = await p.query('SELECT 1 + 1 AS result');
    return rows[0].result === 2;
  } catch (error) {
    logger.warn(`Database connection ping failed: ${error.message}`);
    return false;
  }
}
