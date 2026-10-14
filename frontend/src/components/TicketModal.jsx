import React from 'react';
import { X, Download, Printer, CheckCircle, Clock, MapPin, Calendar, ShieldCheck, GraduationCap } from 'lucide-react';

const TicketModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const event = ticket.event;
  const user = ticket.user || {};
  const isAttended = ticket.attendanceStatus === 'attended';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = ticket.qrCodeUrl;
    link.download = `pass-${ticket.ticketCode}.png`;
    link.click();
  };

  const eventDate = new Date(event?.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Ticket Header */}
        <div className="bg-blue-600 p-6 text-white text-center relative border-b border-blue-700">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-700 text-[11px] font-semibold uppercase tracking-wider mb-2 border border-blue-500/50">
            <GraduationCap className="w-3.5 h-3.5" />
            Official Campus Entry E-Pass
          </div>
          <h2 className="text-xl font-bold leading-snug">{event?.title}</h2>
          <p className="text-xs text-blue-100 mt-1">{event?.clubName || 'College Council'}</p>
        </div>

        {/* Perforation Cut Line */}
        <div className="relative flex items-center justify-between px-4 -my-3">
          <div className="w-6 h-6 rounded-full bg-slate-900/60 -ml-7" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
          <div className="w-6 h-6 rounded-full bg-slate-900/60 -mr-7" />
        </div>

        {/* Ticket Body with QR Code */}
        <div className="p-6 bg-white space-y-4 text-center">
          {/* Status Badge */}
          <div className="flex justify-center">
            {isAttended ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                VERIFIED & CHECKED-IN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Clock className="w-4 h-4 text-blue-600" />
                ACTIVE PASS (READY FOR GATE ENTRY)
              </span>
            )}
          </div>

          {/* QR Code Container */}
          <div className="inline-block p-3 bg-white rounded-xl shadow-xs border border-slate-200">
            <img
              src={ticket.qrCodeUrl}
              alt="Entry QR Code"
              className="w-44 h-44 mx-auto object-contain"
            />
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Registration Pass ID
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 tracking-wide mt-0.5">
              {ticket.ticketCode}
            </div>
          </div>

          {/* Attendee Details Table */}
          <div className="bg-slate-50 rounded-xl p-3.5 text-left text-xs space-y-2 border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Candidate Name:</span>
              <span className="font-semibold text-slate-900">{user?.name || 'Registered Student'}</span>
            </div>
            {user?.rollNumber && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-mono font-medium text-slate-800">{user.rollNumber}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Event Schedule:</span>
              <span className="text-slate-800 font-medium">{eventDate} • {event?.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Venue:</span>
              <span className="text-slate-800 font-medium">{event?.venue}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Show this QR code at the entrance verification desk. Pass is non-transferable.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Admit Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
