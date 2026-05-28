const { Booking, Vehicle } = require('../models');
const { Op } = require('sequelize');

async function createBooking(req, res) {
  try {
    const { vehicleId, startDate, endDate } = req.body;
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'available') return res.status(400).json({ error: 'Vehicle unavailable' });

    const overlap = await Booking.findOne({
      where: {
        vehicleId,
        status: 'active',
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } }
        ]
      }
    });
    if (overlap) return res.status(400).json({ error: 'Vehicle already booked for selected dates' });

    const booking = await Booking.create({ vehicleId, customerId: req.user.id, startDate, endDate });
    res.json(booking);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function cancelBooking(req, res) {
  try {
    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.customerId !== req.user.id && !req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    b.status = 'cancelled';
    await b.save();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

module.exports = { createBooking, cancelBooking };
