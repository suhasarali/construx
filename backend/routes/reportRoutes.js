const express = require('express');
const router = express.Router();
const { createReport, getReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.post('/', protect, upload.array('photos', 5), createReport);
router.get('/', protect, getReports);

module.exports = router;
