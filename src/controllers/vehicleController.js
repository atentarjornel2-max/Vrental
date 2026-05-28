const { Vehicle, Booking } = require('../models');

async function addVehicle(req, res) {
  try {
    const v = await Vehicle.create(req.body);
    res.json(v);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function updateVehicle(req, res) {
  try {
    const v = await Vehicle.findByPk(req.params.id);
    if (!v) return res.status(404).json({ error: 'Not found' });
    await v.update(req.body);
    res.json(v);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function deleteVehicle(req, res) {
  try {
    const v = await Vehicle.findByPk(req.params.id);
    if (!v) return res.status(404).json({ error: 'Not found' });
    await v.destroy();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function listVehicles(req, res) {
  const list = await Vehicle.findAll();
  res.json(list);
}

async function viewBookings(req, res) {
  const v = await Vehicle.findByPk(req.params.id, { include: Booking });
  if (!v) return res.status(404).json({ error: 'Not found' });
  res.json(v.Bookings);
}

module.exports = { addVehicle, updateVehicle, deleteVehicle, listVehicles, viewBookings };
