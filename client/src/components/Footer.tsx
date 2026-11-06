import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 px-4 border-t border-slate-800" role="contentinfo">
      <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-left sm:flex sm:justify-between sm:items-center">
        <div>
          <p className="font-semibold text-white">Tele-nutrition & Digital Health Platform</p>
          <p className="text-xs text-slate-400">
            Health Informatics Final School Project MVP &bull; eNCPT ADIME Charting &bull; Virtual MNT
          </p>
        </div>

        <div className="max-w-md bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs text-amber-300 flex items-start space-x-2 text-left">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Disclaimer:</strong> For educational purposes only. Not a substitute for professional medical advice, diagnosis, or clinical judgment.
          </span>
        </div>
      </div>
    </footer>
  );
};
