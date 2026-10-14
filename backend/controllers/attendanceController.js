const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Scan and verify QR code to mark attendance in real time
// @route   POST /api/attendance/scan
// @access  Private (Coordinator, Admin)
exports.scanAndVerifyTicket = async (req, res) => {
  try {
    const { qrData, eventId } = req.body;

    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR Data or Ticket Code is required' });
    }

    let targetTicketCode = qrData.trim();
    let qrEventId = null;

    // Try parsing as JSON if it's the embedded JSON payload
    try {
      if (qrData.startsWith('{') && qrData.endsWith('}')) {
        const parsed = JSON.parse(qrData);
        targetTicketCode = parsed.ticketCode || targetTicketCode;
        qrEventId = parsed.eventId;
      }
    } catch (e) {
      // not JSON, keep as raw ticketCode
    }

    // Find the registration
    const registration = await Registration.findOne({ ticketCode: targetTicketCode })
      .populate('user', 'name email rollNumber department year avatar')
      .populate('event', 'title date venue clubName');

    if (!registration) {
      return res.status(404).json({
        success: false,
        status: 'INVALID_TICKET',
        message: 'Invalid Ticket! No matching registration found in database.'
      });
    }

    // Check if event matches if eventId was specified in scanner filter
    if (eventId && registration.event._id.toString() !== eventId) {
      return res.status(400).json({
        success: false,
        status: 'WRONG_EVENT',
        message: `Wrong Event Ticket! This ticket is for "${registration.event.title}", not the selected event.`,
        ticketDetails: {
          studentName: registration.user.name,
          ticketCode: registration.ticketCode,
          correctEvent: registration.event.title
        }
      });
    }

    // Check if ticket is already scanned (Prevent Duplicate Entry)
    if (registration.attendanceStatus === 'attended') {
      return res.status(409).json({
        success: false,
        status: 'ALREADY_SCANNED',
        message: 'Entry Denied: Ticket has already been scanned & checked in!',
        checkedInAt: registration.checkedInAt,
        student: {
          name: registration.user.name,
          rollNumber: registration.user.rollNumber,
          department: registration.user.department,
          avatar: registration.user.avatar
        },
        event: {
          title: registration.event.title
        }
      });
    }

    // Mark as attended
    registration.attendanceStatus = 'attended';
    registration.checkedInAt = new Date();
    registration.checkedInBy = req.user._id;
    await registration.save();

    // Increment checkedInCount on the event
    await Event.findByIdAndUpdate(registration.event._id, { $inc: { checkedInCount: 1 } });

    res.status(200).json({
      success: true,
      status: 'VERIFIED',
      message: 'Entry Approved! Attendance marked successfully.',
      checkedInAt: registration.checkedInAt,
      student: {
        id: registration.user._id,
        name: registration.user.name,
        email: registration.user.email,
        rollNumber: registration.user.rollNumber || 'N/A',
        department: registration.user.department,
        year: registration.user.year,
        avatar: registration.user.avatar
      },
      ticket: {
        ticketCode: registration.ticketCode,
        registeredAt: registration.registeredAt,
        paymentStatus: registration.paymentStatus
      },
      event: {
        id: registration.event._id,
        title: registration.event.title,
        venue: registration.event.venue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get real-time attendance stats for an event
// @route   GET /api/attendance/event/:eventId/stats
// @access  Private (Coordinator, Admin)
exports.getAttendanceStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const totalRegistered = await Registration.countDocuments({ event: event._id });
    const totalAttended = await Registration.countDocuments({ event: event._id, attendanceStatus: 'attended' });
    const recentCheckIns = await Registration.find({ event: event._id, attendanceStatus: 'attended' })
      .populate('user', 'name rollNumber department avatar')
      .sort({ checkedInAt: -1 })
      .limit(10);

    const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        eventId: event._id,
        eventTitle: event.title,
        capacity: event.capacity,
        totalRegistered,
        totalAttended,
        remainingSeats: Math.max(0, event.capacity - totalRegistered),
        attendanceRate: `${attendanceRate}%`,
        recentCheckIns
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
