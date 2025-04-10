
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username?: string | null;
  email?: string | null;
  full_name?: string | null;
}

/**
 * Custom hook to fetch user profiles for displaying user information
 * This works by querying the user metadata
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
        
        // Fetch user profiles
        const promises = userIds.map(async (userId) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
          
          if (userError) throw userError;
          
          if (userData && userData.user) {
            return {
              id: userData.user.id,
              email: userData.user.email,
              username: userData.user.user_metadata?.username,
              full_name: userData.user.user_metadata?.full_name,
            } as UserProfile;
          }
          
          return null;
        });
        
        const results = await Promise.all(promises);
        
        // Create a map of user ID to profile data
        const profileMap = results.reduce((acc, profile) => {
          if (profile) {
            acc[profile.id] = profile;
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
