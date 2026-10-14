const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Hackathon', 'Seminar'],
    default: 'Technical'
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  time: {
    type: String,
    required: [true, 'Please provide event time (e.g. 10:00 AM - 04:00 PM)']
  },
  venue: {
    type: String,
    required: [true, 'Please provide event venue / auditorium / lab']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clubName: {
    type: String,
    required: [true, 'Please specify organizing club / department'],
    default: 'Tech Council'
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify registration capacity'],
    default: 100
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  checkedInCount: {
    type: Number,
    default: 0
  },
  fee: {
    type: Number,
    default: 0 // 0 means Free
  },
  poster: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  registrationDeadline: {
    type: Date
  },
  prizes: {
    type: String,
    default: 'Certificates of Merit & Cash Prizes for Top 3'
  },
  contactEmail: {
    type: String,
    default: 'events@college.edu'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
