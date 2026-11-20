import React, { useState } from 'react';
import { Menu, User as UserIcon, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-[#475569]">
          <span className="font-semibold text-[#0F172A]">AirGuard Intelligence</span>
          <span className="text-slate-300">/</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Model Ready
          </span>
        </div>
      </div>

      {/* User profile dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-blue-200 flex items-center justify-center text-[#2563EB] font-semibold text-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AG'}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#0F172A]">{user?.name}</span>
              {isAdmin && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1 rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B]">{user?.email}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1.5 z-50"
            onClick={() => setDropdownOpen(false)}
          >
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-500">Signed in as</p>
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
            </div>

            <Link
              to="/settings"
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              Profile & Account
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                Admin Dashboard
              </Link>
            )}

            <div className="border-t border-slate-100 my-1" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

