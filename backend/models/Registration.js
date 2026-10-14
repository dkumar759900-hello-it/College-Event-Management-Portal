const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  qrCodeUrl: {
    type: String, // Base64 Data URL containing the QR code image
    required: true
  },
  attendanceStatus: {
    type: String,
    enum: ['registered', 'attended', 'cancelled'],
    default: 'registered'
  },
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentStatus: {
    type: String,
    enum: ['free', 'completed', 'pending'],
    default: 'free'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Composite index so a user cannot register twice for the same event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
