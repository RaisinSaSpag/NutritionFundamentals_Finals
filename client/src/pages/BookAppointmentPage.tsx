import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, CheckCircle2, Clock, ShieldCheck, Stethoscope, Video } from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [notes, setNotes] = useState<string>('Medical Nutrition Therapy Consultation');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default provider Maria Santos ID from seed
  const [providerUser, setProviderUser] = useState<any>(null);

  useEffect(() => {
    // Find provider profile
    api.get<{ appointments: any[] }>('/appointments/my').then((res) => {
      if (res.appointments.length > 0 && res.appointments[0].provider) {
        setProviderUser(res.appointments[0].provider);
      }
    }).catch(() => {});
  }, []);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build ISO timestamp
      const scheduledAt = new Date(`${scheduledDate}T${selectedTime}:00`).toISOString();

      // Fallback provider ID if not loaded
      const providerId = providerUser?.id || '4259b6fe-2384-4861-8e50-9bbd9ea4b625';

      const res = await api.post<{ appointment: any }>('/appointments/book', {
        providerId,
        scheduledAt,
        durationMinutes: 30,
        notes
      });

      setSuccess(res.appointment);
    } catch (err: any) {
      setError(err.message || 'Failed to book slot. It may already be occupied.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h1>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left text-xs space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Provider:</span>
            <span className="font-bold text-slate-800">Maria Santos, RDN (PRC-ND-008921)</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Scheduled Time:</span>
            <span className="font-bold text-slate-800">{new Date(success.scheduledAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Session Status:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{success.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Secure Room ID:</span>
            <span className="font-mono text-slate-700">{success.roomName}</span>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate(`/telehealth/${success.id}`)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Go to Video Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content" className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Tele-nutrition Consultation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Book an Appointment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Schedule a 30-minute one-on-one virtual Medical Nutrition Therapy session with your Registered Dietitian.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs" role="alert">
          {error}
        </div>
      )}

      {/* Provider Info Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3">
        <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="text-xs text-emerald-950">
          <p className="font-bold text-sm">Maria Santos, RDN, LDN</p>
          <p className="text-emerald-800">Master of Science in Clinical Nutrition &bull; License PRC-ND-008921</p>
          <p className="text-emerald-700 mt-1">
            Specialties: Type 2 Diabetes &bull; Renal Medical Nutrition Therapy &bull; Cardiovascular Health
          </p>
        </div>
      </div>

      <form onSubmit={handleBook} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <div>
          <label htmlFor="book-date" className="block font-semibold text-slate-700 mb-1">
            Select Consultation Date
          </label>
          <input
            id="book-date"
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-2">Available Time Slots (30 mins)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                  selectedTime === slot
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="book-notes" className="block font-semibold text-slate-700 mb-1">
            Consultation Focus & Symptoms (Optional)
          </label>
          <textarea
            id="book-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share what you would like to discuss (e.g. recent high blood sugar, review food log)..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow transition disabled:opacity-50"
          >
            {loading ? 'Reserving slot...' : `Confirm Booking for ${scheduledDate} at ${selectedTime}`}
          </button>
        </div>
      </form>
    </main>
  );
};
