
import { useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

export const useProfileSettings = (userId: string | null) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const fetchProfileSettings = async () => {
    if (!userId) return;
    
    try {
      const userProfile = await supabaseService.getUserProfile(userId);
      
      setIsPrivate(userProfile?.is_private || false);
      setBio(userProfile?.bio || '');
      setUsername(userProfile?.username || '');
      setUserLocation(userProfile?.location || '');
      setProfileImageUrl(userProfile?.avatar_url || null);
      
      return userProfile;
    } catch (error) {
      console.error("Error fetching profile settings:", error);
      return null;
    }
  };

  return {
    isPrivate,
    setIsPrivate,
    bio,
    setBio,
    username,
    setUsername,
    userLocation,
    setUserLocation,
    profileImageUrl,
    setProfileImageUrl,
    fetchProfileSettings
  };
};
