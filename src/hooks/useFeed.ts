
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed } from '@/services/feedService';
import { useAuth } from '@/contexts/AuthContext';

export const useFeed = () => {
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed', user?.id],
    queryFn: ({ pageParam }) => {
      if (!user?.id) return Promise.resolve([]); // Or throw error if user must be defined
      return fetchFeed(user.id, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page had items, there might be a next page.
      // Assuming lastPage is an array of FeedPost.
      return lastPage.length > 0 ? allPages.length : undefined;
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
  };
};

