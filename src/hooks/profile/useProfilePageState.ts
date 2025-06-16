
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

  // Determine the target user ID and whether this is own profile
  const targetUserId = routeUserId || user?.id;
  const isOwnProfile = user && targetUserId === user.id;

  console.log('useProfilePageState:', {
    routeUserId,
    userId: user?.id,
    targetUserId,
    isOwnProfile,
    authLoading,
    userLoading,
    viewedUser: !!viewedUser,
    pageReady
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      console.log('loadUserProfile called:', { authLoading, targetUserId, isOwnProfile, user: !!user });
      
      if (authLoading) {
        console.log('Still loading auth, returning early');
        return;
      }
      
      if (!targetUserId) {
        console.log('No target user ID, setting as unauthenticated');
        setViewedUser(null);
        setPageReady(true);
        return;
      }

      if (isOwnProfile && user) {
        console.log('Own profile, using authenticated user data');
        setViewedUser(user);
        setPageReady(true);
        return;
      }

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
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load user profile");
        } finally {
          setUserLoading(false);
          setPageReady(true);
        }
      } else {
        console.log('Setting page ready - no external profile needed');
        setPageReady(true);
      }
    };

    loadUserProfile();
  }, [user, routeUserId, authLoading, isOwnProfile, targetUserId]);

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
