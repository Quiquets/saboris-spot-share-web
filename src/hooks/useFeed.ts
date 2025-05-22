import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PeopleFilterOption, FeedPost } from '@/services/feedService';
import { ITEMS_PER_PAGE } from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContext';

export function useFeed(peopleFilter: PeopleFilterOption) {
  const { user } = useAuth();
  const sb = supabase as any;   // allow us to skip the built-in rpc generics

  return useInfiniteQuery<FeedPost[], Error>({
    queryKey: ['feed', user?.id, peopleFilter],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) return [];
      const { data, error } = await sb.rpc(
        'get_user_feed',
        {
          requesting_user_id: user.id,
          page_limit: ITEMS_PER_PAGE,
          page_offset: Number(pageParam) * ITEMS_PER_PAGE,
          p_people_filter: peopleFilter,
        }
      );
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!user?.id,
  });
}
