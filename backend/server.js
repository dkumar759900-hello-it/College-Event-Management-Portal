/**
 * College Event Management System (CampusPulse)
 * Minor Project Submission - Department of Computer Science & Engineering
 * Project Team: Deepak Kumar, Ashish Kumar, Anshul Singh
 * Tech Stack: MERN (React, Node.js, Express, MongoDB)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const autoSeed = require('./utils/autoSeed');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'College Event Management Portal',
    timestamp: new Date().toISOString()
  });
});

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

// Live Database Inspector Route (For Viva & Examiner Demonstration)
app.get('/api/admin/db-inspect', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const events = await Event.find().sort({ createdAt: -1 });
    const registrations = await Registration.find()
      .populate('user', 'name email rollNumber department')
      .populate('event', 'title venue date')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      database: 'MongoDB (college_event_portal)',
      status: 'Connected',
      counts: {
        users: users.length,
        events: events.length,
        registrations: registrations.length
      },
      collections: {
        users,
        events,
        registrations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    // Auto populate sample events and demo users if empty
    await autoSeed();

    app.listen(PORT, () => {
      console.log(`🚀 College Event Portal Backend is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
