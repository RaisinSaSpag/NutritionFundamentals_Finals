import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Apple, ShieldCheck, User, Stethoscope } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerConsumer, registerProvider } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'CONSUMER' | 'PROVIDER'>('CONSUMER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');

  // Consumer fields
  const [sex, setSex] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState('MODERATE');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string>('');
  const [nutritionGoals, setNutritionGoals] = useState('');
  const [useAsianPacificBmi, setUseAsianPacificBmi] = useState(false);

  // Provider fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [credentials, setCredentials] = useState('RDN, LDN');
  const [bio, setBio] = useState('');

  const toggleCondition = (cond: string) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === 'CONSUMER') {
        const allergyList = allergies
          .split(',')
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean);

        await registerConsumer({
          email,
          password,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          healthProfile: {
            sex,
            heightCm: Number(heightCm),
            weightKg: Number(weightKg),
            activityLevel,
            allergies: allergyList,
            medicalConditions: conditions,
            nutritionGoals,
            useAsianPacificBmi
          }
        });
      } else {
        await registerProvider({
          email,
          password,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          providerProfile: {
            licenseNumber,
            credentials,
            bio,
            specialties: ['Clinical Dietetics', 'Chronic Disease Management']
          }
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Apple className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-xs text-slate-500 mt-1">Select your account role to begin personalized tele-nutrition care</p>
        </div>

        {/* Role toggle tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'CONSUMER'}
            onClick={() => setRole('CONSUMER')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'CONSUMER'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" aria-hidden="true" />
            <span>Consumer (Patient)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'PROVIDER'}
            onClick={() => setRole('PROVIDER')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'PROVIDER'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" aria-hidden="true" />
            <span>Provider (Dietitian)</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password (min 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Consumer specific section */}
          {role === 'CONSUMER' && (
            <div className="pt-3 border-t border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Health & Anthropometric Baseline</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sex</label>
                  <select
                    value={sex}
                    onChange={(e: any) => setSex(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="SEDENTARY">Sedentary (little to no exercise)</option>
                  <option value="LIGHT">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="MODERATE">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="ACTIVE">Active (hard exercise 6-7 days/week)</option>
                  <option value="VERY_ACTIVE">Very Active (very hard physical job / athlete)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diagnosed Medical Conditions</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['DIABETES', 'HYPERTENSION', 'CKD'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        conditions.includes(cond)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cond === 'CKD' ? 'Chronic Kidney Disease (CKD)' : cond}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. peanuts, shellfish, dairy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="asian-pacific-bmi"
                  checked={useAsianPacificBmi}
                  onChange={(e) => setUseAsianPacificBmi(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="asian-pacific-bmi" className="text-slate-700 font-medium cursor-pointer">
                  Apply Asian-Pacific BMI cutoffs (Overweight &ge; 23.0, Obese &ge; 27.5)
                </label>
              </div>
            </div>
          )}

          {/* Provider specific section */}
          {role === 'PROVIDER' && (
            <div className="pt-3 border-t border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Professional Dietitian Credentials</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PRC / Board License Number</label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="PRC-ND-XXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Credentials</label>
                <input
                  type="text"
                  required
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  placeholder="RDN, LDN, MS Clinical Nutrition"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Bio & Specialties</label>
                <textarea
                  required
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief description of clinical experience and specialty areas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : `Complete Registration as ${role === 'CONSUMER' ? 'Patient' : 'Dietitian'}`}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-700 hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
