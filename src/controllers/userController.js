const { Customer, Booking } = require('../models');

async function listUsers(req, res) {
  try {
    const users = await Customer.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function updateUser(req, res) {
  try {
    const user = await Customer.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });

    const updates = {};
    ['name', 'email', 'password', 'isAdmin'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    });

    await user.update(updates);
    res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function deleteUser(req, res) {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account while logged in' });
    }

    const user = await Customer.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await Booking.update({ customerId: null }, { where: { customerId: user.id } });
    await user.destroy();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

module.exports = { listUsers, updateUser, deleteUser };
