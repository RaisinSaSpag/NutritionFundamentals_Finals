import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 px-4 border-t border-slate-800" role="contentinfo">
      <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left sm:flex sm:justify-between sm:items-center">
        <div>
          <p className="font-semibold text-white">Tele-Nutrition Clinical Workstation & Digital Health Platform</p>
          <p className="text-xs text-slate-400">
            Standardized eNCPT ADIME Clinical Documentation &bull; Virtual Medical Nutrition Therapy (MNT)
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            &copy; {new Date().getFullYear()} Tele-Nutrition Health Systems. All rights reserved.
          </p>
        </div>

        <div className="max-w-md bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-start space-x-2 text-left">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" aria-hidden="true" />
          <span className="text-[11px] leading-relaxed">
            <strong>Clinical & Data Protection Standards:</strong> Protected Health Information (PHI) is processed in accordance with HIPAA & HITECH security rules. Authorized clinical personnel and enrolled patients only.
          </span>
        </div>
      </div>
    </footer>
  );
};
