import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { NutritionAnalytics } from '../types';
import { MacroDonutChart } from '../components/Charts/MacroDonutChart';
import { CalorieTrendChart } from '../components/Charts/CalorieTrendChart';
import { NutrientRdaBarChart } from '../components/Charts/NutrientRdaBarChart';
import { CdsAlertBanner } from '../components/CdsAlertBanner';
import {
  ArrowLeft,
  Database,
  FileCheck,
  Lock,
  Save
} from 'lucide-react';

const ENCPT_DIAGNOSIS_OPTIONS = [
  { domain: 'INTAKE', code: 'NI-5.10.1', term: 'Excessive sodium intake (NI-5.10.1)' },
  { domain: 'INTAKE', code: 'NI-1.2', term: 'Inadequate energy intake (NI-1.2)' },
  { domain: 'INTAKE', code: 'NI-1.3', term: 'Excessive energy intake (NI-1.3)' },
  { domain: 'INTAKE', code: 'NI-5.7.1', term: 'Inadequate protein intake (NI-5.7.1)' },
  { domain: 'INTAKE', code: 'NI-5.8.2', term: 'Excessive carbohydrate intake (NI-5.8.2)' },
  { domain: 'INTAKE', code: 'NI-5.8.4', term: 'Inadequate fiber intake (NI-5.8.4)' },
  { domain: 'INTAKE', code: 'NI-5.8.5', term: 'Inappropriate intake of food fats (NI-5.8.5)' },
  { domain: 'INTAKE', code: 'NI-5.10.2', term: 'Excessive potassium intake (NI-5.10.2)' },
  { domain: 'CLINICAL', code: 'NC-3.3', term: 'Overweight/obesity (NC-3.3)' },
  { domain: 'CLINICAL', code: 'NC-3.1', term: 'Underweight (NC-3.1)' },
  { domain: 'CLINICAL', code: 'NC-2.2', term: 'Altered nutrition-related laboratory values (NC-2.2)' },
  { domain: 'CLINICAL', code: 'NC-3.2', term: 'Unintended weight loss (NC-3.2)' },
  { domain: 'CLINICAL', code: 'NC-1.4', term: 'Altered GI function (NC-1.4)' },
  { domain: 'BEHAVIORAL_ENVIRONMENTAL', code: 'NB-1.1', term: 'Food- and nutrition-related knowledge deficit (NB-1.1)' },
  { domain: 'BEHAVIORAL_ENVIRONMENTAL', code: 'NB-1.7', term: 'Inappropriate food choices (NB-1.7)' },
  { domain: 'BEHAVIORAL_ENVIRONMENTAL', code: 'NB-1.5', term: 'Disordered eating pattern (NB-1.5)' }
];

