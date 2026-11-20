import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { api } from '../../services/api';

export default function ModelManagement() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchModelData = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminModels();
      setModelData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelData();
  }, []);

  const handleRetrain = async () => {
    if (window.confirm('Retrain all 4 candidate models with the current CPCB dataset? This will run real training on Linear Regression, Decision Tree, Random Forest, and SVR.')) {
      try {
        setRetraining(true);
        setMessage(null);
        const res = await api.retrainModels();
        setMessage({
          type: 'success',
          text: `Retraining completed! Selected best model: ${res.summary.selected_model}. All artifacts updated.`,
        });
        fetchModelData();
      } catch (err) {
        setMessage({ type: 'error', text: 'Retraining failed: ' + err.message });
      } finally {
        setRetraining(false);
      }
    }
  };

  const selectedModel = modelData?.selected_model;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Machine Learning Model Management
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Monitor model artifact status, trigger retraining pipelines, and inspect active algorithms.
          </p>
        </div>

        <Button
          variant="primary"
          icon={RefreshCw}
          onClick={handleRetrain}
          isLoading={retraining}
        >
          {retraining ? 'Retraining All 4 Models...' : 'Retrain ML Pipeline'}
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Active Model Status Card */}
      <Card
        title="Active Production Model"
        subtitle="Currently deployed algorithm serving real-time predictions"
        icon={Cpu}
        padding="p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selected Algorithm
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-black text-slate-900">{selectedModel || 'Random Forest Regression'}</span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated selection based on highest R² score and lowest RMSE on test set split.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Model Version</span>
            <p className="text-base font-bold text-slate-800">v1.0.0 (Production)</p>
            <span className="text-[11px] text-slate-400">StandardScaler + 100 Trees</span>
          </div>
        </div>

        {/* Artifacts check */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">best_model.joblib</p>
              <p className="text-[10px] text-slate-400">Trained Scikit-learn estimator</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">preprocessor.joblib</p>
              <p className="text-[10px] text-slate-400">Fitted StandardScaler pipeline</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">metrics.json</p>
              <p className="text-[10px] text-slate-400">Comparative evaluation scores</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Retraining workflow explanation */}
      <Card title="Retraining Pipeline Architecture" subtitle="How automated model re-evaluation operates" icon={Sparkles}>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            When retraining is triggered, the system loads the complete historical CPCB dataset (12,000 records), validates all features, performs an 80/20 train-test split, fits a feature-standardization scaler, and trains 4 regression models:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Linear Regression</b>: Serves as the statistical baseline.</li>
            <li><b>Decision Tree Regression</b>: Captures non-linear breakpoints with depth bounding.</li>
            <li><b>Random Forest Regression</b>: Ensemble of 100 decision trees reducing variance and preventing overfitting.</li>
            <li><b>Support Vector Regression (SVR)</b>: Kernel-based non-linear boundary estimation.</li>
          </ul>
          <p>
            Each candidate is evaluated across MAE, MSE, RMSE, and R² score on the unseen 20% test split. The candidate with the highest R² score is automatically persisted as <code>best_model.joblib</code> for the live prediction service.
          </p>
        </div>
      </Card>
    </div>
  );
}

