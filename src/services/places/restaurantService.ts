
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { SavedRestaurant } from '../types';

class RestaurantService {
  async saveRestaurant(userId: string, placeId: string, note?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          place_id: placeId,
          note
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("You've already saved this restaurant");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      toast.success("Restaurant saved to your wishlist!");
    } catch (error) {
      console.error("Save restaurant error:", error);
      toast.error("Failed to save restaurant. Please try again.");
    }
  }

  async getSavedRestaurants(userId: string): Promise<SavedRestaurant[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          user_id,
          place_id,
          created_at,
          note,
          places:place_id (
            name,
            description,
            tags,
            category
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Get saved restaurants error:", error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        place_id: item.place_id,
        saved_at: new Date(item.created_at),
        note: item.note,
        restaurant: {
          name: item.places.name,
          description: item.places.description,
          tags: item.places.tags,
          category: item.places.category
        }
      }));
    } catch (error) {
      console.error("Get saved restaurants error:", error);
      return [];
    }
  }
  
  async unsaveRestaurant(userId: string, placeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('place_id', placeId);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Restaurant removed from your wishlist");
    } catch (error) {
      console.error("Unsave restaurant error:", error);
      toast.error("Failed to remove restaurant. Please try again.");
    }
  }
}

export const restaurantService = new RestaurantService();
