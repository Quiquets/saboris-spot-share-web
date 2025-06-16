
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types/global';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  currentUser: User;
  profileUser: User;
  isFollowing: boolean;
  onFollowStatusChange?: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  currentUser, 
  profileUser, 
  isFollowing: initialIsFollowing,
  onFollowStatusChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(initialIsFollowing);
  
  // Update local state when prop changes
  useEffect(() => {
    setFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const checkExistingFollow = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .match({ 
        follower_id: currentUser.id, 
        following_id: profileUser.id 
      })
      .single();
    return !!data;
  };

  const performFollow = async () => {
    const existingFollow = await checkExistingFollow();
    
    if (existingFollow) {
      setFollowing(true);
      toast.success(`Already following @${profileUser.username || 'user'}`);
      return;
    }

    const { error } = await supabase
      .from('follows')
      .insert({ 
        follower_id: currentUser.id, 
        following_id: profileUser.id 
      });
      
    if (error) throw error;
    
    toast.success(`Following @${profileUser.username || 'user'}`);
    setFollowing(true);
  };

  const performUnfollow = async () => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ 
        follower_id: currentUser.id, 
        following_id: profileUser.id 
      });
      
    if (error) throw error;
    
    toast.success(`Unfollowed @${profileUser.username || 'user'}`);
    setFollowing(false);
  };
  
  const handleFollowToggle = async () => {
    if (currentUser.id === profileUser.id) return; // Can't follow yourself
    
    try {
      setLoading(true);
      
      if (following) {
        await performUnfollow();
      } else {
        await performFollow();
      }
      
      // Call callback if provided
      if (onFollowStatusChange) {
        onFollowStatusChange();
      }
    } catch (error: any) {
      console.error('Error toggling follow status:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  if (currentUser.id === profileUser.id) {
    return null; // Don't show follow button for own profile
  }
  
  return (
    <Button
      onClick={handleFollowToggle}
      disabled={loading}
      size="sm"
      variant={following ? "outline" : "default"}
      className={following ? 
        "border-saboris-primary text-saboris-primary hover:bg-saboris-light" : 
        "bg-saboris-primary hover:bg-saboris-primary/90 text-white"
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          <span>Follow</span>
        </>
      )}
    </Button>
  );
};

export default FollowButton;
