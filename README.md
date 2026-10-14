# CampusPulse — College Event Management & Digital QR Ticketing Portal

A full-stack College Event Management System developed as a **Minor Project** for the Department of Computer Science & Engineering. Built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), featuring real-time camera-based QR code ticket scanning, role-based authorization, and attendance reporting.

---

## 📌 Project Overview

| Project Property | Details |
|---|---|
| **Project Title** | CampusPulse - College Event Management Portal |
| **Course / Degree** | Bachelor of Technology (B.Tech) - Computer Science & Engineering |
| **Project Type** | Minor Project Submission |
| **Project Team** | Deepak Kumar, Ashish Kumar, Anshul Singh |
| **Tech Stack** | MERN Stack (React.js, Node.js, Express, MongoDB, Tailwind CSS) |
| **Architecture** | 3-Tier Client-Server RESTful Architecture |

---

## 🎯 Key Features

1. **Multi-Role Access Control (RBAC)**:
   - **Student**: Browse campus events, filter by categories, register, and receive an instant digital QR pass.
   - **Club Coordinator**: Host events, set capacities, monitor registrations, scan attendee passes, and download attendance records.
   - **Faculty / Admin**: Oversee campus-wide events and manage society activities.

2. **Digital QR Code E-Pass**:
   - Dynamic cryptographic QR generation with student roll number, event ID, and unique pass ID.
   - Printable event pass badge with download options.

3. **Live Camera Attendance Scanner**:
   - Real-time webcam / camera QR scanning at venue entry gates.
   - **Duplicate Entry Protection**: Blocks duplicate scans if a pass has already been used.
   - Sound feedback and verified student profile badge upon successful scan.

4. **Analytics & Data Export**:
   - Real-time seat counters and turnout rates.
   - Export full attendee rosters to Excel-compatible CSV files.

---

## 📂 Project Structure

```
college-event-portal/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB database connection
│   ├── controllers/
│   │   ├── authController.js   # User registration & JWT authentication
│   │   ├── eventController.js  # Event creation, updates, and listings
│   │   ├── registrationController.js # Digital QR ticket generation
│   │   └── attendanceController.js   # Live QR scan verification
│   ├── middleware/
│   │   └── auth.js             # JWT verification & role authorization
│   ├── models/
│   │   ├── User.js             # User database schema
│   │   ├── Event.js            # Event database schema
│   │   └── Registration.js     # Ticket & attendance schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── attendanceRoutes.js
│   ├── server.js               # Express application entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx      # Navigation bar & tester profile switcher
    │   │   ├── EventCard.jsx   # Event display cards
    │   │   └── TicketModal.jsx # Printable digital pass modal
    │   ├── context/
    │   │   └── AuthContext.jsx # Authentication state
    │   ├── pages/
    │   │   ├── HomePage.jsx    # Discovery feed & search
    │   │   ├── EventDetailsPage.jsx # Event details & booking
    │   │   ├── MyTicketsPage.jsx    # Student pass wallet
    │   │   ├── ScannerPage.jsx      # Live QR camera scanner
    │   │   ├── CreateEventPage.jsx  # Event creation form
    │   │   ├── ManageEventsPage.jsx # Organizer roster & CSV export
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── api.js              # Axios HTTP client
    │   ├── App.jsx             # React routing setup
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 How to Run the Project

### Option A: 1-Click Startup (Recommended)
Double-click the **`start_portal.bat`** file in the project folder. It will launch both the backend and frontend servers and open `http://localhost:3000` in your browser.

---

### Option B: Manual Command Line Execution

#### 1. Start Backend:
```bash
cd backend
npm install
node server.js
# Backend runs on http://localhost:5000
```

#### 2. Start Frontend:
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔑 Tester / Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Student** | `deepak@college.edu` | `password123` |
| **Club Coordinator** | `coordinator@college.edu` | `password123` |
| **Faculty Admin** | `admin@college.edu` | `password123` |

---

## 🛠️ Technology Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide Icons, HTML5-QRCode
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, QRCode
- **Database**: MongoDB (Mongoose ORM)
