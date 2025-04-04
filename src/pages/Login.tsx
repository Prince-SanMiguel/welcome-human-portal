
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard');
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, [navigate]);

  if (isCheckingAuth) {
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
