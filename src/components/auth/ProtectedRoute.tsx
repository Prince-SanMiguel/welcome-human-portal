
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles?: Array<'employee' | 'manager' | 'admin'>;
};

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
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

  // Check role requirements if specified
  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    console.log(`User role ${userRole} does not have permission to access this page`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Session detected, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
