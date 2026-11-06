import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MacroDonutChartProps {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

// Color-blind safe palette (Blue, Emerald, Amber)
const COLORS = ['#10b981', '#0284c7', '#f59e0b'];

export const MacroDonutChart: React.FC<MacroDonutChartProps> = ({
  proteinGrams,
  carbsGrams,
  fatGrams,
  proteinPct,
  carbsPct,
  fatPct
}) => {
  const data = [
    { name: 'Protein (10-35% AMDR)', value: proteinPct, grams: proteinGrams },
    { name: 'Carbohydrates (45-65% AMDR)', value: carbsPct, grams: carbsGrams },
    { name: 'Fat (20-35% AMDR)', value: fatPct, grams: fatGrams }
  ];

  const totalGrams = proteinGrams + carbsGrams + fatGrams;

  if (totalGrams === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500">
        <p className="text-sm font-medium">No macronutrient data logged for this date.</p>
        <p className="text-xs text-slate-400 mt-1">Log meals above to view AMDR breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="macro-chart-heading">
      <div className="flex justify-between items-center mb-2">
        <h3 id="macro-chart-heading" className="text-base font-semibold text-slate-800">
          Macronutrient Energy Distribution
        </h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">AMDR Standards</span>
      </div>

      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number, _name: string, props: any) => [
                `${val}% (${props.payload.grams}g)`,
                'Energy Contribution'
              ]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible data table for screen readers and text alternative */}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-700">
          <caption className="sr-only">Macronutrient percentage and grams table</caption>
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th scope="col" className="py-1 px-2">Nutrient</th>
              <th scope="col" className="py-1 px-2">Intake (g)</th>
              <th scope="col" className="py-1 px-2">% Energy</th>
              <th scope="col" className="py-1 px-2">AMDR Range</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-1 px-2 font-medium flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" aria-hidden="true" />
                Protein
              </td>
              <td className="py-1 px-2">{proteinGrams}g</td>
              <td className="py-1 px-2 font-semibold">{proteinPct}%</td>
              <td className="py-1 px-2 text-slate-500">10 - 35%</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-1 px-2 font-medium flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 mr-1.5" aria-hidden="true" />
                Carbohydrates
              </td>
              <td className="py-1 px-2">{carbsGrams}g</td>
              <td className="py-1 px-2 font-semibold">{carbsPct}%</td>
              <td className="py-1 px-2 text-slate-500">45 - 65%</td>
            </tr>
            <tr>
              <td className="py-1 px-2 font-medium flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" aria-hidden="true" />
                Dietary Fat
              </td>
              <td className="py-1 px-2">{fatGrams}g</td>
              <td className="py-1 px-2 font-semibold">{fatPct}%</td>
              <td className="py-1 px-2 text-slate-500">20 - 35%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
