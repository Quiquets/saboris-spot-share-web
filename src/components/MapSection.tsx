
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
  const { user } = useAuth();
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
  
  const handleFilterChange = (type: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const handlePeopleFilterChange = (value: string) => {
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
        [directionKey]: newDirection
      }));
    }
  };
  
  return (
    <section id="map-section" className="py-6 md:py-8 px-2 md:px-0 bg-white">
      <div className="max-w-5xl mx-auto">
        {!simplified && (
          <div className="mb-6">
            <MapFilters 
              activeFilters={activeFilters} 
              handleFilterChange={handleFilterChange}
              handlePeopleFilterChange={handlePeopleFilterChange}
              toggleSortDirection={toggleSortDirection}
            />
          </div>
        )}
        
        {/* Google Map Component - pass people filter */}
        <div className="h-[400px] md:h-[500px] w-full border rounded-lg overflow-hidden">
          <GoogleMapView peopleFilter={activeFilters.people} />
        </div>
      </div>
    </section>
  );
};

export default MapSection;
