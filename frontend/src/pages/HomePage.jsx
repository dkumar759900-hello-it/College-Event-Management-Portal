import React, { useState, useEffect } from 'react';
import api from '../api';
import EventCard from '../components/EventCard';
import { Search, Calendar, Users, Award, GraduationCap, CheckCircle } from 'lucide-react';

const categories = ['All', 'Technical', 'Hackathon', 'Workshop', 'Cultural', 'Sports', 'Seminar'];

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/events', { params });
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            University Student Council & Club Events
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Discover & Register for <br className="hidden sm:inline" />
            <span className="text-blue-600">
              Campus Fests, Workshops & Hackathons
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The central activity portal for college students. Browse upcoming society events, secure digital QR admission passes, and track your attendance.
          </p>

          {/* Key Stat Counters */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 max-w-md mx-auto">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">100%</div>
              <div className="text-[11px] text-slate-500 font-medium">Digital QR Entry</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold text-slate-800">5+</div>
              <div className="text-[11px] text-slate-500 font-medium">Active Societies</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">Instant</div>
              <div className="text-[11px] text-slate-500 font-medium">Pass Generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Category Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, club or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs transition"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-white border border-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Events Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any campus events matching your criteria. Try adjusting your search query or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
