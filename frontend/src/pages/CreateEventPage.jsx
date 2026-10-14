import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const categories = ['Technical', 'Hackathon', 'Workshop', 'Cultural', 'Sports', 'Seminar'];

const samplePosters = [
  { label: 'Hackathon / Tech', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI Workshop', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cultural / Concert', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sports Meet', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Coding Contest', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80' }
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '10:00 AM - 04:00 PM',
    venue: '',
    clubName: user?.clubName || 'College Council',
    capacity: 100,
    fee: 0,
    poster: samplePosters[0].url,
    prizes: 'Cash Prizes + Certificates + Goodies',
    contactEmail: user?.email || 'events@college.edu'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/events', formData);
      if (res.data.success) {
        navigate(`/events/${res.data.event._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Host Campus Event</h1>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Publish a new society event, fest, or technical competition with automated digital pass registration.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. HackMatrix 2026: Inter-College Hackathon"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organizing Society / Club *
              </label>
              <input
                type="text"
                name="clubName"
                required
                placeholder="e.g. Coding Club / Robotics Cell"
                value={formData.clubName}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Provide event overview, eligibility, rounds, and guidelines..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Interval *
              </label>
              <input
                type="text"
                name="time"
                required
                placeholder="10:00 AM - 04:00 PM"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Venue *
              </label>
              <input
                type="text"
                name="venue"
                required
                placeholder="Auditorium / Lab 4"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Capacity (Seats) *
              </label>
              <input
                type="number"
                name="capacity"
                required
                min={1}
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Fee (₹ - 0 for Free)
              </label>
              <input
                type="number"
                name="fee"
                min={0}
                value={formData.fee}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prizes & Awards
              </label>
              <input
                type="text"
                name="prizes"
                placeholder="Certificates + Cash Prize"
                value={formData.prizes}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-blue-600 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Poster Image:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {samplePosters.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setFormData({ ...formData, poster: p.url })}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition relative ${
                    formData.poster === p.url
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="h-16 w-full object-cover" />
                  <div className="p-1 text-[10px] text-center bg-white font-medium truncate text-slate-700 border-t border-slate-100">
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Publish Campus Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
