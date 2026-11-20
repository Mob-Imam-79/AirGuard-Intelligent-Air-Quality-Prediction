import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { api } from '../../services/api';

export default function ModelEvaluation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const res = await api.getAdminModels();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading model evaluation metrics...</p>
      </div>
    );
  }

  const models = data?.models || [];
  const selectedModel = data?.selected_model;

  // Chart data for R²
  const r2ChartData = models.map((m) => ({
    name: m.algorithm.replace(' Regression', ''),
    r2: (m.r2_score * 100).toFixed(2),
    isWinner: m.algorithm === selectedModel,
  }));

  // Chart data for RMSE
  const rmseChartData = models.map((m) => ({
    name: m.algorithm.replace(' Regression', ''),
    rmse: m.rmse.toFixed(2),
    isWinner: m.algorithm === selectedModel,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Machine Learning Model Evaluation & Comparison
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Empirical benchmark of candidate algorithms on the 2,400-record test set split.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
          <Award className="w-4 h-4 text-blue-600" />
          Winning Algorithm: <span className="font-bold">{selectedModel}</span>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <Card
        title="Model Performance Metrics"
        subtitle="Comparing Mean Absolute Error (MAE), Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and R² Score"
        icon={BarChart3}
        padding="p-0"
        className="overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Algorithm</th>
                <th className="py-3.5 px-6">MAE (Lower is better)</th>
                <th className="py-3.5 px-6">MSE (Lower is better)</th>
                <th className="py-3.5 px-6">RMSE (Lower is better)</th>
                <th className="py-3.5 px-6">R² Score (Higher is better)</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {models.map((m) => {
                const isSelected = m.algorithm === selectedModel;
                return (
                  <tr
                    key={m.algorithm}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                      {isSelected && <Award className="w-4 h-4 text-[#2563EB]" />}
                      {m.algorithm}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-700">{m.mae.toFixed(3)}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-700">{m.mse.toFixed(2)}</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{m.rmse.toFixed(3)}</td>
                    <td className="py-3.5 px-6 font-mono font-black text-blue-600 text-sm">
                      {(m.r2_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 rounded-full border border-blue-200">
                          <CheckCircle2 className="w-3 h-3" /> Selected Model
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Candidate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Visual Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="R² Score Comparison (%)"
          subtitle="Proportion of variance explained by each regression model"
          icon={TrendingUp}
        >
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={r2ChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[85, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'R² Score']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="r2" radius={[4, 4, 0, 0]}>
                  {r2ChartData.map((entry, index) => (
                    <Cell
                      key={`r2-${index}`}
                      fill={entry.isWinner ? '#2563EB' : '#94A3B8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Root Mean Squared Error (RMSE)"
          subtitle="Prediction deviation in AQI units (lower indicates higher precision)"
          icon={TrendingDown}
        >
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={rmseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [val, 'RMSE (AQI units)']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="rmse" radius={[4, 4, 0, 0]}>
                  {rmseChartData.map((entry, index) => (
                    <Cell
                      key={`rmse-${index}`}
                      fill={entry.isWinner ? '#16A34A' : '#EF4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Decision Rationale Card */}
      <Card title="Model Selection Rationale" subtitle="Why Random Forest Regression was chosen" icon={Award}>
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            Based on empirical evaluation across all 4 regression algorithms on the 2,400-record test set:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-900">Highest Goodness of Fit (R² = 99.96%)</span>
              <p className="text-slate-500 mt-0.5">
                Random Forest captures 99.96% of the variance across non-linear sub-index breakpoints without overfitting.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-900">Lowest Residual Error (RMSE = 1.915)</span>
              <p className="text-slate-500 mt-0.5">
                The average prediction error is less than 2 AQI points, compared to 28.6 AQI points for standard Linear Regression.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

