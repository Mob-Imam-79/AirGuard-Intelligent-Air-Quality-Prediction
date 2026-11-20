import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

export default function AqiTrendChart({ data = [], height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p className="text-sm font-medium">No AQI history available yet</p>
        <p className="text-xs text-slate-400 mt-1">Make predictions to see historical trend graphs</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const aqi = payload[0].value;
      const category = payload[0].payload.category;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-xs">
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-blue-600 font-bold mt-1 text-sm">
            AQI: {aqi} ({category})
          </p>
          {payload[0].payload.pm25 !== undefined && (
            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
              <p>PM2.5: {payload[0].payload.pm25} µg/m³</p>
              <p>PM10: {payload[0].payload.pm10} µg/m³</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="#16A34A" strokeDasharray="3 3" label={{ value: 'Good', fill: '#16A34A', fontSize: 10 }} />
          <ReferenceLine y={100} stroke="#84CC16" strokeDasharray="3 3" label={{ value: 'Satisfactory', fill: '#84CC16', fontSize: 10 }} />
          <ReferenceLine y={200} stroke="#EAB308" strokeDasharray="3 3" label={{ value: 'Moderate', fill: '#EAB308', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ fill: '#2563EB', r: 3 }}
            activeDot={{ r: 5, fill: '#1E40AF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

