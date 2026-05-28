const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const uc = require('../controllers/userController');

router.get('/', auth, adminOnly, uc.listUsers);
router.patch('/:id', auth, adminOnly, uc.updateUser);
router.delete('/:id', auth, adminOnly, uc.deleteUser);

module.exports = router;
