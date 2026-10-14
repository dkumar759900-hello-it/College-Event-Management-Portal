import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Mail,
  CheckCircle,
  Ticket,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchEventDetails();
    if (isAuthenticated) {
      checkMyRegistration();
    }
  }, [id, isAuthenticated]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkMyRegistration = async () => {
    try {
      const res = await api.get('/registrations/my-tickets');
      if (res.data.success) {
        const found = res.data.tickets.find((t) => t.event._id === id || t.event === id);
        if (found) {
          setMyRegistration(found);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      setMessage({ type: '', text: '' });
      const res = await api.post(`/registrations/register/${id}`);
      if (res.data.success) {
        setMyRegistration(res.data.registration);
        setActiveTicket(res.data.registration);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        fetchEventDetails();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to complete registration'
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-6 text-sm">The requested campus event does not exist or has concluded.</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-semibold">
          Return to Events
        </Link>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Feed
        </button>

        {/* Hero Poster Banner */}
        <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges on Poster */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-xs">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-white text-slate-800 shadow-xs">
              {event.fee === 0 ? 'Free Entry' : `₹${event.fee}`}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Organized by {event.clubName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Details & Registration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3">About This Event</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Prizes & Certifications
              </h2>
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                {event.prizes || 'Official Participation E-Certificates & Cash Prizes'}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3">Organizing Committee</h2>
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{event.clubName}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{event.contactEmail || 'events@college.edu'}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Approved Society
                </span>
              </div>
            </div>
          </div>

          {/* Right Booking Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Event Schedule & Logistics</h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Date</div>
                    <div>{eventDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Time</div>
                    <div>{event.time}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">Location</div>
                    <div>{event.venue}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="w-full">
                    <div className="flex justify-between font-semibold text-slate-900 mb-1">
                      <span>Available Seats</span>
                      <span>{event.capacity - event.registeredCount} spots left</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {message.text && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {message.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                {myRegistration ? (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" />
                        You Are Registered
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
                        Pass Code: {myRegistration.ticketCode}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTicket(myRegistration)}
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Ticket className="w-4 h-4" />
                      View Digital E-Pass
                    </button>
                  </div>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs cursor-not-allowed border border-slate-200"
                  >
                    Registrations Closed (Full)
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    {registering ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        Register & Generate Digital Pass
                      </>
                    )}
                  </button>
                )}

                <div className="text-[11px] text-slate-500 text-center mt-2.5">
                  Instant QR admit card is assigned to your account.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTicket && (
        <TicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
};

export default EventDetailsPage;
