
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  authType: 'login' | 'signup';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  authType,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 auth-background items-center justify-center p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-6">HR Management System</h1>
          <p className="text-xl max-w-md">
            Streamline your HR processes with our comprehensive management system.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>

          <div className="auth-card">
            {children}
          </div>

          <div className="mt-6 text-center">
            {authType === 'login' ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-hr-blue hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-hr-blue hover:underline font-medium">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
