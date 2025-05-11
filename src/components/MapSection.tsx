
/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { loadGoogleMapsScript, getUserLocation, communityRecommendations } from '@/utils/mapUtils';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  useEffect(() => {
    // Initialize map once the script is loaded
    const initMap = async () => {
      if (!mapRef.current || !window.google) return;
      
      try {
        // Try to get user location
        try {
          const position = await getUserLocation();
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Create map centered on user location
          createMap({ lat: latitude, lng: longitude });
          toast({
            title: "Location found",
            description: "Showing recommendations near you!",
          });
        } catch (error) {
          console.warn("Could not get user location, using default:", error);
          // Fall back to default location
          createMap({ lat: 40.758, lng: -73.985 });
          toast({
            title: "Location access denied",
            description: "We're showing our New York recommendations instead.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        toast({
          title: "Map Error",
          description: "Could not initialize Google Maps. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    
    const createMap = (center: {lat: number, lng: number}) => {
      if (!mapRef.current || !window.google) return;
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 14,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      
      // Add user location marker if available
      if (userLocation) {
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Use the new Advanced Marker API if available
          const userMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position: userLocation,
            map,
            title: "Your Location",
          });
        } else {
          // Fallback to regular marker with blue circle
          const userMarker = new window.google.maps.Marker({
            position: userLocation,
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
        }
      }
      
      // Add community recommendations
      communityRecommendations.forEach(location => {
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Use the new Advanced Marker API if available
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: location.lat, lng: location.lng },
            map,
            title: location.title,
          });
        } else {
          // Fallback to regular marker with pink icon
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
        }
      });
      
      setMapLoaded(true);
    };
    
    // Define the callback for the Google Maps script
    window.initMap = initMap;
    
    // Start loading Google Maps
    loadGoogleMapsScript(initMap);
    
    return () => {
      // Clean up
      window.initMap = () => {};
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (script) {
        script.remove();
      }
    };
  }, []);
  
  return (
    <section className="py-16 px-4 md:px-8 bg-white">
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
