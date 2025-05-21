import React, { useEffect, useRef, useState } from 'react';
import { useFeed } from '@/hooks/useFeed';
import FeedItem from '@/components/feed/FeedItem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import FeedPeopleFilter from '@/components/feed/filters/FeedPeopleFilter';
import FeedTimeFilter from '@/components/feed/filters/FeedTimeFilter';
import { PeopleFilterOption, TimeFilterOption } from '@/services/feedService';

const FeedPage: React.FC = () => {
  const [activePeopleFilter, setActivePeopleFilter] = useState<PeopleFilterOption>('friends_and_their_friends');
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterOption>('7 days');

  const { 
    feedPages, 
    fetchNextPage, 
    hasNextPage, 
    isLoading, 
    isError, 
    error, 
    isFetchingNextPage 
  } = useFeed(activePeopleFilter, activeTimeFilter);
  
  const { user, loading: authLoading } = useAuth();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
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

  if (!user && !authLoading) {
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
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-8">
        <h1 className="text-3xl font-bold text-saboris-primary mb-6 text-center sm:text-left">Your Feed</h1>
        
        <div className="max-w-2xl mx-auto mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Show posts from:</p>
          <FeedPeopleFilter activeFilter={activePeopleFilter} onFilterChange={setActivePeopleFilter} />
          <p className="text-sm font-medium text-gray-700 mb-1">In the last:</p>
          <FeedTimeFilter activeFilter={activeTimeFilter} onFilterChange={setActiveTimeFilter} />
        </div>

        {isLoading && !feedPages.length && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-saboris-primary" />
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-md max-w-2xl mx-auto">
            <p>Error loading feed: {error?.message || 'Unknown error'}</p>
            <p>Please try again later.</p>
          </div>
        )}
        {!isLoading && !isError && feedPages.length === 0 && (
          <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Your feed is empty for these filters!</h2>
            <p className="mb-4">Try adjusting the filters or follow more users and save/review places.</p>
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

        <div className="max-w-2xl mx-auto">
          {feedPages.map((post, index) => {
            const key = `${post.post_id}-${activePeopleFilter}-${activeTimeFilter}-${index}`; // More unique key when filters change
            if (feedPages.length === index + 1) {
              return <div ref={lastElementRef} key={key}><FeedItem post={post} /></div>;
            }
            return <FeedItem key={key} post={post} />;
          })}
        </div>

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
          </div>
        )}
        {!isLoading && !isFetchingNextPage && hasNextPage && (
           <div className="text-center mt-8">
            <Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
              Load More
            </Button>
          </div>
        )}
         {!isLoading && !isFetchingNextPage && !hasNextPage && feedPages.length > 0 && (
          <p className="text-center text-gray-500 mt-8">You've reached the end of your feed for these filters.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FeedPage;
