import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, BarChart3, Layers,
  GitBranch, FileSearch, ChevronRight, Star,
  BookOpen, Sparkles
} from 'lucide-react';

/* ─── constants ──────────────────────────────────────────────────────── */
const EXAMPLE_WORDS = ['unhappiness', 'disconnection', 'international', 'rewriting', 'beautiful', 'preprocessing'];

const DEMO_MAP: Record<string, { prefix: string; root: string; suffix: string; confidence: number }> = {
  unhappiness:    { prefix: 'un-',    root: 'happy',   suffix: '-ness', confidence: 97 },
  disconnection:  { prefix: 'dis-',   root: 'connect', suffix: '-tion', confidence: 94 },
  international:  { prefix: 'inter-', root: 'nation',  suffix: '-al',   confidence: 91 },
  rewriting:      { prefix: 're-',    root: 'write',   suffix: '-ing',  confidence: 96 },
  beautiful:      { prefix: '',       root: 'beauty',  suffix: '-ful',  confidence: 88 },
  preprocessing:  { prefix: 'pre-',   root: 'process', suffix: '-ing',  confidence: 93 },
};

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Longest-Match Algorithm',
    desc: 'Our proprietary engine uses longest-match-first affix detection with phonological rules to find the most linguistically accurate decomposition.',
    color: 'text-sky-400',
    bg: 'rgba(56,189,248,0.10)',
    border: 'rgba(56,189,248,0.25)',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Dictionary Validation',
    desc: 'Every proposed root is cross-validated against NLTK WordNet to ensure morphological correctness — no hallucinated roots.',
    color: 'text-amber-400',
    bg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.25)',
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'Spelling Rule Engine',
    desc: 'Applies y→i restoration, silent-e restoration, consonant degemination, and 12 more morphophonological rules automatically.',
    color: 'text-emerald-400',
    bg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.25)',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Confidence Scoring',
    desc: 'Every analysis ships with a transparent, rule-derived confidence score — not a black-box probability.',
    color: 'text-pink-400',
    bg: 'rgba(244,114,182,0.10)',
    border: 'rgba(244,114,182,0.25)',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Method Comparison',
    desc: 'Side-by-side compare our rule-based engine against Porter Stemmer, Snowball, and spaCy lemmatizer.',
    color: 'text-cyan-400',
    bg: 'rgba(34,211,238,0.10)',
    border: 'rgba(34,211,238,0.25)',
  },
  {
    icon: <FileSearch className="w-6 h-6" />,
    title: 'Batch Processing',
    desc: 'Upload a .txt or .csv file and analyze thousands of words at once. Download results as structured JSON or CSV.',
    color: 'text-violet-400',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.25)',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Tokenize & Normalize', desc: 'The input is lowercased, punctuation stripped, and validated as a real English token.' },
  { step: '02', title: 'Candidate Generation', desc: 'All known prefixes and suffixes are matched (longest-first). Empty-affix candidates are also included for baseline comparison.' },
  { step: '03', title: 'Spelling Rules Applied', desc: 'For each (prefix, base, suffix) triple, morphophonological rules restore the likely root form (e.g. happi → happy).' },
  { step: '04', title: 'WordNet Validation', desc: 'NLTK checks whether the candidate root exists as a real English word, dramatically boosting accuracy.' },
  { step: '05', title: 'Confidence Ranked', desc: 'All valid decompositions are ranked by a transparent scoring formula. The highest-scoring result is returned.' },
];

const STATS = [
  { value: '90%+', label: 'Prefix Accuracy', sub: 'on benchmark set' },
  { value: '200+', label: 'Affixes', sub: 'in the dictionary' },
  { value: '12', label: 'Spelling Rules', sub: 'morphophonological' },
  { value: '<10ms', label: 'Latency', sub: 'per word analyzed' },
];

const TESTIMONIALS = [
  {
    quote: 'Affixa gave me a clear breakdown of morphemes for every word in my corpus. The confidence scores are genuinely useful for filtering uncertain results.',
    author: 'Priya K.', role: 'NLP Researcher', avatar: 'PK',
  },
  {
    quote: 'The comparison mode is exactly what I needed for my linguistics dissertation. Seeing Porter vs. rule-based side-by-side is invaluable.',
    author: 'James L.', role: 'Computational Linguist', avatar: 'JL',
  },
  {
    quote: 'Finally a tool that explains its reasoning. I can see exactly which spelling rule fired and why the root was accepted.',
    author: 'Amara O.', role: 'PhD Student, Linguistics', avatar: 'AO',
  },
];

