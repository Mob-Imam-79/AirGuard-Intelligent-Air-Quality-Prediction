import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AQI_CATEGORIES } from '../../utils/aqiStandards';

export default function CategoryPieChart({ data = {}, height = 280 }) {
  const chartData = Object.keys(AQI_CATEGORIES).map((cat) => ({
    name: cat,
    value: data[cat] || 0,
    color: AQI_CATEGORIES[cat].color,
  })).filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p className="text-sm font-medium">No category breakdown available</p>
        <p className="text-xs text-slate-400 mt-1">Predictions will be classified and aggregated here</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} predictions`, name]}
            contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

