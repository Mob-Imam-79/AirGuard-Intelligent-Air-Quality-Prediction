import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wind, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@airguard.com');
      setPassword('Admin@123');
    } else {
      setEmail('user@airguard.com');
      setPassword('User@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Wind className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Sign In to AirGuard
          </h2>
          <p className="text-xs text-[#64748B]">
            Environmental Intelligence & AQI Prediction System
          </p>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E40AF]">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            Quick Demo Auto-Fill:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('user')}
              className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-700 hover:bg-blue-50 font-medium text-center transition-colors"
            >
              👤 Standard User
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-700 hover:bg-blue-50 font-medium text-center transition-colors"
            >
              🛡️ System Admin
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#2563EB] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

