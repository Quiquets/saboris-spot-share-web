
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
    if (!user || !activeUserId) return;
    
    try {
      setLoading(true);
      
      await Promise.all([
        fetchSharedPlaces(),
        fetchProfileStats(),
        fetchProfileSettings()
      ]);
      
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeUserId) {
      fetchProfileData();
    }
  }, [user, activeUserId]);

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
