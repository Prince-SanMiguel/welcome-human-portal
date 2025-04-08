
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'manager' | 'admin';
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { session, isLoading, userRole } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Allow a small delay for auth state to stabilize
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [session]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    // Redirect to the login page, but save the current location
    console.log("No session detected, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if a specific role is required and user has that role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Required role ${requiredRole} not matched with user role ${userRole}, redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Session detected, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
