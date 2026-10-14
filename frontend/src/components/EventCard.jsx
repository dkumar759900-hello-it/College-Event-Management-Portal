import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const categoryStyles = {
  Technical: 'bg-blue-50 text-blue-700 border-blue-200',
  Hackathon: 'bg-purple-50 text-purple-700 border-purple-200',
  Workshop: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cultural: 'bg-amber-50 text-amber-800 border-amber-200',
  Sports: 'bg-rose-50 text-rose-700 border-rose-200',
  Seminar: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const percentFull = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = event.registeredCount >= event.capacity;
  const isAlmostFull = percentFull >= 80 && !isFull;

  return (
    <div className="group bg-white border border-slate-200 hover:border-blue-400 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Poster Image & Tags */}
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
            }}
          />

          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border shadow-xs ${
              categoryStyles[event.category] || categoryStyles.Technical
            }`}>
              {event.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
              {event.fee === 0 ? 'Free Entry' : `₹${event.fee}`}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-xs font-semibold text-slate-800 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs border border-slate-200/60 shadow-xs">
              {event.clubName}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Quick Event Logistics */}
          <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{eventDate}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity & Action Footer */}
      <div className="px-5 pb-5 pt-1">
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>Registration Status</span>
            </span>
            <span className="font-semibold text-slate-700">
              {event.registeredCount} / {event.capacity}
              {isFull ? (
                <span className="ml-1 text-rose-600 font-bold">(Full)</span>
              ) : isAlmostFull ? (
                <span className="ml-1 text-amber-600 font-bold">(Almost Full)</span>
              ) : null}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : isAlmostFull
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${percentFull}%` }}
            />
          </div>

          <div className="mt-3.5">
            <Link
              to={`/events/${event._id}`}
              className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Details & Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
