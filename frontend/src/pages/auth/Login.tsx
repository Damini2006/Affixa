import { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, type Variants } from 'framer-motion';
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight, Home, KeyRound, Smartphone } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, Sphere, RoundedBox, ContactShadows, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== '';

/* ── Aurora Background ── */
const AuroraBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = [
      { r: 142, g: 182, b: 155 },
      { r: 126, g: 200, b: 200 },
      { r: 226, g: 184, b: 87 },
    ];

    const animate = () => {
      time += 0.003;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      colors.forEach((color, i) => {
        const x = w * (0.3 + 0.2 * Math.sin(time + i * 2));
        const y = h * (0.3 + 0.2 * Math.cos(time * 0.7 + i * 1.5));
        const radius = 200 + 100 * Math.sin(time * 0.5 + i);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.06)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

/* ── 3D Glassmorphism Morpheme Block ── */
const GlassMorphismBlock = ({ position, color, label, delay }: { position: [number, number, number]; color: string; label: string; delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * 1.1 + delay) * 0.08;
      meshRef.current.rotation.y = Math.sin(t * 0.25 + delay) * 0.05;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
      <RoundedBox
        ref={meshRef}
        args={[1.4, 0.5, 0.5]}
        radius={0.08}
        smoothness={4}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.08}
          transparent
          opacity={0.85}
        />
      </RoundedBox>
      <Text
        position={[position[0], position[1] - 0.45, position[2]]}
        fontSize={0.16}
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

/* ── Floating Particles ── */
const FloatingParticles = () => {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 3 - 1,
        speed: 0.1 + Math.random() * 0.2,
        offset: Math.random() * Math.PI * 2,
        size: 0.01 + Math.random() * 0.015,
      });
    }
    return temp;
  }, []);

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
        <Sphere key={i} args={[p.size, 6, 6]} position={[p.x, p.y, p.z]}>
          <meshBasicMaterial
            color={i % 3 === 0 ? '#8EB69B' : i % 3 === 1 ? '#e2b857' : '#7ec8c8'}
            transparent
            opacity={0.4}
          />
        </Sphere>
      ))}
    </group>
  );
};

/* ── Energy Connection Lines ── */
const ConnectionLine = ({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) => {
  const lineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.15 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line {...({ ref: lineRef, geometry } as Record<string, unknown>)}>
      <lineBasicMaterial color={color} transparent opacity={0.2} />
    </line>
  );
};

/* ── Central Pulsing Orb ── */
const PulsingOrb = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.12, 24, 24]} position={[0, -0.4, 0]}>
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        distort={0.4}
        speed={2.5}
        transparent
        opacity={0.6}
      />
    </Sphere>
  );
};

/* ── Main 3D Scene ── */
const Auth3DScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.06) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <FloatingParticles />
      <ConnectionLine start={[-1.6, 0.3, 0]} end={[0, 0.3, 0]} color="#e2b857" />
      <ConnectionLine start={[0, 0.3, 0]} end={[1.6, 0.3, 0]} color="#7ec8c8" />
      <GlassMorphismBlock position={[-1.6, 0.3, 0]} color="#e2b857" label="UN-" delay={0} />
      <GlassMorphismBlock position={[0, 0.3, 0]} color="#8EB69B" label="HAPPY" delay={1.2} />
      <GlassMorphismBlock position={[1.6, 0.3, 0]} color="#7ec8c8" label="-NESS" delay={2.4} />
      <PulsingOrb color="#8EB69B" />
      <Sparkles count={25} scale={5} size={1.5} speed={0.25} color="#8EB69B" opacity={0.25} />
      <ContactShadows position={[0, -0.8, 0]} opacity={0.2} scale={5} blur={2} far={2} />
    </group>
  );
};

/* ── Text Generate Effect ── */

/* ── Magnetic Button ── */
const MagneticButton = ({ children, className = '', onClick, type = 'button', disabled = false }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={className}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.15);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.15);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

