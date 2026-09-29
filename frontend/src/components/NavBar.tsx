import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, ChevronDown, Settings, BookOpen, Sun, Moon, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const publicNavLinks = [
  { to: '/#features', label: 'Capabilities' },
  { to: '/#how-it-works', label: 'Methodology' },
  { to: '/#breakdown', label: 'Explainability' },
  { to: '/#testimonials', label: 'Benchmark' },
];

const protectedNavLinks = [
  { to: '/analyzer', label: 'Analyzer' },
  { to: '/batch', label: 'Batch' },
  { to: '/comparison', label: 'Compare' },
  { to: '/analytics', label: 'Dashboard' },
  { to: '/dictionary', label: 'Affix Library' },
];

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher';

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-var(--bg-deep) border-b border-var(--border) backdrop-blur-xl shadow-2xl'
            : 'bg-var(--bg)/90 backdrop-blur-md border-b border-var(--border)'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo Mark: Typography emblem for Affixa */}
          <NavLink to="/" className="flex items-center gap-3 group shrink-0">
            <div className="logo-mark font-['Bricolage_Grotesque',sans-serif]">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-var(--text)">
              Affix<span className="text-var(--primary)">a</span>
            </span>
          </NavLink>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {session ? (
              protectedNavLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-var(--text) bg-var(--border) border border-var(--border-hover)'
                        : 'text-var(--text-muted) hover:text-var(--text) hover:bg-var(--bg-card)'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))
            ) : (
              publicNavLinks.map(link => (
                <a
                  key={link.to}
                  href={link.to}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-var(--text-muted) hover:text-var(--text) hover:bg-var(--bg-card) transition-all duration-200"
                >
                  {link.label}
                </a>
              ))
            )}
          </nav>

          {/* Header Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Engine Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-var(--bg-card) border border-var(--border) text-xs text-var(--primary)">
              <span className="w-2 h-2 rounded-full bg-var(--primary) animate-pulse" />
              <span className="font-semibold">Engine Active</span>
            </div>

            {/* Shortcut Badge */}
            <button
              onClick={() => navigate('/analyzer')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-var(--bg-card) border border-var(--border) text-xs text-var(--text-muted) hover:text-var(--text) transition-colors"
              title="Quick Search Analyzer"
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-var(--text-muted) hover:text-var(--text) hover:bg-var(--bg-card) border border-var(--border) transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-700" />}
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-var(--text) bg-var(--bg-card) border border-var(--border) hover:border-var(--border-hover) transition-all text-sm font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-var(--primary) text-white flex items-center justify-center text-xs font-extrabold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="max-w-[130px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-var(--text-muted) transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl overflow-hidden shadow-2xl border border-var(--border)"
                    >
                      <div className="px-4 py-3 border-b border-var(--border) bg-var(--bg-card)">
                        <p className="text-xs text-var(--text-muted)">Signed in as</p>
                        <p className="text-sm text-var(--text) font-medium truncate">{user?.email}</p>
                      </div>

                      <div className="p-1.5 space-y-1">
                        <NavLink
                          to="/settings"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-var(--text) hover:bg-var(--bg-card-hover) transition-colors"
                        >
                          <Settings className="w-4 h-4 text-var(--primary)" />
                          Settings & Engine
                        </NavLink>
                        <NavLink
                          to="/dictionary"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-var(--text) hover:bg-var(--bg-card-hover) transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-var(--primary)" />
                          Affix Library
                        </NavLink>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-amber-500" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="text-sm font-medium text-var(--text-muted) hover:text-var(--text) transition-colors px-4 py-2"
                >
                  Sign in
                </NavLink>
                <NavLink to="/register" className="btn-primary !py-2 !px-5 !text-sm">
                  Get Started
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-var(--text-muted) border border-var(--border)"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-700" />}
            </button>
            <button
              className="p-2 text-var(--text-muted) hover:text-var(--text) transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed top-16 left-0 right-0 z-40 bg-var(--bg-deep) border-b border-var(--border) backdrop-blur-xl px-6 py-4 flex flex-col gap-1 md:hidden"
          >
            {session ? (
              protectedNavLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'text-var(--text) bg-var(--bg-card)' : 'text-var(--text-muted) hover:text-var(--text)'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))
            ) : (
              publicNavLinks.map(link => (
                <a
                  key={link.to}
                  href={link.to}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-var(--text-muted) hover:text-var(--text) transition-all"
                >
                  {link.label}
                </a>
              ))
            )}

            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-var(--border)">
              {session ? (
                <>
                  <div className="px-4 py-2 text-sm text-var(--text-muted) flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {user?.email}
                  </div>
                  <NavLink to="/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-var(--text) rounded-xl hover:bg-var(--bg-card) transition-all">
                    <Settings className="w-4 h-4 text-var(--primary)" />
                    Settings
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-amber-500 rounded-xl hover:bg-amber-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="px-4 py-3 text-center text-sm text-var(--text-muted) rounded-xl hover:text-var(--text) transition-all">
                    Sign in
                  </NavLink>
                  <NavLink to="/register" className="btn-primary justify-center !py-3 !text-sm">
                    Get Started
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
