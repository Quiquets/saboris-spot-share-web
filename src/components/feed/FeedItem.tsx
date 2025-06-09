
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin } from 'lucide-react';
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

  if (post.post_type !== 'review') {
    console.warn('FeedItem received an unexpected post type:', post.post_type, post);
    return null; 
  }

  return (
    <Card className="mb-6 shadow-lg overflow-hidden bg-white">
      {/* User Header */}
      <div className="flex items-center space-x-3 p-4 pb-2">
        <Link to={`/profile/${post.post_user_id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatarSrc} alt={post.post_user_name || post.post_user_username || "User"} />
            <AvatarFallback>{post.post_user_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${post.post_user_id}`} className="font-semibold hover:underline">
              {post.post_user_name || post.post_user_username}
            </Link>
            {post.post_user_is_community_member && (
              <div className="bg-[#FF6B6B] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Saboris Community Member
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">@{post.post_user_username} • {timeAgo}</p>
        </div>
      </div>

      {/* Large Image Carousel - Takes up most of the screen width */}
      {post.review_photo_urls && post.review_photo_urls.length > 0 && (
        <div className="w-full">
          <Carousel
            opts={{
              align: "start",
              loop: post.review_photo_urls.length > 1,
            }}
            className="w-full"
          >
            <CarouselContent>
              {post.review_photo_urls.map((url, index) => (
                <CarouselItem key={index} className="basis-full">
                  <div className="aspect-[4/3] bg-gray-100">
                    <img 
                      src={url} 
                      alt={`Review photo ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
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
        </div>
      )}

      <CardContent className="p-4">
        {/* Restaurant Info and Rating */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF6B6B]" />
              <Link to={`/map?place=${post.place_id}`} className="text-gray-900 hover:text-[#FF6B6B] transition-colors">
                {post.place_name || 'Restaurant'}
              </Link>
            </h3>
            {post.average_rating !== null && post.average_rating !== undefined && (
              <div className="flex items-center gap-1">
                {renderStars(post.average_rating)}
              </div>
            )}
          </div>
        </div>

        {/* Review Text */}
        {post.review_text && (
          <p className="text-gray-700 mb-4 text-base leading-relaxed whitespace-pre-wrap">
            {post.review_text}
          </p>
        )}
        
        {/* Detailed Ratings */}
        {(post.review_rating_food || post.review_rating_atmosphere || post.review_rating_service || post.review_rating_value) && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-gray-800 mb-2">Rating Details</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {post.review_rating_food && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Food:</span>
                  <div className="flex items-center">
                    {renderStars(post.review_rating_food)}
                  </div>
                </div>
              )}
              {post.review_rating_service && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service:</span>
                  <div className="flex items-center">
                    {renderStars(post.review_rating_service)}
                  </div>
                </div>
              )}
              {post.review_rating_atmosphere && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Atmosphere:</span>
                  <div className="flex items-center">
                    {renderStars(post.review_rating_atmosphere)}
                  </div>
                </div>
              )}
              {post.review_rating_value && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Value:</span>
                  <div className="flex items-center">
                    {renderStars(post.review_rating_value)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedItem;
