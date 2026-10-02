import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app" role="status" aria-busy="true" aria-label="Loading">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8EB69B] animate-spin" aria-label="Loading" />
          <span className="text-app-muted text-sm">Checking session…</span>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
