import { useState, useRef, useMemo, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight, Home } from 'lucide-react';
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
        color="#8EB69B"
        emissive="#8EB69B"
        emissiveIntensity={0.8}
        distort={0.4}
        speed={2}
        transparent
        opacity={0.6}
      />
    </Sphere>
  );
};

const Auth3DScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <ParticleRing />
      <MorphemeBlock position={[-1.6, 0.3, 0]} color="#e2b857" label="UN-" delay={0} />
      <MorphemeBlock position={[0, 0.3, 0]} color="#8EB69B" label="HAPPY" delay={1.2} />
      <MorphemeBlock position={[1.6, 0.3, 0]} color="#7ec8c8" label="-NESS" delay={2.4} />
      <CentralOrb />
      <Sparkles count={20} scale={5} size={1.5} speed={0.3} color="#8EB69B" opacity={0.3} />
      <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={6} blur={2} far={2.5} />
    </group>
  );
};

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
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
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-app-deep border-r border-app overflow-hidden flex-col justify-between p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8EB69B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#7ec8c8]/8 rounded-full blur-3xl" />
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
                <pointLight position={[-3, 2, 4]} intensity={0.4} color="#8EB69B" />
                <pointLight position={[3, -2, 4]} intensity={0.3} color="#7ec8c8" />
                <Auth3DScene />
              </Suspense>
            </Canvas>
          </motion.div>
        </div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 space-y-4 border-t border-app pt-6"
        >
          <div className="flex items-center gap-6 text-xs text-app-muted font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#8EB69B]" /> WordNet Verified</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> Longest Match</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#8EB69B]" /> RLS Protected</span>
          </div>
          <p className="text-xs text-app-subtle italic">
            Deconstruct English words into prefixes, roots, and suffixes with transparent rule-based confidence scoring.
          </p>
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

          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-extrabold text-app mb-2"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-app-muted"
            >
              Sign in to your researcher account
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="glass rounded-3xl p-8 border-app shadow-2xl"
          >
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
                      <p className="font-bold mb-0.5">Supabase project connected</p>
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
              onSubmit={handleLogin}
              className="space-y-4"
            >
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please check your email or contact system admin to reset your password.'); }} className="text-xs text-app-muted hover:text-app transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle group-focus-within:text-[#8EB69B] transition-colors" />
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
              </motion.div>

              <motion.div variants={fieldVariants} className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 text-app-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-app border-app text-app-muted focus:ring-0 cursor-pointer"
                  />
                  <span>Remember session for 30 days</span>
                </label>
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
                  <span>{loading ? 'Authenticating...' : 'Sign in to Dashboard'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </motion.div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-xs text-app-muted border-t border-app pt-4"
            >
              <span>Don't have an account? </span>
              <Link to="/register" className="text-app font-semibold hover:underline">
                Create Researcher Account
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};