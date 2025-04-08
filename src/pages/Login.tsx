
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If user is already authenticated, redirect to the dashboard or intended page
    if (session && !isLoading) {
      console.log("User already logged in, redirecting to", from);
      toast({
        title: "Already logged in",
        description: "Redirecting to dashboard",
      });
      // Small delay to ensure the auth state is fully processed
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  }, [session, isLoading, navigate, from, toast]);

  // Don't render the login form if already authenticated and redirecting
  if (session && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