/* ─── animated word demo ─────────────────────────────────────────────── */
const WordDemo = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing'|'showing'|'clearing'>('typing');

  useEffect(() => {
    const word = EXAMPLE_WORDS[wordIndex];
    if (phase === 'typing') {
      if (typed.length < word.length) {
        const t = setTimeout(() => setTyped(word.slice(0, typed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('showing'), 600);
        return () => clearTimeout(t);
      }
    }
    if (phase === 'showing') {
      const t = setTimeout(() => setPhase('clearing'), 2400);
      return () => clearTimeout(t);
    }
    if (phase === 'clearing') {
      if (typed.length > 0) {
        const t = setTimeout(() => setTyped(typed.slice(0, -1)), 28);
        return () => clearTimeout(t);
      } else {
        setWordIndex(i => (i + 1) % EXAMPLE_WORDS.length);
        setPhase('typing');
      }
    }
  }, [typed, phase, wordIndex]);

  const word = EXAMPLE_WORDS[wordIndex];
  const demo = DEMO_MAP[word];
  const showBreakdown = phase === 'showing' && typed === word;

  return (
    <div className="glass rounded-2xl p-6 w-full max-w-lg mx-auto border-sky-400/10">
      <div className="mb-4">
        <div className="text-xs text-sky-400/60 uppercase tracking-widest mb-2 font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Live Demo
        </div>
        <div className="input-dark flex items-center gap-1 text-lg font-mono min-h-[52px]">
          <span className="text-white">{typed}</span>
          <span className="cursor text-sky-400 font-thin">|</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showBreakdown && (
          <motion.div
            key={word}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {demo.prefix && (
                <div className="flex flex-col items-center gap-1">
                  <span className="morph-prefix border px-4 py-2 rounded-xl text-lg font-bold font-mono">{demo.prefix}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest">Prefix</span>
                </div>
              )}
              {demo.prefix && <div className="text-slate-600 mt-[-20px]"><ChevronRight className="w-4 h-4" /></div>}
              <div className="flex flex-col items-center gap-1">
                <span className="morph-root border px-4 py-2 rounded-xl text-lg font-bold font-mono">{demo.root}</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest">Root</span>
              </div>
              {demo.suffix && <div className="text-slate-600 mt-[-20px]"><ChevronRight className="w-4 h-4" /></div>}
              {demo.suffix && (
                <div className="flex flex-col items-center gap-1">
                  <span className="morph-suffix border px-4 py-2 rounded-xl text-lg font-bold font-mono">{demo.suffix}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest">Suffix</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${demo.confidence}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-sky-400 to-pink-400 rounded-full"
                  />
                </div>
                <span className="text-white font-semibold">{demo.confidence}%</span>
              </div>
            </div>
          </motion.div>
        )}
        {!showBreakdown && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[88px] flex items-center justify-center"
          >
            <span className="text-slate-600 text-sm">Results will appear here…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── section wrapper ────────────────────────────────────────────────── */
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ─── Landing page ───────────────────────────────────────────────────── */
export const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="hero-bg grid-bg relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/6 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-sky-300 mb-8 border-sky-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                Rule-Based NLP · No hallucinations · Fully explainable
              </div>

              <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] mb-6">
                Break words into<br />
                <span className="gradient-text">their building blocks.</span>
              </h1>

              <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                Affixa is a precision morphological analyzer that identifies <span className="text-amber-400 font-medium">prefixes</span>, <span className="text-sky-400 font-medium">roots</span>, and <span className="text-emerald-400 font-medium">suffixes</span> in any English word — with full confidence scoring and explainability.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/analyzer" className="btn-primary text-base">
                  Try the Analyzer <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/comparison" className="btn-secondary text-base">
                  Compare Methods
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['PK', 'JL', 'AO'].map(av => (
                    <div key={av} className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-pink-400 border-2 border-[#0f172a] flex items-center justify-center text-[10px] font-bold text-[#0f172a]">
                      {av}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-white font-semibold">Loved by linguists</span> and NLP researchers
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <WordDemo />
            <p className="text-center text-xs text-slate-600 mt-4">Cycling through real examples automatically</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-600 uppercase tracking-widest">Scroll to explore</span>
          <div className="w-5 h-8 border border-sky-400/15 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1 h-1.5 bg-sky-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAND ── */}
      <Section className="section-bg border-y border-sky-400/[0.06] py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="stat-badge"
            >
              <span className="text-3xl font-extrabold gradient-text">{s.value}</span>
              <span className="text-sm font-semibold text-white">{s.label}</span>
              <span className="text-xs text-slate-500">{s.sub}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sky-400 text-sm font-semibold uppercase tracking-widest mb-4">Engine Deep-Dive</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">How the NLP engine works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A transparent, step-by-step pipeline — no black boxes.</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-[40px] top-8 bottom-8 w-px bg-gradient-to-b from-sky-400/50 via-pink-400/30 to-transparent" />

            <div className="flex flex-col gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass rounded-2xl p-6 flex gap-6 items-start lg:ml-16 hover:border-sky-400/25 transition-all"
                >
                  <div className="shrink-0 w-12 h-12 lg:-translate-x-[76px] rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-[#0f172a] font-bold text-sm shadow-lg shadow-sky-500/20">
                    {step.step}
                  </div>
                  <div className="lg:-ml-[76px] lg:ml-0">
                    <div className="text-white font-bold text-lg mb-1">{step.title}</div>
                    <div className="text-slate-400 leading-relaxed">{step.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/analyzer" className="btn-primary">
              See it in action <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── FEATURES GRID ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-4">Capabilities</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">Everything you need to analyze morphology</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Built for linguists, NLP researchers, and language enthusiasts.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="glass rounded-2xl p-6 group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <span className={f.color}>{f.icon}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── MORPHEME BREAKDOWN EXPLAINER ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sky-400 text-sm font-semibold uppercase tracking-widest mb-4">Explainability First</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Every result fully explained
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Unlike black-box models, Affixa tells you exactly <em className="text-pink-400 not-italic font-medium">why</em> it made its decision — which rule fired, what the confidence formula returned, and whether the root was validated by WordNet.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Prefix color-coded in amber', color: 'bg-amber-400' },
                { label: 'Root color-coded in electric blue', color: 'bg-sky-400' },
                { label: 'Suffix color-coded in emerald', color: 'bg-emerald-400' },
                { label: 'Confidence bar with numerical score', color: 'bg-pink-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="text-slate-300 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/analyzer" className="btn-primary">
                Try it now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border-sky-400/10">
            <div className="text-xs text-sky-400/60 uppercase tracking-widest mb-4 font-medium">Example · "international"</div>
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: 'inter-', type: 'Prefix', cls: 'morph-prefix' },
                { label: 'nation', type: 'Root', cls: 'morph-root' },
                { label: '-al', type: 'Suffix', cls: 'morph-suffix' },
              ].map(m => (
                <div key={m.type} className="flex flex-col items-center gap-1.5">
                  <span className={`${m.cls} border rounded-xl px-5 py-2.5 text-xl font-bold font-mono`}>{m.label}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest">{m.type}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                { k: 'Spelling Rule', v: 'none' },
                { k: 'Validation', v: '✓ WordNet confirmed' },
                { k: 'Method', v: 'Rule-based (longest-match)' },
                { k: 'Confidence', v: '91%' },
              ].map(row => (
                <div key={row.k} className="flex justify-between text-sm border-t border-sky-400/[0.06] pt-3">
                  <span className="text-slate-500">{row.k}</span>
                  <span className="text-slate-200 font-medium">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-4">Testimonials</div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Trusted by language researchers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-pink-400 flex items-center justify-center text-xs font-bold text-[#0f172a]">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.author}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/8 to-pink-500/5 rounded-3xl" />
            <div className="relative z-10">
              <BookOpen className="w-12 h-12 text-sky-400 mx-auto mb-6" />
              <h2 className="text-4xl font-extrabold text-white mb-4">Start analyzing words today</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
                No signup required to try the analyzer. Create an account to save history, run batch jobs, and access analytics.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/analyzer" className="btn-primary text-base">
                  Open Analyzer <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register" className="btn-secondary text-base">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-sky-400/[0.06] py-12 px-6 bg-[#0b1120]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#0f172a] fill-[#0f172a]" />
            </div>
            <span className="font-bold text-white">Affixa</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link to="/analyzer" className="hover:text-sky-400 transition-colors">Analyzer</Link>
            <Link to="/comparison" className="hover:text-sky-400 transition-colors">Compare</Link>
            <Link to="/analytics" className="hover:text-sky-400 transition-colors">Analytics</Link>
            <Link to="/batch" className="hover:text-sky-400 transition-colors">Batch</Link>
          </div>
          <div className="text-sm text-slate-600">
            © 2026 Affixa · Morphological Analysis Engine
          </div>
        </div>
      </footer>
    </div>
  );
};
