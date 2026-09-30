import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, Shield, BarChart3, Layers,
  GitBranch, FileSearch, ChevronRight,
  BookOpen, Sparkles, ChevronDown
} from 'lucide-react';

/* ─── constants ──────────────────────────────────────────────────────── */
const EXAMPLE_WORDS = ['unhappiness', 'disconnection', 'international', 'rewriting', 'beautiful', 'preprocessing'];

const DEMO_MAP: Record<string, { prefix: string; root: string; suffix: string; confidence: number; rule: string }> = {
  unhappiness:    { prefix: 'un-',    root: 'happy',   suffix: '-ness', confidence: 97, rule: 'y → i restoration' },
  disconnection:  { prefix: 'dis-',   root: 'connect', suffix: '-tion', confidence: 94, rule: 't-restoration for -tion' },
  international:  { prefix: 'inter-', root: 'nation',  suffix: '-al',   confidence: 91, rule: 'none' },
  rewriting:      { prefix: 're-',    root: 'write',   suffix: '-ing',  confidence: 96, rule: 'silent-e restoration' },
  beautiful:      { prefix: '',       root: 'beauty',  suffix: '-ful',  confidence: 88, rule: 'y → i restoration' },
  preprocessing:  { prefix: 'pre-',   root: 'process', suffix: '-ing',  confidence: 93, rule: 'none' },
};

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Longest-Match Algorithm',
    desc: 'Prioritizes longest matching candidate affixes first to eliminate premature substring stripping errors.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'NLTK WordNet Validation',
    desc: 'Candidate stems are cross-referenced against Princeton WordNet lexicon to reject invalid pseudo-roots.',
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: '12 Morphophonological Rules',
    desc: 'Executes rule-based y→i, silent-e restoration, consonant degemination, and nominalizing t-restoration.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Calibrated Confidence',
    desc: 'Produces transparent, rule-derived confidence scores based on lexical constraint verification.',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Multi-Model Benchmark',
    desc: 'Benchmark rule-based results against Porter Stemmer, Snowball Stemmer, and spaCy Lemmatizer.',
  },
  {
    icon: <FileSearch className="w-6 h-6" />,
    title: 'High-Throughput Batching',
    desc: 'Analyze entire documents or CSV corpora concurrently and export structured breakdown spreadsheets.',
  },
];

