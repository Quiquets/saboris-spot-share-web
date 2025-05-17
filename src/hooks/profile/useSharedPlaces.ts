import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SharedPlace } from '@/types/profile';

export const useSharedPlaces = (userId: string | null) => {
  const [sharedPlaces, setSharedPlaces] = useState<SharedPlace[]>([]);

  const fetchSharedPlaces = async (): Promise<SharedPlace[]> => {
    if (!userId) return [];
    
    try {
      // Get places created by this user
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('id, name, description, category, address, tags, created_by, created_at, photo_urls')
        .eq('created_by', userId);
      
      if (placesError) throw placesError;
      
      // Get reviews created by this user
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, place_id, created_at, rating_food, rating_service, rating_atmosphere, text, photo_urls, places:place_id(id, name, description, category, address, tags, created_by, photo_urls)')
        .eq('user_id', userId);
      
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        // Fallback to places data only
        const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
          id: place.id,
          place_id: place.id,
          created_at: new Date(place.created_at),
          created_by: place.created_by,
          place: {
            name: place.name,
            description: place.description,
            tags: place.tags,
            category: place.category,
            address: place.address
          },
          photo_urls: place.photo_urls || [],
          type: 'place'
        }));
        
        setSharedPlaces(createdPlaces);
        return createdPlaces;
      }
      
      // Process places data
      const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
        id: place.id,
        place_id: place.id,
        created_at: new Date(place.created_at),
        created_by: place.created_by,
        place: {
          name: place.name,
          description: place.description,
          tags: place.tags,
          category: place.category,
          address: place.address
        },
        photo_urls: place.photo_urls || [],
        type: 'place'
      }));
      
      // Process reviews data
      const reviewedPlaces: SharedPlace[] = (reviewsData || []).map(review => {
        // Calculate average rating from available rating fields
        const ratings: number[] = [];
        if (review.rating_food) ratings.push(review.rating_food);
        if (review.rating_service) ratings.push(review.rating_service); 
        if (review.rating_atmosphere) ratings.push(review.rating_atmosphere);
        
        const avgRating = ratings.length > 0 
          ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) 
          : undefined;
            
        return {
          id: review.id, // This is review_id
          place_id: review.place_id,
          created_at: new Date(review.created_at),
          created_by: userId, // The review author
          place: review.places || { name: 'Unknown Place' }, // place details
          rating: avgRating,
          review_text: review.text,
          photo_urls: review.photo_urls || [], // Use photo_urls from reviews table
          type: 'review'
        };
      });
      
      // Combine all places, ensure no duplicates by place_id, and sort by date (newest first)
      const placesMap = new Map<string, SharedPlace>();
      
      // First add created places to the map
      createdPlaces.forEach(place => {
        placesMap.set(place.place_id, place);
      });
      
      // Then add reviews, but make sure not to add duplicates for the same place
      reviewedPlaces.forEach(review => {
        // Check if we already have a place with this place_id
        const existingPlace = placesMap.get(review.place_id);
        
        // If no existing place, or if the review is newer, add/update the map
        if (!existingPlace || review.created_at > existingPlace.created_at) {
          placesMap.set(review.place_id, review);
        }
      });
      
      // Convert the map values back to an array and sort by date
      const allSharedPlaces = Array.from(placesMap.values())
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      setSharedPlaces(allSharedPlaces);
      return allSharedPlaces;
    } catch (error) {
      console.error("Error fetching shared places:", error);
      toast.error("Failed to load shared places");
      return [];
    }
  };

  return {
    sharedPlaces,
    fetchSharedPlaces
  };
};
