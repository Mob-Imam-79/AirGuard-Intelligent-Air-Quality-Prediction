import React, { useState } from 'react';
import {
  Wind,
  CheckCircle2,
  FileDown,
  Sparkles,
  AlertCircle,
  Thermometer,
  Droplets,
  Layers
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ParameterInputForm from '../components/forms/ParameterInputForm';
import { api } from '../services/api';
import { getCategoryInfo } from '../utils/aqiStandards';

export default function Prediction() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePredict = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictAqi(payload);
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

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Model: <span className="font-semibold text-slate-800">Random Forest (v1.0)</span>
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

