import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wind,
  History,
  Activity,
  FileText,
  Settings,
  ShieldCheck,
  Users,
  Database,
  Cpu,
  BarChart3,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin } = useAuth();

  const userNavItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'AQI Prediction', to: '/prediction', icon: Wind },
    { name: 'Model Comparison', to: '/model-comparison', icon: Layers },
    { name: 'Prediction History', to: '/history', icon: History },
    { name: 'Analytics', to: '/analytics', icon: Activity },
    { name: 'Reports', to: '/reports', icon: FileText },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Admin Overview', to: '/admin', icon: ShieldCheck, exact: true },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Dataset Management', to: '/admin/datasets', icon: Database },
    { name: 'ML Model Retraining', to: '/admin/models', icon: Cpu },
    { name: 'Model Evaluation', to: '/admin/evaluation', icon: BarChart3 },
    { name: 'Prediction Monitor', to: '/admin/monitoring', icon: Eye },
    { name: 'System Settings', to: '/admin/settings', icon: Sliders },
  ];

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
        : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0] gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#0F172A] tracking-tight">AirGuard</span>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">SaaS</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-none mt-0.5">Air Quality Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">
              User Application
            </p>
            <nav className="space-y-1">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={linkClasses}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {isAdmin && (
            <div>
              <div className="px-3 flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                  Administrator
                </p>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                  ADMIN
                </span>
              </div>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      onClick={onClose}
                      className={linkClasses}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Pro Banner / ML Model Badge */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#0F172A]">AI Engine Active</p>
              <p className="text-[11px] text-[#475569] mt-0.5">
                Random Forest Regressor • R² 0.9996
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

