
/// <reference types="@types/google.maps" />

import { useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  loadGoogleMapsScript, 
  safeGetUserLocation, 
  communityRecommendations
} from '@/utils/mapUtils';
import { MapPin, Navigation, Target } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const mapStyles = [
  {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [{ "weight": "2.00" }]
  },
  {
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#9c9c9c" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{ "color": "#f2f2f2" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{ "visibility": "simplified" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{ "color": "#FFDEE2" }, { "visibility": "on" }]
  }
];

const MapSection = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapLoadedRef = useRef<boolean>(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const userLocationRef = useRef<{lat: number, lng: number} | null>(null);
  
  // Get user location and initialize map with it
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current) return;
    
    try {
      // Load Google Maps script
      await loadGoogleMapsScript();
      
      // Safety check if component is still mounted and Google Maps is loaded
      if (!mapContainerRef.current || !window.google?.maps) return;
      
      // Try to get user location first
      try {
        // Get user location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords = { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            };
            
            // Store user location in ref
            userLocationRef.current = userCoords;
            
            // Initialize map with user location
            createMap(userCoords);
          },
          // If user location fails, use default location
          (error) => {
            console.warn("Could not get user location:", error);
            // Default location - NYC
            const defaultLocation = { lat: 40.758, lng: -73.985 };
            createMap(defaultLocation);
          }
        );
      } catch (geolocationError) {
        console.warn("Geolocation error:", geolocationError);
        // Default location - NYC
        const defaultLocation = { lat: 40.758, lng: -73.985 };
        createMap(defaultLocation);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not load Google Maps. Please check your internet connection and refresh.",
        variant: "destructive"
      });
    }
  }, []);
  
  // Create map with given center location
  const createMap = (centerLocation: {lat: number, lng: number}) => {
    if (!mapContainerRef.current || !window.google?.maps) return;
    
    const mapInstance = new window.google.maps.Map(mapContainerRef.current, {
      center: centerLocation,
      zoom: 14,
      styles: mapStyles,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    // Store map instance in ref
    mapInstanceRef.current = mapInstance;
    mapLoadedRef.current = true;
    
    // If this is user location, add user marker
    if (userLocationRef.current && 
        centerLocation.lat === userLocationRef.current.lat && 
        centerLocation.lng === userLocationRef.current.lng) {
      addUserMarker(centerLocation);
    }
    
    // Add recommendation markers
    addMarkersToMap();
  };
  
  // Add user location marker
  const addUserMarker = (position: {lat: number, lng: number}) => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    
    // Remove previous user marker if exists
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    
    // Create user marker
    try {
      const userMarker = new window.google.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });
      
      // Store reference to user marker
      userMarkerRef.current = userMarker;
    } catch (error) {
      console.error("Error creating user marker:", error);
    }
  };
  
  // Add markers to map when it's loaded
  const addMarkersToMap = useCallback(() => {
    if (!mapLoadedRef.current || !mapInstanceRef.current || !window.google?.maps) return;
    
    // Clear any existing markers first
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add community recommendations
    communityRecommendations.forEach(location => {
      try {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstanceRef.current,
          title: location.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#EE8C80",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          }
        });
        
        markersRef.current.push(marker);
        
        // Create info window with location details
        if (location.description) {
          const infoContent = `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0; font-weight: bold;">${location.title}</h3>
              <p style="margin-top: 4px;">${location.description}</p>
              ${location.photo ? `<img src="${location.photo}" style="width: 100%; margin-top: 8px; border-radius: 4px;">` : ''}
            </div>
          `;
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent
          });
          
          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        }
      } catch (error) {
        console.error("Error creating recommendation marker:", error);
      }
    });
  }, []);
  
  // Initialize map on mount
  useEffect(() => {
    // Make sure we only load the map once
    if (!mapLoadedRef.current) {
      initializeMap();
    }
    
    // Cleanup function
    return () => {
      // Clear all markers safely
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        markersRef.current = [];
      }
      
      // Clear user marker safely
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      
      // Reset map instance
      mapInstanceRef.current = null;
      mapLoadedRef.current = false;
      
      // We don't call cleanupGoogleMapsScript() here to avoid DOM removal issues
    };
  }, [initializeMap]);
  
  // Safe geolocation handler with improved error handling
  const handleGetUserLocation = useCallback(() => {
    if (!mapLoadedRef.current || !mapInstanceRef.current || !window.google?.maps) {
      toast({
        title: "Map not ready",
        description: "Please wait for the map to load completely.",
        variant: "destructive"
      });
      return;
    }
    
    safeGetUserLocation(
      // Success callback with safety checks
      (position) => {
        try {
          const userCoords = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          
          // Store user location in ref instead of state to avoid re-rendering
          userLocationRef.current = userCoords;
          
          // Get safe reference to map instance
          const mapInstance = mapInstanceRef.current;
          if (!mapInstance) return;
          
          // Pan to user location 
          mapInstance.panTo(userCoords);
          
          // Add user marker
          addUserMarker(userCoords);
          
          toast({
            title: "Location found",
            description: "Showing recommendations near you!",
          });
        } catch (error) {
          console.error("Error handling geolocation result:", error);
          toast({
            title: "Error",
            description: "Something went wrong with geolocation.",
            variant: "destructive"
          });
        }
      },
      // Error callback with user feedback
      (error) => {
        console.warn("Could not get user location:", error);
        toast({
          title: "Location access denied",
          description: "We're showing our New York recommendations instead.",
          variant: "destructive"
        });
      }
    );
  }, []);
  
  return (
    <section id="map-section" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-8 gap-2">
          <MapPin className="text-saboris-primary h-6 w-6" />
          <h2 className="text-3xl font-bold text-center">Discover Great Places</h2>
        </div>
        
        {/* Add key to Card to ensure stable identity */}
        <Card key="map-card" className="overflow-hidden shadow-lg relative">
          {/* Add suppressHydrationWarning to prevent React from modifying this DOM node */}
          <div 
            ref={mapContainerRef} 
            className="map-container h-[400px] w-full"
            suppressHydrationWarning
          >
            {!mapLoadedRef.current && (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                  <Navigation className="h-8 w-8 text-saboris-primary animate-spin" />
                  <p className="mt-2 text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleGetUserLocation}
              variant="secondary" 
              className="shadow-md flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              <span>Find Me</span>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MapSection;
