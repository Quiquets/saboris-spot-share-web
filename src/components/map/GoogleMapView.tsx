import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import { mapStyles } from './MapStyles';
import { safeGetUserLocation, communityRecommendations, loadGoogleMapsScript } from '@/utils/mapUtils';

interface GoogleMapViewProps {
  className?: string;
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({ className }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapLoadedRef = useRef<boolean>(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const userLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const googleMapsLoadedRef = useRef<boolean>(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapIsReady, setMapIsReady] = useState(false);

  // Load Google Maps script and initialize map
  useEffect(() => {
    if (!googleMapsLoadedRef.current) {
      console.log("Loading Google Maps script...");
      
      const loadMap = async () => {
        try {
          await loadGoogleMapsScript();
          console.log("Google Maps script loaded successfully");
          googleMapsLoadedRef.current = true;
          // After script is loaded, we can initialize the map
          initializeMap();
        } catch (err) {
          console.error("Error loading Google Maps script:", err);
          toast.error("Failed to load Google Maps. Please refresh the page.");
          setIsLoadingMap(false);
        }
      };
      
      loadMap();
    }
  }, []);

  // Initialize map once Google Maps API is loaded
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current || !googleMapsLoadedRef.current || !window.google?.maps) {
      console.log("Map container ref or Google Maps not available yet");
      return;
    }
    
    console.log("Initializing map with container:", mapContainerRef.current);
    
    try {
      // Automatically try to get user location on map load
      safeGetUserLocation(
        (position) => {
          const userCoords = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          
          console.log("Got user location:", userCoords);
          
          // Store user location in ref
          userLocationRef.current = userCoords;
          
          // Initialize map with user location
          createMap(userCoords);
        },
        // If user location fails, use default location
        (error) => {
          console.warn("Could not get user location:", error);
          toast.error("Location access denied. Showing default recommendations instead.");
          // Default location - NYC
          const defaultLocation = { lat: 40.758, lng: -73.985 };
          createMap(defaultLocation);
        }
      );
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Map error. Please check your internet connection and refresh.");
      setIsLoadingMap(false);
    }
  }, []);

  // Create map with given center location
  const createMap = (centerLocation: {lat: number, lng: number}) => {
    if (!mapContainerRef.current || !window.google?.maps) {
      console.error("Map container ref or Google Maps not available");
      setIsLoadingMap(false);
      return;
    }
    
    try {
      console.log("Creating map with center:", centerLocation);
      console.log("Map container element:", mapContainerRef.current);
      
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
      setMapIsReady(true);
      setIsLoadingMap(false);
      
      console.log("Map created successfully");
      
      // If this is user location, add user marker
      if (userLocationRef.current && 
          centerLocation.lat === userLocationRef.current.lat && 
          centerLocation.lng === userLocationRef.current.lng) {
        addUserMarker(centerLocation);
      }
      
      // Add recommendation markers
      addMarkersToMap();
    } catch (error) {
      console.error("Error creating map:", error);
      setIsLoadingMap(false);
    }
  };
  
  // Add user location marker
  const addUserMarker = (position: {lat: number, lng: number}) => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    
    try {
      // Remove previous user marker if exists
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      
      // Create user marker
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
    
    try {
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
    } catch (error) {
      console.error("Error adding markers to map:", error);
    }
  }, []);
  
  // Safe geolocation handler with improved error handling
  const handleGetUserLocation = useCallback(() => {
    if (!mapLoadedRef.current || !mapInstanceRef.current || !window.google?.maps) {
      toast.error("Map not ready. Please wait for the map to load completely.");
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
          
          toast.success("Location found. Showing recommendations near you!");
        } catch (error) {
          console.error("Error handling geolocation result:", error);
          toast.error("Something went wrong with geolocation.");
        }
      },
      // Error callback with user feedback
      (error) => {
        console.warn("Could not get user location:", error);
        toast.error("Location access denied. We're showing our New York recommendations instead.");
      }
    );
  }, []);

  return (
    <Card className={`overflow-hidden shadow-lg relative ${className}`}>
      {/* Map container with explicit height */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ display: isLoadingMap ? 'none' : 'block' }}
      />
      
      {/* Loading state */}
      {isLoadingMap && (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-saboris-primary border-t-transparent animate-spin"></div>
            <p className="mt-2 text-saboris-gray">Loading map...</p>
          </div>
        </div>
      )}
      
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

// Helper function from mapUtils.ts - included here to ensure the component works correctly
// These would normally be imported from mapUtils.ts
function loadGoogleMapsScript(): Promise<void> {
  // If already loaded, return immediately
  if (window.google?.maps) {
    console.log("Google Maps API already loaded");
    return Promise.resolve();
  }
  
  return new Promise<void>((resolve, reject) => {
    try {
      // Create unique callback name
      const callbackName = `initGoogleMaps${Date.now()}`;
      
      // Define callback function
      window[callbackName] = function() {
        console.log("Google Maps initialized");
        resolve();
        
        // Clean up the callback after use
        try {
          delete window[callbackName];
        } catch (e) {
          window[callbackName] = undefined;
        }
      };
      
      // Create script element
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDtlKxZhiMEgLtnbdBTpc5ly6-_lJqWnVQ&libraries=places&v=beta&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (e) => {
        console.error('Google Maps failed to load:', e);
        reject(new Error('Google Maps failed to load. Check API key or network connection.'));
      };
      
      // Append to document head
      document.head.appendChild(script);
    } catch (error) {
      console.error("Error in loadGoogleMapsScript:", error);
      reject(error);
    }
  });
}
