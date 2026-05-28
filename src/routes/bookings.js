const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const bc = require('../controllers/bookingController');

router.get('/', auth, bc.listBookings);
router.post('/', auth, bc.createBooking);
router.patch('/:id/status', auth, adminOnly, bc.updateBookingStatus);
router.post('/:id/cancel', auth, bc.cancelBooking);

module.exports = router;
