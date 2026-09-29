import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Zap, Mail, Lock, AlertCircle } from 'lucide-react';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== '';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/analyzer';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_ANON_KEY to frontend/.env and restart.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate(from, { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-sky-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-pink-500/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Zap className="w-5 h-5 text-[#0f172a] fill-[#0f172a]" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Affixa</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white text-center mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm text-center mb-8">Sign in to access your analyzer</p>

          {!SUPABASE_CONFIGURED && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-4 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Supabase not configured</p>
                <p className="text-amber-400/80">Add <code className="bg-amber-900/40 px-1 rounded text-xs">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-amber-900/40 px-1 rounded text-xs">frontend/.env</code> and restart.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-300 rounded-xl p-4 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-dark !pl-10" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-dark !pl-10" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Create one</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">
          <Link to="/" className="hover:text-sky-400 transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
};
