
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { SavedRestaurant } from '@/services/supabaseService';

interface SavedPlacesGridProps {
  places: SavedRestaurant[];
  handleRemoveFromWishlist: (placeId: string) => Promise<void>;
}

export const SavedPlacesGrid: React.FC<SavedPlacesGridProps> = ({ places, handleRemoveFromWishlist }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {places.map((place) => (
        <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img 
              src={`https://source.unsplash.com/random/400x300?restaurant,${place.restaurant.name}`}
              alt={place.restaurant.name} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          <CardHeader className="py-2 md:py-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm md:text-lg line-clamp-1 text-saboris-gray">
                {place.restaurant.name}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 md:h-8 md:w-8 text-saboris-primary"
                onClick={() => handleRemoveFromWishlist(place.place_id)}
              >
                <Heart className="h-4 w-4 fill-saboris-primary" />
              </Button>
            </div>
            
            {place.restaurant.category && (
              <span className="inline-block px-2 py-0.5 bg-saboris-light text-saboris-primary text-xs rounded-full">
                {place.restaurant.category}
              </span>
            )}
          </CardHeader>
          
          <CardContent className="py-1 md:py-2">
            {place.restaurant.description && (
              <p className="text-xs md:text-sm text-saboris-gray mb-2 line-clamp-2">
                {place.restaurant.description}
              </p>
            )}
            
            {place.note && (
              <div className="mt-1 md:mt-2 text-xs italic text-saboris-gray p-2 bg-gray-50 rounded-md line-clamp-2">
                "{place.note}"
              </div>
            )}
            
            {renderTags(place, isMobile)}
          </CardContent>
          
          <CardFooter className="pt-0 pb-2 md:pb-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-saboris-primary border-saboris-primary text-xs py-1"
              asChild
            >
              <Link to={`/map?place=${place.place_id}`}>
                <MapPin className="h-3 w-3 mr-1" />
                <span>View on Map</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Helper function to render tags
const renderTags = (place: SavedRestaurant, isMobile: boolean) => {
  if (!place.restaurant.tags || place.restaurant.tags.length === 0) {
    return null;
  }
  
  const displayLimit = isMobile ? 3 : 5;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {place.restaurant.tags.slice(0, displayLimit).map((tag, index) => (
        <span 
          key={index} 
          className="text-xs px-1.5 py-0.5 bg-gray-100 text-saboris-gray rounded-full"
        >
          {tag}
        </span>
      ))}
      {place.restaurant.tags.length > displayLimit && (
        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-saboris-gray rounded-full">
          +{place.restaurant.tags.length - displayLimit} more
        </span>
      )}
    </div>
  );
};
