import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('==================================================');
  console.log(' [ICS-SHIELD] Starting Database Migration Engine');
  console.log('==================================================');

  // Base connection config without specifying database to allow database creation
  const baseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'icsshield_user',
    password: process.env.DATABASE_PASSWORD || 'icsshield_secure_password_change_me',
    multipleStatements: true
  };

  const dbName = process.env.DATABASE_NAME || 'ics_shield';

  try {
    // 1. Establish connection to server to ensure database exists
    const rootConnection = await mysql.createConnection(baseConfig);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[MIGRATIONS] Verified database \`${dbName}\` creation.`);
    await rootConnection.end();

    // 2. Connect directly to target database
    const dbConfig = { ...baseConfig, database: dbName };
    const connection = await mysql.createConnection(dbConfig);
    console.log(`[MIGRATIONS] Connected to database \`${dbName}\` on ${dbConfig.host}:${dbConfig.port}`);

    // Create migration tracking table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Read migration directory
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const [rows] = await connection.query('SELECT id FROM schema_migrations WHERE filename = ?', [file]);
      if (rows.length > 0) {
        console.log(`[MIGRATIONS] Skipping ${file} (already executed).`);
        continue;
      }

      console.log(`[MIGRATIONS] Executing ${file}...`);
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      if (sql.trim().length > 0) {
        await connection.query(sql);
      }

      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      console.log(`[MIGRATIONS] Successfully applied ${file}.`);
    }

    console.log('==================================================');
    console.log(' [MIGRATIONS] All schema migrations completed!');
    console.log('==================================================');
    await connection.end();
  } catch (err) {
    console.error(`[MIGRATIONS FATAL ERROR] ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}

export { runMigrations };
