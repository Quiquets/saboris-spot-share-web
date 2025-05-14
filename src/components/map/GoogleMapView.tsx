
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import { useMapInitialization } from '@/hooks/map/useMapInitialization';
import { useMapMarkers } from '@/hooks/map/useMapMarkers';
import { usePlacesData } from '@/hooks/map/usePlacesData';
import { MapLoading } from './map-components/MapLoading';

interface GoogleMapViewProps {
  className?: string;
  activeFilters?: {
    people?: string;
    occasion?: string[];
    foodType?: string[];
    vibe?: string[];
    price?: string[];
    rating?: string;
  };
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({ className, activeFilters }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  // Use custom hooks to separate concerns
  const { places, userPlaces, friendsPlaces } = usePlacesData();
  const { 
    mapInstance, 
    mapIsReady, 
    userLocation, 
    initializeMap
  } = useMapInitialization(mapContainerRef, setIsLoadingMap);
  const { 
    addMarkersToMap, 
    addUserMarker
  } = useMapMarkers(mapInstance, mapIsReady);

  // Initialize map when component mounts
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Add markers to map when data or filters change
  useEffect(() => {
    if (mapIsReady && places.length > 0) {
      addMarkersToMap(places, userPlaces, friendsPlaces, activeFilters);
    }
  }, [mapIsReady, places, userPlaces, friendsPlaces, activeFilters, addMarkersToMap]);
  
  // Handle user location button click
  const handleGetUserLocation = () => {
    if (!mapIsReady) {
      toast.error("Map not ready. Please wait for the map to load completely.");
      return;
    }
    
    if (userLocation && mapInstance) {
      mapInstance.panTo(userLocation);
      addUserMarker(userLocation);
      toast.success("Location found. Showing recommendations near you!");
    } else {
      toast.error("Could not get your location. Please check your browser settings.");
    }
  };

  return (
    <Card className={`overflow-hidden shadow-lg relative ${className}`}>
      {isLoadingMap && <MapLoading />}
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ display: isLoadingMap ? 'none' : 'block' }}
      />
      
      <div className="absolute bottom-4 right-4">
        <Button 
          onClick={handleGetUserLocation}
          variant="secondary" 
          className="shadow-md flex items-center gap-2"
        >
          <Target className="h-4 w-4 text-saboris-primary" />
          <span className="text-saboris-gray">Find Me</span>
        </Button>
      </div>
    </Card>
  );
};

export default GoogleMapView;
