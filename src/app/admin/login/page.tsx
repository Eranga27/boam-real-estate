'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/brand/Logo';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      return '';
    }
    return 'http://localhost:5000';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe: true }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password');
      }

      if (data.user?.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      // Store cookie for Next.js middleware
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;

      // Update AuthContext
      login(data.user, data.token);

      // Redirect to Admin Listings control panel
      router.push('/admin/listings');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sea-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Logo variant="light" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Restricted Access Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-3">Administrative Sign In</h1>
          <p className="text-xs text-navy-200/60 mt-1">Authenticate with your master admin credentials</p>
        </div>

        {/* Card */}
        <div className="bg-navy-900/90 backdrop-blur-xl border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-navy-200 uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@boamrealtors.lk"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-200 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-navy-800 text-center">
            <Link href="/" className="text-xs font-semibold text-navy-400 hover:text-white transition-colors">
              ← Return to BOAM Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
