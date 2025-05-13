
/// <reference types="@types/google.maps" />

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import GoogleMapView from './map/GoogleMapView';
import MapFilters from './map/MapFilters';
import { ActiveFilters } from './map/FilterOptions';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapSectionProps {
  simplified?: boolean;
}

const MapSection = ({ simplified = false }: MapSectionProps) => {
  const { user, setShowAuthModal } = useAuth();
  const isMobile = useIsMobile();
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    people: 'community', // Default to Saboris Community
    occasion: [],
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "desc", // Default: high to low
    serviceSortDirection: "desc", // Default: high to low
    atmosphereSortDirection: "desc", // Default: high to low
    valueSortDirection: "desc", // Default: high to low
    sortDirection: "desc", // For compatibility
  });

  useEffect(() => {
    // Update people filter based on authentication state
    setActiveFilters(prev => ({
      ...prev,
      people: user ? prev.people : 'community'
    }));
  }, [user]);
  
  const handleFilterChange = (type: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const handlePeopleFilterChange = (value: string) => {
    // Check if user is authenticated for friends-related filters
    if ((value === 'friends' || value === 'friends-of-friends') && !user) {
      toast.info("Please sign in to use friend filters");
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
        sortDirection: newDirection // Update this for compatibility
      }));
    }
  };
  
  // Mobile height adjustment
  const mapHeight = isMobile ? (simplified ? '300px' : '400px') : (simplified ? '400px' : '700px');
  
  return (
    <section id="map-section" className="py-2 md:py-6 px-1 md:px-2 bg-white">
      <div className="max-w-5xl mx-auto">
        {!simplified && (
          <div className="mb-2 md:mb-6">
            <MapFilters 
              activeFilters={{
                people: activeFilters.people,
                occasion: activeFilters.occasion,
                foodType: activeFilters.foodType,
                vibe: activeFilters.vibe,
                price: activeFilters.price,
                rating: activeFilters.rating.toString(),
                sortDirection: activeFilters.sortDirection
              }}
              handleFilterChange={handleFilterChange}
              handlePeopleFilterChange={handlePeopleFilterChange}
              toggleSortDirection={toggleSortDirection}
              isUserAuthenticated={!!user}
            />
          </div>
        )}
        
        {/* Google Map Component with adjustable height */}
        <div className={`h-[${mapHeight}] w-full border rounded-lg overflow-hidden`} style={{height: mapHeight}}>
          <GoogleMapView className="h-full w-full" />
        </div>
      </div>
    </section>
  );
};

export default MapSection;
