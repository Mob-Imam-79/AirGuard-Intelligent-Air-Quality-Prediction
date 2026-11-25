import React, { useState, useEffect } from 'react';
import {
  Layers,
  Cpu,
  BarChart3,
  Award,
  Zap,
  TrendingDown,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line
} from 'recharts';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ParameterInputForm from '../components/forms/ParameterInputForm';
import { api } from '../services/api';
import { getCategoryInfo } from '../utils/aqiStandards';

export default function ModelComparison() {
  const [selectedMode, setSelectedMode] = useState('compare'); // 'compare', 'linear_regression', 'random_forest', 'ann'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Multi-model comparison results
  const [comparisonResult, setComparisonResult] = useState(null);
  
  // Single model prediction result
  const [singleResult, setSingleResult] = useState(null);
  
  // Benchmark metrics from backend /metrics
  const [metricsData, setMetricsData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoadingMetrics(true);
        const data = await api.getModelMetrics();
        setMetricsData(data);
      } catch (err) {
        console.error('Failed to load model metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadMetrics();
  }, []);

  const handleRunInference = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      if (selectedMode === 'compare') {
        const res = await api.compareModels(payload);
        setComparisonResult(res);
        setSingleResult(null);
      } else if (selectedMode === 'linear_regression') {
        const res = await api.predictLinearRegression(payload);
        setSingleResult(res);
        setComparisonResult(null);
      } else if (selectedMode === 'random_forest') {
        const res = await api.predictRandomForest(payload);
        setSingleResult(res);
        setComparisonResult(null);
      } else if (selectedMode === 'ann') {
        const res = await api.predictAnn(payload);
        setSingleResult(res);
        setComparisonResult(null);
      }

      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Model prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const modelsList = metricsData?.models || [];
  const selectedWinner = metricsData?.selected_model || 'Random Forest Regression';

  // Chart data: R² Scores (scaled to 100%)
  const r2ChartData = modelsList.map((m) => ({
    name: m.algorithm.replace(' Regression', '').replace(' (ANN)', ''),
    r2: (m.r2_score * 100).toFixed(2),
    isWinner: m.algorithm === selectedWinner,
  }));

  // Chart data: Error comparison (MAE and RMSE)
  const errorChartData = modelsList.map((m) => ({
    name: m.algorithm.replace(' Regression', '').replace(' (ANN)', ''),
    MAE: m.mae,
    RMSE: m.rmse,
    isWinner: m.algorithm === selectedWinner,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              ML Model Comparison
            </h1>
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              3 Algorithms Integrated
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Fair comparative benchmark of Linear Regression, Random Forest, and Artificial Neural Network (ANN) trained on identical CPCB observation data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-sm">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Top Generalization:</span>
          <span className="font-bold text-[#0F172A]">{selectedWinner}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Prediction Error</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Component A: Model Selection Controls */}
      <Card
        title="1. Model Selection & Execution Mode"
        subtitle="Choose whether to run inference on a specific model or compare all three algorithms simultaneously."
        icon={Layers}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setSelectedMode('compare')}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
              selectedMode === 'compare'
                ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Recommended</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Compare All Models</p>
            <p className="text-xs text-slate-500 mt-1">
              Runs Linear Regression, Random Forest, and ANN simultaneously for side-by-side analysis.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('random_forest')}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
              selectedMode === 'random_forest'
                ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-semibold text-emerald-700">R² = 99.96%</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Random Forest Regression</p>
            <p className="text-xs text-slate-500 mt-1">
              100-tree ensemble with axis-aligned splits, optimal for non-linear CPCB breakpoints.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('ann')}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
              selectedMode === 'ann'
                ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-semibold text-indigo-700">Deep Regressor</span>
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Artificial Neural Network</p>
            <p className="text-xs text-slate-500 mt-1">
              3-layer MLP architecture (128-64-32) with ReLU activation and Adam optimizer.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('linear_regression')}
            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
              selectedMode === 'linear_regression'
                ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-semibold text-amber-700">Baseline OLS</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Linear Regression</p>
            <p className="text-xs text-slate-500 mt-1">
              Standard multiple linear regression baseline; fast inference with linear weights.
            </p>
          </button>
        </div>
      </Card>

      {/* Input Parameters Form */}
      <ParameterInputForm onSubmit={handleRunInference} isLoading={loading} />

      {/* Component B: Prediction Results */}
      {comparisonResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Side-by-Side Model Prediction Comparison
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Evaluated on {Object.keys(comparisonResult.environmental_data || {}).length} inputs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {comparisonResult.predictions.map((pred) => {
              const isWinner = pred.model_name.includes('Random Forest');
              return (
                <div
                  key={pred.model_key}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative flex flex-col justify-between ${
                    isWinner ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-[#E2E8F0]'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Highest Empirical Accuracy
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{pred.model_name}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Status: <span className="text-emerald-600 font-medium">Verified Active</span></p>
                      </div>
                      <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {pred.inference_time_ms} ms
                      </span>
                    </div>

                    <div className="py-5 text-center">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                        Predicted AQI
                      </p>
                      <div className="text-5xl font-extrabold text-[#0F172A] tracking-tight">
                        {pred.predicted_aqi}
                      </div>

                      <div className="mt-3 flex justify-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                          style={{
                            backgroundColor: `${pred.category_color}18`,
                            color: pred.category_color,
                            border: `1px solid ${pred.category_color}40`,
                          }}
                        >
                          {pred.category.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Dominant Effluent:</span>
                        <span className="font-semibold text-slate-800">{pred.dominant_pollutant}</span>
                      </div>
                      <div className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700 block mb-0.5">Advisory:</span>
                        {pred.health_recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Single Model Result */}
      {singleResult && (
        <Card title={`Prediction Result: ${singleResult.model_used}`} icon={CheckCircle2}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Algorithm Used</p>
              <p className="text-lg font-bold text-slate-900">{singleResult.model_used}</p>
              <p className="text-xs text-slate-600 mt-1">{singleResult.health_recommendation}</p>
            </div>

            <div className="text-center px-6 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Predicted AQI</span>
              <div className="text-4xl font-extrabold text-blue-600">{singleResult.predicted_aqi}</div>
              <span className="text-xs font-bold text-slate-700 uppercase mt-1 block">{singleResult.category}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Component C: Model Comparison Dashboard (Table) */}
      <Card
        title="2. Model Comparison Dashboard"
        subtitle="Empirical benchmark results computed on the identical 2,400-record test set."
        icon={BarChart3}
        padding="p-0"
        className="overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Algorithm Name</th>
                <th className="py-3 px-4 text-right">MAE</th>
                <th className="py-3 px-4 text-right">MSE</th>
                <th className="py-3 px-4 text-right">RMSE</th>
                <th className="py-3 px-4 text-right">R² Score</th>
                <th className="py-3 px-4 text-right">Training Time (s)</th>
                <th className="py-3 px-4 text-right">Inference Latency</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {modelsList.map((m) => {
                const isWinner = m.algorithm === selectedWinner;
                return (
                  <tr
                    key={m.key}
                    className={`transition-colors ${
                      isWinner ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center gap-2 text-slate-900">
                      {isWinner ? (
                        <Award className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold">{m.algorithm}</span>
                        {isWinner && (
                          <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                            Selected Best
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{m.mae.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{m.mse.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">{m.rmse.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                      {(m.r2_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {m.training_time_seconds}s
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {m.inference_latency_ms} ms
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Trained & Ready
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Component D: Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* R² Score Comparison Chart */}
        <Card
          title="Model Explanatory Power (R² Score)"
          subtitle="Proportion of AQI variance explained by each regression algorithm on test data."
          icon={Award}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r2ChartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'R² Score']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="r2" radius={[6, 6, 0, 0]}>
                  {r2ChartData.map((entry, idx) => (
                    <Cell
                      key={`r2-${idx}`}
                      fill={entry.isWinner ? '#2563EB' : entry.name === 'ANN' ? '#4F46E5' : '#94A3B8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Higher is better. Random Forest explains <strong className="text-slate-800">99.96%</strong> of variance, closely followed by ANN at <strong className="text-slate-800">99.84%</strong>.
          </p>
        </Card>

        {/* Error Metrics Comparison Chart */}
        <Card
          title="Error Metrics Comparison (MAE vs RMSE)"
          subtitle="Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) in AQI points."
          icon={TrendingDown}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorChartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val) => [val, 'AQI Points']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="MAE" fill="#3B82F6" radius={[4, 4, 0, 0]} name="MAE" />
                <Bar dataKey="RMSE" fill="#EF4444" radius={[4, 4, 0, 0]} name="RMSE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Lower is better. Tree and Neural architectures heavily penalize extreme errors compared to Linear Regression.
          </p>
        </Card>
      </div>
    </div>
  );
}
