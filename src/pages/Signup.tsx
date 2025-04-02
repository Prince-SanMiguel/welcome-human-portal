
import AuthLayout from '@/components/layout/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';

const Signup = () => {
  return (
    <AuthLayout 
      title="Create Account"
      subtitle="Get started with HR Management System"
      authType="signup"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
