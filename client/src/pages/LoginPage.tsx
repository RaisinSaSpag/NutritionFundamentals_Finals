import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Apple, Lock, Mail, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Apple className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tele-Nutrition Platform</h1>
          <p className="mt-1 text-xs text-slate-500">Sign in to access your digital nutrition care and telehealth sessions</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs" role="alert">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Logins */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" aria-hidden="true" />
            Quick Demo Accounts (1-Click Autofill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('dietitian@telenutrition.demo')}
              className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md text-emerald-900 font-medium"
            >
              👩‍⚕️ <strong>Dietitian (RDN)</strong>
              <span className="block text-[10px] text-emerald-700">Maria Santos, RDN</span>
            </button>
            <button
              type="button"
              onClick={() => autofill('juan.diabetes@telenutrition.demo')}
              className="p-2 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-blue-900 font-medium"
            >
              👤 <strong>Diabetic Patient</strong>
              <span className="block text-[10px] text-blue-700">Juan Dela Cruz</span>
            </button>
            <button
              type="button"
              onClick={() => autofill('clara.hypertension@telenutrition.demo')}
              className="p-2 text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md text-amber-900 font-medium"
            >
              👤 <strong>Renal Patient</strong>
              <span className="block text-[10px] text-amber-700">Clara (CKD/HTN)</span>
            </button>
            <button
              type="button"
              onClick={() => autofill('alex.healthy@telenutrition.demo')}
              className="p-2 text-left bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md text-slate-900 font-medium"
            >
              👤 <strong>Active Patient</strong>
              <span className="block text-[10px] text-slate-600">Alex Tan</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 pt-2">
          New user?{' '}
          <Link to="/register" className="text-emerald-700 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
