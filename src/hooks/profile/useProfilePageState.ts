
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { User } from '@/types/global';
import { toast } from 'sonner';

export const useProfilePageState = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading } = useAuth();
  
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  console.log('useProfilePageState render:', {
    routeUserId,
    userId: user?.id,
    authLoading,
    userLoading,
    viewedUser: !!viewedUser,
    pageReady
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      console.log('loadUserProfile called:', { 
        authLoading, 
        routeUserId, 
        userId: user?.id 
      });
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('Still loading auth, returning early');
        return;
      }

      // If no route userId and no authenticated user, we're done
      if (!routeUserId && !user) {
        console.log('No route user ID and no authenticated user');
        setViewedUser(null);
        setPageReady(true);
        return;
      }

      // Determine target user ID
      const targetUserId = routeUserId || user?.id;
      const isOwnProfile = user && targetUserId === user.id;

      console.log('Target user determined:', { targetUserId, isOwnProfile });

      if (!targetUserId) {
        console.log('No target user ID available');
        setViewedUser(null);
        setPageReady(true);
        return;
      }

      // If viewing own profile and we have user data, use it
      if (isOwnProfile && user) {
        console.log('Own profile, using authenticated user data');
        setViewedUser(user);
        setPageReady(true);
        return;
      }

      // If viewing external profile, fetch it
      if (routeUserId && routeUserId !== user?.id) {
        console.log('Loading external user profile for:', routeUserId);
        try {
          setUserLoading(true);
          const profile = await supabaseService.getUserProfile(routeUserId);
          console.log('External profile loaded:', !!profile);
          
          if (profile) {
            setViewedUser(profile);
          } else {
            console.log('Profile not found');
            toast.error("User profile not found");
            setViewedUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load user profile");
          setViewedUser(null);
        } finally {
          setUserLoading(false);
          setPageReady(true);
        }
        return;
      }

      // Default case - just mark as ready
      console.log('Default case - marking as ready');
      setPageReady(true);
    };

    loadUserProfile();
  }, [authLoading, routeUserId, user]);

  // Derived values calculated after data is loaded
  const targetUserId = routeUserId || user?.id;
  const isOwnProfile = user && targetUserId === user.id;

  console.log('useProfilePageState returning:', {
    user: !!user,
    routeUserId,
    targetUserId,
    isOwnProfile,
    viewedUser: !!viewedUser,
    authLoading,
    userLoading,
    pageReady
  });

  return {
    user,
    routeUserId,
    targetUserId,
    isOwnProfile,
    viewedUser,
    authLoading,
    userLoading,
    pageReady
  };
};
