const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, authorize('Manager', 'Owner'), getUsers);
router.delete('/users/:id', protect, authorize('Manager', 'Owner'), deleteUser);

module.exports = router;
