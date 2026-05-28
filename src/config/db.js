const { Sequelize } = require('sequelize');
const url = process.env.AIVEN_URL || process.env.DATABASE_URL;

function requireRenderDatabaseConfig() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
  const hasDbConfig = process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER;

  if (isProduction && !url && !hasDbConfig) {
    throw new Error('Missing database config. Add AIVEN_URL or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, and DB_SSL=true in Render environment variables.');
  }
}

function createSequelize() {
  requireRenderDatabaseConfig();

  if (url) {
    return new Sequelize(url, { dialect: 'mysql', dialectOptions: { ssl: { rejectUnauthorized: false } } });
  }
  const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';
  return new Sequelize(process.env.DB_NAME || 'vrental', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: useSsl ? { ssl: { rejectUnauthorized: false } } : {}
  });
}

module.exports = createSequelize();
