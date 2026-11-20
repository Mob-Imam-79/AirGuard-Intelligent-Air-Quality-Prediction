import React, { useEffect, useState } from 'react';
import { Eye, RefreshCw, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { api } from '../../services/api';

export default function PredictionMonitoring() {
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMonitoring = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPredictions({ page, limit: 15 });
      setPredictions(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            System Prediction Monitoring
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Real-time multi-user prediction stream and model inference audit log.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMonitoring}
          className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stream
        </button>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading prediction stream...</div>
        ) : predictions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No predictions logged across the system yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Predicted AQI</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">PM2.5</th>
                  <th className="py-3 px-4">PM10</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Model Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500">#{p.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.user_name}</p>
                      <p className="text-[11px] text-slate-400">{p.user_email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {p.predicted_aqi.toFixed(1)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge category={p.category} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-700">{p.pm25} µg/m³</td>
                    <td className="py-3 px-4 text-slate-700">{p.pm10} µg/m³</td>
                    <td className="py-3 px-4 text-slate-700">{p.temperature}°C</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{p.model_used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {pages} ({total} predictions)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded border border-[#E2E8F0] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded border border-[#E2E8F0] hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

