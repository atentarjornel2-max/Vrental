const { Customer } = require('../models');

async function upsertUser({ name, email, password, isAdmin }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await Customer.findOne({ where: { email: normalizedEmail } });

  if (existing) {
    await existing.update({ name, password, isAdmin });
    return existing;
  }

  return Customer.create({ name, email: normalizedEmail, password, isAdmin });
}

async function seedDefaultUsers() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const customerEmail = process.env.DEFAULT_CUSTOMER_EMAIL || 'customer@gmail.com';
  const customerPassword = process.env.DEFAULT_CUSTOMER_PASSWORD || 'customer123';

  await upsertUser({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    isAdmin: true
  });

  await upsertUser({
    name: 'Customer',
    email: customerEmail,
    password: customerPassword,
    isAdmin: false
  });

  console.log('Default users are ready');
}

module.exports = { seedDefaultUsers };
