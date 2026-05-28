const { sequelize } = require('../models');
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('DB synced');
    process.exit(0);
  } catch (e) {
    console.error('Sync error', e);
    process.exit(1);
  }
})();
