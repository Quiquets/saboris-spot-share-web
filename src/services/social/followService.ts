
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { User } from '../types';

class FollowService {
  async getFollowers(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, users!follows_follower_id_fkey(*)')
        .eq('following_id', userId);
      
      if (error) {
        console.error("Get followers error:", error);
        return [];
      }
      
      return data.map(item => {
        const user = item.users;
        // Add email field to match User interface
        const email = user.username.includes('@') ? user.username : '';
        return {
          ...user,
          email
        };
      });
    } catch (error) {
      console.error("Get followers error:", error);
      return [];
    }
  }
  
  async followUser(userId: string): Promise<void> {
    try {
      const currentUser = await supabase.auth.getUser().then(res => res.data.user);
      if (!currentUser) {
        toast.error("You need to be logged in to follow users");
        return;
      }

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: userId
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("You're already following this user");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Follow user error:", error);
      toast.error("Failed to follow user. Please try again.");
    }
  }
  
  async unfollowUser(userId: string): Promise<void> {
    try {
      const currentUser = await supabase.auth.getUser().then(res => res.data.user);
      if (!currentUser) {
        toast.error("You need to be logged in to unfollow users");
        return;
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("User unfollowed successfully");
    } catch (error) {
      console.error("Unfollow user error:", error);
      toast.error("Failed to unfollow user. Please try again.");
    }
  }
}

export const followService = new FollowService();
