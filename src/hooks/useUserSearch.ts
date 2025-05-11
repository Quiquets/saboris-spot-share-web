
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  is_following?: boolean;
  followers_count?: number;
  posts_count?: number;
}

export const useUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (searchQuery.length > 0) {
      searchUsers();
    }
  }, [searchQuery]);
  
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await supabaseService.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserFollowStatus = (userId: string, isFollowing: boolean) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            is_following: isFollowing, 
            followers_count: isFollowing 
              ? (u.followers_count || 0) + 1 
              : Math.max(0, (u.followers_count || 1) - 1) 
          } 
        : u
    ));
  };
  
  return {
    searchQuery,
    setSearchQuery,
    users,
    loading,
    updateUserFollowStatus
  };
};
