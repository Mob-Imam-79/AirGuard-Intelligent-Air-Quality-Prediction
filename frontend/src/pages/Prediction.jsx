import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  CheckCircle2,
  FileDown,
  Sparkles,
  AlertCircle,
  Thermometer,
  Droplets,
  Layers,
  Cpu,
  BarChart2
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ParameterInputForm from '../components/forms/ParameterInputForm';
import { api } from '../services/api';
import { getCategoryInfo } from '../utils/aqiStandards';

export default function Prediction() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('random_forest'); // 'random_forest', 'linear_regression', 'ann'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePredict = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (selectedAlgorithm === 'linear_regression') {
        res = await api.predictLinearRegression(payload);
      } else if (selectedAlgorithm === 'ann') {
        res = await api.predictAnn(payload);
      } else {
        res = await api.predictRandomForest(payload);
      }
      setPredictionResult(res);
      // Scroll to result smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await api.exportPdf();
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const categoryInfo = predictionResult ? getCategoryInfo(predictionResult.category) : null;
  const env = predictionResult?.environmental_data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            AQI Prediction & Real-Time Inference
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Input environmental parameters to calculate the Air Quality Index using the trained Scikit-Learn regression model.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/model-comparison"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Compare All 3 Models
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Selected: <span className="font-semibold text-slate-800">
              {selectedAlgorithm === 'linear_regression'
                ? 'Linear Regression'
                : selectedAlgorithm === 'ann'
                ? 'Artificial Neural Network'
                : 'Random Forest (Ensemble)'}
            </span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Prediction Error</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Result Section (Prominent when available) */}
      {predictionResult && categoryInfo && (
        <div
          className="bg-white border rounded-xl shadow-md p-6 sm:p-8 space-y-6 animate-fadeIn transition-all"
          style={{ borderColor: categoryInfo.borderColor }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prediction Output Generated
              </span>
              <div className="flex items-baseline gap-4 mt-2">
                <span
                  className="text-6xl font-black tracking-tight"
                  style={{ color: categoryInfo.color }}
                >
                  {predictionResult.predicted_aqi.toFixed(1)}
                </span>
                <div>
                  <Badge category={predictionResult.category} size="lg" showRange={true} />
                  <p className="text-xs text-slate-500 mt-1">
                    Air Quality Index (CPCB Standard)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={FileDown}
                onClick={handleDownloadPdf}
                isLoading={downloadingPdf}
              >
                Download Official PDF Report
              </Button>
            </div>
          </div>

          {/* Progress gauge bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>0 (Good)</span>
              <span>100 (Satisfactory)</span>
              <span>200 (Moderate)</span>
              <span>300 (Poor)</span>
              <span>400 (Very Poor)</span>
              <span>500 (Severe)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, (predictionResult.predicted_aqi / 500) * 100)}%`,
                  backgroundColor: categoryInfo.color,
                }}
              />
            </div>
          </div>

          {/* Health Recommendation Card */}
          <div
            className="p-5 rounded-xl flex items-start gap-3.5"
            style={{
              backgroundColor: categoryInfo.bgLight,
              border: `1px solid ${categoryInfo.borderColor}`,
            }}
          >
            <CheckCircle2
              className="w-6 h-6 shrink-0 mt-0.5"
              style={{ color: categoryInfo.color }}
            />
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: categoryInfo.textColor }}
              >
                Category Classification: {predictionResult.category} — Health Advisory
              </h4>
              <p className="text-sm mt-1 text-slate-800 leading-relaxed font-medium">
                {predictionResult.health_recommendation}
              </p>
            </div>
          </div>

          {/* Input Parameters Summary */}
          {env && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Input Environmental Vector Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">PM2.5</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.pm25}</p>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">PM10</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.pm10}</p>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">NO₂</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.no2}</p>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SO₂</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.so2}</p>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">CO</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.co}</p>
                  <span className="text-[9px] text-slate-400">mg/m³</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">O₃</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.o3}</p>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Temp</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.temperature}°C</p>
                  <span className="text-[9px] text-slate-400">Ambient</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">{env.humidity}%</p>
                  <span className="text-[9px] text-slate-400">Relative</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Model Used: <b>{predictionResult.model_used}</b></span>
            <span>Record ID: #{predictionResult.id} • Saved to Database</span>
          </div>
        </div>
      )}

      {/* Algorithm Selection Bar */}
      <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Algorithm:</span>
          <button
            type="button"
            onClick={() => setSelectedAlgorithm('random_forest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedAlgorithm === 'random_forest'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Random Forest (R² 99.96%)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAlgorithm('ann')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedAlgorithm === 'ann'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Neural Network (ANN)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAlgorithm('linear_regression')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedAlgorithm === 'linear_regression'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Linear Regression
          </button>
        </div>

        <Link
          to="/model-comparison"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Compare All 3 Side-by-Side &rarr;
        </Link>
      </div>

      {/* Environmental Input Form Card */}
      <Card
        title="Environmental Measurement Form"
        subtitle="Enter 8 standard environmental and meteorological parameters"
        icon={Layers}
      >
        <ParameterInputForm onSubmit={handlePredict} isLoading={loading} />
      </Card>
    </div>
  );
}