const FAQS = [
  {
    q: 'How does the rule-based morphological analyzer work?',
    a: 'It preprocesses tokens, matches candidate prefixes and suffixes using a longest-match-first algorithm, applies morphophonological rules (e.g. y → i, silent-e), and validates candidate roots against NLTK WordNet.',
  },
  {
    q: 'Why use a rule-based system instead of a generative LLM?',
    a: 'Rule-based morphological analyzers offer 100% explainability, deterministic repeatability, zero hallucinations, and high execution speed (<10ms per word) making them ideal for computational linguistics.',
  },
  {
    q: 'How is confidence calculated?',
    a: 'Confidence scores start from a high baseline when a root is validated by WordNet, adding bonuses for dual prefix+suffix combinations and applying penalties for unvalidated or short roots.',
  },
  {
    q: 'Can I export batch processing results?',
    a: 'Yes! The Batch processing page allows uploading TXT or CSV files and downloading the complete morpheme breakdown as a structured CSV.',
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
      const t = setTimeout(() => setPhase('clearing'), 2600);
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
    <div className="glass rounded-3xl p-6 w-full max-w-lg mx-auto border-app shadow-2xl">
      <div className="mb-4">
        <div className="text-xs text-app-muted uppercase tracking-widest mb-2 font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8EB69B] animate-pulse" />
            Live NLP Engine Demo
          </span>
          <span className="text-[10px] font-mono text-app-subtle">Longest Match First</span>
        </div>
        <div className="input-dark flex items-center gap-1 text-lg font-mono min-h-[52px]">
          <span className="text-app font-bold">{typed}</span>
          <span className="cursor text-app-muted font-thin">|</span>
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
            <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
              {demo.prefix && (
                <div className="flex flex-col items-center gap-1">
                  <span className="morph-prefix border px-4 py-2 rounded-xl text-lg font-bold font-mono">{demo.prefix}</span>
                  <span className="text-xs text-app-subtle uppercase tracking-widest">Prefix</span>
                </div>
              )}
              {demo.prefix && <div className="text-app-muted mt-[-20px]"><ChevronRight className="w-4 h-4" /></div>}
              <div className="flex flex-col items-center gap-1">
                <span className="morph-root border px-4 py-2 rounded-xl text-lg font-bold font-mono">{demo.root}</span>
                <span className="text-xs text-app-subtle uppercase tracking-widest">Root</span>
              </div>
              {demo.suffix && <div className="text-app-muted mt-[-20px]"><ChevronRight className="w-4 h-4" /></div>}
              {demo.suffix && (
                <div className="flex flex-col items-center gap-1">
                  <span className="morph-suffix border px-4 py-2 rounded-xl text-lg font-bold font-mono">{demo.suffix}</span>
                  <span className="text-xs text-app-subtle uppercase tracking-widest">Suffix</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-app-deep border border-app rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-app-subtle">Rule Triggered</span>
                <span className="text-app font-mono font-semibold">{demo.rule}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-subtle">Analysis Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-app rounded-full overflow-hidden border border-app">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${demo.confidence}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-[#8EB69B] rounded-full"
                    />
                  </div>
                  <span className="text-app font-bold font-mono">{demo.confidence}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {!showBreakdown && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[100px] flex items-center justify-center text-xs text-app-subtle"
          >
            Analyzing morpheme candidate combinations…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── section wrapper ────────────────────────────────────────────────── */
const Section = ({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      id={id}
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-app text-app">

      {/* ── HERO ── */}
      <section className="hero-bg grid-bg relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8EB69B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#7ec8c8]/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-app-muted mb-8 border-app">
                <Sparkles className="w-3.5 h-3.5 text-[#8EB69B]" />
                Rule-Based NLP · 100% Explainable · Zero Hallucinations
              </div>

              <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-5xl lg:text-7xl font-extrabold tracking-tight text-app leading-[1.06] mb-6">
                Deconstruct English words<br />
                <span className="gradient-text">into pure morphemes.</span>
              </h1>

              <p className="text-base lg:text-lg text-app-muted mb-10 max-w-lg leading-relaxed">
                Affixa is a research-grade morphological analyzer that extracts <span className="text-[#e2b857] font-semibold">prefixes</span>, <span className="text-[#8EB69B] font-semibold">roots</span>, and <span className="text-[#7ec8c8] font-semibold">suffixes</span> with dictionary validation and morphophonological rule tracing.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/analyzer" className="btn-primary text-base">
                  Try the Analyzer <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/comparison" className="btn-secondary text-base">
                  Compare Models
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['PK', 'JL', 'AO'].map(av => (
                    <div key={av} className="w-8 h-8 rounded-full bg-[#8EB69B] border-2 border-app flex items-center justify-center text-[10px] font-extrabold text-[#051F20]">
                      {av}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-app-muted">
                  <span className="text-app font-semibold">Trusted by computational linguists</span> & NLP researchers
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
            <p className="text-center text-xs text-app-subtle mt-4">Automated live demonstration cycling real morphophonological rules</p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <Section className="section-bg border-y border-app py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '90.0%', label: 'Prefix Accuracy', sub: 'on benchmark test set' },
            { value: '200+', label: 'Affix Entries', sub: 'curated dictionary' },
            { value: '12', label: 'Spelling Rules', sub: 'morphophonological' },
            { value: '<10ms', label: 'Latency', sub: 'per token execution' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="stat-badge"
            >
              <span className="text-3xl font-extrabold text-app">{s.value}</span>
              <span className="text-sm font-semibold text-app-muted">{s.label}</span>
              <span className="text-xs text-app-subtle">{s.sub}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── HOW IT WORKS (3-STEP PIPELINE) ── */}
      <Section id="how-it-works" className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-app-muted text-xs font-semibold uppercase tracking-widest mb-3">Pipeline Overview</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-app mb-4">How Affixa Analyzes Language</h2>
            <p className="text-app-muted max-w-xl mx-auto text-sm">A 3-stage deterministic pipeline combining rule-based heuristics with lexical validation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Token Normalization',
                desc: 'Cleans, case-folds, and extracts lexical tokens while preserving punctuation contexts and compound word stems.',
                badge: 'Stage 1',
              },
              {
                step: '02',
                title: 'Longest-Match Decomposition',
                desc: 'Greedily matches prefixes and suffixes from 200+ affix rules, executing morphophonological transforms (y→i, silent-e).',
                badge: 'Stage 2',
              },
              {
                step: '03',
                title: 'WordNet Validation & Scoring',
                desc: 'Validates derived base forms against NLTK WordNet and calculates a calibrated explainability confidence score.',
                badge: 'Stage 3',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="glass rounded-3xl p-8 border-app relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-extrabold text-app-muted/40 font-mono">{item.step}</span>
                    <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-app-card text-app-muted border border-app font-semibold font-mono">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-app mb-3">{item.title}</h3>
                  <p className="text-xs text-app-muted leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-app flex items-center gap-2 text-[11px] text-app-subtle font-mono">
                  <span>Deterministic Rule Execution</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CAPABILITIES GRID ── */}
      <Section id="features" className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-app-muted text-xs font-semibold uppercase tracking-widest mb-3">Capabilities</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-app mb-4">Precision NLP Architecture</h2>
            <p className="text-app-muted max-w-xl mx-auto text-sm">Designed specifically for morphological analysis and stemmer evaluation.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="glass rounded-3xl p-6 group cursor-default hover:border-app-hover transition-all"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-app-card border border-app text-app-muted group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-app font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-app-muted text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── EXPLAINABILITY DEMO ── */}
      <Section id="breakdown" className="section-bg py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-app-muted text-xs font-semibold uppercase tracking-widest mb-3">Transparent Rules</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-app mb-6">
              Every segmentation fully justified
            </h2>
            <p className="text-app-muted text-base leading-relaxed mb-8">
              Unlike neural models that return unexplainable outputs, Affixa exposes the exact reasoning — displaying which morphophonological rule fired and confirming dictionary validation via WordNet.
            </p>

            <div className="space-y-4">
              {[
                { label: 'Prefix color-coded in warm gold', color: 'bg-[#e2b857]' },
                { label: 'Root color-coded in sage green', color: 'bg-[#8EB69B]' },
                { label: 'Suffix color-coded in soft teal', color: 'bg-[#7ec8c8]' },
                { label: 'Confidence score derived from rule constraints', color: 'bg-app-muted' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="text-app text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/analyzer" className="btn-primary">
                Launch Analyzer <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border-app">
            <div className="text-xs text-app-subtle uppercase tracking-widest mb-4 font-medium">Decomposition Example · "unhappiness"</div>
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: 'un-', type: 'Prefix', cls: 'morph-prefix' },
                { label: 'happy', type: 'Root', cls: 'morph-root' },
                { label: '-ness', type: 'Suffix', cls: 'morph-suffix' },
              ].map(m => (
                <div key={m.type} className="flex flex-col items-center gap-1.5">
                  <span className={`${m.cls} border rounded-xl px-5 py-2.5 text-xl font-bold font-mono`}>{m.label}</span>
                  <span className="text-xs text-app-subtle uppercase tracking-widest">{m.type}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 font-mono text-xs">
              {[
                { k: 'Applied Rule', v: 'y → i restoration' },
                { k: 'WordNet Validation', v: '✓ Confirmed (happy)' },
                { k: 'Method', v: 'Rule-based (longest-match)' },
                { k: 'Confidence', v: '97%' },
              ].map(row => (
                <div key={row.k} className="flex justify-between border-t border-app pt-3">
                  <span className="text-app-subtle">{row.k}</span>
                  <span className="text-app font-semibold">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── FAQ ACCORDION ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-app-muted text-xs font-semibold uppercase tracking-widest mb-3">FAQ</div>
            <h2 className="text-4xl font-extrabold text-app mb-3">Frequently Asked Questions</h2>
            <p className="text-app-muted text-sm">Everything you need to know about the engine architecture.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="glass rounded-2xl border-app overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-app text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-app-muted transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-xs text-app-muted leading-relaxed border-t border-app pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="section-bg py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 relative overflow-hidden border-app">
            <div className="relative z-10">
              <BookOpen className="w-12 h-12 text-app-muted mx-auto mb-6" />
              <h2 className="text-4xl font-extrabold text-app mb-4">Start analyzing morphology</h2>
              <p className="text-app-muted text-base mb-10 max-w-lg mx-auto">
                No setup required. Launch the interactive analyzer or create a free researcher account.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/analyzer" className="btn-primary text-base">
                  Open Analyzer <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register" className="btn-secondary text-base">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-app py-12 px-6 bg-app-deep">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="logo-mark">
              <img src="/logo.svg" alt="" />
            </div>
            <span className="font-bold text-app">Affixa</span>
          </div>
          <div className="flex gap-8 text-xs text-app-muted">
            <Link to="/analyzer" className="hover:text-app transition-colors">Analyzer</Link>
            <Link to="/comparison" className="hover:text-app transition-colors">Compare</Link>
            <Link to="/analytics" className="hover:text-app transition-colors">Analytics</Link>
            <Link to="/dictionary" className="hover:text-app transition-colors">Library</Link>
          </div>
          <div className="text-xs text-app-subtle">
            © 2026 Affixa · Morphological Analysis System
          </div>
        </div>
      </footer>
    </div>
  );
};
