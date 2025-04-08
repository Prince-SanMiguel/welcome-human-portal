
import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Define the roles as a type
export type UserRole = 'employee' | 'manager' | 'admin';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  userRole: UserRole | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  signOut: async () => {},
  userRole: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        // Get user role from user metadata if session exists
        if (currentSession?.user) {
          const role = currentSession.user.user_metadata?.role as UserRole || 'employee';
          setUserRole(role);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
        
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      // Get user role from user metadata if session exists
      if (currentSession?.user) {
        const role = currentSession.user.user_metadata?.role as UserRole || 'employee';
        setUserRole(role);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};
