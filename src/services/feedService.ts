
import { supabase } from '@/integrations/supabase/client';
import { FeedPost } from '@/types/feed'; // FeedResponse removed as it's not directly used here

const ITEMS_PER_PAGE = 10;

export type PeopleFilterOption = 'my_friends' | 'friends_and_their_friends' | 'community';
export type TimeFilterOption = '1 day' | '7 days' | '30 days' | 'all_time';

export const fetchFeed = async (
  userId: string,
  pageParam: number = 0,
  peopleFilter: PeopleFilterOption = 'friends_and_their_friends',
  timeFilter: TimeFilterOption = '7 days'
): Promise<FeedPost[]> => {
  const { data, error } = await supabase.rpc('get_user_feed', {
    requesting_user_id: userId,
    page_limit: ITEMS_PER_PAGE,
    page_offset: pageParam * ITEMS_PER_PAGE,
    p_people_filter: peopleFilter,
    p_time_filter: timeFilter,
  });

  if (error) {
    console.error('Error fetching feed:', error);
    throw new Error(error.message);
  }
  return (data as FeedPost[]) || [];
};
