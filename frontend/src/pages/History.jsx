import React, { useEffect, useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  FileDown,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { api } from '../services/api';
import { getCategoryInfo } from '../utils/aqiStandards';

export default function History() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (categoryFilter !== 'All') {
        params.category = categoryFilter;
      }
      const data = await api.getHistory(params);
      setHistory(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, categoryFilter]);

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete prediction record #${id}?`)) {
      try {
        await api.deletePrediction(id);
        fetchHistory();
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      await api.exportCsv();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await api.exportPdf();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Prediction History
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Historical log of all environmental parameter predictions and model outputs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={FileDown}
            onClick={handleExportCsv}
            isLoading={exportingCsv}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileDown}
            onClick={handleExportPdf}
            isLoading={exportingPdf}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card padding="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filter by Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="All">All Categories ({total})</option>
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
              <option value="Moderate">Moderate</option>
              <option value="Poor">Poor</option>
              <option value="Very Poor">Very Poor</option>
              <option value="Severe">Severe</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading prediction records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <HistoryIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-700">No predictions found</p>
            <p className="text-xs text-slate-400 mt-1">
              {categoryFilter !== 'All' ? 'Try clearing your category filter' : 'Submit your first prediction in the AQI Predictor'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Predicted AQI</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">PM2.5</th>
                  <th className="py-3 px-4">PM10</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Humidity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">#{record.id}</td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {record.predicted_aqi.toFixed(1)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge category={record.category} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-700">{record.pm25} µg/m³</td>
                    <td className="py-3 px-4 text-slate-700">{record.pm10} µg/m³</td>
                    <td className="py-3 px-4 text-slate-700">{record.temperature}°C</td>
                    <td className="py-3 px-4 text-slate-700">{record.humidity}%</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Full Parameters"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {page} of {pages} ({total} total records)
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

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`Prediction Record #${selectedRecord?.id}`}
        maxWidth="max-w-2xl"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Predicted AQI</span>
                <p className="text-4xl font-extrabold text-slate-900 mt-1">
                  {selectedRecord.predicted_aqi.toFixed(1)}
                </p>
              </div>
              <Badge category={selectedRecord.category} size="lg" showRange={true} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">PM2.5</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.pm25} µg/m³</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">PM10</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.pm10} µg/m³</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">NO₂</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.no2} µg/m³</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SO₂</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.so2} µg/m³</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">CO</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.co} mg/m³</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">O₃</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.o3} µg/m³</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Temperature</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.temperature}°C</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.humidity}%</p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

