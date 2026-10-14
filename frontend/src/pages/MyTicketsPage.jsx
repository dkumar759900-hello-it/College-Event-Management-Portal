import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import TicketModal from '../components/TicketModal';
import {
  Ticket,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my-tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this event registration? Your ticket pass will be voided.')) {
      return;
    }

    try {
      const res = await api.delete(`/registrations/cancel/${ticketId}`);
      if (res.data.success) {
        setTickets(tickets.filter((t) => t._id !== ticketId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'attended') return t.attendanceStatus === 'attended';
    if (filter === 'upcoming') return t.attendanceStatus === 'registered';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Student Pass Wallet
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Event Passes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View and download your digital entry passes for college fests and society workshops.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'upcoming' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('attended')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'attended' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attended
          </button>
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((t) => {
            const event = t.event;
            const isAttended = t.attendanceStatus === 'attended';
            const eventDate = new Date(event?.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={t._id}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row gap-5 items-center justify-between transition-all"
              >
                {/* QR Code Preview Thumbnail */}
                <div
                  onClick={() => setActiveTicket(t)}
                  className="cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 shrink-0 transition"
                  title="Click to view full pass"
                >
                  <img
                    src={t.qrCodeUrl}
                    alt="QR Code"
                    className="w-28 h-28 object-contain"
                  />
                  <div className="text-[10px] text-center font-bold text-slate-700 mt-1 flex items-center justify-center gap-1">
                    <QrCode className="w-3 h-3 text-blue-600" />
                    <span>View Admit Pass</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {event?.clubName || 'College Fest'}
                    </span>

                    {isAttended ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Checked-In
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Ready for Entry
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                    {event?.title}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{eventDate}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{event?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{event?.venue}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 pt-1">
                    Code: <span className="text-slate-800 font-bold">{t.ticketCode}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveTicket(t)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      Open E-Pass
                    </button>

                    {!isAttended && (
                      <button
                        onClick={() => handleCancelTicket(t._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Cancel Registration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Event Passes Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You have not registered for any campus events yet. Explore upcoming society events and get your digital admit card!
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {activeTicket && (
        <TicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
};

export default MyTicketsPage;
