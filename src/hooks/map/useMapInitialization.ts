
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { mapStyles } from '@/components/map/MapStyles';
import { safeGetUserLocation, loadGoogleMapsScript } from '@/utils/mapUtils';

export const useMapInitialization = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  setIsLoadingMap: (isLoading: boolean) => void
) => {
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapLoadedRef = useRef<boolean>(false);
  const googleMapsLoadedRef = useRef<boolean>(false);
  const userLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const [mapIsReady, setMapIsReady] = useState(false);
  
  // Initialize the map with Google Maps API
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current) return;
    
    // Load Google Maps script if not loaded yet
    if (!googleMapsLoadedRef.current) {
      try {
        await loadGoogleMapsScript();
        console.log("Google Maps script loaded successfully");
        googleMapsLoadedRef.current = true;
      } catch (err) {
        console.error("Error loading Google Maps script:", err);
        toast.error("Failed to load Google Maps. Please refresh the page.");
        setIsLoadingMap(false);
        return;
      }
    }
    
    // Don't initialize map if already initialized or container not available
    if (mapLoadedRef.current || !googleMapsLoadedRef.current || !window.google?.maps) {
      return;
    }
    
    try {
      // Automatically try to get user location on map load
      safeGetUserLocation(
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
  }, [mapContainerRef, setIsLoadingMap]);
  
  // Create the map with the specified center location
  const createMap = useCallback((centerLocation: {lat: number, lng: number}) => {
    if (!mapContainerRef.current || !window.google?.maps) {
      setIsLoadingMap(false);
      return;
    }
    
    try {
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
      
      // If this is user location, add user marker
      if (userLocationRef.current && 
          centerLocation.lat === userLocationRef.current.lat && 
          centerLocation.lng === userLocationRef.current.lng) {
        // User marker will be added by useMapMarkers hook
      }
    } catch (error) {
      console.error("Error creating map:", error);
      setIsLoadingMap(false);
    }
  }, [mapContainerRef, setIsLoadingMap]);

  return {
    mapInstance: mapInstanceRef.current,
    mapIsReady,
    userLocation: userLocationRef.current,
    initializeMap
  };
};
