const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const vc = require('../controllers/vehicleController');

router.get('/', vc.listVehicles);
router.post('/', auth, adminOnly, vc.addVehicle);
router.put('/:id', auth, adminOnly, vc.updateVehicle);
router.delete('/:id', auth, adminOnly, vc.deleteVehicle);
router.get('/:id/bookings', auth, adminOnly, vc.viewBookings);

module.exports = router;
