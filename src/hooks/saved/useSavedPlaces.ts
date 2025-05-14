
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService, SavedRestaurant } from '@/services/supabaseService';
import { toast } from 'sonner';
import { User } from '@/types/global';
import { ActiveFilters } from '@/components/map/FilterOptions';

export const useSavedPlaces = (
  user: User | null,
  setShowAuthModal: (show: boolean) => void
) => {
  const [savedPlaces, setSavedPlaces] = useState<SavedRestaurant[]>([]);
  const [friendsSavedPlaces, setFriendsSavedPlaces] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state for filters
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    people: 'my-places', // Default to my places for saved places page
    occasion: [],
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "desc",
    serviceSortDirection: "desc",
    atmosphereSortDirection: "desc",
    valueSortDirection: "desc",
    sortDirection: "desc",
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchSavedPlaces = async () => {
      try {
        setLoading(true);
        // Get user's saved places
        const places = await supabaseService.getSavedRestaurants(user.id);
        setSavedPlaces(places);
        
        // Get friends' saved places
        const { data: friendsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
          
        if (friendsData && friendsData.length > 0) {
          const friendIds = friendsData.map(f => f.following_id);
          
          const { data: friendsPlaces } = await supabase
            .from('wishlists')
            .select('id, place_id, created_at, user_id, note, restaurant:place_id(id, name, description, category, tags, address)')
            .in('user_id', friendIds);
            
          if (friendsPlaces) {
            setFriendsSavedPlaces(friendsPlaces as SavedRestaurant[]);
          }
        }
      } catch (error) {
        console.error("Error fetching saved places:", error);
        toast.error("Failed to load saved places");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedPlaces();
  }, [user]);

  const handleRemoveFromWishlist = async (placeId: string) => {
    if (!user) return;
    
    try {
      await supabaseService.unsaveRestaurant(user.id, placeId);
      setSavedPlaces(currentPlaces => 
        currentPlaces.filter(place => place.place_id !== placeId)
      );
      toast.success("Removed from saved places");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };
  
  const handleFilterChange = (type: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const handlePeopleFilterChange = (value: string) => {
    // Check authentication for friend-related filters
    if ((value === 'friends' || value === 'friends-of-friends') && !user) {
      setShowAuthModal(true);
      return;
    }
    
    setActiveFilters(prev => ({
      ...prev,
      people: value
    }));
  };
  
  const toggleSortDirection = (category: string) => {
    const directionKey = {
      'value': 'valueSortDirection',
      'food-quality': 'foodSortDirection',
      'service': 'serviceSortDirection',
      'atmosphere': 'atmosphereSortDirection'
    }[category] as keyof ActiveFilters;
    
    if (directionKey) {
      const currentDirection = activeFilters[directionKey] as "asc" | "desc";
      const newDirection = currentDirection === "desc" ? "asc" : "desc";
      
      setActiveFilters(prev => ({
        ...prev,
        [directionKey]: newDirection,
        sortDirection: newDirection
      }));
    }
  };

  // Filter places based on active filters
  const filteredPlaces = useMemo(() => {
    let placesToShow = savedPlaces;
    
    // Choose which set of places to show based on people filter
    if (activeFilters.people === 'friends' || activeFilters.people === 'friends-of-friends') {
      placesToShow = friendsSavedPlaces;
    } else if (activeFilters.people === 'community') {
      // Show all places - would be fetched from a different API
      placesToShow = [...savedPlaces, ...friendsSavedPlaces];
    } else {
      // Default to user's places
      placesToShow = savedPlaces;
    }
    
    // Apply other filters (occasion, foodType, etc.)
    let filtered = [...placesToShow];
    
    if (activeFilters.occasion && activeFilters.occasion.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant?.tags?.some(tag => activeFilters.occasion.includes(tag))
      );
    }
    
    if (activeFilters.foodType && activeFilters.foodType.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant?.category && activeFilters.foodType.includes(place.restaurant.category.toLowerCase()) ||
        place.restaurant?.tags?.some(tag => activeFilters.foodType.includes(tag))
      );
    }
    
    if (activeFilters.vibe && activeFilters.vibe.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant?.tags?.some(tag => activeFilters.vibe.includes(tag))
      );
    }
    
    if (activeFilters.price && activeFilters.price.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant?.tags?.some(tag => {
          const priceTags = ['low', 'medium', 'high', 'premium'];
          return priceTags.some(price => tag.includes(price) && activeFilters.price.includes(price));
        })
      );
    }
    
    return filtered;
  }, [savedPlaces, friendsSavedPlaces, activeFilters]);

  return {
    savedPlaces,
    friendsSavedPlaces,
    loading,
    activeFilters,
    handleFilterChange,
    handlePeopleFilterChange,
    toggleSortDirection,
    filteredPlaces,
    handleRemoveFromWishlist
  };
};
