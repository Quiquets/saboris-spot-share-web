import { supabase } from "@/integrations/supabase/client";
import { User as AuthUser, Session, Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  is_private?: boolean;
}

export interface SavedRestaurant {
  id: string;
  user_id: string;
  place_id: string;
  saved_at: Date;
  note?: string;
  restaurant: {
    name: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ProfileStats {
  followers_count: number;
  following_count: number;
  saved_places_count: number;
  reviews_count: number;
  posts_count: number;
}

export interface UserSettings {
  is_private: boolean;
}

class SupabaseService {
  async signIn(email: string, password: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return null;
      }
      
      return data.user;
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
      return null;
    }
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Registration successful! Please check your email for verification.");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to sign up. Please try again.");
    }
  }

  async signInWithProvider(provider: 'google'): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(error.message);
        return null;
      }
      
      // Fix: The OAuth call doesn't immediately return a user,
      // it redirects the browser, so we return null here
      return null;
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  }
  
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
  
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session || null;
    } catch (error) {
      console.error("Get current session error:", error);
      return null;
    }
  }

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
  
  async getFollowing(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, users!follows_following_id_fkey(*)')
        .eq('follower_id', userId);
      
      if (error) {
        console.error("Get following error:", error);
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
      console.error("Get following error:", error);
      return [];
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
      const currentUser = await this.getCurrentUser();
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

  async saveRestaurant(userId: string, placeId: string, note?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          place_id: placeId,
          note
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("You've already saved this restaurant");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success("Restaurant saved to your wishlist!");
    } catch (error) {
      console.error("Save restaurant error:", error);
      toast.error("Failed to save restaurant. Please try again.");
    }
  }

  async getSavedRestaurants(userId: string): Promise<SavedRestaurant[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          user_id,
          place_id,
          created_at,
          note,
          places:place_id (
            name,
            description,
            tags,
            category
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Get saved restaurants error:", error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        place_id: item.place_id,
        saved_at: new Date(item.created_at),
        note: item.note,
        restaurant: {
          name: item.places.name,
          description: item.places.description,
          tags: item.places.tags,
          category: item.places.category
        }
      }));
    } catch (error) {
      console.error("Get saved restaurants error:", error);
      return [];
    }
  }
  
  async unsaveRestaurant(userId: string, placeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('place_id', placeId);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Restaurant removed from your wishlist");
    } catch (error) {
      console.error("Unsave restaurant error:", error);
      toast.error("Failed to remove restaurant. Please try again.");
    }
  }
  
  async followUser(userId: string): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
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
      const currentUser = await this.getCurrentUser();
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
  
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Is following error:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Is following error:", error);
      return false;
    }
  }
  
  async getProfileStats(userId: string): Promise<ProfileStats | null> {
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
}

export const supabaseService = new SupabaseService();
