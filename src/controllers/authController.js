const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

function userPayload(user) {
  return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
}

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function register(req, res) {
  try {
    const { name, password, adminCode } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const users = await Customer.count();
    const hasValidAdminCode = Boolean(process.env.ADMIN_INVITE_CODE && adminCode === process.env.ADMIN_INVITE_CODE);
    const existing = await Customer.findOne({ where: { email } });

    if (existing) {
      if (!hasValidAdminCode) {
        return res.status(409).json({ error: 'Email already registered. Please login instead.' });
      }

      await existing.update({ name, password, isAdmin: true });
      return res.json({ token: signToken(existing), user: userPayload(existing), message: 'Admin account updated' });
    }

    const isAdmin = users === 0 || hasValidAdminCode;
    const user = await Customer.create({ name, email, password, isAdmin });
    res.status(201).json({ token: signToken(user), user: userPayload(user) });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already registered. Please login instead.' });
    }
    res.status(400).json({ error: e.message });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const user = await Customer.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    res.json({ token: signToken(user), user: userPayload(user) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function me(req, res) {
  res.json(userPayload(req.user));
}

module.exports = { register, login, me };
