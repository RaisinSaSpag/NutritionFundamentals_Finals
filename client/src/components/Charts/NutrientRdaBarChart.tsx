import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DailyNutritionTotals, RdaTargets } from '../../types';

interface NutrientRdaProps {
  actual: DailyNutritionTotals;
  targets: RdaTargets;
}

export const NutrientRdaBarChart: React.FC<NutrientRdaProps> = ({ actual, targets }) => {
  // Normalize comparison into percentage of daily target met (100% = target met)
  const data = [
    {
      nutrient: 'Protein',
      actual: actual.protein,
      target: targets.proteinGrams,
      unit: 'g',
      pct: Math.min(200, Math.round((actual.protein / (targets.proteinGrams || 1)) * 100)),
      isUpperLimit: false
    },
    {
      nutrient: 'Dietary Fiber',
      actual: actual.fiber,
      target: targets.fiberGrams,
      unit: 'g',
      pct: Math.min(200, Math.round((actual.fiber / (targets.fiberGrams || 1)) * 100)),
      isUpperLimit: false
    },
    {
      nutrient: 'Sodium',
      actual: actual.sodium,
      target: targets.sodiumMaxMg,
      unit: 'mg',
      pct: Math.min(200, Math.round((actual.sodium / (targets.sodiumMaxMg || 1)) * 100)),
      isUpperLimit: true
    },
    {
      nutrient: 'Potassium',
      actual: actual.potassium,
      target: targets.potassiumMg,
      unit: 'mg',
      pct: Math.min(200, Math.round((actual.potassium / (targets.potassiumMg || 1)) * 100)),
      isUpperLimit: false
    }
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="rda-chart-heading">
      <div className="flex justify-between items-center mb-2">
        <h3 id="rda-chart-heading" className="text-base font-semibold text-slate-800">
          Daily Intake vs RDA / DRI Targets
        </h3>
        <span className="text-xs text-slate-500 font-mono">% of Recommended Allowance</span>
      </div>

      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="nutrient" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
            <Tooltip
              formatter={(val: number, _name: string, props: any) => [
                `${props.payload.actual} ${props.payload.unit} (${val}% of target ${props.payload.target} ${props.payload.unit})`,
                'Intake Level'
              ]}
            />
            <Legend verticalAlign="bottom" height={30} />
            <Bar dataKey="pct" name="% of Target Met" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible data table */}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-700">
          <caption className="sr-only">Nutrient actual vs target values</caption>
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="py-1 px-2">Nutrient</th>
              <th scope="col" className="py-1 px-2">Actual Intake</th>
              <th scope="col" className="py-1 px-2">RDA Target</th>
              <th scope="col" className="py-1 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isWarning = row.isUpperLimit ? row.actual > row.target : row.actual < row.target * 0.7;
              return (
                <tr key={row.nutrient} className="border-b border-slate-100">
                  <td className="py-1 px-2 font-medium">{row.nutrient}</td>
                  <td className="py-1 px-2 font-semibold">
                    {row.actual} {row.unit}
                  </td>
                  <td className="py-1 px-2 text-slate-500">
                    {row.target} {row.unit} {row.isUpperLimit ? '(Upper Limit)' : ''}
                  </td>
                  <td className="py-1 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isWarning
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.isUpperLimit
                        ? row.actual > row.target
                          ? 'Exceeds UL'
                          : 'Within Limit'
                        : row.actual >= row.target
                        ? 'Target Met'
                        : `${row.pct}% Met`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
