
import { useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { User } from '@/types/global';
import { toast } from 'sonner';

export const useFollowers = (user: User | null, targetUserId: string | null) => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  const fetchFollowers = async (): Promise<void> => {
    if (!targetUserId) return;
    
    try {
      // Get followers with additional data about whether current user follows each follower
      const followersData = await supabaseService.getFollowers(targetUserId);
      
      // For each follower, check if the current user is following them
      const followersWithFollowingStatus = await Promise.all(
        followersData.map(async (follower) => {
          const isFollowing = await supabaseService.isFollowing(user?.id || '', follower.id);
          // Check if the follower is the current user
          const isSelf = follower.id === user?.id;
          
          return {
            ...follower,
            is_following: isFollowing,
            is_self: isSelf
          };
        })
      );
      
      setFollowers(followersWithFollowingStatus);
    } catch (error) {
      console.error("Error fetching followers:", error);
      toast.error("Failed to load followers");
    }
  };

  const fetchFollowing = async (): Promise<void> => {
    if (!targetUserId) return;
    
    try {
      // Get users that the target user is following
      const followingData = await supabaseService.getFollowing(targetUserId);
      
      // For each followed user, check if the current user is following them
      const processedFollowing = await Promise.all(
        followingData.map(async (followed) => {
          // Only check is_following if not viewing own profile
          const isFollowing = user?.id === targetUserId ? 
            true : // If viewing own profile, we're following everyone in our following list
            await supabaseService.isFollowing(user?.id || '', followed.id);
            
          // Check if the followed user is the current user
          const isSelf = followed.id === user?.id;
          
          return {
            ...followed,
            is_following: isFollowing,
            is_self: isSelf
          };
        })
      );
      
      setFollowing(processedFollowing);
    } catch (error) {
      console.error("Error fetching following:", error);
      toast.error("Failed to load following");
    }
  };

  return {
    followers,
    following,
    fetchFollowers,
    fetchFollowing
  };
};
