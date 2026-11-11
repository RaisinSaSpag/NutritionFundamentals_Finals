import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { NutritionAnalytics, Appointment, AdimeChart } from '../types';
import { MacroDonutChart } from '../components/Charts/MacroDonutChart';
import { CalorieTrendChart } from '../components/Charts/CalorieTrendChart';
import { NutrientRdaBarChart } from '../components/Charts/NutrientRdaBarChart';
import { CdsAlertBanner } from '../components/CdsAlertBanner';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Flame,
  Heart,
  Scale,
  Utensils,
  Video
} from 'lucide-react';

export const ConsumerDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<NutritionAnalytics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [finalizedCharts, setFinalizedCharts] = useState<AdimeChart[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchDashboardData = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, apptsRes] = await Promise.all([
        api.get<{ analytics: NutritionAnalytics }>(`/meals/analytics?date=${dateStr}`),
        api.get<{ appointments: Appointment[] }>('/appointments/my')
      ]);

      setAnalytics(analyticsRes.analytics);
      setAppointments(apptsRes.appointments);

      // Extract finalized charts from appointments
      const charts: AdimeChart[] = [];
      apptsRes.appointments.forEach((a) => {
        if (a.charts) {
          a.charts.forEach((c) => {
            if (c.status === 'FINALIZED') charts.push(c);
          });
        }
      });
      setFinalizedCharts(charts);
    } catch (err: any) {
      setError(err.message || 'Failed to load nutrition analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-sm text-slate-600">Loading your nutrition profile...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm" role="alert">
          {error || 'Unable to retrieve dashboard data.'}
        </div>
      </div>
    );
  }

  const p = analytics.profile;
  const totals = analytics.todayTotals;
  const targets = analytics.targets;
  const macros = analytics.macroPercentages;

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Patient Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700 text-emerald-100 border border-emerald-600">
                Patient Portal
              </span>
              <span className="text-xs text-emerald-200">Date: {selectedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Personalized Nutrition Dashboard
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl mt-1">
              Evidence-based dietary tracking, clinical decision metrics, and virtual consultations with your Registered Dietitian.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/meals/log"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm rounded-xl shadow transition"
            >
              <Utensils className="w-4 h-4" aria-hidden="true" />
              <span>Log Meal</span>
            </Link>
            <Link
              to="/appointments/book"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-emerald-800 font-bold text-sm rounded-xl shadow transition"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Book Dietitian</span>
            </Link>
          </div>
        </div>

        {/* Vital Health Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-700/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700 rounded-lg text-emerald-200">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-emerald-200">Weight & Height</p>
              <p className="font-bold text-sm sm:text-base">
                {p.weightKg} kg &bull; {p.heightCm} cm
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700 rounded-lg text-emerald-200">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-emerald-200">BMI & Category</p>
              <p className="font-bold text-sm sm:text-base flex items-center space-x-1">
                <span>{p.bmi}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 font-normal">
                  {p.bmiCategory}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700 rounded-lg text-emerald-200">
              <Flame className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-emerald-200">Basal BMR</p>
              <p className="font-bold text-sm sm:text-base">{p.bmr} kcal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700 rounded-lg text-emerald-200">
              <Heart className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-emerald-200">Est. Daily Needs (TEE)</p>
              <p className="font-bold text-sm sm:text-base">{p.tee} kcal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Clinical Decision Support Alerts */}
      <section aria-labelledby="cds-heading">
        <CdsAlertBanner alerts={analytics.activeAlerts} />
      </section>

      {/* Date Switcher */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <label htmlFor="dashboard-date" className="text-xs font-semibold text-slate-700">
          Viewing Intake For Date:
        </label>
        <input
          id="dashboard-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Daily Nutrients Quick Summary Cards */}
      <section aria-label="Daily Nutrition Snapshot" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Daily Calories</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {totals.calories} <span className="text-xs font-normal text-slate-500">/ {p.tee} kcal</span>
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Math.round((totals.calories / (p.tee || 1)) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Protein Intake</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {totals.protein}g <span className="text-xs font-normal text-slate-500">/ {targets.proteinGrams}g</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">AMDR: {macros.proteinPct}% of energy</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Dietary Sodium</p>
          <p className={`text-2xl font-extrabold mt-1 ${totals.sodium > targets.sodiumMaxMg ? 'text-rose-600' : 'text-slate-900'}`}>
            {totals.sodium}mg <span className="text-xs font-normal text-slate-500">/ &lt;{targets.sodiumMaxMg}mg</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totals.sodium > targets.sodiumMaxMg ? '⚠️ Exceeds Upper Limit' : 'Within Target Limit'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Potassium Intake</p>
          <p className="text-2xl font-extrabold text-teal-700 mt-1">
            {totals.potassium}mg <span className="text-xs font-normal text-slate-500">/ {targets.potassiumMg}mg</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Adequate Intake (AI)</p>
        </div>
      </section>

      {/* Visual Analytics Grid (Recharts) */}
      <section aria-label="Visual Nutrition Charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MacroDonutChart
            proteinGrams={totals.protein}
            carbsGrams={totals.carbs}
            fatGrams={totals.fat}
            proteinPct={macros.proteinPct}
            carbsPct={macros.carbsPct}
            fatPct={macros.fatPct}
          />
        </div>

        <div className="lg:col-span-2">
          <CalorieTrendChart trendData={analytics.sevenDayTrend} targetTee={p.tee} />
        </div>

        <div className="lg:col-span-3">
          <NutrientRdaBarChart actual={totals} targets={targets} />
        </div>
      </section>

      {/* Telehealth & Appointments Section */}
      <section aria-labelledby="appts-heading" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 id="appts-heading" className="text-lg font-bold text-slate-900 flex items-center">
            <Video className="w-5 h-5 text-emerald-600 mr-2" aria-hidden="true" />
            Tele-Nutrition Consultations
          </h2>
          <Link
            to="/appointments/book"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            + Book Another Session
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-sm">
            <p>No upcoming appointments scheduled.</p>
            <Link
              to="/appointments/book"
              className="mt-2 inline-block text-xs font-semibold text-emerald-600 underline"
            >
              Book your first consultation with Maria Santos, RDN
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const apptDate = new Date(appt.scheduledAt);
              const formattedDate = apptDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const formattedTime = apptDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={appt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          appt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Provider: <strong>Dietitian {appt.provider?.profile?.lastName || 'Santos'}</strong> &bull; {appt.durationMinutes} mins
                    </p>
                    {appt.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{appt.notes}</p>}
                  </div>

                  <div>
                    {appt.status === 'COMPLETED' ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" aria-hidden="true" />
                        Session Completed
                      </span>
                    ) : (
                      <Link
                        to={`/telehealth/${appt.id}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        <Video className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Join Video Room</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Finalized eNCPT Care Plan Summaries */}
      {finalizedCharts.length > 0 && (
        <section aria-labelledby="careplan-heading" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 id="careplan-heading" className="text-lg font-bold text-slate-900 mb-4">
            Dietitian Clinical Care Plans (eNCPT ADIME)
          </h2>
          <div className="space-y-4">
            {finalizedCharts.map((chart) => (
              <div key={chart.id} className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold uppercase">
                      Finalized eNCPT Chart
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      Nutrition Diagnosis: {chart.diagnosisTerm}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Finalized {chart.finalizedAt ? new Date(chart.finalizedAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs">
                  <p className="font-semibold text-emerald-950 mb-1">Standardized PES Statement:</p>
                  <p className="text-slate-700 italic">{chart.pesStatement}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">Prescribed Nutrition Delivery:</p>
                    <p className="text-slate-600">{chart.interventionFoodDelivery || 'General dietary optimization'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Monitoring Targets:</p>
                    <p className="text-slate-600">{chart.meTargets || 'Bi-weekly weight and daily sodium logging'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
