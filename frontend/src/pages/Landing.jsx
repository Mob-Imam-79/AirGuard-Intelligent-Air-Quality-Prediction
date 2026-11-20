import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  Shield,
  Activity,
  Cpu,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function Landing() {
  const categories = [
    { name: 'Good', range: '0-50', color: '#16A34A', bg: '#DCFCE7' },
    { name: 'Satisfactory', range: '51-100', color: '#84CC16', bg: '#ECFCCB' },
    { name: 'Moderate', range: '101-200', color: '#EAB308', bg: '#FEF9C3' },
    { name: 'Poor', range: '201-300', color: '#F97316', bg: '#FFEDD5' },
    { name: 'Very Poor', range: '301-400', color: '#DC2626', bg: '#FEE2E2' },
    { name: 'Severe', range: '401-500+', color: '#7F1D1D', bg: '#FFE4E6' },
  ];

  const parameters = [
    { name: 'PM2.5', unit: 'µg/m³', desc: 'Fine respirable particulate matter' },
    { name: 'PM10', unit: 'µg/m³', desc: 'Coarse inhalable dust & aerosols' },
    { name: 'NO₂', unit: 'µg/m³', desc: 'Nitrogen dioxide from combustion' },
    { name: 'SO₂', unit: 'µg/m³', desc: 'Sulfur dioxide from industrial power' },
    { name: 'CO', unit: 'mg/m³', desc: 'Carbon monoxide traffic emissions' },
    { name: 'O₃', unit: 'µg/m³', desc: 'Photochemical ground-level ozone' },
    { name: 'Temperature', unit: '°C', desc: 'Ambient atmospheric thermal level' },
    { name: 'Humidity', unit: '%', desc: 'Relative tropospheric water vapor' },
  ];

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Environmental Analytics SaaS Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#0F172A] tracking-tight leading-tight sm:leading-none">
          Predict Air Quality with <br />
          <span className="text-[#2563EB]">Machine Learning</span> Precision
        </h1>

        <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
          AirGuard transforms atmospheric pollutant concentrations and meteorological parameters into accurate, real-time Air Quality Index predictions and actionable health advisories.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/prediction">
            <Button variant="primary" size="lg" icon={Wind}>
              Launch AQI Prediction
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Explore User Dashboard
            </Button>
          </Link>
        </div>

        {/* Live AQI Standard Spectrum */}
        <div className="pt-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Indian National CPCB Air Quality Index Classification Standard
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="p-3 rounded-xl border text-center transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: cat.bg, borderColor: cat.color }}
              >
                <span className="block text-xs font-bold" style={{ color: cat.color }}>
                  {cat.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                  {cat.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Parameters Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Comprehensive 8-Parameter Environmental Vector
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Calibrated against real CPCB observation stations for maximal predictive accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {parameters.map((p) => (
            <div
              key={p.name}
              className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">{p.name}</span>
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                  {p.unit}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ML Architecture & Workflow */}
      <section className="bg-white border-y border-[#E2E8F0] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              End-to-End Prediction Workflow
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              From raw meteorological inputs to verified health advisories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold mx-auto text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Input Validation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pydantic validation schemas enforce physical concentration bounds across all 8 parameters.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold mx-auto text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">StandardScaler</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Feature vector normalized to match statistical parameters fitted during model training.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold mx-auto text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Random Forest Inference</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                100 decision trees evaluate non-linear synergistic pollutant sub-indices in parallel.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold mx-auto text-lg">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900">Health Advisory & Persistence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mapped to CPCB tiers, actionable guidance delivered, and stored in PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy Showcase Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#1E40AF] rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-800/80 px-2.5 py-1 rounded">
              Verified Experimental Accuracy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              99.96% Variance Explained with Random Forest Regressor
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              AirGuard benchmarked Linear Regression, Decision Tree, Random Forest, and SVR against 12,000 environmental records. Random Forest demonstrated an RMSE of only 1.91 AQI points.
            </p>
            <div className="pt-2">
              <Link to="/features">
                <Button variant="secondary" size="md">
                  Explore Architecture & Specifications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

