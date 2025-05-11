/// <reference types="@types/google.maps" />

import { useEffect, useRef, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  loadGoogleMapsScript, 
  safeGetUserLocation, 
  communityRecommendations
} from '@/utils/mapUtils';
import { MapPin, Target, Filter, ArrowDown, ArrowUp, Sliders } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    { id: 'mexican', label: 'Mexican 🌮' },
    { id: 'thai', label: 'Thai 🍜' },
    { id: 'chinese', label: 'Chinese 🥡' },
    { id: 'breakfast', label: 'Breakfast 🥞' },
    { id: 'seafood', label: 'Seafood 🦞' },
    { id: 'pizza', label: 'Pizza 🍕' },
    { id: 'bbq', label: 'BBQ 🍖' },
    { id: 'vegan', label: 'Vegan 🥬' },
    { id: 'vegetarian', label: 'Vegetarian 🥕' },
    { id: 'mediterranean', label: 'Mediterranean 🫒' },
    { id: 'greek', label: 'Greek 🥙' },
    { id: 'french', label: 'French 🥐' },
    { id: 'korean', label: 'Korean 🍲' },
    { id: 'japanese', label: 'Japanese 🍱' },
    { id: 'vietnamese', label: 'Vietnamese 🍜' },
    { id: 'tapas', label: 'Tapas 🧆' },
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
    { id: 'trendy', label: 'Trendy' },
    { id: 'cozy', label: 'Cozy' },
    { id: 'quiet', label: 'Quiet' },
    { id: 'live-music', label: 'Live Music' },
    { id: 'pet-friendly', label: 'Pet Friendly' },
    { id: 'instagrammable', label: 'Instagrammable' },
    { id: 'view', label: 'Great View' },
    { id: 'historic', label: 'Historic' },
    { id: 'hidden-gem', label: 'Hidden Gem' },
    { id: 'rooftop', label: 'Rooftop' },
    { id: 'speakeasy', label: 'Speakeasy' },
    { id: 'sports-bar', label: 'Sports Bar' },
    { id: 'late-night', label: 'Late Night' },
    { id: 'brunch', label: 'Brunch' },
    { id: 'work-friendly', label: 'Work Friendly' },
    { id: 'date-night', label: 'Date Night' },
  ],
  price: [
    { id: 'low', label: '€' },
    { id: 'medium', label: '€€' },
    { id: 'high', label: '€€€' },
    { id: 'premium', label: '€€€€' },
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
  const googleMapsLoadedRef = useRef<boolean>(false);
  const { user } = useAuth();
  
  const [activeFilters, setActiveFilters] = useState<{
    people: string;
    foodType: string[];
    vibe: string[];
    price: string[];
    rating: number;
    foodSortDirection: "asc" | "desc";
    serviceSortDirection: "asc" | "desc";
    atmosphereSortDirection: "asc" | "desc";
    valueSortDirection: "asc" | "desc";
  }>({
    people: user ? 'friends' : 'community',
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "desc", // Default: high to low
    serviceSortDirection: "desc", // Default: high to low
    atmosphereSortDirection: "desc", // Default: high to low
    valueSortDirection: "desc", // Default: high to low
  });
  
  const [showGateModal, setShowGateModal] = useState(false);
  const [mapIsReady, setMapIsReady] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  useEffect(() => {
    // Update people filter based on authentication state
    setActiveFilters(prev => ({
      ...prev,
      people: user ? 'friends' : 'community'
    }));
  }, [user]);
  
  // Load Google Maps script first
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
  
  // Auto-center map on user's location when loaded
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
  
  // Handle filter change
  const handleFilterChange = (type: string, value: string | string[] | { direction: "asc" | "desc", category: string }) => {
    if (typeof value === 'object' && 'direction' in value) {
      // Handle sort direction change for rating categories
      const { direction, category } = value;
      setActiveFilters(prev => ({
        ...prev,
        [`${category}SortDirection`]: direction
      }));
    } else {
      // Handle other filter changes
      setActiveFilters(prev => ({
        ...prev,
        [type]: value
      }));
    }
    
    // In a real app, we would refresh the map data based on filters here
    toast.success("Filters applied. Map data would be refreshed based on your filters.");
  };
  
  const toggleSortDirection = (category: string) => {
    const directionKey = `${category}SortDirection` as keyof typeof activeFilters;
    const currentDirection = activeFilters[directionKey];
    const newDirection = currentDirection === "desc" ? "asc" : "desc";
    
    handleFilterChange(category, { direction: newDirection, category });
  };
  
  return (
    <section id="map-section" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-8 gap-2">
          <MapPin className="text-saboris-primary h-6 w-6" />
          <h2 className="text-3xl font-bold text-center text-saboris-gray">Explore</h2>
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

          <div className="grid grid-cols-4 gap-2 mb-4 w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4 text-saboris-primary" /> Food Type
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
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
                <div className="flex flex-col gap-2">
                  {filterOptions.price.map(option => (
                    <Button 
                      key={option.id}
                      variant={activeFilters.price.includes(option.id) ? "default" : "outline"}
                      className="w-full justify-start"
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

            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 font-bold"
            >
              <Sliders className="h-4 w-4 text-saboris-primary" /> 
              More Filters
            </Button>
          </div>
          
          {/* Active filter badges */}
          {(activeFilters.foodType.length > 0 || activeFilters.vibe.length > 0 || activeFilters.price.length > 0) && (
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
        
        {/* Map container with stable ID */}
        <Card className="overflow-hidden shadow-lg relative">
          {/* Map container with explicit height */}
          <div 
            ref={mapContainerRef} 
            className="h-[400px] w-full"
            style={{ display: isLoadingMap ? 'none' : 'block' }}
          />
          
          {/* Loading state */}
          {isLoadingMap && (
            <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
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
