import { supabase } from '@/integrations/supabase/client';
const sb = supabase as any;

export type PeopleFilterOption =
  | 'my_friends'
  | 'community'
  | 'friends_and_their_friends';

export interface FeedPost {
  post_id: string;
  cuisineOptions: string | null;
  post_type: 'review' | 'save' | 'follow';
  post_created_at: string;
  post_user_id: string;
  post_user_name: string;
  post_user_username: string;
  post_user_avatar_url: string | null;
  place_id: string | null;
  place_name: string | null;
  review_id: string | null;
  review_text: string | null;
  review_photo_urls: string[] | null;
  review_rating_food: number | null;
  review_rating_service: number | null;
  review_rating_value: number | null;
  review_rating_atmosphere: number | null;
  average_rating: number | null;
}

export const ITEMS_PER_PAGE = 10;

