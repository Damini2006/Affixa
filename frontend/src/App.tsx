import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NavBar } from './components/NavBar';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#051F20] text-[#DAF1DE]">
          <NavBar />

          {/* pt-16 offsets the fixed navbar */}
          <main className="flex-1 pt-16">
            <Routes>
              {/* ── Public routes ── */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ── Protected routes ── */}
              <Route
                path="/analyzer"
                element={
                  <ProtectedRoute>
                    <Analyzer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/batch"
                element={
                  <ProtectedRoute>
                    <Batch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comparison"
                element={
                  <ProtectedRoute>
                    <Comparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dictionary"
                element={
                  <ProtectedRoute>
                    <Dictionary />
                  </ProtectedRoute>
                }
              />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
