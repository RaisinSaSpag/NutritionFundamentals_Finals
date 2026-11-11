import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AdimeChart } from '../types';
import { ArrowLeft, Lock } from 'lucide-react';

export const AdimeCarePlanViewPage: React.FC = () => {
  const { chartId } = useParams<{ chartId: string }>();
  const [chart, setChart] = useState<AdimeChart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await api.get<{ chart: AdimeChart }>(`/provider/charts/${chartId}`);
        setChart(res.chart);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve clinical care plan.');
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-sm">{error || 'Care plan not found.'}</div>
      </div>
    );
  }

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
              eNCPT ADIME Clinical Record
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              Nutrition Care Plan: {chart.diagnosisTerm}
            </h1>
            <p className="text-slate-500 mt-1">
              Finalized: {chart.finalizedAt ? new Date(chart.finalizedAt).toLocaleDateString() : 'Draft'}
            </p>
          </div>
          <span className="p-2 bg-emerald-50 rounded-full text-emerald-700">
            <Lock className="w-5 h-5" />
          </span>
        </div>

        {/* Diagnosis PES Statement */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <p className="font-bold text-emerald-950 text-xs">Standardized eNCPT PES Statement:</p>
          <p className="text-slate-800 italic leading-relaxed text-sm font-medium">{chart.pesStatement}</p>
        </div>

        {/* Assessment */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 text-sm border-b pb-1">1. Assessment Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Food &amp; Nutrition History:</p>
              <p className="text-slate-600 mt-0.5">{chart.assessmentFoodNutritionHistory || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Anthropometrics:</p>
              <p className="text-slate-600 mt-0.5">{chart.assessmentAnthropometrics || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
              <p className="font-semibold text-slate-700">Biochemical Data / Labs:</p>
              <p className="text-slate-600 mt-0.5 whitespace-pre-line">{chart.assessmentBiochemical || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Intervention */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 text-sm border-b pb-1">2. Interventions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Food/Nutrient Delivery (ND):</p>
              <p className="text-slate-600 mt-0.5">{chart.interventionFoodDelivery || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Nutrition Education (E):</p>
              <p className="text-slate-600 mt-0.5">{chart.interventionEducation || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Nutrition Counseling (C):</p>
              <p className="text-slate-600 mt-0.5">{chart.interventionCounseling || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Coordination of Care (RC):</p>
              <p className="text-slate-600 mt-0.5">{chart.interventionCoordination || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Monitoring & Evaluation */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 text-sm border-b pb-1">3. Monitoring &amp; Evaluation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Indicators:</p>
              <p className="text-slate-600 mt-0.5">{chart.meIndicators || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Measurable Targets:</p>
              <p className="text-slate-600 mt-0.5">{chart.meTargets || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700">Follow-Up Date:</p>
              <p className="text-slate-600 mt-0.5">{chart.meFollowUpDate ? new Date(chart.meFollowUpDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
