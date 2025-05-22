import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react'; // ThumbsUp removed
import { FeedPost } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeedItemProps {
  post: FeedPost;
}

const renderStars = (rating: number | null | undefined) => {
  if (rating === null || rating === undefined || rating < 0) return <span className="text-sm text-gray-500">Not rated</span>;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0; 
  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}-${Math.random()}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }
  if (halfStar) {
     stars.push(<Star key={`half-${Math.random()}`} className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-60" />);
  }
  for (let i = stars.length; i < 5; i++) {
    stars.push(<Star key={`empty-${i}-${Math.random()}`} className="h-4 w-4 text-gray-300" />);
  }
  return <div className="flex items-center">{stars} <span className="ml-1 text-sm font-medium">({rating.toFixed(1)})</span></div>;
};


const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
  const timeAgo = formatDistanceToNow(new Date(post.post_created_at), { addSuffix: true });
  const userAvatarSrc = post.post_user_avatar_url || `https://avatar.vercel.sh/${post.post_user_username || post.post_user_id}.png`;

  // Since the feed will only contain 'review' posts, we can simplify the component.
  // If for some reason a non-review post slips through, it won't render content.
  if (post.post_type !== 'review') {
    // Optionally, log this unexpected case or render nothing
    console.warn('FeedItem received an unexpected post type:', post.post_type, post);
    return null; 
  }

  return (
    <Card className="mb-6 shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Link to={`/profile/${post.post_user_id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatarSrc} alt={post.post_user_name || post.post_user_username || "User"} />
            <AvatarFallback>{post.post_user_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${post.post_user_id}`} className="font-semibold hover:underline">
            {post.post_user_name || post.post_user_username}
          </Link>
          <p className="text-xs text-gray-500">@{post.post_user_username} &bull; {timeAgo}</p>
        </div>
      </CardHeader>

      {/* Image Carousel for Reviews */}
      {post.review_photo_urls && post.review_photo_urls.length > 0 && (
        <Carousel
          opts={{
            align: "start",
            loop: post.review_photo_urls.length > 1,
          }}
          className="w-full mb-3"
        >
          <CarouselContent>
            {post.review_photo_urls.map((url, index) => (
              <CarouselItem key={index} className="basis-full">
                <div className="aspect-video bg-gray-100">
                  <img src={url} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {post.review_photo_urls.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none h-8 w-8" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none h-8 w-8" />
            </>
          )}
        </Carousel>
      )}

      <CardContent className="p-4 pt-0">
        {/* Content for 'review' post type */}
        <div className="mb-2">
          <h3 className="font-semibold text-lg">
            Review for <Link to={`/map?place=${post.place_id}`} className="text-saboris-primary hover:underline">{post.place_name || 'a place'}</Link>
          </h3>
          {post.average_rating !== null && post.average_rating !== undefined && (
            <div className="my-1">{renderStars(post.average_rating)}</div>
          )}
        </div>
        {post.review_text && <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.review_text}</p>}
        
        {(post.review_rating_food || post.review_rating_atmosphere || post.review_rating_service || post.review_rating_value) && (
          <div className="text-xs text-gray-600 space-y-0.5 border-t pt-3 mt-3">
            {post.review_rating_food && <p>Food: {renderStars(post.review_rating_food)}</p>}
            {post.review_rating_service && <p>Service: {renderStars(post.review_rating_service)}</p>}
            {post.review_rating_atmosphere && <p>Atmosphere: {renderStars(post.review_rating_atmosphere)}</p>}
            {post.review_rating_value && <p>Value: {renderStars(post.review_rating_value)}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedItem;
