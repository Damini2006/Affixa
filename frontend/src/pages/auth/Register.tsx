import { useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, Award, ArrowRight, Home, Github } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, Sphere, MeshWobbleMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== '';

/* ── 3D Morpheme Decomposition Scene ── */
const MorphemeBlock = ({ position, color, label, delay }: { position: [number, number, number]; color: string; label: string; delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5 + delay) * 0.15;
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5 + delay) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <RoundedBox
        ref={meshRef}
        args={[1.2, 0.6, 0.6]}
        radius={0.12}
        smoothness={4}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshWobbleMaterial
          color={color}
          factor={hovered ? 0.4 : 0.15}
          speed={2}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.08}
        />
      </RoundedBox>
      <Text
        position={[position[0], position[1] - 0.6, position[2]]}
        fontSize={0.22}
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

const ParticleField = () => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 6 - 2;
      temp.push({ x, y, z, speed: 0.3 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
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
        <Sphere key={i} args={[0.02 + Math.random() * 0.02, 8, 8]} position={[p.x, p.y, p.z]}>
          <meshStandardMaterial
            color={i % 3 === 0 ? '#8EB69B' : i % 3 === 1 ? '#e2b857' : '#7ec8c8'}
            emissive={i % 3 === 0 ? '#8EB69B' : i % 3 === 1 ? '#e2b857' : '#7ec8c8'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </Sphere>
      ))}
    </group>
  );
};

const ConnectionLines = () => {
  const lineRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  const lines = [
    { start: [-2, 0.5, 0], end: [0, 0.5, 0], color: '#e2b857' },
    { start: [0, 0.5, 0], end: [2, 0.5, 0], color: '#7ec8c8' },
  ];

  return (
    <group ref={lineRef}>
      {lines.map((line, i) => {
        const points = [
          new THREE.Vector3(...line.start),
          new THREE.Vector3(...line.end),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color={line.color} transparent opacity={0.4} linewidth={1} />
          </line>
        );
      })}
    </group>
  );
};

const Register3DScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <ParticleField />
      <ConnectionLines />
      <MorphemeBlock position={[-2, 0.5, 0]} color="#e2b857" label="INTER-" delay={0} />
      <MorphemeBlock position={[0, 0.5, 0]} color="#8EB69B" label="NATION" delay={1} />
      <MorphemeBlock position={[2, 0.5, 0]} color="#7ec8c8" label="-AL" delay={2} />
      <Sphere args={[0.15, 32, 32]} position={[0, -0.8, 0]}>
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
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < strength ? colors[strength] : 'var(--border-app)',
            }}
          />
        ))}
      </div>
      <p className="text-[10px] text-app-muted" style={{ color: strength > 0 ? colors[strength] : undefined }}>
        {labels[strength]}
      </p>
    </motion.div>
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

  const handleGithubSignup = async () => {
    if (!SUPABASE_CONFIGURED) {
      setError('Supabase is not configured.');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-app text-app flex items-stretch">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-app-deep border-r border-app overflow-hidden flex-col justify-between p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#8EB69B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#e2b857]/8 rounded-full blur-3xl" />
        </div>

        {/* 3D Interactive Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <div className="w-full h-80">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
              <pointLight position={[-3, 2, 4]} intensity={0.5} color="#e2b857" />
              <pointLight position={[3, -2, 4]} intensity={0.3} color="#7ec8c8" />
              <Register3DScene />
            </Canvas>
          </div>
        </div>

        {/* Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Back to home */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app transition-colors mb-6">
            <Home className="w-3.5 h-3.5" />
            Back to home
          </Link>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
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
              initial={{ opacity: 0, scale: 0.98 }}
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
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-400 rounded-2xl p-4 mb-6 text-xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* GitHub OAuth */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                type="button"
                onClick={handleGithubSignup}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-app-card border border-app text-app text-sm font-medium hover:border-app-hover transition-all cursor-pointer mb-4"
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-app" />
                <span className="text-[11px] text-app-subtle uppercase tracking-widest">or register with email</span>
                <div className="flex-1 h-px bg-app" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
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

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
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
                  <PasswordStrength password={password} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-2 text-xs text-app-muted pt-1"
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded bg-app border-app text-app-muted focus:ring-0 cursor-pointer"
                    required
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center !py-3.5 mt-2 text-sm disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Creating Account...' : 'Create Free Account'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center text-xs text-app-muted border-t border-app pt-4"
              >
                <span>Already registered? </span>
                <Link to="/login" className="text-app font-semibold hover:underline">
                  Sign in to your account
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};