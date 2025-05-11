/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { loadGoogleMapsScript, getUserLocation, communityRecommendations, cleanupGoogleMapsScript } from '@/utils/mapUtils';
import { MapPin, Navigation } from 'lucide-react';
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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Separate useEffect for script loading
  useEffect(() => {
    let isMounted = true;
    
    const loadMap = async () => {
      try {
        await loadGoogleMapsScript();
        
        // Only proceed if component is still mounted
        if (!isMounted || !mapRef.current || !window.google) return;
        
        try {
          // Create map with default location first
          const defaultLocation = { lat: 40.758, lng: -73.985 }; // NYC default
          
          const map = new window.google.maps.Map(mapRef.current, {
            center: defaultLocation,
            zoom: 14,
            styles: mapStyles,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
          
          // Store the map instance in ref for later use
          mapInstanceRef.current = map;
          setMapLoaded(true);
        } catch (mapError) {
          console.error("Error creating map:", mapError);
          toast({
            title: "Map Error",
            description: "Could not initialize Google Maps. Please refresh the page.",
            variant: "destructive"
          });
        }
      } catch (scriptError) {
        console.error("Error loading Google Maps script:", scriptError);
        if (isMounted) {
          toast({
            title: "Map Error",
            description: "Could not load Google Maps. Please check your internet connection and refresh.",
            variant: "destructive"
          });
        }
      }
    };
    
    loadMap();
    
    // Clean up function
    return () => {
      isMounted = false;
      cleanupGoogleMapsScript();
    };
  }, []);
  
  // Separate useEffect for user location and markers
  useEffect(() => {
    let isMounted = true;
    
    const setupMapFeatures = async () => {
      // Only proceed if map is loaded
      if (!mapLoaded || !mapInstanceRef.current || !window.google) return;
      
      const map = mapInstanceRef.current;
      
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
      
      // Try to get user location
      try {
        const position = await getUserLocation();
        if (!isMounted || !map) return;
        
        const { latitude, longitude } = position.coords;
        const userCoords = { lat: latitude, lng: longitude };
        setUserLocation(userCoords);
        
        // Pan to user location
        map.panTo(userCoords);
        
        // Add user location marker
        new window.google.maps.Marker({
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
        
        toast({
          title: "Location found",
          description: "Showing recommendations near you!",
        });
      } catch (locationError) {
        console.warn("Could not get user location:", locationError);
        if (isMounted) {
          toast({
            title: "Location access denied",
            description: "We're showing our New York recommendations instead.",
            variant: "destructive"
          });
        }
        // Keep using the default location we already set
      }
    };
    
    if (mapLoaded) {
      setupMapFeatures();
    }
    
    return () => {
      isMounted = false;
    };
  }, [mapLoaded]);
  
  return (
    <section id="map-section" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-8 gap-2">
          <MapPin className="text-saboris-primary h-6 w-6" />
          <h2 className="text-3xl font-bold text-center">Discover Great Places</h2>
        </div>
        
        <Card className="overflow-hidden shadow-lg">
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
        </Card>
      </div>
    </section>
  );
};

export default MapSection;
