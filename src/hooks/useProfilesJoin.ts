
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username?: string | null;
  email?: string | null;
  full_name?: string | null;
}

interface AdminUser {
  id: string;
  email?: string | null;
  user_metadata?: {
    username?: string | null;
    full_name?: string | null;
  };
}

/**
 * Custom hook to fetch user profiles for displaying user information
 * This is necessary because we can't directly join with auth.users
 */
export const useProfilesJoin = (userIds: string[]) => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!userIds.length) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Batch user IDs to use in the query
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) throw error;
        
        // Create a map of user ID to profile data
        const profileMap = (data?.users || []).reduce((acc, user: AdminUser) => {
          if (userIds.includes(user.id)) {
            acc[user.id] = {
              id: user.id,
              email: user.email,
              username: user.user_metadata?.username,
              full_name: user.user_metadata?.full_name,
            };
          }
          return acc;
        }, {} as Record<string, UserProfile>);
        
        setProfiles(profileMap);
      } catch (err) {
        console.error('Error fetching user profiles:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profiles'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [userIds]);

  return { profiles, isLoading, error };
};
