import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wind, User, Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Wind className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Create an AirGuard Account
          </h2>
          <p className="text-xs text-[#64748B]">
            Start logging environmental parameters and predicting AQI
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

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
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
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
              Register & Start
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

