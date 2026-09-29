import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Sliders, BookOpen, Layers, BarChart3, FileSearch,
  LogOut, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher';
  const activeItem = sidebarItems.find(item => item.to === location.pathname) || sidebarItems[0];

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE] flex overflow-hidden">
      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#0B2B26] border-r border-[#8EB69B]/15 flex flex-col justify-between shrink-0 relative z-30"
      >
        {/* Top logo & toggle */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#8EB69B]/10">
            <NavLink to="/analyzer" className="flex items-center gap-3 overflow-hidden">
              <div className="logo-mark shrink-0">A</div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-lg tracking-tight text-[#DAF1DE] whitespace-nowrap"
                >
                  Affix<span className="text-[#8EB69B]">a</span>
                  <span className="ml-2 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#8EB69B]/20 text-[#8EB69B] font-mono border border-[#8EB69B]/30">
                    Pro
                  </span>
                </motion.span>
              )}
            </NavLink>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-[#8EB69B]/70 hover:text-[#DAF1DE] hover:bg-[#8EB69B]/10 transition-colors"
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
                      ? 'bg-[#8EB69B]/15 text-[#DAF1DE] border border-[#8EB69B]/30 shadow-lg shadow-[#051F20]/50'
                      : 'text-[#8EB69B]/70 hover:text-[#DAF1DE] hover:bg-[#8EB69B]/10'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3.5 shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#8EB69B]' : 'text-[#8EB69B]/60 group-hover:text-[#8EB69B]'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-[#8EB69B] text-[#051F20] font-bold' : 'bg-[#163832] text-[#8EB69B]/60'
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
        <div className="p-3 border-t border-[#8EB69B]/10 bg-[#051F20]/40">
          {!collapsed ? (
            <div className="glass p-3 rounded-2xl border-[#8EB69B]/15 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#8EB69B] text-[#051F20] flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#DAF1DE] truncate">{displayName}</p>
                  <p className="text-[10px] text-[#8EB69B]/60 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-3 text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-colors"
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
        <header className="h-16 px-8 border-b border-[#8EB69B]/10 bg-[#0B2B26]/80 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <activeItem.icon className="w-5 h-5 text-[#8EB69B]" />
            <h2 className="font-bold text-base text-[#DAF1DE]">{activeItem.label}</h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#163832] border border-[#8EB69B]/20 text-[#8EB69B]">
              <span className="w-2 h-2 rounded-full bg-[#8EB69B] animate-pulse" />
              <span>FastAPI API Connected (8000)</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#163832] border border-[#8EB69B]/20 text-[#8EB69B]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8EB69B]" />
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
