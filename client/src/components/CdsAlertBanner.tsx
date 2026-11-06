import React from 'react';
import { CdsAlert } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface CdsAlertBannerProps {
  alerts: CdsAlert[];
}

export const CdsAlertBanner: React.FC<CdsAlertBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Optimal Nutrition Status</p>
          <p className="text-xs text-emerald-700">No active Clinical Decision Support (CDS) alerts detected for recent intake.</p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (sev: CdsAlert['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-900',
          badge: 'bg-rose-600 text-white',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" aria-hidden="true" />
        };
      case 'ALERT':
        return {
          bg: 'bg-orange-50 border-orange-300 text-orange-900',
          badge: 'bg-orange-600 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" aria-hidden="true" />
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
        };
      case 'FLAG':
        return {
          bg: 'bg-indigo-50 border-indigo-300 text-indigo-900',
          badge: 'bg-indigo-600 text-white',
          icon: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" aria-hidden="true" />
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-sky-50 border-sky-300 text-sky-900',
          badge: 'bg-sky-600 text-white',
          icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" aria-hidden="true" />
        };
    }
  };

  return (
    <div className="space-y-2.5" role="region" aria-label="Clinical Decision Support Alerts">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" aria-hidden="true" />
          Active Clinical Decision Support Alerts ({alerts.length})
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Automated Evidence-Based Rules</span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, idx) => {
          const style = getSeverityStyle(alert.severity);
          return (
            <div
              key={`${alert.ruleId}-${idx}`}
              className={`p-3.5 rounded-lg border flex items-start space-x-3 text-sm transition-all shadow-sm ${style.bg}`}
              role="alert"
              aria-live="polite"
            >
              {style.icon}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${style.badge}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-600">
                    {alert.ruleId}
                  </span>
                </div>
                <p className="font-medium text-slate-800 text-xs sm:text-sm leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
