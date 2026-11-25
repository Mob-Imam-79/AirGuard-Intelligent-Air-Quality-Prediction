import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  Activity,
  History,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import AqiTrendChart from '../components/charts/AqiTrendChart';
import PollutantBarChart from '../components/charts/PollutantBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCategoryInfo } from '../utils/aqiStandards';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [pollutants, setPollutants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [sumData, polData] = await Promise.all([
          api.getDashboardSummary(),
          api.getPollutantAverages(),
        ]);
        setSummary(sumData);
        setPollutants(polData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading environmental intelligence...</p>
        </div>
      </div>
    );
  }

  const latest = summary?.latest_prediction;
  const categoryInfo = latest ? getCategoryInfo(latest.category) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Environmental Intelligence Dashboard
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Real-time air quality monitoring & predictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/prediction">
            <Button variant="primary" icon={Wind}>
              New AQI Prediction
            </Button>
          </Link>
        </div>
      </div>

      {/* Error alert if backend request failed */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to Load Dashboard Intelligence</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Prominent Latest AQI / Highlight Section */}
      {latest ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: AQI Value & Badge */}
            <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Latest AQI Prediction
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(latest.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-baseline gap-4 my-2">
                <span className="text-5xl font-black tracking-tight" style={{ color: categoryInfo.color }}>
                  {latest.predicted_aqi.toFixed(1)}
                </span>
                <Badge category={latest.category} size="lg" showRange={true} />
              </div>

              {/* Progress gauge bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 my-3 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (latest.predicted_aqi / 400) * 100)}%`,
                    backgroundColor: categoryInfo.color,
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Measured scale: 0 (Pure) to 500 (Severe). Current condition: <b>{latest.category}</b>
              </p>
            </div>

            {/* Right: Health Advisory & Environmental Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: categoryInfo.bgLight, border: `1px solid ${categoryInfo.borderColor}` }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: categoryInfo.color }} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: categoryInfo.textColor }}>
                      Actionable Health Advisory
                    </h4>
                    <p className="text-xs mt-1 text-slate-800 leading-relaxed font-medium">
                      {latest.health_recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pollutants mini grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">PM2.5</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{latest.pm25}</p>
                  <p className="text-[9px] text-slate-400">µg/m³</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">PM10</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{latest.pm10}</p>
                  <p className="text-[9px] text-slate-400">µg/m³</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">NO₂</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{latest.no2}</p>
                  <p className="text-[9px] text-slate-400">µg/m³</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">SO₂</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{latest.so2}</p>
                  <p className="text-[9px] text-slate-400">µg/m³</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Temp</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{latest.temperature}°C</p>
                  <p className="text-[9px] text-slate-400">Ambient</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Humidity</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{latest.humidity}%</p>
                  <p className="text-[9px] text-slate-400">Relative</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="text-center py-10">
          <Wind className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-slate-800">No AQI predictions yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Submit your first set of environmental parameters to calculate AQI using the trained Machine Learning regression pipeline.
          </p>
          <Link to="/prediction">
            <Button variant="primary" icon={Wind}>
              Launch First Prediction
            </Button>
          </Link>
        </Card>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Predictions</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <History className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.total_predictions || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Recorded in your profile</p>
        </Card>

        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Historical AQI</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.average_aqi || '0.0'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all logged sessions</p>
        </Card>

        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ML Model in Production</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2 truncate">Random Forest</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">R² 0.9996 • RMSE 1.91</p>
        </Card>

        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Standard Classification</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">CPCB 6-Tier</p>
          <p className="text-[11px] text-slate-400 mt-1">National Air Quality Index</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card
            title="AQI Trend Analysis"
            subtitle="Chronological AQI progression with environmental thresholds"
            action={
              <Link to="/analytics" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                Full Analytics <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            <AqiTrendChart data={summary?.recent_trends || []} height={280} />
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card
            title="AQI Distribution"
            subtitle="Categorical breakdown of your records"
          >
            <CategoryPieChart data={summary?.category_counts || {}} height={280} />
          </Card>
        </div>
      </div>

      {/* Bottom Pollutants Bar Chart */}
      <Card
        title="Average Pollutant Concentrations"
        subtitle="Comparing concentration values across all recorded environmental inputs"
      >
        <PollutantBarChart data={pollutants} height={260} />
      </Card>
    </div>
  );
}

