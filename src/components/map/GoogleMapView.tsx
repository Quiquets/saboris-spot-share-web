/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import mapStyles from './MapStyles';
import { toast } from 'sonner';
import { ActiveFilters } from './FilterOptions';

interface GoogleMapViewProps {
  peopleFilter: string;
  activeFilters: ActiveFilters; // Added the activeFilters prop type
}

const GoogleMapView = ({ peopleFilter, activeFilters }: GoogleMapViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const { user } = useAuth();
  
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
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };
  
  useEffect(() => {
    // Initialize map only after user location is available
    if (userLocation) {
      initMap();
    }
  }, [userLocation]);
  
  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map") as HTMLElement, {
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
  };
  
  const addMarker = (location: google.maps.LatLngLiteral, map: google.maps.Map) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      title: "Your Location",
    });
    
    markerRef.current = marker;
  };
  
  return (
    <div id="map" style={{ height: '100%', width: '100%' }}></div>
  );
};

export default GoogleMapView;
