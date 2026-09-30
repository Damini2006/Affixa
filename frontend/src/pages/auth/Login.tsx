import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== '';

/* ── 3D Floating Morphemes Scene for Left Panel ── */
const Auth3DScene = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
        <Text position={[-1.8, 0.4, 0]} fontSize={0.7} color="#e2b857" anchorX="center" anchorY="middle">
          UN
        </Text>
        <Text position={[0, 0.4, 0]} fontSize={0.85} color="#8EB69B" anchorX="center" anchorY="middle">
          HAPPY
        </Text>
        <Text position={[1.8, 0.4, 0]} fontSize={0.7} color="#7ec8c8" anchorX="center" anchorY="middle">
          NESS
        </Text>
      </Float>
    </group>
  );
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/analyzer';

  const PasswordIcon = showPassword ? EyeOff : Eye;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) {
      setError('Supabase is not configured. Please check VITE_SUPABASE_ANON_KEY in frontend/.env');
      return;
    }
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    } else {
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-app text-app flex items-stretch">
      {/* ── LEFT PANEL (3D Visuals & Branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-app-deep border-r border-app overflow-hidden flex-col justify-between p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8EB69B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#7ec8c8]/8 rounded-full blur-3xl" />
        </div>

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="logo-mark font-['Bricolage_Grotesque',sans-serif]">A</div>
          <span className="font-bold text-xl text-app tracking-tight">Affix<span className="text-app-muted">a</span></span>
        </div>

        {/* 3D Interactive Canvas */}
        <div className="relative z-10 h-64 my-auto w-full">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <PresentationControls global snap={true} rotation={[0, 0.2, 0]} polar={[-Math.PI / 4, Math.PI / 4]}>
              <Auth3DScene />
            </PresentationControls>
          </Canvas>
        </div>

        {/* Highlights */}
        <div className="relative z-10 space-y-4 border-t border-app pt-6">
          <div className="flex items-center gap-6 text-xs text-app-muted font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#8EB69B]" /> WordNet Verified</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> Longest Match</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> RLS Protected</span>
          </div>
          <p className="text-xs text-app-subtle italic">
            Deconstruct English words into prefixes, roots, and suffixes with transparent rule-based confidence scoring.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-app mb-2">Welcome Back</h1>
            <p className="text-sm text-app-muted">Sign in to your researcher account</p>
          </div>

          {/* Form Card */}
          <div className="glass rounded-3xl p-8 border-app shadow-2xl">
            {!SUPABASE_CONFIGURED && (
              <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/25 text-amber-500 rounded-2xl p-4 mb-6 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Supabase project connected</p>
                  <p className="opacity-80">Add <code className="bg-app px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to frontend/.env</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-400 rounded-2xl p-4 mb-6 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="input-dark !pl-10 !py-3.5 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please check your email or contact system admin to reset your password.'); }} className="text-xs text-app-muted hover:text-app transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-dark !pl-10 !pr-10 !py-3.5 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-subtle hover:text-app transition-colors cursor-pointer"
                  >
                    <PasswordIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Remember me option */}
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 text-app-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-app border-app text-app-muted focus:ring-0 cursor-pointer"
                  />
                  <span>Remember session for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !py-3.5 mt-2 text-sm disabled:opacity-60 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Authenticating...' : 'Sign in to Dashboard'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Quick Academic SSO Options */}
            <div className="mt-6 pt-4 border-t border-app">
              <span className="block text-[11px] text-app-subtle uppercase tracking-widest text-center mb-3">Academic SSO Access</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => alert('ORCID SSO active. Select standard sign in or create account.')}
                  className="py-2 px-3 rounded-xl bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ORCID iD</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Institutional SSO active. Select standard sign in or create account.')}
                  className="py-2 px-3 rounded-xl bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EduID SSO</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-app-muted border-t border-app pt-4">
              <span>Don't have an account? </span>
              <Link to="/register" className="text-app font-semibold hover:underline">
                Create Researcher Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
