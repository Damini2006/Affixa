import { useState, useRef, useMemo, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, Award, ArrowRight, Home } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, Sphere, RoundedBox, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== '';

/* ── 3D Morpheme Scene ── */
const MorphemeBlock = ({ position, color, label, delay }: { position: [number, number, number]; color: string; label: string; delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + delay) * 0.1;
      meshRef.current.rotation.y = Math.sin(t * 0.3 + delay) * 0.06;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.25}>
      <RoundedBox
        ref={meshRef}
        args={[1.3, 0.5, 0.5]}
        radius={0.1}
        smoothness={4}
        position={position}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          metalness={0.3}
          roughness={0.4}
        />
      </RoundedBox>
      <Text
        position={[position[0], position[1] - 0.5, position[2]]}
        fontSize={0.18}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </Float>
  );
};

const ParticleRing = () => {
  const groupRef = useRef<THREE.Group>(null);
  const count = 50;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.2 + Math.random() * 1.2;
      temp.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 2.5,
        z: Math.sin(angle) * radius,
        speed: 0.15 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
        size: 0.015 + Math.random() * 0.02,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      groupRef.current.children.forEach((child, i) => {
        const p = particles[i];
        if (p) {
          child.position.y = p.y + Math.sin(state.clock.getElapsedTime() * p.speed + p.offset) * 0.3;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[p.size, 6, 6]} position={[p.x, p.y, p.z]}>
          <meshBasicMaterial
            color={i % 3 === 0 ? '#8EB69B' : i % 3 === 1 ? '#e2b857' : '#7ec8c8'}
            transparent
            opacity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
};

const CentralOrb = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.15, 24, 24]} position={[0, -0.5, 0]}>
      <MeshDistortMaterial
        color="#e2b857"
        emissive="#e2b857"
        emissiveIntensity={0.8}
        distort={0.4}
        speed={2}
        transparent
        opacity={0.6}
      />
    </Sphere>
  );
};

const Register3DScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <ParticleRing />
      <MorphemeBlock position={[-1.8, 0.3, 0]} color="#e2b857" label="INTER-" delay={0} />
      <MorphemeBlock position={[0, 0.3, 0]} color="#8EB69B" label="NATION" delay={1.2} />
      <MorphemeBlock position={[1.8, 0.3, 0]} color="#7ec8c8" label="-AL" delay={2.4} />
      <CentralOrb />
      <Sparkles count={20} scale={5} size={1.5} speed={0.3} color="#e2b857" opacity={0.3} />
      <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={6} blur={2} far={2.5} />
    </group>
  );
};

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 space-y-1.5"
    >
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.04 }}
            className="h-1 flex-1 rounded-full"
            style={{ backgroundColor: i < strength ? colors[strength] : 'var(--border-app)' }}
          />
        ))}
      </div>
      <p className="text-[10px]" style={{ color: strength > 0 ? colors[strength] : 'var(--text-muted)' }}>
        {labels[strength]}
      </p>
    </motion.div>
  );
};

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
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

        {/* 3D Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full h-80"
          >
            <Canvas camera={{ position: [0, 0, 5.5], fov: 40 }} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.7} />
                <pointLight position={[-3, 2, 4]} intensity={0.4} color="#e2b857" />
                <pointLight position={[3, -2, 4]} intensity={0.3} color="#7ec8c8" />
                <Register3DScene />
              </Suspense>
            </Canvas>
          </motion.div>
        </div>

        {/* Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 space-y-3 border-t border-app pt-6"
        >
          <h4 className="text-xs uppercase tracking-widest text-app-muted font-bold">Research Account Benefits</h4>
          <div className="grid grid-cols-2 gap-3 text-xs text-app-muted font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#8EB69B]" /> Isolated History</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> Batch CSV Exports</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#8EB69B]" /> Model Benchmarks</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> Lexicon Settings</span>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app transition-colors mb-6">
            <Home className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-8 text-center border-app"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-14 h-14 text-[#8EB69B] mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-app mb-2">Registration Complete!</h2>
                <p className="text-app-muted text-xs leading-relaxed mb-4">
                  We sent a confirmation link to <span className="text-app font-mono">{email}</span>. Please check your inbox and verify your email.
                </p>
                <p className="text-xs text-app-subtle">Redirecting to login...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="glass rounded-3xl p-8 border-app shadow-2xl"
              >
                <div className="text-center mb-6">
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-extrabold text-app mb-2"
                  >
                    Create Account
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-app-muted"
                  >
                    Get instant access to morphological analysis tools
                  </motion.p>
                </div>

                <AnimatePresence mode="wait">
                  {!SUPABASE_CONFIGURED && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/25 text-amber-500 rounded-2xl p-4 mb-6 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold mb-0.5">Supabase connection active</p>
                          <p className="opacity-80">Add <code className="bg-app px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to frontend/.env</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-400 rounded-2xl p-4 mb-6 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <motion.div variants={fieldVariants}>
                    <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle group-focus-within:text-[#8EB69B] transition-colors" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Neelam Rishika"
                        className="input-dark !pl-10 !py-3.5 text-sm"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle group-focus-within:text-[#8EB69B] transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="researcher@university.edu"
                        className="input-dark !pl-10 !py-3.5 text-sm"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
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
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle group-focus-within:text-[#8EB69B] transition-colors" />
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
                    <PasswordStrength password={password} />
                  </motion.div>

                  <motion.div variants={fieldVariants} className="flex items-start gap-2 text-xs text-app-muted pt-1">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 rounded bg-app border-app text-app-muted focus:ring-0 cursor-pointer"
                      required
                    />
                    <span>I agree to the Terms of Service and Privacy Policy</span>
                  </motion.div>

                  <motion.div variants={fieldVariants}>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full justify-center !py-3.5 mt-2 text-sm disabled:opacity-60 cursor-pointer"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{loading ? 'Creating Account...' : 'Create Free Account'}</span>
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </motion.div>
                </motion.form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 text-center text-xs text-app-muted border-t border-app pt-4"
                >
                  <span>Already registered? </span>
                  <Link to="/login" className="text-app font-semibold hover:underline">
                    Sign in to your account
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};