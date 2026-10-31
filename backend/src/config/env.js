import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5050', 10),
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    name: process.env.DATABASE_NAME || 'icsshield_db',
    user: process.env.DATABASE_USER || 'icsshield_user',
    password: process.env.DATABASE_PASSWORD || 'icsshield_secure_password_change_me',
  },
  pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'http://localhost:8080',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
};
