
/// <reference types="@types/google.maps" />

import { useEffect, useRef } from 'react';
import { useMapInitialization } from '@/hooks/map/useMapInitialization';
import { useMapMarkers } from '@/hooks/map/useMapMarkers';
import { useExplorePlaces } from '@/hooks/map/useExplorePlaces';
import { useAuth } from '@/contexts/AuthContext';
import { MapLoading } from './map-components/MapLoading';

interface GoogleMapViewProps {
  className?: string;
  activeFilters?: {
    people: string;
    occasion: string[];
    foodType: string[];
    vibe: string[];
    price: string[];
    rating: string;
  };
  onMapReady?: (map: google.maps.Map) => void;
}

const GoogleMapView = ({ className = "h-96 w-full", activeFilters, onMapReady }: GoogleMapViewProps) => {
  const { user, setShowAuthModal } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, loadError } = useMapInitialization(mapRef);
  const { places, loading: placesLoading } = useExplorePlaces(activeFilters);

  // Use the map markers hook with user and auth modal
  useMapMarkers(map, places, user, setShowAuthModal);

  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Failed to load map</p>
          <p className="text-gray-600 text-sm mt-1">Please check your internet connection and try again</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || placesLoading) {
    return <MapLoading className={className} />;
  }

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ minHeight: '400px' }}
    />
  );
};

export default GoogleMapView;
