import React, { useEffect, useState } from 'react';
import { Database, FileSpreadsheet, CheckCircle2, Layers, Download } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { api } from '../../services/api';

export default function DatasetManagement() {
  const [datasets, setDatasets] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dsData, prevData] = await Promise.all([
          api.getAdminDatasets(),
          api.getAdminDatasetPreview(25),
        ]);
        setDatasets(dsData);
        setPreview(prevData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeDataset = datasets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Environmental Dataset Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Inspect training and validation datasets according to SRS specification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          CPCB Baseline Dataset Verified
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Dataset Name</span>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {activeDataset?.name || 'CPCB Air Quality Dataset'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Source: {activeDataset?.source || 'CPCB Standard'}</p>
        </Card>

        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Verified Records</span>
          <p className="text-3xl font-extrabold text-[#2563EB] mt-2">
            {activeDataset?.record_count?.toLocaleString() || '12,000'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Samples used for 80/20 train-test split</p>
        </Card>

        <Card padding="p-5">
          <span className="text-xs font-semibold text-slate-500">Feature Dimensions</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">8 + 1</p>
          <p className="text-[11px] text-slate-400 mt-1">8 Environmental inputs + 1 Target AQI</p>
        </Card>
      </div>

      {/* Feature schema list */}
      <Card title="Dataset Schema & Attributes" subtitle="Column definitions and measurement units" icon={Layers}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">1. pm25</span>
            <p className="text-[11px] text-slate-500 mt-0.5">PM2.5 (µg/m³)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">2. pm10</span>
            <p className="text-[11px] text-slate-500 mt-0.5">PM10 (µg/m³)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">3. no2</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Nitrogen dioxide (µg/m³)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">4. so2</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Sulfur dioxide (µg/m³)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">5. co</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Carbon monoxide (mg/m³)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">6. o3</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Ground ozone (µg/m³)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">7. temperature</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Ambient temp (°C)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800">8. humidity</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Relative humidity (%)</p>
          </div>
        </div>
      </Card>

      {/* Dataset Preview Table */}
      <Card
        title="Training Dataset Records Viewer"
        subtitle="Displaying first 25 records from verified CPCB data file"
        padding="p-0"
        className="overflow-hidden"
      >
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading dataset records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">PM2.5</th>
                  <th className="py-3 px-4">PM10</th>
                  <th className="py-3 px-4">NO₂</th>
                  <th className="py-3 px-4">SO₂</th>
                  <th className="py-3 px-4">CO</th>
                  <th className="py-3 px-4">O₃</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Humidity</th>
                  <th className="py-3 px-4 font-bold text-blue-700">Calculated AQI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 font-mono">
                    <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4">{row.pm25}</td>
                    <td className="py-2.5 px-4">{row.pm10}</td>
                    <td className="py-2.5 px-4">{row.no2}</td>
                    <td className="py-2.5 px-4">{row.so2}</td>
                    <td className="py-2.5 px-4">{row.co}</td>
                    <td className="py-2.5 px-4">{row.o3}</td>
                    <td className="py-2.5 px-4">{row.temperature}°C</td>
                    <td className="py-2.5 px-4">{row.humidity}%</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 bg-blue-50/40">
                      {row.aqi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

