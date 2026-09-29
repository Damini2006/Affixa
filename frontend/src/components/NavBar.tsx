import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, ChevronDown, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/analyzer', label: 'Analyzer', protected: true },
  { to: '/batch', label: 'Batch', protected: true },
  { to: '/comparison', label: 'Compare', protected: true },
  { to: '/analytics', label: 'Dashboard', protected: true },
  { to: '/dictionary', label: 'Affix Library', protected: true },
];

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, signOut } = useAuth();

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
            ? 'bg-[#051F20]/95 border-b border-[#8EB69B]/15 backdrop-blur-xl shadow-2xl shadow-[#051F20]'
            : 'bg-[#051F20]/80 backdrop-blur-md border-b border-[#8EB69B]/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Mark: Typography emblem for Affixa */}
          <NavLink to="/" className="flex items-center gap-3 group shrink-0">
            <div className="logo-mark font-['Bricolage_Grotesque',sans-serif]">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-[#DAF1DE]">
              Affix<span className="text-[#8EB69B]">a</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              if (link.protected && !session) return null;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#DAF1DE] bg-[#8EB69B]/15 border border-[#8EB69B]/20'
                        : 'text-[#8EB69B]/70 hover:text-[#DAF1DE] hover:bg-[#8EB69B]/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[#DAF1DE] bg-[#0B2B26] border border-[#8EB69B]/20 hover:border-[#8EB69B]/40 transition-all text-sm font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8EB69B] text-[#051F20] flex items-center justify-center text-xs font-extrabold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="max-w-[130px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#8EB69B] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-[#8EB69B]/20"
                    >
                      <div className="px-4 py-3 border-b border-[#8EB69B]/10 bg-[#0B2B26]/60">
                        <p className="text-xs text-[#8EB69B]/60">Signed in as</p>
                        <p className="text-sm text-[#DAF1DE] font-medium truncate">{user?.email}</p>
                      </div>

                      <div className="p-1.5 space-y-1">
                        <NavLink
                          to="/settings"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#DAF1DE] hover:bg-[#8EB69B]/15 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[#8EB69B]" />
                          Settings & Engine
                        </NavLink>
                        <NavLink
                          to="/dictionary"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[#DAF1DE] hover:bg-[#8EB69B]/15 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-[#8EB69B]" />
                          Affix Library
                        </NavLink>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-amber-400/90 hover:bg-amber-400/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-amber-400" />
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
                  className="text-sm font-medium text-[#8EB69B] hover:text-[#DAF1DE] transition-colors px-4 py-2"
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
          <button
            className="md:hidden p-2 text-[#8EB69B] hover:text-[#DAF1DE] transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
            className="fixed top-16 left-0 right-0 z-40 bg-[#0B2B26]/98 border-b border-[#8EB69B]/15 backdrop-blur-xl px-6 py-4 flex flex-col gap-1 md:hidden"
          >
            {session && navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'text-[#DAF1DE] bg-[#8EB69B]/15' : 'text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#8EB69B]/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-[#8EB69B]/15">
              {session ? (
                <>
                  <div className="px-4 py-2 text-sm text-[#8EB69B] flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {user?.email}
                  </div>
                  <NavLink to="/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-[#DAF1DE] rounded-xl hover:bg-[#8EB69B]/15 transition-all">
                    <Settings className="w-4 h-4 text-[#8EB69B]" />
                    Settings
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-amber-400 rounded-xl hover:bg-amber-400/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="px-4 py-3 text-center text-sm text-[#8EB69B] rounded-xl hover:bg-[#8EB69B]/10 hover:text-[#DAF1DE] transition-all">
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
