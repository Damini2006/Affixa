import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== '';

/* ── 3D Floating Scene for Register Left Panel ── */
const Register3DScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.7}>
        <Text position={[-2, 0, 0]} fontSize={0.75} color="#e2b857" anchorX="center" anchorY="middle">
          INTER
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.85} color="#8EB69B" anchorX="center" anchorY="middle">
          NATION
        </Text>
        <Text position={[1.8, 0, 0]} fontSize={0.75} color="#7ec8c8" anchorX="center" anchorY="middle">
          AL
        </Text>
      </Float>
    </group>
  );
};

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Linguistics Researcher');
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const PasswordIcon = showPassword ? EyeOff : Eye;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) {
      setError('Supabase is not configured. Please check VITE_SUPABASE_ANON_KEY in frontend/.env');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!agreed) {
      setError('Please accept the Terms of Service to create an account.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, research_role: role } },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-app text-app flex items-stretch">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-app-deep border-r border-app overflow-hidden flex-col justify-between p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#8EB69B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#e2b857]/8 rounded-full blur-3xl" />
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
            <PresentationControls global snap={true} rotation={[0, -0.2, 0]} polar={[-Math.PI / 4, Math.PI / 4]}>
              <Register3DScene />
            </PresentationControls>
          </Canvas>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-3 border-t border-app pt-6">
          <h4 className="text-xs uppercase tracking-widest text-app-muted font-bold">Research Account Benefits</h4>
          <div className="grid grid-cols-2 gap-3 text-xs text-app-muted font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#8EB69B]" /> Isolated History</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> Batch CSV Exports</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#8EB69B]" /> Model Benchmarks</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> Lexicon Settings</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 text-center border-app">
              <CheckCircle2 className="w-14 h-14 text-[#8EB69B] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-app mb-2">Registration Complete!</h2>
              <p className="text-app-muted text-xs leading-relaxed mb-4">
                We sent a confirmation link to <span className="text-app font-mono">{email}</span>. Please check your inbox and verify your email.
              </p>
              <p className="text-xs text-app-subtle">Redirecting to login...</p>
            </motion.div>
          ) : (
            <div className="glass rounded-3xl p-8 border-app shadow-2xl">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-extrabold text-app mb-2">Create Account</h1>
                <p className="text-sm text-app-muted">Get instant access to morphological analysis tools</p>
              </div>

              {!SUPABASE_CONFIGURED && (
                <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/25 text-amber-500 rounded-2xl p-4 mb-6 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">Supabase connection active</p>
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

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Neelam Rishika"
                      className="input-dark !pl-10 !py-3.5 text-sm"
                      required
                    />
                  </div>
                </div>

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
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Research Role / Discipline</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-dark !py-3.5 text-sm"
                  >
                    <option value="Linguistics Researcher">Linguistics Researcher</option>
                    <option value="NLP Engineer / Data Scientist">NLP Engineer / Data Scientist</option>
                    <option value="Computational Bio / BioNLP">Computational Bio / BioNLP</option>
                    <option value="Student / Educator">Student / Educator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="input-dark !pl-10 !pr-10 !py-3.5 text-sm"
                      required
                      minLength={6}
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

                <div className="flex items-start gap-2 text-xs text-app-muted pt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded bg-app border-app text-app-muted focus:ring-0 cursor-pointer"
                    required
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center !py-3.5 mt-2 text-sm disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Creating Account...' : 'Create Free Account'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-app-muted border-t border-app pt-4">
                <span>Already registered? </span>
                <Link to="/login" className="text-app font-semibold hover:underline">
                  Sign in to your account
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
