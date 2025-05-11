
/// <reference types="@types/google.maps" />

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

declare global {
  interface Window {
    google: any;
  }
}

const MapSection = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadGoogleMaps = () => {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuq7aCWMYJQwiSJxN7u-DRX-2xHAeVQeo&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      window.document.body.appendChild(googleMapsScript);
      
      googleMapsScript.onload = () => {
        if (mapRef.current && window.google) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 40.758, lng: -73.985 }, // New York by default
            zoom: 14,
            styles: [
              {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "weight": "2.00"
                  }
                ]
              },
              {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [
                  {
                    "color": "#9c9c9c"
                  }
                ]
              },
              {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                  {
                    "color": "#f2f2f2"
                  }
                ]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "color": "#ffffff"
                  }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                  {
                    "saturation": -100
                  },
                  {
                    "lightness": 45
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "color": "#eeeeee"
                  }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                  {
                    "visibility": "simplified"
                  }
                ]
              },
              {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                  {
                    "color": "#FFDEE2"
                  },
                  {
                    "visibility": "on"
                  }
                ]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
          
          // Sample restaurant locations
          const locations = [
            { lat: 40.7580, lng: -73.9855, title: "Delicious Sushi Place" },
            { lat: 40.7610, lng: -73.9840, title: "Amazing Pasta Restaurant" },
            { lat: 40.7540, lng: -73.9870, title: "Best Brunch Spot" },
          ];
          
          // Add markers for each location
          locations.forEach(location => {
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
          });
        }
      };
    };
    
    loadGoogleMaps();
    
    return () => {
      // Clean up script if component unmounts before script loads
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (script) {
        script.remove();
      }
    };
  }, []);
  
  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Discover Great Places</h2>
        <Card className="overflow-hidden shadow-lg">
          <div ref={mapRef} className="map-container h-[400px] w-full" />
        </Card>
      </div>
    </section>
  );
};

export default MapSection;
