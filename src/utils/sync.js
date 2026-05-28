require('dotenv').config();
const { Sequelize } = require('sequelize');
const { sequelize } = require('../models');
const { seedDefaultUsers } = require('./seed');

async function createDatabaseIfMissing(error) {
  if (error.original?.code !== 'ER_BAD_DB_ERROR' || process.env.AIVEN_URL || process.env.DATABASE_URL) {
    throw error;
  }

  const dbName = process.env.DB_NAME || 'vrental';
  const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';
  const server = new Sequelize('', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: useSsl ? { ssl: { rejectUnauthorized: false } } : {},
    logging: false
  });

  try {
    await server.query(`CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, '``')}\`;`);
    console.log(`Database "${dbName}" is ready`);
  } finally {
    await server.close();
  }
}

(async () => {
  try {
    try {
      await sequelize.sync({ alter: true });
    } catch (e) {
      await createDatabaseIfMissing(e);
      await sequelize.sync({ alter: true });
    }
    await seedDefaultUsers();
    console.log('DB synced');
    process.exit(0);
  } catch (e) {
    console.error('Sync error', e);
    process.exit(1);
  }
})();
