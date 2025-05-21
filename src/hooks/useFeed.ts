
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed, PeopleFilterOption, TimeFilterOption } from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContext';

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
    refetch, // Added refetch for when filters change significantly if needed, though queryKey change handles it
  } = useInfiniteQuery({
    queryKey: ['feed', user?.id, peopleFilter, timeFilter], // Include filters in queryKey
    queryFn: ({ pageParam }) => {
      if (!user?.id) return Promise.resolve([]);
      return fetchFeed(user.id, pageParam, peopleFilter, timeFilter);
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page had items, there might be a next page.
      // ITEMS_PER_PAGE is defined in feedService, assuming it's 10
      const ITEMS_PER_PAGE = 10; 
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!user?.id, // Only run query if user is logged in
  });

  return {
    feedPages: data?.pages.flat() || [], // Flattened array of all feed posts
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    refetch,
  };
};
