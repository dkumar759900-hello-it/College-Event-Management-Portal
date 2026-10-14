import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Ticket,
  QrCode,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Menu,
  X,
  GraduationCap,
  User
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, quickDemoLogin, isCoordinatorOrAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const handleDemoSwitch = async (role) => {
    try {
      setSwitchLoading(true);
      await quickDemoLogin(role);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setSwitchLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Academic Testing Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>Role Switcher (Evaluation & Testing):</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDemoSwitch('student')}
              disabled={switchLoading}
              className={`px-2.5 py-0.5 rounded-md text-xs transition border ${
                user?.role === 'student'
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              🎓 Student (Deepak)
            </button>
            <button
              onClick={() => handleDemoSwitch('coordinator')}
              disabled={switchLoading}
              className={`px-2.5 py-0.5 rounded-md text-xs transition border ${
                user?.role === 'coordinator'
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              👩‍💻 Coordinator (Priya)
            </button>
            <button
              onClick={() => handleDemoSwitch('admin')}
              disabled={switchLoading}
              className={`px-2.5 py-0.5 rounded-md text-xs transition border ${
                user?.role === 'admin'
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              👨‍💼 Faculty Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Campus<span className="text-blue-600">Pulse</span>
              </span>
              <span className="block text-[10px] tracking-wider uppercase text-slate-500 font-semibold -mt-1">
                College Event Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              Explore Events
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-tickets"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  isActive('/my-tickets')
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Ticket className="w-4 h-4 text-blue-500" />
                My Passes
              </Link>
            )}

            {isCoordinatorOrAdmin && (
              <>
                <Link
                  to="/scanner"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    isActive('/scanner')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  Live Gate Scanner
                </Link>

                <Link
                  to="/manage-events"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    isActive('/manage-events')
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-500" />
                  Organizer Portal
                </Link>

                <Link
                  to="/create-event"
                  className="ml-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Host Event
                </Link>
              </>
            )}
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
                      {user?.name}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        user?.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : user?.role === 'coordinator'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{user?.department?.split(' ')[0] || user?.email}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white border-b border-slate-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore Events
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              My Passes
            </Link>
          )}
          {isCoordinatorOrAdmin && (
            <>
              <Link
                to="/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Live Gate Scanner
              </Link>
              <Link
                to="/manage-events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Organizer Portal
              </Link>
              <Link
                to="/create-event"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                + Host Event
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.role}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium border border-slate-300 rounded-lg text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
