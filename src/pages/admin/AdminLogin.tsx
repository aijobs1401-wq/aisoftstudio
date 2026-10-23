import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Database, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ParticleBackground from '../../components/ParticleBackground';

export default function AdminLogin() {
  const { user, login, isConfigured } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'setup'>('login');

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      setLocation('/admin');
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your work email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setLocation('/admin');
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050711] text-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Ambience */}
      <ParticleBackground />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-gradient-to-tr from-[#8B5CF6]/20 via-[#22D3EE]/15 to-transparent blur-3xl pointer-events-none" />

      {/* Top Bar with back link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public site</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] p-[2px] mb-4 shadow-[0_0_30px_rgba(139,92,246,0.35)]">
            <div className="w-full h-full bg-[#050711] rounded-[14px] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE]" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI SOFT STUDIO</h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">Administrative Control Console</p>
        </div>

        {/* Tab switcher: Sign In vs. Setup Instructions */}
        {!isConfigured && (
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-violet-600/40 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'setup'
                  ? 'bg-cyan-500/30 text-cyan-300 shadow-sm border border-cyan-400/30'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>
          </div>
        )}

        {/* Card Container */}
        <div className="rounded-2xl p-6 sm:p-8 bg-[#070A18]/85 backdrop-blur-xl border border-violet-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          {activeTab === 'setup' && !isConfigured ? (
            /* Setup Instructions Tab */
            <div className="space-y-4 text-xs text-gray-300">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Database Credentials Required</div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    To authenticate real administrators, configure your Supabase URL and Anon Key in
                    your environment variables.
                  </p>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                  1. Add to .env (or Vercel Settings):
                </div>
                <pre className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-cyan-300 overflow-x-auto select-text">
{`VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"`}
                </pre>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                  2. Run SQL Schema:
                </div>
                <p className="text-[11px] text-gray-400">
                  Execute the script located in <code className="text-violet-300">/supabase/schema.sql</code>{' '}
                  in your Supabase SQL Editor.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {!isConfigured && (
                <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-[11px] text-violet-300 flex items-center justify-between">
                  <span>Supabase is in setup mode.</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('setup')}
                    className="underline text-cyan-300 hover:text-white"
                  >
                    View instructions
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aisoftstudio.io"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-300">Password</label>
                  <Link
                    href="/admin/forgot-password"
                    className="text-xs text-violet-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#22D3EE] hover:opacity-95 shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-gray-500">
                Protected by strict Row Level Security (RLS) & Server-Side RBAC.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
