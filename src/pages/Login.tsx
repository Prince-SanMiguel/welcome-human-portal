
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If user is already authenticated, redirect to the dashboard or intended page
    if (session && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [session, isLoading, navigate, from]);

  // Don't render the login form if already authenticated and redirecting
  if (session && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue"></div>
      </div>
    );
  }

  return (
    <AuthLayout 
      title="Welcome Back"
      subtitle="Enter your credentials to access your account"
      authType="login"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
