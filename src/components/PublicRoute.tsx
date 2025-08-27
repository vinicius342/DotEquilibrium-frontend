import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Prevent flashing while auth is being checked
  if (isLoading) return null;

  // If authenticated, redirect to dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
