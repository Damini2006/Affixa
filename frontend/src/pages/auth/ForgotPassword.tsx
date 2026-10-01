import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Loader2, KeyRound, AlertCircle, ArrowLeft,
  CheckCircle2, Inbox, ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder_key';

/**
 * Standalone forgot-password page. Sends a recovery link that lands on
 * /reset-password; the success view spells out exactly which email to
 * open so sibling projects' reset emails don't get clicked by mistake.
 */
export const ForgotPassword = () => {
  const location = useLocation();

  const [email, setEmail] = useState<string>((location.state as { email?: string })?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const trimmed = email.trim();
  const isGmail = /@gmail\.com$/i.test(trimmed);

  // Countdown for resend throttling (Supabase enforces ~1 recovery email / 60s).
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    if (!SUPABASE_CONFIGURED) {
      setError('Password reset is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in frontend/.env).');
      return;
    }
    if (!trimmed) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (resetError) {
        const msg = resetError.message ?? '';
        if (/rate limit|too many|only request this once every|email.*limit|429/i.test(msg)) {
          // Extract "60 seconds" style wait hints when Supabase provides one.
          const waitMatch = msg.match(/(\d+)\s*second/i);
          const waitSecs = waitMatch ? parseInt(waitMatch[1], 10) : 60;
          setCooldown(Math.min(Math.max(waitSecs, 15), 300));
          setError(
            `Too many reset attempts — Supabase limits recovery emails (about 1 per minute). ` +
            `Check your inbox and spam for the newest "Reset your password" email, wait ${waitSecs}s, then resend. ` +
            `If this persists, the project needs a custom SMTP sender (Supabase Dashboard → Authentication → Emails).`
          );
        } else {
          setError(msg || 'Could not send the reset email. Please try again.');
        }
      } else {
        setSent(true);
        setCooldown(60); // prevent accidental double-sends on the success view's "different email" path
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
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
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setSent(false); setError(''); }}
                className="flex-1 py-3 rounded-xl bg-app-card border border-app text-app-muted text-sm font-medium hover:text-app transition-colors cursor-pointer"
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
              disabled={loading || cooldown > 0}
              className="flex-1 btn-primary justify-center !py-3 text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : cooldown > 0 ? (
                `Retry in ${cooldown}s`
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
