import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, BookOpen, Layers, Sliders, BarChart3, FileSearch, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import prefixesData from '../../../backend/app/nlp/dictionaries/prefixes.json';
import suffixesData from '../../../backend/app/nlp/dictionaries/suffixes.json';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Morphological Analyzer', to: '/analyzer', icon: Search, category: 'Navigation' },
  { label: 'Batch Corpus Processing', to: '/batch', icon: FileSearch, category: 'Navigation' },
  { label: 'Multi-Model Comparison', to: '/comparison', icon: Layers, category: 'Navigation' },
  { label: 'Analytics Dashboard', to: '/analytics', icon: BarChart3, category: 'Navigation' },
  { label: 'Affix Library & Dictionary', to: '/dictionary', icon: BookOpen, category: 'Navigation' },
  { label: 'Engine & Profile Settings', to: '/settings', icon: Sliders, category: 'Navigation' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search matching nav items
  const matchedNav = NAV_ITEMS.filter(item =>
    item.label.toLowerCase().includes(trimmed) || item.to.toLowerCase().includes(trimmed)
  );

  // Search matching affixes
  const allAffixes = [
    ...(prefixesData as any[]).map(p => ({ affix: p.affix, type: 'Prefix', desc: p.description, example: p.example_word })),
    ...(suffixesData as any[]).map(s => ({ affix: s.affix, type: 'Suffix', desc: s.description, example: s.example_word })),
  ];

  const matchedAffixes = trimmed
    ? allAffixes.filter(a => a.affix.toLowerCase().includes(trimmed) || a.example?.toLowerCase().includes(trimmed)).slice(0, 4)
    : [];

  const handleSelectNav = (to: string) => {
    onClose();
    navigate(to);
  };

  const handleAnalyzeWord = (word: string) => {
    onClose();
    navigate('/analyzer', { state: { autoAnalyze: word } });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl glass-strong rounded-3xl border border-app shadow-2xl overflow-hidden z-10"
        >
          {/* Search bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-app bg-app-card">
            <Search className="w-5 h-5 text-app-muted mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleAnalyzeWord(query.trim());
                }
              }}
              placeholder="Search views, look up affixes, or type a word to analyze..."
              className="w-full bg-transparent text-app placeholder:text-app-subtle text-sm focus:outline-none"
            />
            {query ? (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-app-subtle hover:text-app cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-app border border-app text-app-subtle">
                ESC
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {/* Quick Word Analysis Option */}
            {query.trim().length > 1 && (
              <div
                onClick={() => handleAnalyzeWord(query.trim())}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#8EB69B]/10 hover:bg-[#8EB69B]/20 border border-[#8EB69B]/25 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#8EB69B]/20 flex items-center justify-center text-[#8EB69B]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-app-subtle block">Analyze input word</span>
                    <span className="text-sm font-bold text-app font-mono">{query.trim()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-app-muted font-medium">
                  <span>Deconstruct</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Navigation Results */}
            {matchedNav.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-app-subtle px-3 py-1.5 block">
                  Workspace Pages
                </span>
                {matchedNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => handleSelectNav(item.to)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-app-card text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-app-muted group-hover:text-app transition-colors" />
                        <span className="text-xs font-semibold text-app">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-app-subtle group-hover:text-app transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Matching Affixes */}
            {matchedAffixes.length > 0 && (
              <div className="pt-2 border-t border-app">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-app-subtle px-3 py-1.5 block">
                  Dictionary Affixes
                </span>
                {matchedAffixes.map((affix, idx) => (
                  <div
                    key={`${affix.affix}-${idx}`}
                    onClick={() => {
                      onClose();
                      navigate('/dictionary');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-app-card transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-sm font-bold ${affix.type === 'Prefix' ? 'text-amber-500' : 'text-teal-600'}`}>
                        {affix.type === 'Prefix' ? `${affix.affix}-` : `-${affix.affix}`}
                      </span>
                      <span className="text-xs text-app-muted truncate max-w-[280px]">
                        {affix.desc || `Common English ${affix.type.toLowerCase()}`}
                      </span>
                    </div>
                    {affix.example && (
                      <span className="text-[11px] font-mono text-app-subtle bg-app-card px-2 py-0.5 rounded border border-app">
                        ex: {affix.example}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {matchedNav.length === 0 && matchedAffixes.length === 0 && !query.trim() && (
              <div className="p-6 text-center text-xs text-app-subtle">
                Type a keyword to navigate or enter any word to run real-time morphological analysis.
              </div>
            )}
          </div>

          {/* Footer Hints */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-app-deep border-t border-app text-[11px] text-app-subtle font-mono">
            <div className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 rounded bg-app-card border border-app">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-app-card border border-app">↵</kbd> Select</span>
            </div>
            <span>Affixa NLP v1.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