export const ConsumerClinicalDetailPage: React.FC = () => {
  const { consumerId } = useParams<{ consumerId: string }>();
  const [consumer, setConsumer] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<NutritionAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'nutrition' | 'history'>('chart');
  const [loading, setLoading] = useState<boolean>(true);
  const [chartSubmitting, setChartSubmitting] = useState<boolean>(false);
  const [ehrSyncing, setEhrSyncing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ADIME Form State
  const [activeChartId, setActiveChartId] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [finalizedAt, setFinalizedAt] = useState<string | null>(null);

  // 1. Assessment (5 domains)
  const [foodHistory, setFoodHistory] = useState('');
  const [anthropometrics, setAnthropometrics] = useState('');
  const [biochemical, setBiochemical] = useState('');
  const [physicalFindings, setPhysicalFindings] = useState('');
  const [clientHistory, setClientHistory] = useState('');

  // 2. Diagnosis (PES Statement)
  const [diagnosisDomain, setDiagnosisDomain] = useState<'INTAKE' | 'CLINICAL' | 'BEHAVIORAL_ENVIRONMENTAL'>('INTAKE');
  const [diagnosisTerm, setDiagnosisTerm] = useState(ENCPT_DIAGNOSIS_OPTIONS[0].term);
  const [etiology, setEtiology] = useState('');
  const [signsSymptoms, setSignsSymptoms] = useState('');

  // 3. Intervention (4 categories)
  const [interventionFood, setInterventionFood] = useState('');
  const [interventionEducation, setInterventionEducation] = useState('');
  const [interventionCounseling, setInterventionCounseling] = useState('');
  const [interventionCoordination, setInterventionCoordination] = useState('');

  // 4. Monitoring & Evaluation
  const [meIndicators, setMeIndicators] = useState('');
  const [meTargets, setMeTargets] = useState('');
  const [meFollowUpDate, setMeFollowUpDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [consRes, analyticsRes] = await Promise.all([
        api.get<{ consumer: any }>(`/provider/consumers/${consumerId}`),
        api.get<{ analytics: NutritionAnalytics }>(`/meals/analytics?consumerId=${consumerId}`)
      ]);

      const c = consRes.consumer;
      setConsumer(c);
      setAnalytics(analyticsRes.analytics);

      // Prepopulate anthropometrics if empty
      const hp = c.healthProfile;
      if (hp && analyticsRes.analytics) {
        const p = analyticsRes.analytics.profile;
        setAnthropometrics(`Height: ${hp.heightCm} cm | Weight: ${hp.weightKg} kg | BMI: ${p.bmi} (${p.bmiCategory}) | BMR: ${p.bmr} kcal | TEE: ${p.tee} kcal`);
        setClientHistory(`Sex: ${hp.sex} | Conditions: ${hp.medicalConditions} | Allergies: ${hp.allergies} | Goals: ${hp.nutritionGoals}`);
      }

      // Check if there is an existing chart
      if (c.consumerCharts && c.consumerCharts.length > 0) {
        const latest = c.consumerCharts[0];
        setActiveChartId(latest.id);
        setIsFinalized(latest.status === 'FINALIZED');
        setFinalizedAt(latest.finalizedAt);
        setFoodHistory(latest.assessmentFoodNutritionHistory || '');
        setBiochemical(latest.assessmentBiochemical || '');
        setPhysicalFindings(latest.assessmentPhysicalFindings || '');
        setDiagnosisDomain(latest.diagnosisDomain || 'INTAKE');
        setDiagnosisTerm(latest.diagnosisTerm || ENCPT_DIAGNOSIS_OPTIONS[0].term);
        setEtiology(latest.diagnosisEtiology || '');
        setSignsSymptoms(latest.diagnosisSignsSymptoms || '');
        setInterventionFood(latest.interventionFoodDelivery || '');
        setInterventionEducation(latest.interventionEducation || '');
        setInterventionCounseling(latest.interventionCounseling || '');
        setInterventionCoordination(latest.interventionCoordination || '');
        setMeIndicators(latest.meIndicators || '');
        setMeTargets(latest.meTargets || '');
        if (latest.meFollowUpDate) {
          setMeFollowUpDate(new Date(latest.meFollowUpDate).toISOString().split('T')[0]);
        }
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to load patient clinical profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [consumerId]);

  // Prefill from Hospital EHR (FHIR observations)
  const handlePrefillEhr = async () => {
    setEhrSyncing(true);
    setStatusMsg(null);
    try {
      const res = await api.get<{ observations: any[]; message: string }>(`/export/ehr/observations/${consumerId}`);
      const obsSummary = res.observations.map((o: any) => `${o.test}: ${o.value} (Observed: ${o.effectiveDate.substring(0, 10)})`).join('\n');
      setBiochemical((prev) => (prev ? `${prev}\n\n[FHIR EHR Observations]:\n${obsSummary}` : `[FHIR EHR Observations]:\n${obsSummary}`));
      setStatusMsg({ text: res.message, type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to query hospital EHR.', type: 'error' });
    } finally {
      setEhrSyncing(false);
    }
  };

  // Live computed PES Statement
  const computedPes = (diagnosisTerm && etiology && signsSymptoms)
    ? `${diagnosisTerm} related to ${etiology} as evidenced by ${signsSymptoms}.`
    : '';

  // Save as Draft
  const handleSaveDraft = async () => {
    setChartSubmitting(true);
    setStatusMsg(null);
    try {
      const payload = {
        consumerId,
        assessmentFoodNutritionHistory: foodHistory,
        assessmentAnthropometrics: anthropometrics,
        assessmentBiochemical: biochemical,
        assessmentPhysicalFindings: physicalFindings,
        assessmentClientHistory: clientHistory,
        diagnosisDomain,
        diagnosisTerm,
        diagnosisEtiology: etiology,
        diagnosisSignsSymptoms: signsSymptoms,
        interventionFoodDelivery: interventionFood,
        interventionEducation,
        interventionCounseling,
        interventionCoordination,
        meIndicators,
        meTargets,
        meFollowUpDate: meFollowUpDate || undefined
      };

      if (activeChartId) {
        await api.put(`/provider/charts/${activeChartId}`, payload);
        setStatusMsg({ text: 'ADIME chart draft saved successfully.', type: 'success' });
      } else {
        const res = await api.post<{ chart: any }>('/provider/charts', payload);
        setActiveChartId(res.chart.id);
        setStatusMsg({ text: 'New ADIME chart draft created.', type: 'success' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to save chart draft.', type: 'error' });
    } finally {
      setChartSubmitting(false);
    }
  };

  // Finalize and Lock Chart
  const handleFinalize = async () => {
    if (!computedPes) {
      setStatusMsg({ text: 'Complete PES Statement (Problem, Etiology, Signs/Symptoms) required prior to finalization.', type: 'error' });
      return;
    }
    if (!window.confirm('Finalize and lock this ADIME chart? This will timestamp the record and push the Encounter note to the hospital EHR.')) {
      return;
    }

    setChartSubmitting(true);
    setStatusMsg(null);
    try {
      // Save latest updates first
      await handleSaveDraft();

      if (!activeChartId) throw new Error('No chart ID available to finalize.');

      // Finalize
      const res = await api.post<{ chart: any }>(`/provider/charts/${activeChartId}/finalize`);
      setIsFinalized(true);
      setFinalizedAt(res.chart.finalizedAt);

      // Trigger EHR Encounter push
      const ehrRes = await api.post<{ message: string }>(`/export/ehr/sync-chart/${activeChartId}`);
      setStatusMsg({
        text: `Chart successfully finalized and locked. ${ehrRes.message}`,
        type: 'success'
      });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error finalizing chart.', type: 'error' });
    } finally {
      setChartSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-sm text-slate-600">Loading patient medical chart...</span>
      </div>
    );
  }

  if (!consumer) {
    return <div className="p-8 text-center text-rose-600 text-sm">Consumer record not found or unauthorized.</div>;
  }

  const cp = consumer.profile;
  const chp = consumer.healthProfile;
  const conditions: string[] = chp ? JSON.parse(chp.medicalConditions || '[]') : [];

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link to="/provider" className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Caseload</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {cp?.firstName} {cp?.lastName}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              DOB: {cp?.dateOfBirth ? new Date(cp.dateOfBirth).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sex: {chp?.sex} &bull; Height: {chp?.heightCm} cm &bull; Weight: {chp?.weightKg} kg &bull; Conditions: {conditions.join(', ') || 'None'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isFinalized ? (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1.5 border border-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Finalized &amp; Locked ({finalizedAt ? new Date(finalizedAt).toLocaleDateString() : 'Audit Timestamp'})</span>
            </span>
          ) : (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={chartSubmitting}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                disabled={chartSubmitting}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
              >
                <FileCheck className="w-4 h-4" />
                <span>Finalize &amp; Push to EHR</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-lg text-xs ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`} role="alert">
          {statusMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-3 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('chart')}
          className={`pb-2.5 px-3 border-b-2 transition ${activeTab === 'chart' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          eNCPT ADIME Chart Form
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`pb-2.5 px-3 border-b-2 transition ${activeTab === 'nutrition' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Patient Nutrition Analytics &amp; CDS Alerts
        </button>
      </div>

      {activeTab === 'nutrition' && analytics && (
        <div className="space-y-6">
          <CdsAlertBanner alerts={analytics.activeAlerts} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MacroDonutChart
                proteinGrams={analytics.todayTotals.protein}
                carbsGrams={analytics.todayTotals.carbs}
                fatGrams={analytics.todayTotals.fat}
                proteinPct={analytics.macroPercentages.proteinPct}
                carbsPct={analytics.macroPercentages.carbsPct}
                fatPct={analytics.macroPercentages.fatPct}
              />
            </div>
            <div className="lg:col-span-2">
              <CalorieTrendChart trendData={analytics.sevenDayTrend} targetTee={analytics.profile.tee} />
            </div>
            <div className="lg:col-span-3">
              <NutrientRdaBarChart actual={analytics.todayTotals} targets={analytics.targets} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <form className="space-y-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
          {/* SECTION 1: ASSESSMENT */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase text-emerald-900">
                1. Assessment (5 eNCPT Domains)
              </h2>
              <button
                type="button"
                onClick={handlePrefillEhr}
                disabled={ehrSyncing || isFinalized}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold text-[11px] disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{ehrSyncing ? 'Fetching...' : 'Prefill from Hospital EHR (FHIR)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Food/Nutrition-Related History (FH)
                </label>
                <textarea
                  rows={3}
                  disabled={isFinalized}
                  value={foodHistory}
                  onChange={(e) => setFoodHistory(e.target.value)}
                  placeholder="24h recall, habitual intake, macronutrient distribution..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Anthropometric Measurements (AD)
                </label>
                <textarea
                  rows={3}
                  disabled={isFinalized}
                  value={anthropometrics}
                  onChange={(e) => setAnthropometrics(e.target.value)}
                  placeholder="Height, weight, BMI, BMR, TEE..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Biochemical Data &amp; Lab Tests (BD)
                </label>
                <textarea
                  rows={3}
                  disabled={isFinalized}
                  value={biochemical}
                  onChange={(e) => setBiochemical(e.target.value)}
                  placeholder="HbA1c, BP, serum potassium, eGFR..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nutrition-Focused Physical Findings (PD)
                </label>
                <textarea
                  rows={3}
                  disabled={isFinalized}
                  value={physicalFindings}
                  onChange={(e) => setPhysicalFindings(e.target.value)}
                  placeholder="Edema, muscle wasting, subcutaneous fat loss..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Client History (CH)
                </label>
                <input
                  type="text"
                  disabled={isFinalized}
                  value={clientHistory}
                  onChange={(e) => setClientHistory(e.target.value)}
                  placeholder="Age, sex, medical conditions, medication profile..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DIAGNOSIS (PES STATEMENT) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase text-emerald-900">
              2. Diagnosis (eNCPT PES Statement)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diagnosis Domain</label>
                <select
                  disabled={isFinalized}
                  value={diagnosisDomain}
                  onChange={(e: any) => setDiagnosisDomain(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="INTAKE">Intake (NI)</option>
                  <option value="CLINICAL">Clinical (NC)</option>
                  <option value="BEHAVIORAL_ENVIRONMENTAL">Behavioral-Environmental (NB)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Standardized Diagnosis Term (Problem)</label>
                <select
                  disabled={isFinalized}
                  value={diagnosisTerm}
                  onChange={(e) => setDiagnosisTerm(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-emerald-900"
                >
                  {ENCPT_DIAGNOSIS_OPTIONS.map((item) => (
                    <option key={item.code} value={item.term}>
                      [{item.domain}] {item.term}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Etiology (Related to...)
                  </label>
                  <input
                    type="text"
                    disabled={isFinalized}
                    value={etiology}
                    onChange={(e) => setEtiology(e.target.value)}
                    placeholder="e.g. frequent consumption of high-sodium savory dishes"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Signs and Symptoms (As evidenced by...)
                  </label>
                  <input
                    type="text"
                    disabled={isFinalized}
                    value={signsSymptoms}
                    onChange={(e) => setSignsSymptoms(e.target.value)}
                    placeholder="e.g. daily sodium exceeding 2,700 mg and BP 138/88 mmHg"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Live PES Preview Banner */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-[11px] text-emerald-900 uppercase tracking-wide">
                Synthesized PES Statement (Standardized eNCPT Format):
              </span>
              <p className="text-xs text-slate-800 italic font-medium leading-relaxed">
                {computedPes || 'Enter Problem, Etiology, and Signs/Symptoms above to synthesize standardized PES statement.'}
              </p>
            </div>
          </div>

          {/* SECTION 3: INTERVENTION */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase text-emerald-900">
              3. Intervention (4 eNCPT Categories)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Food and/or Nutrient Delivery (ND)
                </label>
                <textarea
                  rows={2}
                  disabled={isFinalized}
                  value={interventionFood}
                  onChange={(e) => setInterventionFood(e.target.value)}
                  placeholder="Dietary prescription, meal schedule, sodium restriction..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nutrition Education (E)
                </label>
                <textarea
                  rows={2}
                  disabled={isFinalized}
                  value={interventionEducation}
                  onChange={(e) => setInterventionEducation(e.target.value)}
                  placeholder="Education on food label reading, salt substitutes..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nutrition Counseling (C)
                </label>
                <textarea
                  rows={2}
                  disabled={isFinalized}
                  value={interventionCounseling}
                  onChange={(e) => setInterventionCounseling(e.target.value)}
                  placeholder="Motivational interviewing, behavioral goal setting..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Coordination of Nutrition Care (RC)
                </label>
                <textarea
                  rows={2}
                  disabled={isFinalized}
                  value={interventionCoordination}
                  onChange={(e) => setInterventionCoordination(e.target.value)}
                  placeholder="Collaboration with PCP, referral for lab monitoring..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: MONITORING & EVALUATION */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase text-emerald-900">
              4. Monitoring &amp; Evaluation (M/E)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Indicators</label>
                <input
                  type="text"
                  disabled={isFinalized}
                  value={meIndicators}
                  onChange={(e) => setMeIndicators(e.target.value)}
                  placeholder="e.g. Daily sodium intake, BP readings"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Measurable Targets</label>
                <input
                  type="text"
                  disabled={isFinalized}
                  value={meTargets}
                  onChange={(e) => setMeTargets(e.target.value)}
                  placeholder="e.g. Sodium < 2000mg, BP < 130/80"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  disabled={isFinalized}
                  value={meFollowUpDate}
                  onChange={(e) => setMeFollowUpDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </main>
  );
};
