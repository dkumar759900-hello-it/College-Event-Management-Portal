const express = require('express');
const router = express.Router();
const { scanAndVerifyTicket, getAttendanceStats } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (Organizers / Admins only)
router.post('/scan', protect, authorize('coordinator', 'admin'), scanAndVerifyTicket);
router.get('/event/:eventId/stats', protect, authorize('coordinator', 'admin'), getAttendanceStats);

module.exports = router;
