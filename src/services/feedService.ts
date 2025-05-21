
import { supabase } from '@/integrations/supabase/client';
import { FeedPost, FeedResponse } from '@/types/feed';

const ITEMS_PER_PAGE = 10;

export const fetchFeed = async (
  userId: string,
  pageParam: number = 0
): Promise<FeedPost[]> => {
  const { data, error } = await supabase.rpc('get_user_feed', {
    requesting_user_id: userId,
    page_limit: ITEMS_PER_PAGE,
    page_offset: pageParam * ITEMS_PER_PAGE,
  });

  if (error) {
    console.error('Error fetching feed:', error);
    throw new Error(error.message);
  }
  return (data as FeedPost[]) || [];
};

