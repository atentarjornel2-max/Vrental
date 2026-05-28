const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const bc = require('../controllers/bookingController');

router.post('/', auth, bc.createBooking);
router.post('/:id/cancel', auth, bc.cancelBooking);

module.exports = router;
