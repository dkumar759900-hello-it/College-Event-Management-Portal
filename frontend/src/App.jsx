import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import ScannerPage from './pages/ScannerPage';
import CreateEventPage from './pages/CreateEventPage';
import ManageEventsPage from './pages/ManageEventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const OrganizerRoute = ({ children }) => {
  const { user, isCoordinatorOrAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isCoordinatorOrAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
          <Navbar />

          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scanner"
                element={
                  <OrganizerRoute>
                    <ScannerPage />
                  </OrganizerRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <OrganizerRoute>
                    <CreateEventPage />
                  </OrganizerRoute>
                }
              />
              <Route
                path="/manage-events"
                element={
                  <OrganizerRoute>
                    <ManageEventsPage />
                  </OrganizerRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Academic Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">CampusPulse</span>
                <span>• College Event Management & Digital Ticketing Portal</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
                <span className="text-slate-400">Designed & Developed by</span>
                <span className="font-semibold text-slate-800">Deepak Kumar</span>

              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
