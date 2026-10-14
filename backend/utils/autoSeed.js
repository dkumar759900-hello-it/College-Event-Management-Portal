const QRCode = require('qrcode');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database already contains data. Skipping auto-seed.');
      return;
    }

    console.log('🌱 Seeding initial demo data for College Event Portal...');

    // 1. Create Users
    const admin = await User.create({
      name: 'Dr. Ramesh Sharma (Dean)',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'admin',
      department: 'Dean Office',
      rollNumber: 'FAC-001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    });

    const coordinator = await User.create({
      name: 'Priya Verma (President)',
      email: 'coordinator@college.edu',
      password: 'password123',
      role: 'coordinator',
      department: 'Computer Science & Engineering',
      rollNumber: '22CS1045',
      clubName: 'Tech & Coding Club',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    });

    const student = await User.create({
      name: 'Deepak Kumar',
      email: 'deepak@college.edu',
      password: 'password123',
      role: 'student',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      rollNumber: '23CS1088',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    });

    // 2. Create Events
    const eventsData = [
      {
        title: 'InnovateX 2026: 24-Hour National Hackathon',
        description: 'Build real-world AI, Web3, and IoT solutions in 24 non-stop hours of coding, mentorship, and pizza! Top teams win cash prizes, incubator incubation, and internship referrals.',
        category: 'Hackathon',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '09:00 AM - 09:00 AM (Next Day)',
        venue: 'Main Auditorium & Innovation Center, 3rd Floor',
        organizer: coordinator._id,
        clubName: 'Tech & Coding Club',
        capacity: 150,
        registeredCount: 0,
        fee: 0,
        poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        prizes: '₹50,000 Cash Pool + Certificates of Merit + Internship Opportunities',
        contactEmail: 'innovatex@college.edu'
      },
      {
        title: 'TechSparks: Hands-on Generative AI & LLM Workshop',
        description: 'A deep-dive workshop on building autonomous AI agents, RAG architectures, and fine-tuning models. Hands-on coding session with Google Cloud & OpenAI credits provided to all attendees.',
        category: 'Workshop',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        time: '10:00 AM - 04:30 PM',
        venue: 'Computer Science Lab 4 & 5',
        organizer: coordinator._id,
        clubName: 'AI & Data Science Society',
        capacity: 80,
        registeredCount: 0,
        fee: 0,
        poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        prizes: 'Verified E-Certificate + Cloud Credits Voucher',
        contactEmail: 'ai-club@college.edu'
      },
      {
        title: 'Tarang 2026: Annual Cultural & Battle of the Bands',
        description: 'The biggest cultural night of the semester featuring live music bands, western & classical dance showdowns, fashion show, street play, and celebrity guest DJ performance!',
        category: 'Cultural',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '05:00 PM - 10:30 PM',
        venue: 'Open Air Amphitheatre (OAT)',
        organizer: admin._id,
        clubName: 'Cultural Affairs Committee',
        capacity: 500,
        registeredCount: 0,
        fee: 0,
        poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        prizes: 'Trophies, Band Kits & Cash Awards',
        contactEmail: 'cultural@college.edu'
      },
      {
        title: 'CodeClash: Speed Coding & Algorithmic Duel',
        description: '1v1 elimination rounds on Data Structures and Algorithms with live projector leaderboards! Fastest submissions advance to the Grand Finale round.',
        category: 'Technical',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        time: '02:00 PM - 06:00 PM',
        venue: 'Turing Hall, Seminar Block B',
        organizer: coordinator._id,
        clubName: 'Competitive Programming Cell',
        capacity: 100,
        registeredCount: 0,
        fee: 0,
        poster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        prizes: 'Mechanical Keyboards, Swag Hoodies & Certificates',
        contactEmail: 'cpcell@college.edu'
      },
      {
        title: 'Ignite Inter-Department Cricket & Football Cup',
        description: 'Annual inter-department sports tournament. High octane matches between CSE, ECE, Mechanical, Civil, and Management departments for the coveted Champions Trophy.',
        category: 'Sports',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        time: '08:00 AM - 06:00 PM',
        venue: 'College Sports Grounds & Turf',
        organizer: admin._id,
        clubName: 'Sports Council',
        capacity: 250,
        registeredCount: 0,
        fee: 0,
        poster: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        prizes: 'Rolling Champions Trophy + Gold & Silver Medals',
        contactEmail: 'sports@college.edu'
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);

    // 3. Pre-register Deepak for the Hackathon so we have a ready-to-test QR Code!
    const sampleEvent = createdEvents[0];
    const ticketCode = `TKT-${sampleEvent._id.toString().slice(-4).toUpperCase()}-DEMO-001`;

    const qrPayload = JSON.stringify({
      ticketCode,
      eventId: sampleEvent._id.toString(),
      userId: student._id.toString(),
      eventTitle: sampleEvent.title,
      userName: student.name,
      rollNumber: student.rollNumber
    });

    const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      }
    });

    await Registration.create({
      event: sampleEvent._id,
      user: student._id,
      ticketCode,
      qrCodeUrl,
      attendanceStatus: 'registered',
      paymentStatus: 'free'
    });

    sampleEvent.registeredCount = 1;
    await sampleEvent.save();

    console.log('✅ Demo data successfully seeded!');
    console.log('--------------------------------------------------');
    console.log('🔑 Quick Login Credentials:');
    console.log('👨‍💼 Admin:       admin@college.edu       | password123');
    console.log('👩‍💻 Coordinator: coordinator@college.edu | password123');
    console.log('🎓 Student:     deepak@college.edu      | password123');
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('⚠️ Auto-seed error:', err.message);
  }
};

module.exports = autoSeed;
