import { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NavBar } from './components/NavBar';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CommandPalette } from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Landing } from './pages/Landing';
import { NotFound } from './pages/NotFound';

// Route-level code splitting: three.js (auth) and recharts (analytics) only
// load on the routes that actually use them.
const Analyzer = lazy(() => import('./pages/Analyzer').then(m => ({ default: m.Analyzer })));
const Batch = lazy(() => import('./pages/Batch').then(m => ({ default: m.Batch })));
const Comparison = lazy(() => import('./pages/Comparison').then(m => ({ default: m.Comparison })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Dictionary = lazy(() => import('./pages/Dictionary').then(m => ({ default: m.Dictionary })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));

const PageFallback = () => (
  <div className="min-h-screen bg-app flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-[#8EB69B] animate-spin" aria-label="Loading" />
  </div>
);

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Affixa — Morphological Analyzer',
  '/login': 'Sign In — Affixa',
  '/register': 'Create Account — Affixa',
  '/reset-password': 'Reset Password — Affixa',
  '/forgot-password': 'Forgot Password — Affixa',
  '/analyzer': 'Word Analyzer — Affixa',
  '/batch': 'Batch Analysis — Affixa',
  '/comparison': 'Method Comparison — Affixa',
  '/analytics': 'Analytics — Affixa',
  '/settings': 'Settings — Affixa',
  '/profile': 'Profile — Affixa',
  '/dictionary': 'Affix Dictionary — Affixa',
};

function AppContent() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  // Keep the tab title in sync with the current route.
  useEffect(() => {
    document.title = ROUTE_TITLES[location.pathname] ?? 'Affixa — Morphological Analyzer';
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-app text-app transition-colors">
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
        <Routes>
        {/* ── Public routes (Hero & Auth) ── */}
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <main className="pt-16">
                <Landing />
              </main>
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <NavBar />
              <main className="pt-16">
                <Login />
              </main>
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <NavBar />
              <main className="pt-16">
                <Register />
              </main>
            </>
          }
        />
        <Route
          path="/reset-password"
          element={
            <>
              <NavBar />
              <main className="pt-16">
                <ResetPassword />
              </main>
            </>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <NavBar />
              <main className="pt-16">
                <ForgotPassword />
              </main>
            </>
          }
        />

        {/* ── Protected Dashboard Workspace routes (with left sidebar) ── */}
        <Route
          path="/analyzer"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analyzer />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Batch />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparison"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Comparison />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dictionary"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dictionary />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ── 404 Fallback ── */}
        <Route
          path="*"
          element={
            <>
              <NavBar />
              <main className="pt-16">
                <NotFound />
              </main>
            </>
          }
        />
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
