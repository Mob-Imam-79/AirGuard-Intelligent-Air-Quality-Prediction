import React, { useEffect, useState } from 'react';
import {
  Activity,
  TrendingUp,
  Droplets,
  Thermometer,
  PieChart,
  BarChart,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import Card from '../components/common/Card';
import AqiTrendChart from '../components/charts/AqiTrendChart';
import PollutantBarChart from '../components/charts/PollutantBarChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import { api } from '../services/api';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [pollutants, setPollutants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sumData, polData] = await Promise.all([
          api.getDashboardSummary(),
          api.getPollutantAverages(),
        ]);
        setSummary(sumData);
        setPollutants(polData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Aggregating historical environmental analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0]">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Environmental Analytics & Trends
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Deep-dive analysis of atmospheric pollutants, meteorological correlations, and air quality categories.
        </p>
      </div>

      {/* Top Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Total Observations</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.total_predictions || 0}</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 inline-flex items-center">
            User Verified Records
          </span>
        </Card>

        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Historical Average AQI</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.average_aqi || '0.0'}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Baseline air quality index</span>
        </Card>

        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Primary Driving Pollutant</span>
          <p className="text-xl font-bold text-slate-900 mt-2">PM2.5 & PM10</p>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Highest sub-index weight</span>
        </Card>

        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Model Precision</span>
          <p className="text-xl font-bold text-emerald-600 mt-2">R² 0.9996</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Random Forest Regressor</span>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card
            title="Chronological Air Quality Index Progression"
            subtitle="AQI variability plotted against Indian National CPCB standard thresholds"
            icon={TrendingUp}
          >
            <AqiTrendChart data={summary?.recent_trends || []} height={320} />
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card
            title="AQI Category Composition"
            subtitle="Proportional frequency of classified levels"
            icon={PieChart}
          >
            <CategoryPieChart data={summary?.category_counts || {}} height={320} />
          </Card>
        </div>
      </div>

      {/* Pollutants Bar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card
            title="Average Pollutant Levels"
            subtitle="Mean concentration values across environmental parameters"
            icon={BarChart}
          >
            <PollutantBarChart data={pollutants} height={280} />
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card
            title="Environmental Impact Breakdown"
            subtitle="Scientific context and health implications"
            icon={Layers}
          >
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">Particulate Matter (PM2.5 & PM10)</span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Fine particles penetrate deep into the respiratory tract and bloodstream. Usually the dominant driver of elevated AQI during dry or winter conditions.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">Gaseous Pollutants (NO₂, SO₂, CO, O₃)</span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Vehicular traffic and industrial emissions produce oxides and carbon monoxide. Ground-level ozone increases with high temperature and solar radiation.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">Meteorological Interplay</span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Low temperatures and high humidity reduce planetary boundary layer height, preventing vertical dispersion of emissions and causing smog buildup.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

