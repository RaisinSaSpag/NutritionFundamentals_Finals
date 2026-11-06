import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { JitsiMeetEmbed } from '../components/JitsiMeetEmbed';
import { ArrowLeft, CheckCircle2, FileText, Video } from 'lucide-react';

export const TelehealthSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any | null>(null);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const [roomRes, apptRes] = await Promise.all([
          api.get<{ session: any }>(`/appointments/${id}/room`),
          api.get<{ appointment: any }>(`/appointments/${id}`)
        ]);

        setSessionData(roomRes.session);
        setAppointment(apptRes.appointment);
      } catch (err: any) {
        setError(err.message || 'Unable to join video session at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleEndSession = async () => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'COMPLETED' });
      setSessionCompleted(true);
    } catch (err) {
      console.error('Failed to complete session status:', err);
      setSessionCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-sm text-slate-600">Connecting to secure video gateway...</span>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm" role="alert">
          {error || 'Video session is unavailable.'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return</span>
        </button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Virtual Session Concluded</h1>
        <p className="text-xs text-slate-600">
          The consultation status has been updated to <strong>COMPLETED</strong>.
        </p>

        {user?.role === 'PROVIDER' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-3 text-left">
            <p className="font-bold text-emerald-900 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-emerald-700" />
              Post-Session eNCPT Documentation Required
            </p>
            <p className="text-slate-600">
              Please complete and finalize the Nutrition Care Process (ADIME) chart for{' '}
              <strong>{appointment?.consumer?.profile?.firstName} {appointment?.consumer?.profile?.lastName}</strong>.
            </p>
            <button
              onClick={() => navigate(`/provider/consumers/${appointment?.consumerId}`)}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition"
            >
              Open ADIME Charting Form
            </button>
          </div>
        ) : (
          <div className="flex justify-center space-x-3 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              Back to Patient Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Room: {sessionData.roomName.substring(0, 18)}...
        </span>
      </div>

      <JitsiMeetEmbed
        roomName={sessionData.roomName}
        displayName={sessionData.displayName}
        onSessionEnd={handleEndSession}
      />
    </main>
  );
};
