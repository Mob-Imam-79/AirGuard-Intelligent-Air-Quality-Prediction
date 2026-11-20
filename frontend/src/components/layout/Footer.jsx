import React from 'react';
import { Wind, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <Wind className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              AirGuard
            </span>
            <span className="text-xs text-slate-400">
              — Intelligent Air Quality Prediction System
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link to="/about" className="hover:text-blue-600">About</Link>
            <Link to="/features" className="hover:text-blue-600">Features</Link>
            <Link to="/prediction" className="hover:text-blue-600">Predict AQI</Link>
            <Link to="/login" className="hover:text-blue-600">Sign In</Link>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 AirGuard. Software Engineering Laboratory.
          </p>
        </div>
      </div>
    </footer>
  );
}