/* ── Staggered Form Variants ── */
const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.4 },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);
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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    } else if (data?.user) {
      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp && factors.totp.length > 0) {
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim()) {
      setError('Please enter the 6-digit code');
      return;
    }
    setTotpLoading(true);
    setError('');

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.[0];

    if (!totpFactor) {
      setError('No 2FA factor found. Please contact support.');
      setTotpLoading(false);
      return;
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    });
    if (challengeError) {
      setError('Could not start verification. Please try again.');
      setTotpLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.id,
      code: totpCode.trim(),
    });

    if (verifyError) {
      setError('Invalid code. Please try again.');
    } else {
      navigate(from, { replace: true });
    }
    setTotpLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    setForgotLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: window.location.origin + '/login',
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setForgotSent(true);
    }
    setForgotLoading(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-app text-app flex items-stretch overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-app-deep border-r border-app overflow-hidden flex-col justify-between p-12">
        <AuroraBackground />

        {/* 3D Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="w-full h-80"
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 38 }} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={0.6} />
                <pointLight position={[-3, 2, 4]} intensity={0.5} color="#8EB69B" />
                <pointLight position={[3, -2, 4]} intensity={0.3} color="#7ec8c8" />
                <pointLight position={[0, -1, 3]} intensity={0.2} color="#e2b857" />
                <Auth3DScene />
                <Environment preset="city" />
              </Suspense>
            </Canvas>
          </motion.div>
        </div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
      <div className="w-full lg:w-1/2 relative overflow-hidden">
        <AuroraBackground />
        {/* Radial glow pulse behind card */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full animate-glow-pulse bg-[radial-gradient(circle,rgba(142,182,155,0.22)_0%,rgba(126,200,200,0.10)_45%,transparent_70%)]" />

        {/* Scroll container (only scrolls if viewport is very short) */}
        <div className="relative z-10 h-full overflow-y-auto flex px-6 sm:px-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md m-auto"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app transition-colors mb-4">
            <Home className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <div className="mb-5">
            <span
              className="animate-fade-up inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2b857] border border-[#e2b857]/30 bg-[#e2b857]/10 mb-3"
              style={{ animationDelay: '0.05s' }}
            >
              Researcher Access
            </span>
            <h1
              className="animate-fade-up text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-2"
              style={{ animationDelay: '0.12s' }}
            >
              <span className="animate-gradient-text">Welcome</span>
              <br />
              Back
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-app-muted"
            >
              Sign in to your researcher account
            </motion.p>
          </div>

          {/* Morpheme marquee ticker */}
          <div
            className="animate-fade-up marquee-mask border-y border-app py-1.5 mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-app-subtle"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="animate-marquee">
              {[0, 1].map((dup) => (
                <span key={dup} className="flex shrink-0">
                  {[
                    ['un-', '#e2b857'],
                    ['re-', '#e2b857'],
                    ['pre-', '#e2b857'],
                    ['graph', '#8EB69B'],
                    ['struct', '#8EB69B'],
                    ['phon', '#8EB69B'],
                    ['-able', '#7ec8c8'],
                    ['-tion', '#7ec8c8'],
                    ['-ness', '#7ec8c8'],
                  ].map(([w, c]) => (
                    <span key={dup + w} className="px-4" style={{ color: c as string }}>
                      {w}
                      <span className="text-app-subtle/50 ml-4">/</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass rounded-3xl p-7 border-app shadow-2xl"
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
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle group-focus-within:text-[#8EB69B] transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="input-dark !pl-10 !py-3.5 text-sm transition-shadow duration-300 focus:shadow-[0_0_0_3px_rgba(142,182,155,0.12)]"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={fieldVariants}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setForgotEmail(email); setError(''); }}
                    className="text-xs text-app-muted hover:text-app transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle group-focus-within:text-[#8EB69B] transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-dark !pl-10 !pr-10 !py-3.5 text-sm transition-shadow duration-300 focus:shadow-[0_0_0_3px_rgba(142,182,155,0.12)]"
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
                <MagneticButton
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center !py-3.5 mt-2 text-sm disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Authenticating...' : 'Sign in to Dashboard'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </MagneticButton>
              </motion.div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center text-xs text-app-muted border-t border-app pt-4"
            >
              <span>Don't have an account? </span>
              <Link to="/register" className="text-app font-semibold hover:underline">
                Create Researcher Account
              </Link>
            </motion.div>
          </motion.div>

            {/* ── FORGOT PASSWORD MODAL ── */}
            <AnimatePresence>
              {showForgotPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="glass-strong rounded-3xl p-8 border-app shadow-2xl w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {forgotSent ? (
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          <CheckCircle2 className="w-12 h-12 text-[#8EB69B] mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-app mb-2">Check Your Email</h3>
                        <p className="text-xs text-app-muted mb-6">
                          We sent a password reset link to <span className="text-app font-mono">{forgotEmail}</span>. Please check your inbox.
                        </p>
                        <button
                          type="button"
                          onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                          className="btn-primary w-full justify-center !py-3 text-sm cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-[#8EB69B]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-app">Reset Password</h3>
                            <p className="text-xs text-app-muted">We'll send you a reset link</p>
                          </div>
                        </div>

                        {error && (
                          <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-400 rounded-2xl p-3 mb-4 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div>
                            <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-subtle" />
                              <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="researcher@university.edu"
                                className="input-dark !pl-10 !py-3 text-sm"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(false)}
                              className="flex-1 py-3 rounded-xl bg-app-card border border-app text-app-muted text-sm font-medium hover:text-app transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={forgotLoading}
                              className="flex-1 btn-primary justify-center !py-3 text-sm disabled:opacity-60 cursor-pointer"
                            >
                              {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 2FA VERIFICATION MODAL ── */}
            <AnimatePresence>
              {showTwoFactor && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowTwoFactor(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="glass-strong rounded-3xl p-8 border-app shadow-2xl w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-app-card border border-app flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-[#8EB69B]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-app">Two-Factor Authentication</h3>
                        <p className="text-xs text-app-muted">Enter the code from your authenticator app</p>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/25 text-pink-400 rounded-2xl p-3 mb-4 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleVerifyTotp} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-app-muted font-semibold mb-2">6-Digit Code</label>
                        <input
                          type="text"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="input-dark !py-3 text-sm text-center text-lg font-mono tracking-[0.5em]"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowTwoFactor(false); setTotpCode(''); setError(''); }}
                          className="flex-1 py-3 rounded-xl bg-app-card border border-app text-app-muted text-sm font-medium hover:text-app transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={totpLoading || totpCode.length !== 6}
                          className="flex-1 btn-primary justify-center !py-3 text-sm disabled:opacity-60 cursor-pointer"
                        >
                          {totpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};