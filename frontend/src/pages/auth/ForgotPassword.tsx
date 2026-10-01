import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Loader2, KeyRound, AlertCircle, ArrowLeft,
  CheckCircle2, Inbox, ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useResetCooldown } from '../../hooks/useResetCooldown';

const SUPABASE_HOST = (() => {
  try {
    return new URL(import.meta.env.VITE_SUPABASE_URL).host;
  } catch {
    return 'your Supabase project';
  }
})();

/**
 * Standalone forgot-password page (rebuilt from the old modal flow).
 * Sends a recovery link that lands on /reset-password, guards the send
 * with the shared rate-limit cooldown, and tells the user exactly which
 * email to look for so they don't click a sibling project's message.
 */
export const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetCooldown = useResetCooldown();

  const [email, setEmail] = useState<string>((location.state as { email?: string })?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const trimmed = email.trim();
  const isGmail = /@gmail\.com$/i.test(trimmed);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCooldown.active || loading) return;
    if (!trimmed) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (resetError) {
      if (/rate limit/i.test(resetError.message)) {
        // Email quota hit: show the countdown instead of a raw error.
        resetCooldown.start();
      } else {
        setError(resetError.message);
      }
    } else {
      resetCooldown.start();
      setSent(true);
    }
    setLoading(false);
  };

  const card = 'glass rounded-3xl border-app p-8 max-w-md w-full';

  /* ── Success view ── */
  if (sent) {
    return (
      <div className="section-bg min-h-[70vh] flex items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
              <CheckCircle2 className="w-12 h-12 text-[#8EB69B] mx-auto mb-4" />
            </motion.div>
            <h1 className="text-xl font-extrabold text-app mb-1">Check your email</h1>
            <p className="text-sm text-app-muted mb-5">
              We sent a reset link to{' '}
              <span className="text-app font-semibold font-mono break-all">{trimmed}</span>
            </p>
          </div>

          {/* How to recognise the right email */}
          <div className="rounded-2xl bg-app-deep border border-app p-4 mb-5 space-y-2.5 text-xs text-app-muted">
            <p className="font-semibold text-app text-[11px] uppercase tracking-wider">What to look for</p>
            <p>• Subject: <span className="text-app">Reset your password</span></p>
            <p>
              • Link comes from <span className="text-app font-mono break-all">{SUPABASE_HOST}</span> and opens{' '}
              <span className="text-app font-mono break-all">{window.location.origin}/reset-password</span>
            </p>
            <p className="text-amber-500">
              • Ignore reset emails from your other projects — only this newest one works
            </p>
            <p className="text-app-subtle">• The link expires in about 1 hour</p>
          </div>

          <div className="space-y-3">
            {isGmail && (
              <a
                href="https://mail.google.com/mail/u/0/#search/Reset+your+password"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary justify-center !py-3 text-sm flex items-center gap-2"
              >
                <Inbox className="w-4 h-4" /> Open Gmail
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}
            {resetCooldown.active && (
              <p className="text-center text-xs text-app-subtle">
                You can request another link in{' '}
                <b className="font-mono text-app-muted">{resetCooldown.label}</b>
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setSent(false); setError(''); }}
                disabled={resetCooldown.active}
                className="flex-1 py-3 rounded-xl bg-app-card border border-app text-app-muted text-sm font-medium hover:text-app transition-colors cursor-pointer disabled:opacity-50"
              >
                Use a different email
              </button>
              <Link
                to="/login"
                className="flex-1 py-3 rounded-xl btn-primary justify-center text-sm"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Request form ── */
  return (
    <div className="section-bg min-h-[70vh] flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={card}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-app-subtle mb-2">
          Account recovery
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-[#8EB69B]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-app">Forgot your password?</h1>
            <p className="text-xs text-app-muted">We&rsquo;ll email you a secure reset link</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {resetCooldown.active && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-2xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Reset emails are limited to a few per hour. You can request another link in{' '}
                <b className="font-mono">{resetCooldown.label}</b>.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-400 rounded-2xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="reset-email" className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="researcher@university.edu"
                className="input-dark !pl-10 !py-3 text-sm"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="flex-1 py-3 rounded-xl bg-app-card border border-app text-app-muted text-sm font-medium hover:text-app transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || resetCooldown.active}
              className="flex-1 btn-primary justify-center !py-3 text-sm disabled:opacity-60 cursor-pointer"
            >
              {resetCooldown.active ? (
                `Wait ${resetCooldown.label}`
              ) : loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <p className="text-[11px] text-app-subtle text-center">
            Remembered it? <Link to="/login" className="text-app-muted hover:text-app underline">Back to sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
