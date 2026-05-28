const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const user = await Customer.create({ name, email, password });
    res.json({ id: user.id, email: user.email });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await Customer.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { register, login };
