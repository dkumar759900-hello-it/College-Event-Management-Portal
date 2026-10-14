const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with filters & search
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { clubName: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email clubName')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email department clubName');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Coordinator, Admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      clubName,
      capacity,
      fee,
      poster,
      prizes,
      contactEmail
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category: category || 'Technical',
      date,
      time,
      venue,
      organizer: req.user._id,
      clubName: clubName || req.user.clubName || 'College Council',
      capacity: Number(capacity) || 100,
      fee: Number(fee) || 0,
      poster: poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      prizes: prizes || 'Participation Certificates & Medals',
      contactEmail: contactEmail || req.user.email
    });

    res.status(201).json({
      success: true,
      message: 'Event published successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer, Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check authorization: must be creator or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer, Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered attendees for an event
// @route   GET /api/events/:id/attendees
// @access  Private (Organizer, Admin)
exports.getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email rollNumber department year avatar')
      .populate('checkedInBy', 'name email')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
