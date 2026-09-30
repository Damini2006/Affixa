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
    <div className="h-screen bg-app text-app flex overflow-hidden">
      {/* ── SIDEBAR (fixed, does not scroll) ── */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="h-screen bg-app-deep border-r border-app flex flex-col justify-between shrink-0 relative z-30 overflow-y-auto"
      >
        {/* Top logo & toggle */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-app sticky top-0 bg-app-deep z-10">
            <NavLink to="/analyzer" className="flex items-center gap-3 overflow-hidden">
              <div className="logo-mark shrink-0">
                <img src="/logo.svg" alt="" />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-lg tracking-tight text-app whitespace-nowrap"
                >
                  Affix<span className="text-app-muted">a</span>
                  <span className="ml-2 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-app-card text-app-muted font-mono border border-app">
                    Pro
                  </span>
                </motion.span>
              )}
            </NavLink>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-app-muted hover:text-app hover:bg-app-card transition-colors cursor-pointer shrink-0"
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
                      ? 'bg-app-card text-app border border-app shadow-md'
                      : 'text-app-muted hover:text-app hover:bg-app-card'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3.5 shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-app' : 'text-app-muted group-hover:text-app'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-[#8EB69B] text-[#051F20] font-bold' : 'bg-app-card text-app-subtle'
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
        <div className="p-3 border-t border-app bg-app-deep sticky bottom-0">
          {!collapsed ? (
            <div className="glass p-3 rounded-2xl border-app flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#8EB69B] text-[#051F20] flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-app truncate">{displayName}</p>
                  <p className="text-[10px] text-app-subtle truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 px-8 border-b border-app bg-app-deep/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <activeItem.icon className="w-5 h-5 text-app-muted" />
            <h2 className="font-bold text-base text-app">{activeItem.label}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-app-card border border-app text-app-muted hover:text-app hover:border-app-hover transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <><Sun className="w-3.5 h-3.5 text-amber-400" /><span className="hidden sm:inline">Light</span></>
              ) : (
                <><Moon className="w-3.5 h-3.5 text-teal-700" /><span className="hidden sm:inline">Dark</span></>
              )}
            </button>

            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-app-card border border-app text-app-muted">
              <span className="w-2 h-2 rounded-full bg-[#8EB69B] animate-pulse" />
              <span className="hidden md:inline">FastAPI :8000</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-app-card border border-app text-app-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8EB69B]" />
              <span>Supabase RLS</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};