import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Stethoscope,
  Users,
  Video
} from 'lucide-react';

export const ProviderDashboardPage: React.FC = () => {
  const [consumers, setConsumers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportData, setExportData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consRes, apptsRes] = await Promise.all([
          api.get<{ consumers: any[] }>('/provider/consumers'),
          api.get<{ appointments: any[] }>('/appointments/my')
        ]);
        setConsumers(consRes.consumers);
        setAppointments(apptsRes.appointments);
      } catch (err) {
        console.error('Failed to load provider data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadExport = async () => {
    setExportLoading(true);
    try {
      const data = await api.get<any>('/export/anonymized');
      setExportData(data);

      // Trigger browser JSON download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `telenutrition_deidentified_research_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-sm text-slate-600">Loading Clinical Practice Portal...</span>
      </div>
    );
  }

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800 text-emerald-100 border border-emerald-700">
            Registered Dietitian Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Clinical Nutrition Practice Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Manage your patient caseload, review real-time meal diaries, evaluate CDS alerts, and chart standardized eNCPT ADIME care plans.
          </p>
        </div>

        <button
          onClick={handleDownloadExport}
          disabled={exportLoading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exportLoading ? 'Generating...' : 'Export De-Identified Dataset'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Patient Caseload List */}
        <section aria-labelledby="caseload-heading" className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 id="caseload-heading" className="text-base font-bold text-slate-900 flex items-center">
              <Users className="w-5 h-5 text-emerald-600 mr-2" />
              Patient Caseload ({consumers.length})
            </h2>
            <span className="text-xs text-slate-400">Authorized Consultation Relationships</span>
          </div>

          {consumers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
              No patients scheduled yet.
            </div>
          ) : (
            <div className="space-y-3">
              {consumers.map((consumer) => {
                const hp = consumer.healthProfile;
                const activeAlerts = consumer.cdsAlerts || [];
                const conditions: string[] = hp ? JSON.parse(hp.medicalConditions || '[]') : [];

                return (
                  <Link
                    key={consumer.id}
                    to={`/provider/consumers/${consumer.id}`}
                    className="block p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">
                            {consumer.profile?.firstName} {consumer.profile?.lastName}
                          </p>
                          <span className="text-xs text-slate-400">&bull; {hp?.sex} &bull; {hp?.weightKg} kg</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {conditions.map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                              {c}
                            </span>
                          ))}
                          {activeAlerts.length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
                        <span>Open Clinical Chart</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Upcoming Sessions Schedule */}
        <section aria-labelledby="schedule-heading" className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 id="schedule-heading" className="text-base font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 text-emerald-600 mr-2" />
              Upcoming Schedule
            </h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
              No appointments scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appt) => {
                const dateObj = new Date(appt.scheduledAt);
                return (
                  <div key={appt.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800">
                        {appt.consumer?.profile?.firstName} {appt.consumer?.profile?.lastName}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        appt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex justify-end space-x-2 pt-1 border-t border-slate-100">
                      {appt.status !== 'COMPLETED' && (
                        <Link
                          to={`/telehealth/${appt.id}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center space-x-1"
                        >
                          <Video className="w-3 h-3" />
                          <span>Join Room</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
