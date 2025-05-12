
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { User, UserSettings } from '../types';

class UserService {
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Get user profile error:", error);
        return null;
      }
      
      // Fix: Add email to the user object since our User interface requires it
      // We use username as email if it's in email format, otherwise leave it empty
      // and let the app handle it
      const email = data.username.includes('@') ? data.username : '';
      
      return {
        ...data,
        email
      };
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  }
  
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      // Remove email from updates if it exists since it's not in the database schema
      const { email, ...dbUpdates } = updates;
      
      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        return null;
      }
      
      toast.success("Profile updated successfully");
      
      // Fix: Add email to returned user object
      const userEmail = email || (data.username.includes('@') ? data.username : '');
      
      return {
        ...data,
        email: userEmail
      };
    } catch (error) {
      console.error("Update user profile error:", error);
      toast.error("Failed to update profile. Please try again.");
      return null;
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_private')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Get user settings error:", error);
        return null;
      }
      
      return {
        is_private: data.is_private || false
      };
    } catch (error) {
      console.error("Get user settings error:", error);
      return null;
    }
  }
  
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update(settings)
        .eq('id', userId);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Update user settings error:", error);
      toast.error("Failed to update settings. Please try again.");
    }
  }
  
  async searchUsers(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, username, avatar_url, bio, is_private')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(20);
      
      if (error) {
        console.error("Search users error:", error);
        return [];
      }
      
      // If user is authenticated, check if they are following each user
      const currentUser = await supabase.auth.getUser().then(res => res.data.user);
      if (currentUser) {
        const withFollowingStatus = await Promise.all(data.map(async (user) => {
          if (currentUser.id === user.id) {
            return { ...user, is_following: false };
          }
          
          const isFollowing = await this.isFollowing(currentUser.id, user.id);
          const profileStats = await this.getProfileStats(user.id);
          
          return {
            ...user,
            is_following: isFollowing,
            followers_count: profileStats?.followers_count || 0,
            posts_count: profileStats?.posts_count || 0
          };
        }));
        
        return withFollowingStatus;
      }
      
      return data;
    } catch (error) {
      console.error("Search users error:", error);
      return [];
    }
  }

  async getProfileStats(userId: string): Promise<any | null> {
    try {
      const followersPromise = supabase.rpc('get_followers_count', { user_uuid: userId });
      const followingPromise = supabase.rpc('get_following_count', { user_uuid: userId });
      const savedPlacesPromise = supabase
        .from('wishlists')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      const reviewsPromise = supabase
        .from('reviews')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      
      const [followers, following, savedPlaces, reviews] = await Promise.all([
        followersPromise,
        followingPromise,
        savedPlacesPromise,
        reviewsPromise
      ]);
      
      if (followers.error || following.error || savedPlaces.error || reviews.error) {
        console.error("Get profile stats error:", followers.error || following.error || savedPlaces.error || reviews.error);
        return null;
      }
      
      // Get posts count from feedposts table
      const postsCount = await supabase
        .from('feed_posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      
      return {
        followers_count: followers.data || 0,
        following_count: following.data || 0,
        saved_places_count: savedPlaces.count || 0,
        reviews_count: reviews.count || 0,
        posts_count: postsCount.count || 0
      };
    } catch (error) {
      console.error("Get profile stats error:", error);
      return null;
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_following', { 
          follower_uuid: followerId, 
          following_uuid: followingId 
        });
      
      if (error) {
        console.error("Is following error:", error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error("Is following error:", error);
      return false;
    }
  }
}

export const userService = new UserService();
