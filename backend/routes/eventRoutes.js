const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (Only Coordinator and Admin can manage events)
router.post('/', protect, authorize('coordinator', 'admin'), createEvent);
router.put('/:id', protect, authorize('coordinator', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('coordinator', 'admin'), deleteEvent);
router.get('/:id/attendees', protect, authorize('coordinator', 'admin'), getEventAttendees);

module.exports = router;
