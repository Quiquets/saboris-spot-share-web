
/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  loadGoogleMapsScript, 
  safeGetUserLocation, 
  communityRecommendations, 
  cleanupGoogleMapsScript 
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
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  
  // Initialize map separately from adding markers
  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      if (!mapRef.current) return;
      
      try {
        // Load Google Maps script
        await loadGoogleMapsScript();
        
        // Check if component is still mounted
        if (!isMounted || !window.google || !mapRef.current) return;
        
        // Create map with default location
        const defaultLocation = { lat: 40.758, lng: -73.985 }; // NYC default
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 14,
          styles: mapStyles,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });
        
        // Store map instance in ref
        googleMapRef.current = mapInstance;
        
        // Set map as loaded successfully
        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        if (isMounted) {
          toast({
            title: "Map Error",
            description: "Could not load Google Maps. Please check your internet connection and refresh.",
            variant: "destructive"
          });
        }
      }
    };
    
    initializeMap();
    
    // Clean up function
    return () => {
      isMounted = false;
      
      // Clear Google Maps setup when component unmounts
      clearAllMarkers();
      
      // Clean up map reference
      googleMapRef.current = null;
    };
  }, []); // Empty dependency array - only run on mount
  
  // Function to clear all markers
  const clearAllMarkers = () => {
    // Clear community markers
    if (markersRef.current) {
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    }
    
    // Clear user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
  };
  
  // Add markers when map is loaded
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current || !window.google) return;
    
    const map = googleMapRef.current;
    
    // Add community recommendations
    communityRecommendations.forEach(location => {
      try {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
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
            infoWindow.open(map, marker);
          });
        }
      } catch (markerError) {
        console.error("Error creating recommendation marker:", markerError);
      }
    });
    
  }, [mapLoaded]);
  
  // Handle getting user location
  const handleGetUserLocation = () => {
    if (!mapLoaded || !googleMapRef.current || !window.google) {
      toast({
        title: "Map not ready",
        description: "Please wait for the map to load completely.",
        variant: "destructive"
      });
      return;
    }
    
    const map = googleMapRef.current;
    
    safeGetUserLocation(
      // Success callback
      (position) => {
        const userCoords = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        
        // Store user location in state
        setUserLocation(userCoords);
        
        // Pan to user location if map exists
        if (map) {
          map.panTo(userCoords);
        
          // Remove previous user marker if exists
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }
          
          // Add new user location marker
          const userMarker = new window.google.maps.Marker({
            position: userCoords,
            map,
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
          
          toast({
            title: "Location found",
            description: "Showing recommendations near you!",
          });
        }
      },
      // Error callback
      (error) => {
        console.warn("Could not get user location:", error);
        toast({
          title: "Location access denied",
          description: "We're showing our New York recommendations instead.",
          variant: "destructive"
        });
      }
    );
  };
  
  // Final cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear all markers when unmounting
      clearAllMarkers();
      
      // Clean up script properly
      cleanupGoogleMapsScript();
    };
  }, []);
  
  return (
    <section id="map-section" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-8 gap-2">
          <MapPin className="text-saboris-primary h-6 w-6" />
          <h2 className="text-3xl font-bold text-center">Discover Great Places</h2>
        </div>
        
        <Card className="overflow-hidden shadow-lg relative">
          <div ref={mapRef} className="map-container h-[400px] w-full">
            {!mapLoaded && (
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
