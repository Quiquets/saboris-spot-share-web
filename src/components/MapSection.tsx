/// <reference types="@types/google.maps" />

import { useEffect, useRef, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  loadGoogleMapsScript, 
  safeGetUserLocation, 
  communityRecommendations
} from '@/utils/mapUtils';
import { MapPin, Target, Filter, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AccessGateModal from './AccessGateModal';
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const filterOptions = {
  people: [
    { id: 'friends', label: 'Friends' },
    { id: 'friends-of-friends', label: 'Friends of Friends' },
    { id: 'community', label: 'Saboris Community' },
  ],
  foodType: [
    { id: 'sushi', label: 'Sushi 🍣' },
    { id: 'indian', label: 'Indian 🥘' },
    { id: 'italian', label: 'Italian 🍝' },
    { id: 'burgers', label: 'Burgers 🍔' },
    { id: 'coffee', label: 'Coffee ☕' },
    { id: 'street-food', label: 'Street Food 🌮' },
    { id: 'healthy', label: 'Healthy 🥗' },
    { id: 'dessert', label: 'Dessert 🍰' },
  ],
  vibe: [
    { id: 'romantic', label: 'Romantic' },
    { id: 'casual', label: 'Casual' },
    { id: 'lively', label: 'Lively' },
    { id: 'business', label: 'Business' },
    { id: 'solo-friendly', label: 'Solo Friendly' },
    { id: 'family-friendly', label: 'Family Friendly' },
    { id: 'outdoor', label: 'Outdoor Seating' },
    { id: 'local', label: 'Local Favorite' },
  ],
  price: [
    { id: 'low', label: '€' },
    { id: 'medium', label: '€€' },
    { id: 'high', label: '€€€' },
    { id: 'premium', label: '€€€€' },
  ],
  sort: [
    { id: 'food-high-low', label: 'Food Rating (High to Low)', icon: <ArrowDown className="h-4 w-4" /> },
    { id: 'food-low-high', label: 'Food Rating (Low to High)', icon: <ArrowUp className="h-4 w-4" /> },
    { id: 'service-high-low', label: 'Service Rating (High to Low)', icon: <ArrowDown className="h-4 w-4" /> },
    { id: 'service-low-high', label: 'Service Rating (Low to High)', icon: <ArrowUp className="h-4 w-4" /> },
    { id: 'atmosphere-high-low', label: 'Atmosphere Rating (High to Low)', icon: <ArrowDown className="h-4 w-4" /> },
    { id: 'atmosphere-low-high', label: 'Atmosphere Rating (Low to High)', icon: <ArrowUp className="h-4 w-4" /> },
    { id: 'value-high-low', label: 'Value for Quality (High to Low)', icon: <ArrowDown className="h-4 w-4" /> },
    { id: 'value-low-high', label: 'Value for Quality (Low to High)', icon: <ArrowUp className="h-4 w-4" /> },
  ],
};

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
  const { user } = useAuth();
  
  const [activeFilters, setActiveFilters] = useState<{
    people: string;
    foodType: string[];
    vibe: string[];
    price: string[];
    rating: number;
    sort: string;
  }>({
    people: user ? 'friends' : 'community',
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    sort: 'food-high-low',
  });
  
  const [showGateModal, setShowGateModal] = useState(false);
  const [mapIsReady, setMapIsReady] = useState(false);

  useEffect(() => {
    // Update people filter based on authentication state
    setActiveFilters(prev => ({
      ...prev,
      people: user ? 'friends' : 'community'
    }));
  }, [user]);
  
  // Auto-center map on user's location when loaded
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current) return;
    
    try {
      // Load Google Maps script
      await loadGoogleMapsScript();
      
      // Safety check if component is still mounted and Google Maps is loaded
      if (!mapContainerRef.current || !window.google?.maps) return;
      
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
          toast({
            title: "Location access denied",
            description: "We're showing our default recommendations instead.",
            variant: "destructive"
          });
          // Default location - NYC
          const defaultLocation = { lat: 40.758, lng: -73.985 };
          createMap(defaultLocation);
        }
      );
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
  
  // Initialize map on mount
  useEffect(() => {
    // Make sure we only load the map once
    if (!mapLoadedRef.current) {
      initializeMap();
    }
    
    // Cleanup function with explicit error handling
    return () => {
      try {
        console.log("Cleaning up map component...");
        
        // Clear all markers safely
        if (markersRef.current && markersRef.current.length > 0) {
          markersRef.current.forEach(marker => {
            if (marker) {
              try {
                marker.setMap(null);
              } catch (e) {
                console.error("Error clearing marker:", e);
              }
            }
          });
          markersRef.current = [];
        }
        
        // Clear user marker safely
        if (userMarkerRef.current) {
          try {
            userMarkerRef.current.setMap(null);
          } catch (e) {
            console.error("Error clearing user marker:", e);
          }
          userMarkerRef.current = null;
        }
        
        // Don't try to remove the map from the DOM directly,
        // just clear our references to it
        mapInstanceRef.current = null;
        mapLoadedRef.current = false;
        setMapIsReady(false);
        
        console.log("Map cleanup complete");
      } catch (error) {
        console.error("Error during map cleanup:", error);
      }
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
  
  // Handle filter change
  const handleFilterChange = (type: string, value: string | string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value
    }));
    
    // In a real app, we would refresh the map data based on filters here
    toast({
      title: "Filters applied",
      description: "Map data would be refreshed based on your filters.",
    });
  };
  
  return (
    <section id="map-section" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-8 gap-2">
          <MapPin className="text-saboris-primary h-6 w-6" />
          <h2 className="text-3xl font-bold text-center">Taste, Share, Explore</h2>
        </div>
        
        <div className="mb-4 flex flex-col items-start">
          <Tabs 
            value={activeFilters.people} 
            className="w-full mb-4"
            onValueChange={(value) => handleFilterChange('people', value)}
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="friends-of-friends">Friends of Friends</TabsTrigger>
              <TabsTrigger value="community">Saboris Community</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 mb-4 w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4 text-saboris-primary" /> Food Type
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.foodType.map(option => (
                    <Button 
                      key={option.id}
                      variant={activeFilters.foodType.includes(option.id) ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => {
                        const newFilters = activeFilters.foodType.includes(option.id)
                          ? activeFilters.foodType.filter(id => id !== option.id)
                          : [...activeFilters.foodType, option.id];
                        handleFilterChange('foodType', newFilters);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4 text-saboris-primary" /> Vibe
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.vibe.map(option => (
                    <Button 
                      key={option.id}
                      variant={activeFilters.vibe.includes(option.id) ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => {
                        const newFilters = activeFilters.vibe.includes(option.id)
                          ? activeFilters.vibe.filter(id => id !== option.id)
                          : [...activeFilters.vibe, option.id];
                        handleFilterChange('vibe', newFilters);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4 text-saboris-primary" /> Price
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.price.map(option => (
                    <Button 
                      key={option.id}
                      variant={activeFilters.price.includes(option.id) ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        const newFilters = activeFilters.price.includes(option.id)
                          ? activeFilters.price.filter(id => id !== option.id)
                          : [...activeFilters.price, option.id];
                        handleFilterChange('price', newFilters);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4 text-saboris-primary" /> Sort By
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex flex-col gap-1">
                  {filterOptions.sort.map(option => (
                    <Button 
                      key={option.id}
                      variant={activeFilters.sort === option.id ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleFilterChange('sort', option.id)}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {activeFilters.foodType.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {activeFilters.foodType.map(filter => (
                <Badge 
                  key={filter} 
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    const newFilters = activeFilters.foodType.filter(id => id !== filter);
                    handleFilterChange('foodType', newFilters);
                  }}
                >
                  {filterOptions.foodType.find(o => o.id === filter)?.label}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
          )}
          
          {activeFilters.vibe.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {activeFilters.vibe.map(filter => (
                <Badge 
                  key={filter} 
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    const newFilters = activeFilters.vibe.filter(id => id !== filter);
                    handleFilterChange('vibe', newFilters);
                  }}
                >
                  {filterOptions.vibe.find(o => o.id === filter)?.label}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
          )}
          
          {activeFilters.price.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {activeFilters.price.map(filter => (
                <Badge 
                  key={filter} 
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    const newFilters = activeFilters.price.filter(id => id !== filter);
                    handleFilterChange('price', newFilters);
                  }}
                >
                  {filterOptions.price.find(o => o.id === filter)?.label}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Add key to Card to ensure stable identity */}
        <Card className="overflow-hidden shadow-lg relative">
          {/* Only render map container if we're ready for it, with key for stability */}
          {mapIsReady ? (
            <div 
              ref={mapContainerRef} 
              className="map-container h-[400px] w-full"
              id={`map-container-${Date.now()}`}
            />
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full border-4 border-saboris-primary border-t-transparent animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading map...</p>
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
              <span>Find Me</span>
            </Button>
          </div>
        </Card>
      </div>
      
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)}
        featureName="customize map filters"
      />
    </section>
  );
};

export default MapSection;
