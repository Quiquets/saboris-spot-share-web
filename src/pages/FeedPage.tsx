// src/components/feed/FeedPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useFeed } from '@/hooks/useFeed';
import FeedItem from '@/components/feed/FeedItem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import PeopleFilter from '@/components/map/filters/PeopleFilter';
import FoodTypeFilter from '@/components/map/filters/FoodTypeFilter';
import PriceFilter from '@/components/map/filters/PriceFilter';
import type { PeopleFilterOption, TimeFilterOption } from '@/services/feedService';

const FeedPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Use the same toggle values as Explore/Saved
  const [activePeopleFilter, setActivePeopleFilter] = useState<
    'my' | 'friends' | 'friends-of-friends'
  >('friends-of-friends');
  const [activeTimeFilter, setActiveTimeFilter] =
    useState<TimeFilterOption>('7 days');

  // Map our UI values to feedService enums
  const feedPeople: PeopleFilterOption =
    activePeopleFilter === 'my'
      ? 'my_friends'
      : activePeopleFilter === 'friends'
      ? 'friends_and_their_friends'
      : 'community';

  const {
    feedPages,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
  } = useFeed(feedPeople, activeTimeFilter);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRef = React.useCallback(
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
          <p className="mb-6 text-gray-600">
            Please log in to see your personalized feed.
          </p>
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
        <h1 className="text-3xl font-bold text-saboris-primary mb-6">
          Your Feed
        </h1>

        <div className="max-w-2xl mx-auto mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Show posts from:
            </p>
            <PeopleFilter
              activePeople={activePeopleFilter}
              handlePeopleFilterChange={value =>
                setActivePeopleFilter(
                  value as 'my' | 'friends' | 'friends-of-friends'
                )
              }
              isUserAuthenticated={!!user}
            />
          </div>
        </div>

        {isLoading && !feedPages.length && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-saboris-primary" />
          </div>
        )}

        {isError && (
          <div className="max-w-2xl mx-auto bg-red-100 text-red-500 p-4 rounded-md text-center">
            <p>Error loading feed: {error?.message || 'Unknown error'}</p>
          </div>
        )}

        {!isLoading && !isError && !feedPages.length && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-2">
              No posts match these filters.
            </h2>
            <p className="mb-4">
              Try broadening your filter or follow more community members.
            </p>
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
          {feedPages.map((post, idx) => {
            const key = `${post.post_id}-${idx}`;
            if (idx === feedPages.length - 1) {
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

        {!isLoading && !hasNextPage && feedPages.length > 0 && (
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
