
import { useState, useEffect } from 'react';
import { User } from '@/types/global';
import { useSharedPlaces } from './profile/useSharedPlaces';
import { useProfileStats } from './profile/useProfileStats';
import { useProfileSettings } from './profile/useProfileSettings';
import { useFollowers } from './profile/useFollowers';

export const useProfileData = (user: User | null, targetUserId?: string) => {
  const [loading, setLoading] = useState(true);
  
  // Use the target user id if provided, otherwise use the logged-in user's id
  const activeUserId = targetUserId || (user ? user.id : null);
  
  console.log('useProfileData: Initializing with:', { 
    hasUser: !!user, 
    targetUserId, 
    activeUserId 
  });

  // Import functionality from specialized hooks
  const { sharedPlaces, fetchSharedPlaces } = useSharedPlaces(activeUserId);
  
  const { profileStats, fetchProfileStats } = useProfileStats(activeUserId);
  const { 
    isPrivate, setIsPrivate,
    bio, setBio,
    name, setName,
    username, setUsername,
    userLocation, setUserLocation,
    profileImageUrl, setProfileImageUrl,
    fetchProfileSettings
  } = useProfileSettings(activeUserId);
  const {
    followers, following, fetchFollowers, fetchFollowing
  } = useFollowers(user, activeUserId);

  // Combined fetch function to load all profile data
  const fetchProfileData = async () => {
    if (!activeUserId) {
      console.log('useProfileData: No active user ID, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('useProfileData: Starting to fetch profile data for:', activeUserId);
      setLoading(true);
      
      await Promise.all([
        fetchSharedPlaces(),
        fetchProfileStats(),
        fetchProfileSettings()
      ]);
      
      console.log('useProfileData: Successfully loaded profile data');
    } catch (error) {
      console.error("useProfileData: Error fetching profile data:", error);
      // Don't throw error, just log it and continue
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useProfileData: useEffect triggered with:', { 
      hasUser: !!user, 
      activeUserId 
    });
    
    if (activeUserId) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [activeUserId]);

  return {
    sharedPlaces,
    profileStats,
    loading,
    isPrivate,
    setIsPrivate,
    followers,
    following,
    bio,
    setBio,
    name,
    setName,
    username,
    setUsername,
    userLocation,
    setUserLocation,
    profileImageUrl,
    setProfileImageUrl,
    fetchProfileData,
    fetchFollowers,
    fetchFollowing
  };
};
