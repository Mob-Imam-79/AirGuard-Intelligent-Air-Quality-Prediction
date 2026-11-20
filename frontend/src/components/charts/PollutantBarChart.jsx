import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export default function PollutantBarChart({ data = [], height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p className="text-sm font-medium">No pollutant metrics available</p>
        <p className="text-xs text-slate-400 mt-1">Submit measurements to view pollutant distributions</p>
      </div>
    );
  }

  const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B', '#10B981'];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="pollutant" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
          <Tooltip
            formatter={(value, name, item) => [`${value} ${item.payload.unit || ''}`, 'Average Concentration']}
            contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

