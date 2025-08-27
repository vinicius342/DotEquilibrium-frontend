import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from './Header';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While we check auth, avoid flashing the protected UI
  if (isLoading) return null;

  if (!isAuthenticated) {
    // Redirect to login, preserve the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Header />
      <div className="pt-20">
        {children}
      </div>
    </>
  );
}
