const express = require('express');
const router = express.Router();
const { createLog, getLogs } = require('../controllers/dailyLogController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.post('/', protect, upload.single('photo'), createLog);
router.get('/', protect, getLogs);

module.exports = router;
