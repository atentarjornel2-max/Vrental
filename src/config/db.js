const { Sequelize } = require('sequelize');
const url = process.env.AIVEN_URL || process.env.DATABASE_URL;

function createSequelize() {
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
