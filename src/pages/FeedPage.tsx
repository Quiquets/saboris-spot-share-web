import React, { useRef, useCallback, useState } from 'react';
import { useFeed } from '@/hooks/useFeed';
import type { FeedPost, PeopleFilterOption } from '@/services/feedService';
import FeedItem from '@/components/feed/FeedItem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import PeopleFilter from '@/components/map/filters/PeopleFilter';
import FoodTypeFilter from '@/components/map/filters/FoodTypeFilter';
import { Card } from '@/components/ui/card';

const FeedPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activePeopleFilter, setActivePeopleFilter] = useState<
    'my' | 'friends' | 'friends-of-friends'
  >('friends-of-friends');
  const [activeFoodTypes, setActiveFoodTypes] = useState<string[]>([]);
  const [minAvgRating, setMinAvgRating] = useState<number>(0);

  const feedPeople: PeopleFilterOption =
    activePeopleFilter === 'my'
      ? 'my_friends'
      : activePeopleFilter === 'friends'
      ? 'friends_and_their_friends'
      : 'community';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
  } = useFeed(feedPeople);

  // now data.pages: FeedPost[][] — we flatten it
  const feedPosts: FeedPost[] = data?.pages.flat() ?? [];

  const observer = useRef<IntersectionObserver>();
  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      observer.current?.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isLoading, isFetchingNextPage]
  );

  // Filter feedPosts by food type and minimum average rating
  const filteredFeedPosts = feedPosts.filter(post => {
    // Filter by food type if any selected
    const foodTypeMatch =
      activeFoodTypes.length === 0 ||
      (post.cuisineOptions && activeFoodTypes.includes(post.cuisineOptions));
    // Filter by minimum average rating
    const avgRating = post.average_rating ?? 0;
    const ratingMatch = minAvgRating === 0 || avgRating >= minAvgRating;
    return foodTypeMatch && ratingMatch;
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-saboris-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-2xl font-semibold mb-4">Access Your Feed</h2>
          <p className="mb-6 text-gray-600">Please log in to see your personalized feed.</p>
          <Button asChild>
            <Link to="/">Log In / Sign Up</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-center mb-3 md:mb-6 text-saboris-primary flex items-center justify-center">
        </h1>

        {/* Filters styled like SavedPlacesFilters */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 w-full mb-4 md:mb-6 max-w-2xl mx-auto">
          <div className="flex flex-col gap-3">
            <PeopleFilter
              activePeople={activePeopleFilter}
              handlePeopleFilterChange={(v) =>
                setActivePeopleFilter(v as 'my' | 'friends' | 'friends-of-friends')
              }
              isUserAuthenticated={!!user}
            />
            <div className="w-full">
              <FoodTypeFilter
                activeFoodTypes={activeFoodTypes}
                handleFilterChange={(_, value) => setActiveFoodTypes(value)}
              />

            
                
            </div>
          </div>
        </Card>

        {isLoading && filteredFeedPosts.length === 0 && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-saboris-primary" />
          </div>
        )}

        {isError && (
          <div className="max-w-2xl mx-auto bg-red-100 text-red-500 p-4 rounded-md text-center">
            <p>Error loading feed: {error?.message || 'Unknown error'}</p>
          </div>
        )}

        {!isLoading && !isError && filteredFeedPosts.length === 0 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-2">No posts match these filters.</h2>
            <p className="mb-4">Try broadening your filter or follow more community members.</p>
            <div className="space-x-2">
              <Button asChild variant="outline">
                <Link to="/map">Explore Places</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/search">Find Users</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-6">
          {filteredFeedPosts.map((post, idx) => {
            const key = `${post.post_id}-${idx}`;
            if (idx === filteredFeedPosts.length - 1) {
              return (
                <div ref={lastRef} key={key}>
                  <FeedItem post={post} />
                </div>
              );
            }
            return <FeedItem key={key} post={post} />;
          })}
        </div>

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
          </div>
        )}

        {!isLoading && hasNextPage && !isFetchingNextPage && (
          <div className="text-center mt-8">
            <Button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
              Load More
            </Button>
          </div>
        )}

        {!isLoading && !hasNextPage && filteredFeedPosts.length > 0 && (
          <p className="text-center text-gray-500 mt-8">
            You’ve reached the end of your feed.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FeedPage;
