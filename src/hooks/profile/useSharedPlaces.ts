
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SharedPlace } from '@/types/profile';

export const useSharedPlaces = (userId: string | null) => {
  const [sharedPlaces, setSharedPlaces] = useState<SharedPlace[]>([]);

  const fetchSharedPlaces = async (): Promise<SharedPlace[]> => {
    if (!userId) return [];
    
    try {
      // Get places created by this user.
      // The 'places' table does not have 'photo_urls'. It might have 'image_url' for a main photo.
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('id, name, description, category, address, tags, created_by, created_at, image_url') // Assuming image_url exists for main place photo
        .eq('created_by', userId);
      
      if (placesError) throw placesError;
      
      // Get reviews created by this user
      // Ensure the joined 'places' table selects existing columns, like 'image_url' instead of 'photo_urls'
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id, 
          place_id, 
          created_at, 
          rating_food, 
          rating_service, 
          rating_atmosphere, 
          text, 
          photo_urls, 
          places:place_id (
            id, 
            name, 
            description, 
            category, 
            address, 
            tags, 
            created_by, 
            image_url 
          )
        `)
        .eq('user_id', userId);
      
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        // Fallback to places data only if reviews fail
        const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
          id: place.id,
          place_id: place.id,
          created_at: new Date(place.created_at),
          created_by: place.created_by || undefined,
          place: {
            name: place.name,
            description: place.description || undefined,
            tags: place.tags || undefined,
            category: place.category || undefined,
            address: place.address || undefined,
            image_url: place.image_url || undefined, // Main image for the place
          },
          // Places themselves don't have a photo_urls array in this model, reviews do.
          // If a place can have multiple photos, 'places' table needs a 'photo_urls' TEXT[] too.
          // For now, using place.image_url as the source for the card if it's just a 'place' type.
          photo_urls: place.image_url ? [place.image_url] : [], 
          type: 'place'
        }));
        
        setSharedPlaces(createdPlaces);
        return createdPlaces;
      }
      
      // Process places data
      const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
        id: place.id, // This is place.id
        place_id: place.id,
        created_at: new Date(place.created_at),
        created_by: place.created_by || undefined,
        place: {
          name: place.name,
          description: place.description || undefined,
          tags: place.tags || undefined,
          category: place.category || undefined,
          address: place.address || undefined,
          image_url: place.image_url || undefined,
        },
        photo_urls: place.image_url ? [place.image_url] : [], // For 'place' type, use its main image_url
        type: 'place'
      }));
      
      // Process reviews data
      const reviewedPlaces: SharedPlace[] = (reviewsData || []).map(review => {
        const ratings: number[] = [];
        if (review.rating_food) ratings.push(review.rating_food);
        if (review.rating_service) ratings.push(review.rating_service); 
        if (review.rating_atmosphere) ratings.push(review.rating_atmosphere);
        
        const avgRating = ratings.length > 0 
          ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) 
          : undefined;
        
        // Handle case where review.places might be null (e.g., if place was deleted)
        const placeDetails = review.places ? {
            name: review.places.name,
            description: review.places.description || undefined,
            tags: review.places.tags || undefined,
            category: review.places.category || undefined,
            address: review.places.address || undefined,
            image_url: review.places.image_url || undefined,
        } : { name: 'Unknown Place (possibly deleted)' };
            
        return {
          id: review.id, // This is review_id
          place_id: review.place_id,
          created_at: new Date(review.created_at),
          created_by: userId, 
          place: placeDetails,
          rating: avgRating,
          review_text: review.text || undefined,
          photo_urls: review.photo_urls || [], // Photos from the review itself
          type: 'review'
        };
      });
      
      // Combine all places, ensure no duplicates by place_id, and sort by date (newest first)
      const placesMap = new Map<string, SharedPlace>();
      
      createdPlaces.forEach(place => {
        placesMap.set(place.place_id, place);
      });
      
      reviewedPlaces.forEach(review => {
        const existingItem = placesMap.get(review.place_id);
        // If it's a review for a place we already mapped as 'place' type,
        // we prefer the review details (which are more specific for user's interaction).
        // Or if no existing item, or if the review is newer than whatever 'place' record we had.
        if (!existingItem || existingItem.type === 'place' || review.created_at > existingItem.created_at) {
          placesMap.set(review.place_id, review);
        }
      });
      
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
