const QRCode = require('qrcode');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Helper to generate readable high-entropy ticket codes
const generateTicketCode = (eventId, userId) => {
  const timeHex = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const eventShort = eventId.toString().slice(-4).toUpperCase();
  return `TKT-${eventShort}-${timeHex}-${rand}`;
};

// @desc    Register for an event & generate digital QR ticket
// @route   POST /api/registrations/register/:eventId
// @access  Private (Students, Coordinators, Admins)
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot register: Event is already ${event.status}` });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Registration closed! Event capacity is full.' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ event: eventId, user: userId });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event',
        ticketCode: existingRegistration.ticketCode
      });
    }

    // Generate unique ticket code
    const ticketCode = generateTicketCode(eventId, userId);

    // Payload embedded inside QR code (encrypted/structured JSON)
    const qrPayload = JSON.stringify({
      ticketCode,
      eventId: event._id.toString(),
      userId: userId.toString(),
      eventTitle: event.title,
      userName: req.user.name,
      rollNumber: req.user.rollNumber || 'N/A'
    });

    // Generate QR Code as Data URL
    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e1b4b', // deep indigo
        light: '#ffffff'
      }
    });

    const registration = await Registration.create({
      event: eventId,
      user: userId,
      ticketCode,
      qrCodeUrl,
      paymentStatus: event.fee > 0 ? 'completed' : 'free' // simulated payment success for minor project
    });

    // Increment registeredCount on event
    event.registeredCount += 1;
    await event.save();

    await registration.populate('event', 'title date time venue clubName poster fee');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Digital QR ticket generated.',
      registration
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets/registrations of logged-in student
// @route   GET /api/registrations/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Registration.find({ user: req.user._id })
      .populate('event')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket details by ticketCode
// @route   GET /api/registrations/ticket/:ticketCode
// @access  Private
exports.getTicketByCode = async (req, res) => {
  try {
    const ticket = await Registration.findOne({ ticketCode: req.params.ticketCode })
      .populate('event')
      .populate('user', 'name email rollNumber department year avatar');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/cancel/:id
// @access  Private
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }

    if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this ticket' });
    }

    if (registration.attendanceStatus === 'attended') {
      return res.status(400).json({ success: false, message: 'Cannot cancel ticket: Attendance already marked as attended' });
    }

    // Decrement event registered count
    await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } });
    await registration.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
