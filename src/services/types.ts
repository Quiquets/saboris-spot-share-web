
import { User as AuthUser, Session } from '@supabase/supabase-js';

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
