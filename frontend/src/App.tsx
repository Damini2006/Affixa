import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NavBar } from './components/NavBar';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Analyzer } from './pages/Analyzer';
import { Batch } from './pages/Batch';
import { Comparison } from './pages/Comparison';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Dictionary } from './pages/Dictionary';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-var(--bg) text-var(--text) transition-colors">
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
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
