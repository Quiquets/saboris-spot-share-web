// src/components/map/GoogleMapView.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { toast } from 'sonner';

// Correct paths into your map/ directory
import { useMapInitialization } from '@/hooks/map/useMapInitialization';
import { useMapMarkers } from '@/hooks/map/useMapMarkers';
import { useExplorePlaces } from '@/hooks/map/useExplorePlaces';
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
  onMapReady?: (map: google.maps.Map) => void;
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  className,
  activeFilters,
  onMapReady,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  // Map your filter UI into the hook’s expected keys
  const peopleScope: 'my' | 'friends' | 'fof' | 'community' =
    activeFilters?.people === 'my-places'
      ? 'my'
      : activeFilters?.people === 'friends'
      ? 'friends'
      : activeFilters?.people === 'friends-of-friends'
      ? 'fof'
      : activeFilters?.people === 'community'
      ? 'community'
      : 'my';

  // 1) Fetch grouped & averaged explore data
  const { places, loading: exploreLoading } = useExplorePlaces(peopleScope);

  // 2) Initialize Google Map
  const {
    mapInstance,
    mapIsReady,
    userLocation,
    initializeMap,
  } = useMapInitialization(mapContainerRef, setIsLoadingMap);

  // 3) Whenever places change, drop coral-pink pins
  useMapMarkers(mapInstance, places);

  // Run map setup once
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Notify parent when map is ready
  useEffect(() => {
    if (mapInstance && mapIsReady && onMapReady) {
      onMapReady(mapInstance);
    }
  }, [mapInstance, mapIsReady, onMapReady]);

  // “Find Me” button logic
  const handleGetUserLocation = () => {
    if (!mapIsReady) {
      toast.error('Map not ready. Please wait for the map to load completely.');
      return;
    }
    if (userLocation && mapInstance) {
      mapInstance.panTo(userLocation);
      // Inline creation of a user‐location marker
      new google.maps.Marker({
        position: userLocation,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#FF6B81',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
      toast.success('Location found. Showing recommendations near you!');
    } else {
      toast.error(
        'Could not get your location. Please check your browser settings.'
      );
    }
  };

  return (
    <Card className={`overflow-hidden shadow-lg relative ${className ?? ''}`}>
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
