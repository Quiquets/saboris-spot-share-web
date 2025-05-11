/// <reference types="@types/google.maps" />

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import MapFilters from './map/MapFilters';
import GoogleMapView from './map/GoogleMapView';
import { ActiveFilters } from './map/FilterOptions';
import { useIsMobile } from '@/hooks/use-mobile';

const MapSection = () => {
  const { user, setShowAuthModal, setFeatureName } = useAuth();
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
  });

  useEffect(() => {
    // Update people filter based on authentication state
    setActiveFilters(prev => ({
      ...prev,
      people: user ? prev.people : 'community'
    }));
  }, [user]);
  
  // Handle filter change
  const handleFilterChange = (type: string, value: string | string[] | { direction: "asc" | "desc", category: string }) => {
    if (typeof value === 'object' && 'direction' in value) {
      // Handle sort direction change for rating categories
      const { direction, category } = value;
      setActiveFilters(prev => ({
        ...prev,
        [`${category}SortDirection`]: direction
      }));
    } else {
      // Handle other filter changes
      setActiveFilters(prev => ({
        ...prev,
        [type]: value
      }));
    }
    
    // In a real app, we would refresh the map data based on filters here
    toast.success("Filters applied. Map data would be refreshed based on your filters.");
  };
  
  // Define the mapping between option.id and state property keys
  const directionKeyMap: Record<string, keyof ActiveFilters> = {
    'value': 'valueSortDirection',
    'food-quality': 'foodSortDirection',
    'service': 'serviceSortDirection',
    'atmosphere': 'atmosphereSortDirection'
  };
  
  const toggleSortDirection = (category: string) => {
    // Use the mapping to get the correct state property key
    const directionKey = directionKeyMap[category];
    if (!directionKey) return;
    
    const currentDirection = activeFilters[directionKey] as "asc" | "desc";
    const newDirection = currentDirection === "desc" ? "asc" : "desc";
    
    handleFilterChange(category, { direction: newDirection, category });
  };
  
  // Handle people filter change with auth gate
  const handlePeopleFilterChange = (value: string) => {
    // Check if user is logged in for restricted filters
    if ((value === 'friends' || value === 'friends-of-friends') && !user) {
      // Show auth modal with specific feature name
      setFeatureName('see friends\' recommendations');
      setShowAuthModal(true);
      return;
    }
    
    setActiveFilters(prev => ({
      ...prev,
      people: value
    }));
  };
  
  return (
    <section id="map-section" className="py-6 md:py-16 px-2 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-4 md:mb-8 gap-2">
          <MapPin className="text-saboris-primary h-5 w-5 md:h-6 md:w-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-center text-saboris-gray">Explore</h2>
        </div>
        
        {/* Mobile layout - stack filters and map vertically */}
        {isMobile && (
          <div className="flex flex-col gap-4">
            {/* Map Filters Component */}
            <div className="bg-white z-10 w-full pb-2">
              <MapFilters 
                activeFilters={activeFilters}
                handleFilterChange={handleFilterChange}
                handlePeopleFilterChange={handlePeopleFilterChange}
                toggleSortDirection={toggleSortDirection}
              />
            </div>
            
            {/* Google Map Component */}
            <div className="h-[400px] w-full border rounded-lg overflow-hidden">
              <GoogleMapView />
            </div>
          </div>
        )}
        
        {/* Desktop layout - keep as is */}
        {!isMobile && (
          <>
            {/* Map Filters Component */}
            <MapFilters 
              activeFilters={activeFilters}
              handleFilterChange={handleFilterChange}
              handlePeopleFilterChange={handlePeopleFilterChange}
              toggleSortDirection={toggleSortDirection}
            />
            
            {/* Google Map Component */}
            <GoogleMapView />
          </>
        )}
      </div>
    </section>
  );
};

export default MapSection;
