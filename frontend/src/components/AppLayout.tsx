import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Sliders, BookOpen, Layers, BarChart3, FileSearch,
  LogOut, ChevronLeft, ChevronRight, CheckCircle2, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const sidebarItems = [
  { to: '/analyzer', label: 'Analyzer', icon: Search, badge: 'NLP Core' },
  { to: '/batch', label: 'Batch Processing', icon: FileSearch, badge: 'CSV/TXT' },
  { to: '/comparison', label: 'Model Comparison', icon: Layers, badge: 'Matrix' },
  { to: '/analytics', label: 'Analytics Dashboard', icon: BarChart3, badge: 'Live' },
  { to: '/dictionary', label: 'Affix Library', icon: BookOpen, badge: '200+' },
  { to: '/settings', label: 'Engine Settings', icon: Sliders, badge: 'Config' },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher';
  const activeItem = sidebarItems.find(item => item.to === location.pathname) || sidebarItems[0];

  return (
    <div className="min-h-screen bg-var(--bg) text-var(--text) flex overflow-hidden">
      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-var(--bg-deep) border-r border-var(--border) flex flex-col justify-between shrink-0 relative z-30"
      >
        {/* Top logo & toggle */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-var(--border)">
            <NavLink to="/analyzer" className="flex items-center gap-3 overflow-hidden">
              <div className="logo-mark shrink-0">A</div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-lg tracking-tight text-var(--text) whitespace-nowrap"
                >
                  Affix<span className="text-var(--primary)">a</span>
                  <span className="ml-2 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-var(--primary)/20 text-var(--primary) font-mono border border-var(--primary)/30">
                    Pro
                  </span>
                </motion.span>
              )}
            </NavLink>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-var(--text-muted) hover:text-var(--text) hover:bg-var(--bg-card) transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1 mt-2">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-var(--bg-card) text-var(--text) border border-var(--border-hover) shadow-lg'
                      : 'text-var(--text-muted) hover:text-var(--text) hover:bg-var(--bg-card)'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3.5 shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-var(--primary)' : 'text-var(--text-muted) group-hover:text-var(--primary)'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-var(--primary) text-white font-bold' : 'bg-var(--bg-card) text-var(--text-subtle)'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-3 border-t border-var(--border) bg-var(--bg-card)">
          {!collapsed ? (
            <div className="glass p-3 rounded-2xl border-var(--border) flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-var(--primary) text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-var(--text) truncate">{displayName}</p>
                  <p className="text-[10px] text-var(--text-subtle) truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 px-8 border-b border-var(--border) bg-var(--bg-deep)/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <activeItem.icon className="w-5 h-5 text-var(--primary)" />
            <h2 className="font-bold text-base text-var(--text)">{activeItem.label}</h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Theme Toggle Button in App Header */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-var(--bg-card) border border-var(--border) text-var(--text) hover:border-var(--border-hover) transition-all"
            >
              {theme === 'dark' ? (
                <><Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode</>
              ) : (
                <><Moon className="w-3.5 h-3.5 text-teal-700" /> Dark Mode</>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-var(--bg-card) border border-var(--border) text-var(--primary)">
              <span className="w-2 h-2 rounded-full bg-var(--primary) animate-pulse" />
              <span>FastAPI Connected (8000)</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-var(--bg-card) border border-var(--border) text-var(--primary)">
              <CheckCircle2 className="w-3.5 h-3.5 text-var(--primary)" />
              <span>Supabase RLS Active</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
