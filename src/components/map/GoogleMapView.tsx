
import React, { useRef, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

// Define the props interface
export interface GoogleMapViewProps {
  places: any[];
  center: { lat: number; lng: number };
  onCenterChanged: (center: { lat: number; lng: number }) => void;
  placeImages?: Record<string, string>;
}

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

const GoogleMapView: React.FC<GoogleMapViewProps> = ({ 
  places, 
  center, 
  onCenterChanged,
  placeImages = {} 
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Initialize map
  useEffect(() => {
    if (isLoaded && !map) {
      const newMap = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      
      mapRef.current = newMap;
      setMap(newMap);
      
      // Create InfoWindow instance
      setInfoWindow(new google.maps.InfoWindow());
      
      console.info("Map created successfully");
    }
  }, [isLoaded, map, center]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Add listeners for map events
  useEffect(() => {
    if (map) {
      const centerChangedListener = map.addListener("center_changed", () => {
        const newCenter = map.getCenter();
        if (newCenter) {
          onCenterChanged({
            lat: newCenter.lat(),
            lng: newCenter.lng(),
          });
        }
      });
      
      return () => {
        google.maps.event.removeListener(centerChangedListener);
      };
    }
  }, [map, onCenterChanged]);

  // Add markers for places
  useEffect(() => {
    if (map && places.length > 0) {
      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null));
      
      // Create new markers
      const newMarkers = places.map((place) => {
        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map,
          title: place.name,
        });
        
        // Add click event for markers
        marker.addListener("click", () => {
          if (infoWindow) {
            // Get the place image if available
            const placeImage = placeImages[place.id] || '';
            const imageHtml = placeImage 
              ? `<div class="mb-2"><img src="${placeImage}" alt="${place.name}" style="max-width: 100px; max-height: 100px;"></div>` 
              : '';
              
            // Create info window content
            const content = `
              <div class="p-2">
                ${imageHtml}
                <h3 class="font-bold">${place.name}</h3>
                <div class="flex items-center my-1">
                  <span class="text-yellow-500">★</span>
                  <span class="ml-1">${place.rating} (${place.reviewCount})</span>
                  <span class="ml-2">${'$'.repeat(place.priceLevel)}</span>
                </div>
                <div class="flex flex-wrap mt-1">
                  ${place.tags.map((tag: string) => 
                    `<span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1">${tag}</span>`
                  ).join('')}
                </div>
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          }
        });
        
        return marker;
      });
      
      setMarkers(newMarkers);
    }
  }, [map, places, infoWindow, placeImages]);

  if (loadError) {
    return <div className="w-full h-full flex items-center justify-center">Error loading map</div>;
  }
  
  if (!isLoaded) {
    return <div className="w-full h-full flex items-center justify-center">Loading map...</div>;
  }
  
  return (
    <div id="map" className="w-full h-full"></div>
  );
};

export default GoogleMapView;
