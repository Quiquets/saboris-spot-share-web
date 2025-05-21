
import React, { useEffect, useRef } from 'react';
import { useFeed } from '@/hooks/useFeed';
import FeedItem from '@/components/feed/FeedItem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const FeedPage: React.FC = () => {
  const { feedPages, fetchNextPage, hasNextPage, isLoading, isError, error, isFetchingNextPage } = useFeed();
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
        <h1 className="text-3xl font-bold text-saboris-primary mb-8 text-center sm:text-left">Your Feed</h1>
        {isLoading && !feedPages.length && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-saboris-primary" />
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">
            <p>Error loading feed: {error?.message || 'Unknown error'}</p>
            <p>Please try again later.</p>
          </div>
        )}
        {!isLoading && !isError && feedPages.length === 0 && (
          <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Your feed is empty!</h2>
            <p className="mb-4">Follow some users or save/review places to see updates here.</p>
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
            if (feedPages.length === index + 1) {
              // Attach ref to the last element for infinite scroll
              return <div ref={lastElementRef} key={post.post_id}><FeedItem post={post} /></div>;
            }
            return <FeedItem key={post.post_id} post={post} />;
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
          <p className="text-center text-gray-500 mt-8">You've reached the end of your feed.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FeedPage;

