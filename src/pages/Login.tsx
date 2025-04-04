
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
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
