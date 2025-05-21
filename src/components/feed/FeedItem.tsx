
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, MapPin, MessageSquare, ThumbsUp, Image as ImageIcon } from 'lucide-react'; // Using ThumbsUp for save, ImageIcon for photo placeholder
import { FeedPost } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';

interface FeedItemProps {
  post: FeedPost;
}

const renderStars = (rating: number | null | undefined) => {
  if (rating === null || rating === undefined || rating < 0) return <span className="text-sm text-gray-500">Not rated</span>;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
  }
  if (halfStar) {
    stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />); // Simplistic half star
  }
  for (let i = stars.length; i < 5; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }
  return <div className="flex items-center">{stars} <span className="ml-1 text-sm font-medium">({rating.toFixed(1)})</span></div>;
};


const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
  const timeAgo = formatDistanceToNow(new Date(post.post_created_at), { addSuffix: true });
  const userAvatarSrc = post.post_user_avatar_url || `https://avatar.vercel.sh/${post.post_user_username || post.post_user_id}.png`;

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Link to={`/profile/${post.post_user_id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatarSrc} alt={post.post_user_name} />
            <AvatarFallback>{post.post_user_name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${post.post_user_id}`} className="font-semibold hover:underline">
            {post.post_user_name}
          </Link>
          <p className="text-xs text-gray-500">@{post.post_user_username} &bull; {timeAgo}</p>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {post.post_type === 'review' && post.review_id && (
          <>
            <div className="mb-2">
              <h3 className="font-semibold text-lg">
                Review for <Link to={`/place/${post.place_id}`} className="text-saboris-primary hover:underline">{post.place_name || 'a place'}</Link>
              </h3>
              {post.average_rating !== null && post.average_rating !== undefined && (
                <div className="my-1">{renderStars(post.average_rating)}</div>
              )}
            </div>
            {post.review_text && <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.review_text}</p>}
            {post.review_photo_urls && post.review_photo_urls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {post.review_photo_urls.map((url, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                    <img src={url} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {(post.review_rating_food || post.review_rating_atmosphere || post.review_rating_service || post.review_rating_value) && (
              <div className="text-xs text-gray-600 space-y-0.5 border-t pt-2 mt-2">
                {post.review_rating_food && <p>Food: {renderStars(post.review_rating_food)}</p>}
                {post.review_rating_atmosphere && <p>Atmosphere: {renderStars(post.review_rating_atmosphere)}</p>}
                {post.review_rating_service && <p>Service: {renderStars(post.review_rating_service)}</p>}
                {post.review_rating_value && <p>Value: {renderStars(post.review_rating_value)}</p>}
              </div>
            )}
          </>
        )}

        {post.post_type === 'save' && post.place_id && (
          <div className="flex items-center text-gray-700">
            <ThumbsUp className="h-5 w-5 mr-2 text-saboris-primary" />
            <p>
              Saved <Link to={`/place/${post.place_id}`} className="font-semibold text-saboris-primary hover:underline">{post.place_name || 'a place'}</Link> to their wishlist.
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Placeholder for potential actions like comments/likes in the future */}
      {/* <CardFooter className="p-4 border-t">
        <Button variant="ghost" size="sm"><MessageSquare className="h-4 w-4 mr-1" /> Comment</Button>
      </CardFooter> */}
    </Card>
  );
};

export default FeedItem;

