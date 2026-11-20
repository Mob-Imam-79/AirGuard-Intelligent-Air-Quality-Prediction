import React, { useEffect, useState } from 'react';
import {
  FileText,
  FileDown,
  Printer,
  CheckCircle,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getHistory({ limit: 15 });
        setHistory(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await api.exportPdf();
    } catch (err) {
      alert('PDF generation error: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      await api.exportCsv();
    } catch (err) {
      alert('CSV generation error: ' + err.message);
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Environmental Reports Center
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Generate and export official air quality intelligence summaries and audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            icon={FileDown}
            onClick={handleDownloadPdf}
            isLoading={downloadingPdf}
          >
            Download PDF Report
          </Button>
          <Button
            variant="outline"
            icon={Download}
            onClick={handleDownloadCsv}
            isLoading={downloadingCsv}
          >
            Download CSV
          </Button>
        </div>
      </div>

      {/* Report Cards / Formats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Official PDF Air Quality Audit
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Complete printable document including brand header, metadata summary, average pollutant metrics, and formatted table of all prediction runs.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  icon={FileDown}
                  onClick={handleDownloadPdf}
                  isLoading={downloadingPdf}
                >
                  Generate PDF ({total} Records)
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">
                Raw CSV Environmental Dataset
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tabular raw data export formatted for spreadsheet software (Excel, Numbers, Sheets) or statistical programming in Python/R.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadCsv}
                  isLoading={downloadingCsv}
                >
                  Export CSV Spreadsheet
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Preview */}
      <Card
        title="Live Report Preview"
        subtitle={`Showing latest ${history.length} of ${total} records`}
        padding="p-0"
        className="overflow-hidden"
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading preview...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No prediction history recorded to report.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Predicted AQI</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">PM2.5</th>
                  <th className="py-3 px-4">PM10</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Humidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-500">#{r.id}</td>
                    <td className="py-3 px-4 text-slate-600">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.predicted_aqi.toFixed(1)}</td>
                    <td className="py-3 px-4"><Badge category={r.category} size="sm" /></td>
                    <td className="py-3 px-4 text-slate-600">{r.pm25} µg/m³</td>
                    <td className="py-3 px-4 text-slate-600">{r.pm10} µg/m³</td>
                    <td className="py-3 px-4 text-slate-600">{r.temperature}°C</td>
                    <td className="py-3 px-4 text-slate-600">{r.humidity}%</td>
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

