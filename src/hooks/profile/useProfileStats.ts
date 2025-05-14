
import { useState } from 'react';
import { supabaseService, ProfileStats } from '@/services/supabaseService';

export const useProfileStats = (userId: string | null) => {
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  const fetchProfileStats = async () => {
    if (!userId) return null;
    
    try {
      const stats = await supabaseService.getProfileStats(userId);
      setProfileStats(stats);
      return stats;
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      return null;
    }
  };

  return {
    profileStats,
    fetchProfileStats
  };
};
