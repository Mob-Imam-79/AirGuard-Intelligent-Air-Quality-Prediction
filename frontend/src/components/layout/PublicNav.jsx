import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Wind, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function PublicNav() {
  const { isAuthenticated, user } = useAuth();

  const navClass = ({ isActive }) =>
    `text-xs font-semibold transition-colors ${
      isActive ? 'text-[#2563EB]' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-[#0F172A] tracking-tight">AirGuard</span>
            <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">SaaS</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/about" className={navClass}>About AirGuard</NavLink>
          <NavLink to="/features" className={navClass}>Features</NavLink>
          <NavLink to="/prediction" className={navClass}>AQI Predictor</NavLink>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm" icon={User}>
                Dashboard ({user?.name?.split(' ')[0]})
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

