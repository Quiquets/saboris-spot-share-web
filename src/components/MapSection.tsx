
/// <reference types="@types/google.maps" />

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import GoogleMapView from './map/GoogleMapView';
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
  
  // In a real app, we would refresh the map data based on filters here
  
  return (
    <section id="map-section" className="py-6 md:py-16 px-2 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Google Map Component - simplified layout */}
        <div className="h-[400px] md:h-[500px] w-full border rounded-lg overflow-hidden">
          <GoogleMapView />
        </div>
      </div>
    </section>
  );
};

export default MapSection;
