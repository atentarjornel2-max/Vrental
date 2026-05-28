const { Booking, Vehicle, Customer } = require('../models');
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
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } }
        ]
      }
    });
    if (overlap) return res.status(400).json({ error: 'Vehicle already booked for selected dates' });

    const booking = await Booking.create({
      vehicleId,
      customerId: req.user.id,
      startDate,
      endDate,
      statusNote: 'Waiting for admin review.'
    });
    res.status(201).json(booking);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function listBookings(req, res) {
  try {
    const where = req.user.isAdmin ? {} : { customerId: req.user.id };
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Vehicle },
        { model: Customer, attributes: ['id', 'name', 'email', 'isAdmin'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function updateBookingStatus(req, res) {
  try {
    const allowed = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
    const { status, statusNote } = req.body;
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    b.status = status;
    b.statusNote = String(statusNote || '').trim() || defaultStatusNote(status);
    await b.save();
    await updateVehicleAvailability(b);
    res.json(b);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

async function updateVehicleAvailability(booking) {
  if (!booking.vehicleId) return;

  if (booking.status === 'approved') {
    await Vehicle.update({ status: 'unavailable' }, { where: { id: booking.vehicleId } });
    return;
  }

  if (['rejected', 'cancelled', 'completed'].includes(booking.status)) {
    const approvedBooking = await Booking.findOne({
      where: {
        vehicleId: booking.vehicleId,
        status: 'approved',
        id: { [Op.ne]: booking.id }
      }
    });

    if (!approvedBooking) {
      await Vehicle.update({ status: 'available' }, { where: { id: booking.vehicleId } });
    }
  }
}

function defaultStatusNote(status) {
  const notes = {
    pending: 'Your booking is waiting for admin review.',
    approved: 'Your booking has been approved.',
    rejected: 'Your booking was rejected by the admin.',
    cancelled: 'Your booking was cancelled.',
    completed: 'Your booking has been completed.'
  };
  return notes[status] || '';
}

async function cancelBooking(req, res) {
  try {
    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.customerId !== req.user.id && !req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    if (!req.user.isAdmin && b.status === 'approved') {
      return res.status(400).json({ error: 'Approved bookings cannot be cancelled by customers' });
    }
    b.status = 'cancelled';
    b.statusNote = req.user.isAdmin
      ? String(req.body.statusNote || '').trim() || 'The admin cancelled this booking.'
      : 'The customer cancelled this booking.';
    await b.save();
    await updateVehicleAvailability(b);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

module.exports = { createBooking, listBookings, updateBookingStatus, cancelBooking };
