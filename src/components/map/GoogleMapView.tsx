
/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mapStyles } from './MapStyles';
import { toast } from 'sonner';
import { loadGoogleMapsScript } from '@/utils/mapUtils';

// Define ActiveFilters type
export interface ActiveFilters {
  foodType: string[];
  price: string[];
  rating: number;
  occasion: string[];
  vibe: string[];
}

interface GoogleMapViewProps {
  peopleFilter: string;
  activeFilters: ActiveFilters;
}

const GoogleMapView = ({ peopleFilter, activeFilters }: GoogleMapViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { user } = useAuth();
  
  // Load the Google Maps API script
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        setIsMapLoaded(true);
        getUserLocation();
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        toast.error("Failed to load map. Please try again later.");
      }
    };
    
    initializeMap();
    
    return () => {
      // Clean up any map references if component unmounts
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (!user) {
      getUserLocation();
    }
  }, [user]);
  
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not retrieve your location.");
          
          // Set a default location (e.g., New York City) when user location can't be retrieved
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      // Set a default location
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  };
  
  useEffect(() => {
    // Initialize map only after user location is available AND Google Maps is loaded
    if (userLocation && isMapLoaded) {
      if (window.google && window.google.maps) {
        initMap();
      } else {
        console.error("Google Maps API not available even though load was attempted");
        toast.error("Map couldn't be loaded properly. Please refresh the page.");
      }
    }
  }, [userLocation, isMapLoaded]);
  
  const initMap = () => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not available");
      return;
    }
    
    try {
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        console.error("Map container not found");
        return;
      }
      
      const map = new window.google.maps.Map(mapElement, {
        center: userLocation,
        zoom: 15,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });
      
      mapRef.current = map;
      
      // Add a marker at the user's location
      addMarker(userLocation, map);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to initialize map. Please refresh the page.");
    }
  };
  
  const addMarker = (location: google.maps.LatLngLiteral, map: google.maps.Map) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not available for marker creation");
      return;
    }
    
    try {
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: "Your Location",
      });
      
      markerRef.current = marker;
    } catch (error) {
      console.error("Error creating marker:", error);
    }
  };
  
  return (
    <div id="map" style={{ height: '100%', width: '100%' }}></div>
  );
};

export default GoogleMapView;
