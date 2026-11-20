import React, { useState } from 'react';
import { Sliders, Shield, Database, Save, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    apiRateLimit: '100',
    predictionCacheTtl: '300',
    enablePublicRegistration: true,
    alertNotificationThreshold: '200',
    modelInferenceTimeout: '5',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0]">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          System Configuration & Admin Settings
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Global platform parameters, ML inference timeouts, and rate limits.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          System configuration settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Runtime & Performance Controls" subtitle="API and prediction worker thresholds" icon={Sliders}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                API Rate Limit (Requests / minute)
              </label>
              <input
                type="number"
                name="apiRateLimit"
                value={config.apiRateLimit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Model Inference Timeout (seconds)
              </label>
              <input
                type="number"
                name="modelInferenceTimeout"
                value={config.modelInferenceTimeout}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Severe Pollution Warning Threshold (AQI)
              </label>
              <input
                type="number"
                name="alertNotificationThreshold"
                value={config.alertNotificationThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enablePublicRegistration"
                  checked={config.enablePublicRegistration}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">Allow Public User Registrations</span>
              </label>
            </div>
          </div>
        </Card>

        <Card title="Database & Security Policies" subtitle="PostgreSQL and JWT policies" icon={Shield}>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">JWT Token Lifetime</p>
                <p className="text-[11px] text-slate-400">Configured to 24 hours with HS256 HMAC encryption</p>
              </div>
              <span className="font-mono text-slate-700 font-semibold">1440 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Database Connection Pool</p>
                <p className="text-[11px] text-slate-400">Pre-ping health check enabled with automatic rollback</p>
              </div>
              <span className="font-mono text-slate-700 font-semibold">Active</span>
            </div>
          </div>
        </Card>

        <div className="text-right">
          <Button type="submit" variant="primary" icon={Save}>
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

