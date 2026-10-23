import React, { useState } from 'react';
import { Link } from 'wouter';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ParticleBackground from '../../components/ParticleBackground';

export default function AdminForgotPassword() {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    await resetPassword(email);
    setIsSubmitting(false);
    // Always show generic success state to prevent account enumeration
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-[#050711] text-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl p-6 sm:p-8 bg-[#070A18]/85 backdrop-blur-xl border border-violet-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>

          {submitted ? (
            <div className="text-center py-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-400/40 p-2 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Reset Link Dispatched</h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                If an authorized administrative account exists for{' '}
                <strong className="text-white">{email}</strong>, a secure password reset link has
                been sent. The link expires in 60 minutes.
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-xs text-gray-400">
                  Enter your registered work email to receive a secure recovery link.
                </p>
              </div>

              {!isConfigured && (
                <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-[11px] text-violet-300">
                  Note: Email delivery requires Supabase SMTP or custom mailer to be configured.
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Work Email</label>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending Link...</span>
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
