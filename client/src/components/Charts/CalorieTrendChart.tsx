import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';

interface CalorieTrendProps {
  trendData: Array<{
    date: string;
    calories: number;
    targetCalories: number;
  }>;
  targetTee: number;
}

export const CalorieTrendChart: React.FC<CalorieTrendProps> = ({ trendData, targetTee }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="calorie-trend-heading">
      <div className="flex justify-between items-center mb-2">
        <h3 id="calorie-trend-heading" className="text-base font-semibold text-slate-800">
          7-Day Energy Intake vs Target TEE
        </h3>
        <span className="text-xs text-slate-500 font-mono">Target: {targetTee} kcal/day</span>
      </div>

      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => d.substring(5)}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(val: number) => [`${val} kcal`, 'Energy']}
              labelFormatter={(l: string) => `Date: ${l}`}
            />
            <Legend verticalAlign="bottom" height={30} />
            <ReferenceLine
              y={targetTee}
              stroke="#059669"
              strokeDasharray="4 4"
              label={{ value: 'Target TEE', fill: '#059669', fontSize: 10, position: 'top' }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              name="Logged Calories"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0284c7' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-2 text-xs text-slate-500">
        <summary className="cursor-pointer font-medium hover:text-slate-700">View 7-day raw calorie numbers</summary>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
          {trendData.map((d) => (
            <div key={d.date} className="bg-slate-50 p-1.5 rounded">
              <p className="text-slate-400 font-mono text-[10px]">{d.date.substring(5)}</p>
              <p className="font-semibold text-slate-800">{d.calories}</p>
              <p className="text-[10px] text-slate-500">kcal</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};
