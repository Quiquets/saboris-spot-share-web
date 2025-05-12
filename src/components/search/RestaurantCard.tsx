
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, MapPin, Star } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  place_id: string;
  cuisine?: string;
  avg_rating?: number;
  reviewers?: {
    id: string;
    name: string;
    avatar_url: string | null;
  }[];
  is_saved?: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  saveLoading: boolean;
  onSave: () => void;
  onUnsave: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  saveLoading,
  onSave,
  onUnsave
}) => {
  const { name, address, cuisine, avg_rating, reviewers = [], is_saved } = restaurant;
  const displayedReviewers = reviewers.slice(0, 4);
  const additionalReviewers = Math.max(0, reviewers.length - 4);
  
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-800 truncate">{name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={is_saved ? onUnsave : onSave}
            disabled={saveLoading}
            className="ml-2 flex-shrink-0"
          >
            {saveLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className={`h-5 w-5 ${is_saved ? "fill-saboris-primary text-saboris-primary" : "text-gray-400"}`} />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {reviewers.length > 0 ? (
              <>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-medium">{avg_rating || 0}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({reviewers.length} {reviewers.length === 1 ? 'friend' : 'friends'})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500 italic">
                No friend reviews yet – go try it yourself!
              </span>
            )}
          </div>
        </div>
        
        {cuisine && (
          <div className="mb-3">
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
              {cuisine}
            </span>
          </div>
        )}
        
        {reviewers.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {displayedReviewers.map((reviewer) => (
                <Avatar key={reviewer.id} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={reviewer.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-saboris-primary text-white">
                    {reviewer.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              
              {additionalReviewers > 0 && (
                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">+{additionalReviewers}</span>
                </div>
              )}
            </div>
            
            <span className="ml-2 text-xs text-gray-500">
              Reviewed by {reviewers.length === 1 
                ? '1 friend' 
                : `${reviewers.length} friends`}
            </span>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 text-saboris-primary border-saboris-primary"
          asChild
        >
          <Link to={`/map?place=${restaurant.id}`}>
            <MapPin className="h-4 w-4 mr-1" />
            View on Map
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
