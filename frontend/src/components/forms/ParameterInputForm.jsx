import React, { useState } from 'react';
import { Wind, Thermometer, Droplets, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

export const PRESETS = [
  {
    name: 'Clean Coastal Air',
    values: { pm25: 14.5, pm10: 28.0, no2: 12.0, so2: 5.0, co: 0.4, o3: 25.0, temperature: 24.0, humidity: 68.0 }
  },
  {
    name: 'Typical City Center',
    values: { pm25: 45.0, pm10: 82.0, no2: 32.0, so2: 14.0, co: 0.8, o3: 42.0, temperature: 28.5, humidity: 55.0 }
  },
  {
    name: 'High Traffic Peak',
    values: { pm25: 95.0, pm10: 175.0, no2: 68.0, so2: 24.0, co: 2.1, o3: 65.0, temperature: 31.0, humidity: 48.0 }
  },
  {
    name: 'Winter Inversion Episode',
    values: { pm25: 220.0, pm10: 340.0, no2: 110.0, so2: 45.0, co: 4.8, o3: 35.0, temperature: 11.0, humidity: 88.0 }
  }
];

export default function ParameterInputForm({ onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    pm25: '42.0',
    pm10: '78.0',
    no2: '18.0',
    so2: '7.0',
    co: '0.6',
    o3: '24.0',
    temperature: '29.0',
    humidity: '56.0',
  });

  const [errors, setErrors] = useState({});

  const fields = [
    { key: 'pm25', label: 'PM2.5', unit: 'µg/m³', min: 0, max: 1000, step: 0.1, hint: 'Fine particulate matter' },
    { key: 'pm10', label: 'PM10', unit: 'µg/m³', min: 0, max: 1500, step: 0.1, hint: 'Coarse particulate matter' },
    { key: 'no2', label: 'NO₂', unit: 'µg/m³', min: 0, max: 500, step: 0.1, hint: 'Nitrogen dioxide' },
    { key: 'so2', label: 'SO₂', unit: 'µg/m³', min: 0, max: 500, step: 0.1, hint: 'Sulfur dioxide' },
    { key: 'co', label: 'CO', unit: 'mg/m³', min: 0, max: 50, step: 0.05, hint: 'Carbon monoxide' },
    { key: 'o3', label: 'O₃', unit: 'µg/m³', min: 0, max: 500, step: 0.1, hint: 'Ground-level ozone' },
    { key: 'temperature', label: 'Temperature', unit: '°C', min: -40, max: 60, step: 0.5, hint: 'Ambient temperature' },
    { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 1, hint: 'Relative humidity' },
  ];

  const validate = () => {
    const errs = {};
    fields.forEach((f) => {
      const val = parseFloat(formData[f.key]);
      if (isNaN(val)) {
        errs[f.key] = 'Required numeric value';
      } else if (val < f.min || val > f.max) {
        errs[f.key] = `Must be between ${f.min} and ${f.max} ${f.unit}`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {};
    Object.keys(formData).forEach((k) => {
      payload[k] = parseFloat(formData[k]);
    });
    onSubmit(payload);
  };

  const applyPreset = (preset) => {
    const formatted = {};
    Object.keys(preset.values).forEach((k) => {
      formatted[k] = String(preset.values[k]);
    });
    setFormData(formatted);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            Quick Environmental Scenarios:
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-2.5 py-1.5 text-xs text-left bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors font-medium text-slate-700 truncate"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((f) => {
          const hasError = !!errors[f.key];
          return (
            <div key={f.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                  {f.label}
                  <span className="text-slate-400 font-normal">({f.unit})</span>
                </label>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step={f.step}
                  name={f.key}
                  value={formData[f.key]}
                  onChange={handleChange}
                  placeholder={`0 - ${f.max}`}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    hasError ? 'border-red-400 bg-red-50/20' : 'border-[#E2E8F0] hover:border-slate-300'
                  }`}
                />
              </div>

              {hasError ? (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors[f.key]}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 truncate">{f.hint}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          icon={Wind}
          className="w-full sm:w-auto px-8"
        >
          {isLoading ? 'Computing Air Quality Prediction...' : 'Generate AQI Prediction'}
        </Button>
      </div>
    </form>
  );
}

