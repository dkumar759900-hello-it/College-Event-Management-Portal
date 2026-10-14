import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  User
} from 'lucide-react';

const ScannerPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  const playSound = (type = 'success') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => {
      stopCameraScanner();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success && res.data.events.length > 0) {
        setEvents(res.data.events);
        setSelectedEventId(res.data.events[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startCameraScanner = async () => {
    setCameraError('');
    try {
      const qrScanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          if (!isProcessingRef.current) {
            handleScanPayload(decodedText);
          }
        },
        (errorMessage) => {
          // scanning frames
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Camera permission failed:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions in browser, or use Manual Pass Code entry below.'
      );
      setScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Failed to stop camera:', err);
      }
    }
    setScanning(false);
  };

  const handleScanPayload = async (payload) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setScanLoading(true);

    try {
      const res = await api.post('/attendance/scan', {
        qrData: payload,
        eventId: selectedEventId || undefined
      });

      if (res.data.success) {
        playSound('success');
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.7 }
        });

        const verifiedResult = {
          type: 'success',
          status: 'ENTRY APPROVED',
          message: res.data.message,
          student: res.data.student,
          ticket: res.data.ticket,
          event: res.data.event,
          timestamp: new Date().toLocaleTimeString()
        };

        setScanResult(verifiedResult);
        setRecentScans((prev) => [verifiedResult, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      playSound('error');
      const errData = err.response?.data || {};

      const errorResult = {
        type: errData.status === 'ALREADY_SCANNED' ? 'warning' : 'error',
        status: errData.status || 'ERROR',
        message: errData.message || 'Ticket verification failed',
        student: errData.student,
        checkedInAt: errData.checkedInAt,
        timestamp: new Date().toLocaleTimeString()
      };

      setScanResult(errorResult);
      if (errData.student) {
        setRecentScans((prev) => [errorResult, ...prev.slice(0, 9)]);
      }
    } finally {
      setScanLoading(false);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanPayload(manualCode.trim());
    setManualCode('');
  };

  const handleQuickDemoScan = () => {
    const demoCode = 'TKT-DEMO-001';
    handleScanPayload(demoCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gate Security & Attendance Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Live QR Attendance Scanner</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time camera verification, duplicate check-in protection, and student admission desk.
          </p>
        </div>

        {/* Event Selection Dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Active Event Gate:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
          >
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title} ({evt.clubName})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Scanner & Manual Input */}
        <div className="lg:col-span-7 space-y-6">
          {/* Camera Viewport */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Camera Reader</h3>
              </div>

              {!scanning ? (
                <button
                  onClick={startCameraScanner}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Camera className="w-4 h-4" />
                  Turn On Camera
                </button>
              ) : (
                <button
                  onClick={stopCameraScanner}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <CameraOff className="w-4 h-4" />
                  Stop Camera
                </button>
              )}
            </div>

            {/* Video Box */}
            <div className="relative w-full aspect-video sm:aspect-square max-h-80 mx-auto rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-300">
              <div id="qr-reader" className="w-full h-full" />

              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-100">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3 text-blue-600">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Camera is currently off</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Click 'Turn On Camera' to scan attendee QR admit cards using your webcam or phone.
                  </p>
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-emerald-400 rounded-xl animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.4)]" />
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Manual Pass Code Entry</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the printed registration pass code manually if the candidate's screen is unreadable.
            </p>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. TKT-DEMO-001 or paste ticket code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={scanLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs"
              >
                Verify Pass
              </button>
            </form>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Sample Test Pass:</span>
              <button
                type="button"
                onClick={handleQuickDemoScan}
                className="px-3 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Scan Sample Demo Ticket (Deepak)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result & Real-Time Log */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Verification Result</span>
              {scanLoading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </h3>

            {scanResult ? (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  scanResult.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : scanResult.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {scanResult.type === 'success' ? (
                    <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : scanResult.type === 'warning' ? (
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                  ) : (
                    <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-bold tracking-wide uppercase">
                      {scanResult.status}
                    </div>
                    <div className="text-xs opacity-90">{scanResult.message}</div>
                  </div>
                </div>

                {scanResult.student && (
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-2 text-slate-800 shadow-xs">
                    <div className="flex items-center gap-3 pb-2.5 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{scanResult.student.name}</div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          Roll: {scanResult.student.rollNumber || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-900">{scanResult.student.department}</span>
                    </div>

                    {scanResult.ticket && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pass ID:</span>
                        <span className="font-mono text-blue-700 font-bold">{scanResult.ticket.ticketCode}</span>
                      </div>
                    )}

                    {scanResult.checkedInAt && (
                      <div className="flex justify-between text-amber-800 font-medium">
                        <span>Original Check-In:</span>
                        <span className="font-mono">{new Date(scanResult.checkedInAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                <QrCode className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
                <p className="text-xs text-slate-600 font-medium">No pass scanned yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Scan a student's admit pass to see live verification.</p>
              </div>
            )}
          </div>

          {/* Recent Scans Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Today's Verified Check-Ins</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {recentScans.length} Total
              </span>
            </h3>

            {recentScans.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          scan.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {scan.student?.name || 'Attendee'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {scan.student?.rollNumber || scan.ticket?.ticketCode}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{scan.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No check-in entries yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
