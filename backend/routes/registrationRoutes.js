const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyTickets,
  getTicketByCode,
  cancelRegistration
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

router.post('/register/:eventId', protect, registerForEvent);
router.get('/my-tickets', protect, getMyTickets);
router.get('/ticket/:ticketCode', protect, getTicketByCode);
router.delete('/cancel/:id', protect, cancelRegistration);

module.exports = router;
