import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Clock,
  Download,
  Trash2,
  ExternalLink,
  X,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Database
} from 'lucide-react';

const ManageEventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for Attendees
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Database Inspector State (For Viva / Teacher Demonstration)
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbData, setDbData] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbTab, setDbTab] = useState('users');

  const handleOpenDbInspect = async () => {
    try {
      setDbLoading(true);
      setDbModalOpen(true);
      const res = await api.get('/admin/db-inspect');
      if (res.data.success) {
        setDbData(res.data);
      }
    } catch (err) {
      alert('Failed to query database: ' + (err.response?.data?.message || err.message));
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAttendees = async (event) => {
    setSelectedEvent(event);
    try {
      setAttendeesLoading(true);
      const res = await api.get(`/events/${event._id}/attendees`);
      if (res.data.success) {
        setAttendees(res.data.registrations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? All student registrations will be cancelled.')) {
      return;
    }

    try {
      const res = await api.delete(`/events/${eventId}`);
      if (res.data.success) {
        setEvents(events.filter((e) => e._id !== eventId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const exportToCSV = (event, registrations) => {
    if (!registrations || registrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Email', 'Department', 'Ticket Code', 'Attendance Status', 'Check-In Time'];
    const rows = registrations.map((r) => [
      `"${r.user?.name || ''}"`,
      `"${r.user?.rollNumber || 'N/A'}"`,
      `"${r.user?.email || ''}"`,
      `"${r.user?.department || ''}"`,
      `"${r.ticketCode}"`,
      `"${r.attendanceStatus}"`,
      `"${r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : 'Not Checked In'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAttendees = attendees.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.user?.name?.toLowerCase().includes(q) ||
      a.user?.rollNumber?.toLowerCase().includes(q) ||
      a.ticketCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Organizer Control Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Event & Attendance Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student turnouts, manage active event registrations, and export attendance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenDbInspect}
            className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition"
          >
            <Database className="w-4 h-4 text-emerald-700" />
            Inspect MongoDB Database
          </button>

          <Link
            to="/create-event"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Event
          </Link>
        </div>
      </div>

      {/* Events Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6">Event Title & Venue</th>
                <th className="py-3.5 px-6">Society / Club</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Registrations</th>
                <th className="py-3.5 px-6">Checked In (Turnout)</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading events...
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((evt) => {
                  const percentCheckedIn = evt.registeredCount > 0 ? Math.round((evt.checkedInCount / evt.registeredCount) * 100) : 0;
                  return (
                    <tr key={evt._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900 text-sm">{evt.title}</div>
                        <div className="text-[11px] text-slate-500">{evt.venue}</div>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          {evt.clubName}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-slate-600">
                        {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-800">
                          {evt.registeredCount} / {evt.capacity}
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (evt.registeredCount / evt.capacity) * 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700">{evt.checkedInCount}</span>
                          <span className="text-[10px] text-slate-400">({percentCheckedIn}%)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAttendees(evt)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1 transition"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Roster
                          </button>

                          <Link
                            to={`/events/${evt._id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeleteEvent(evt._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No events managed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendees Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                  Registration & Gate Roster
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedEvent.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV(selectedEvent, attendees)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export to CSV
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student by name, roll no, or pass ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500">
                Total Registrations: <span className="font-bold text-slate-800">{attendees.length}</span>
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {attendeesLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading candidate roster...
                </div>
              ) : filteredAttendees.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Student Candidate</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Pass ID</th>
                      <th className="py-2.5 px-3">Gate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{a.user?.name}</div>
                          <div className="text-[10px] text-slate-400">{a.user?.email}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {a.user?.rollNumber || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {a.user?.department || 'CSE'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">
                          {a.ticketCode}
                        </td>
                        <td className="py-2.5 px-3">
                          {a.attendanceStatus === 'attended' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              Checked-In ({new Date(a.checkedInAt).toLocaleTimeString()})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <Clock className="w-3 h-3" />
                              Registered
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No attendees matching filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live MongoDB Database Inspector Modal */}
      {dbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <Database className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>MongoDB Database Inspector</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      LIVE CONNECTED
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Database: <code className="font-mono text-slate-800">{dbData?.database || 'college_event_portal'}</code> • Real-time collections & documents
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDbModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Collection Tabs */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setDbTab('users')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    dbTab === 'users'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  👥 Users Collection ({dbData?.counts?.users || 0})
                </button>
                <button
                  onClick={() => setDbTab('registrations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    dbTab === 'registrations'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🎟️ Registrations / Tickets ({dbData?.counts?.registrations || 0})
                </button>
                <button
                  onClick={() => setDbTab('events')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    dbTab === 'events'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📅 Events Collection ({dbData?.counts?.events || 0})
                </button>
              </div>

              <button
                onClick={handleOpenDbInspect}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                🔄 Refresh Live Data
              </button>
            </div>

            {/* Collection Table Content */}
            <div className="overflow-y-auto p-4 flex-1">
              {dbLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Querying MongoDB collections...
                </div>
              ) : dbTab === 'users' ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">College Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbData?.collections?.users?.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                            u.role === 'coordinator' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{u.rollNumber || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{u.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : dbTab === 'registrations' ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Ticket Code</th>
                      <th className="py-2.5 px-3">Student Candidate</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Event Title</th>
                      <th className="py-2.5 px-3">Gate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbData?.collections?.registrations?.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-bold">{r.ticketCode}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{r.user?.name || 'Candidate'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{r.user?.rollNumber || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{r.event?.title || 'Event'}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.attendanceStatus === 'attended' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {r.attendanceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Event Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Society Club</th>
                      <th className="py-2.5 px-3">Capacity</th>
                      <th className="py-2.5 px-3">Registered / Turnout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbData?.collections?.events?.map((e) => (
                      <tr key={e._id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{e.title}</td>
                        <td className="py-2.5 px-3 text-slate-700">{e.category}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-medium">{e.clubName}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{e.capacity} Seats</td>
                        <td className="py-2.5 px-3 font-mono">{e.registeredCount} Booked / {e.checkedInCount} Checked In</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEventsPage;
