import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, BookOpen, Layers, Sliders, BarChart3, FileSearch, ArrowRight, CornerDownLeft, X, User } from 'lucide-react';
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
  { label: 'Profile', to: '/profile', icon: User, category: 'Navigation' },
  { label: 'Settings', to: '/settings', icon: Sliders, category: 'Navigation' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Focus trap — keep Tab cycling within the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const modal = document.getElementById('command-palette');
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const trimmed = query.trim().toLowerCase();

  const matchedNav = useMemo(
    () => NAV_ITEMS.filter(item =>
      item.label.toLowerCase().includes(trimmed) || item.to.toLowerCase().includes(trimmed)
    ),
    [trimmed]
  );

  const allAffixes = useMemo(() => [
    ...(prefixesData as any[]).map(p => ({ affix: p.affix, type: 'Prefix', desc: p.description, example: p.example_word })),
    ...(suffixesData as any[]).map(s => ({ affix: s.affix, type: 'Suffix', desc: s.description, example: s.example_word })),
  ], []);

  const matchedAffixes = useMemo(() => trimmed
    ? allAffixes.filter(a => a.affix.toLowerCase().includes(trimmed) || a.example?.toLowerCase().includes(trimmed)).slice(0, 4)
    : [], [trimmed, allAffixes]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const items: { type: 'analyze' | 'nav' | 'affix'; data: any }[] = [];
    if (query.trim().length > 1) items.push({ type: 'analyze', data: query.trim() });
    matchedNav.forEach(item => items.push({ type: 'nav', data: item }));
    matchedAffixes.forEach(item => items.push({ type: 'affix', data: item }));
    return items;
  }, [query, matchedNav, matchedAffixes]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (!item) return;
      if (item.type === 'analyze') handleAnalyzeWord(item.data);
      else if (item.type === 'nav') handleSelectNav(item.data.to);
      else { onClose(); navigate('/dictionary'); }
    }
  }, [flatItems, activeIndex, onClose, navigate]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const handleSelectNav = (to: string) => {
    onClose();
    navigate(to);
  };

  const handleAnalyzeWord = (word: string) => {
    onClose();
    navigate('/analyzer', { state: { autoAnalyze: word } });
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" role="dialog" aria-modal="true" aria-label="Command palette">
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
          id="command-palette"
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
              onKeyDown={handleKeyDown}
              placeholder="Search views, look up affixes, or type a word to analyze..."
              className="w-full bg-transparent text-app placeholder:text-app-subtle text-sm focus:outline-none"
              aria-label="Search command palette"
              aria-expanded={flatItems.length > 0}
              aria-controls="command-palette-results"
              role="combobox"
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
          <div id="command-palette-results" ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1" role="listbox" aria-label="Search results">
            {/* Quick Word Analysis Option */}
            {query.trim().length > 1 && (() => { flatIndex++; const idx = flatIndex; return (
              <div
                data-index={idx}
                onClick={() => handleAnalyzeWord(query.trim())}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer group ${idx === activeIndex ? 'bg-[#8EB69B]/20 border-[#8EB69B]/25' : 'bg-[#8EB69B]/10 border-[#8EB69B]/25 hover:bg-[#8EB69B]/20'}`}
                role="option"
                aria-selected={idx === activeIndex}
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
            ); })()}

            {/* Navigation Results */}
            {matchedNav.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-app-subtle px-3 py-1.5 block">
                  Workspace Pages
                </span>
                {matchedNav.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      data-index={idx}
                      onClick={() => handleSelectNav(item.to)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer group ${idx === activeIndex ? 'bg-app-card border border-app' : 'hover:bg-app-card border border-transparent'}`}
                      role="option"
                      aria-selected={idx === activeIndex}
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
                {matchedAffixes.map((affix) => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <div
                      key={`${affix.affix}-${idx}`}
                      data-index={idx}
                      onClick={() => { onClose(); navigate('/dictionary'); }}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${idx === activeIndex ? 'bg-app-card' : 'hover:bg-app-card'}`}
                      role="option"
                      aria-selected={idx === activeIndex}
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
                  );
                })}
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
