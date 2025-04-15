
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
        
        // Get unique user IDs to avoid duplicate requests
        const uniqueUserIds = [...new Set(userIds)];
        console.log('Fetching profiles for user IDs:', uniqueUserIds);
        
        // Get user data from Supabase Auth
        const profileMap: Record<string, UserProfile> = {};
        
        for (const userId of uniqueUserIds) {
          try {
            // Try to get user information directly from auth metadata
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
            
            if (userError) {
              console.error(`Error fetching user ${userId}:`, userError);
              continue;
            }
            
            if (userData && userData.user) {
              profileMap[userId] = {
                id: userData.user.id,
                email: userData.user.email,
                username: userData.user.user_metadata?.username || userData.user.email?.split('@')[0],
                full_name: userData.user.user_metadata?.full_name || 'User'
              };
            }
          } catch (err) {
            console.error(`Error processing user ${userId}:`, err);
          }
        }
        
        console.log('Fetched profiles:', profileMap);
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
