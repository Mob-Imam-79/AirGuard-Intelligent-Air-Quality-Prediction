import React from 'react';
import {
  Wind,
  Cpu,
  BarChart3,
  FileDown,
  ShieldCheck,
  History,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';
import Card from '../components/common/Card';

export default function Features() {
  const featuresList = [
    {
      icon: Wind,
      title: 'Real-Time AQI Prediction',
      desc: 'Instant inference computing Air Quality Index from 8 validated environmental parameters using a pre-trained regression pipeline.',
      points: ['Validates PM2.5, PM10, NO2, SO2, CO, O3, Temp, Humidity', 'Sub-millisecond inference latency', 'CPCB 6-tier categorical classification'],
    },
    {
      icon: Cpu,
      title: 'Empirical Multi-Model Comparison',
      desc: 'Automatic training and statistical benchmarking across Linear Regression, Decision Tree, Random Forest, and Support Vector Regression.',
      points: ['Evaluated with MAE, MSE, RMSE, and R² score', 'StandardScaler feature normalization', 'Automated best model selection & joblib persistence'],
    },
    {
      icon: BarChart3,
      title: 'Interactive Environmental Analytics',
      desc: 'Data visualization dashboards powered by Recharts, showing chronological trends, category compositions, and pollutant comparisons.',
      points: ['Line charts with standard reference thresholds', 'Pollutant concentration comparison bar charts', 'Category distribution donut charts'],
    },
    {
      icon: FileDown,
      title: 'Exportable Audit Reports',
      desc: '1-click generation of professional PDF audit reports with company header, summary metrics, and tables, or raw CSV spreadsheets.',
      points: ['Printable vector PDF generated with ReportLab', 'Raw CSV format for Excel/Sheets analysis', 'User-specific audit logs'],
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Multi-tenant authentication with bcrypt password encryption and stateless JSON Web Token (JWT) bearer protection.',
      points: ['Secure password hashing', 'Isolated user prediction histories', 'Dedicated administrator control suite'],
    },
    {
      icon: History,
      title: 'Persistent History & Auditing',
      desc: 'Full relational database storage in PostgreSQL tracking every prediction run, input parameter vector, and timestamp.',
      points: ['SQLAlchemy ORM integration with connection pooling', 'Category filtering and search capabilities', 'Individual record detail modals and deletion'],
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Commercial-Grade Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          AirGuard Platform Capabilities
        </h1>
        <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
          Engineered as a complete environmental intelligence system meeting every functional and non-functional requirement defined in the project SRS.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuresList.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} padding="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  <ul className="space-y-1 pt-1">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

