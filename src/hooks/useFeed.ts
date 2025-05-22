
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PeopleFilterOption, TimeFilterOption } from '@/services/feedService'; // TimeFilterOption is now updated
import { ITEMS_PER_PAGE } from '@/services/feedService'; // Import ITEMS_PER_PAGE
import { useAuth } from '@/contexts/AuthContext';
import type { FeedPost } from '@/types/feed'; // Use FeedPost type from @/types/feed

export const useFeed = (peopleFilter: PeopleFilterOption, timeFilter: TimeFilterOption) => {
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<FeedPost[], Error, FeedPost[], FeedPost[], number>({
    queryKey: ['feed', user?.id, peopleFilter, timeFilter],
    queryFn: async ({ pageParam }) => {
      if (!user?.id) return Promise.resolve([]);

      const { data: feedData, error: rpcError } = await supabase.rpc('get_user_feed', {
        requesting_user_id: user.id,
        page_limit: ITEMS_PER_PAGE,
        page_offset: pageParam * ITEMS_PER_PAGE,
        p_people_filter: peopleFilter,
        p_time_filter: timeFilter,
      });

      if (rpcError) {
        console.error('Error fetching feed from RPC:', rpcError);
        throw rpcError;
      }
      return (feedData as FeedPost[]) || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!user?.id,
  });

  return {
    feedPages: data?.pages.flat() || [],
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    refetch,
  };
};

