import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, Layers, BarChart3, FileSearch,
  LogOut, ChevronLeft, ChevronRight, Sun, Moon, User, Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type NavItem = { to: string; label: string; icon: typeof Search };

// Structured groups: what you can do → what you can learn → your account.
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Analyze',
    items: [
      { to: '/analyzer', label: 'Analyzer', icon: Search },
      { to: '/batch', label: 'Batch Processing', icon: FileSearch },
      { to: '/comparison', label: 'Model Comparison', icon: Layers },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/dictionary', label: 'Affix Library', icon: BookOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher';
  const allItems = navGroups.flatMap(g => g.items);
  const activeItem = allItems.find(item => item.to === location.pathname) || allItems[0];

  return (
    <div className="h-screen bg-app text-app flex overflow-hidden">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-app-card focus:border focus:border-[#8EB69B] focus:text-app text-sm font-medium"
      >
        Skip to content
      </a>
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
                </motion.span>
              )}
            </NavLink>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-app-muted hover:text-app hover:bg-app-card transition-colors cursor-pointer shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation links — grouped by purpose */}
          <nav className="p-3 mt-2 space-y-5" aria-label="Main">
            {navGroups.map(group => (
              <div key={group.label}>
                {collapsed ? (
                  <div className="mx-auto mb-2 h-px w-6 bg-app-hover" aria-hidden="true" />
                ) : (
                  <p className="px-3.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-app-subtle">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? 'bg-app-card text-app border border-app shadow-md'
                            : 'text-app-muted hover:text-app hover:bg-app-card'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-app' : 'text-app-muted group-hover:text-app'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8EB69B] shrink-0" aria-hidden="true" />}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Card — links to Profile */}
        <div className="p-3 border-t border-app bg-app-deep sticky bottom-0">
          {!collapsed ? (
            <div className="glass p-3 rounded-2xl border-app flex items-center justify-between">
              <NavLink
                to="/profile"
                className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 group"
                title="Open profile"
              >
                <div className="w-8 h-8 rounded-xl bg-[#8EB69B] text-[#051F20] flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-app truncate group-hover:text-[#8EB69B] transition-colors">{displayName}</p>
                  <p className="text-[10px] text-app-subtle truncate">{user?.email}</p>
                </div>
              </NavLink>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer shrink-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <NavLink
                to="/profile"
                className="w-9 h-9 rounded-xl bg-[#8EB69B] text-[#051F20] flex items-center justify-center font-extrabold text-xs shadow-md hover:scale-105 transition-transform"
                title="Profile"
                aria-label="Profile"
              >
                {displayName.slice(0, 1).toUpperCase()}
              </NavLink>
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-2 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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
          </div>
        </header>

        {/* Content area */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-6 lg:p-10 outline-none">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};