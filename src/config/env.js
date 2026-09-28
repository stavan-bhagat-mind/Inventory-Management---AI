const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DB: {
    NAME: process.env.DB_NAME || 'inventory_db',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'Mind@1234',
    HOST: process.env.DB_HOST || '192.168.1.237',
    PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    LOGGING: process.env.DB_LOGGING === 'true',
    POOL: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    }
  }
};

module.exports = env;
