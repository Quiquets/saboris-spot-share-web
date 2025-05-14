import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import { mapStyles } from './MapStyles';
import { safeGetUserLocation, communityRecommendations, loadGoogleMapsScript } from '@/utils/mapUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/lib/colors';

interface GoogleMapViewProps {
  className?: string;
  activeFilters?: {
    people?: string;
    occasion?: string[];
    foodType?: string[];
    vibe?: string[];
    price?: string[];
    rating?: string;
  };
}

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  tags?: string[];
  photo_url?: string;
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({ className, activeFilters }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapLoadedRef = useRef<boolean>(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const userLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const googleMapsLoadedRef = useRef<boolean>(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);
  const [friendsPlaces, setFriendsPlaces] = useState<Place[]>([]);
  const [mapIsReady, setMapIsReady] = useState(false);
  const { user } = useAuth();

  // Load community places from Supabase
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        // Fetch community places
        const { data: communityData, error: communityError } = await supabase
          .from('places')
          .select('id, name, lat, lng, description, category, tags, created_by, reviews(photo_url)');
        
        if (communityError) {
          console.error("Error fetching community places:", communityError);
          return;
        }
        
        // Process community places
        const processedCommunityPlaces = communityData?.map(place => ({
          id: place.id,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          description: place.description,
          category: place.category,
          tags: place.tags,
          created_by: place.created_by,
          photo_url: place.reviews?.length > 0 ? place.reviews[0].photo_url : undefined,
          type: 'community'
        })) || [];
        
        setPlaces(processedCommunityPlaces);
        
        // If user is logged in, fetch friends' places
        if (user) {
          // Fetch user's places
          const { data: userPlacesData } = await supabase
            .from('places')
            .select('id, name, lat, lng, description, category, tags, reviews(photo_url)')
            .eq('created_by', user.id);
            
          if (userPlacesData) {
            const processedUserPlaces = userPlacesData.map(place => ({
              ...place,
              photo_url: place.reviews?.length > 0 ? place.reviews[0].photo_url : undefined,
              type: 'user'
            }));
            setUserPlaces(processedUserPlaces);
          }
          
          // Fetch friends list
          const { data: friendsData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
            
          if (friendsData && friendsData.length > 0) {
            const friendIds = friendsData.map(f => f.following_id);
            
            // Fetch friends' places
            const { data: friendsPlacesData } = await supabase
              .from('places')
              .select('id, name, lat, lng, description, category, tags, created_by, reviews(photo_url)')
              .in('created_by', friendIds);
              
            if (friendsPlacesData) {
              const processedFriendsPlaces = friendsPlacesData.map(place => ({
                ...place,
                photo_url: place.reviews?.length > 0 ? place.reviews[0].photo_url : undefined,
                type: 'friend'
              }));
              setFriendsPlaces(processedFriendsPlaces);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching places:", err);
      }
    };
    
    fetchPlaces();
  }, [user]);

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
  const createMap = useCallback((centerLocation: {lat: number, lng: number}) => {
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
      
      // Add markers to map
      addMarkersToMap();
    } catch (error) {
      console.error("Error creating map:", error);
      setIsLoadingMap(false);
    }
  }, [places]);
  
  // Add user location marker
  const addUserMarker = useCallback((position: {lat: number, lng: number}) => {
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
  }, []);
  
  // Filter places based on active filters
  const filterPlaces = useCallback(() => {
    // Determine which set of places to show based on people filter
    let filtered: any[] = [];
    
    if (!activeFilters || !activeFilters.people) {
      // Default to community if no filter
      filtered = [...places];
    } else if (activeFilters.people === 'community') {
      filtered = [...places];
    } else if (activeFilters.people === 'my-places' && user) {
      filtered = [...userPlaces];
    } else if (activeFilters.people === 'friends' && user) {
      filtered = [...friendsPlaces];
    } else if (activeFilters.people === 'friends-of-friends' && user) {
      // For simplicity, just showing friends' places for now
      // In a real app, you'd need to fetch friends-of-friends data
      filtered = [...friendsPlaces];
    } else {
      // Default to community
      filtered = [...places];
    }
    
    // Apply other filters
    if (activeFilters) {
      // Filter by occasion
      if (activeFilters.occasion && activeFilters.occasion.length > 0) {
        filtered = filtered.filter(place => 
          place.tags?.some((tag: string) => activeFilters.occasion?.includes(tag))
        );
      }
      
      // Filter by food type
      if (activeFilters.foodType && activeFilters.foodType.length > 0) {
        filtered = filtered.filter(place => 
          place.category && activeFilters.foodType?.includes(place.category.toLowerCase()) ||
          place.tags?.some((tag: string) => activeFilters.foodType?.includes(tag))
        );
      }
      
      // Filter by vibe
      if (activeFilters.vibe && activeFilters.vibe.length > 0) {
        filtered = filtered.filter(place => 
          place.tags?.some((tag: string) => activeFilters.vibe?.includes(tag))
        );
      }
      
      // Filter by price
      if (activeFilters.price && activeFilters.price.length > 0) {
        filtered = filtered.filter(place => 
          place.tags?.some((tag: string) => {
            const priceTags = ['low', 'medium', 'high', 'premium'];
            return priceTags.some(price => tag.includes(price) && activeFilters.price?.includes(price));
          })
        );
      }
    }
    
    return filtered;
  }, [places, userPlaces, friendsPlaces, activeFilters, user]);

  // Add markers to map when it's loaded
  const addMarkersToMap = useCallback(() => {
    if (!mapLoadedRef.current || !mapInstanceRef.current || !window.google?.maps) {
      console.log("Map not ready for markers");
      return;
    }
    
    try {
      // Clear any existing markers first
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Filter places based on activeFilters
      const filteredPlaces = filterPlaces();
      console.log("Displaying places:", filteredPlaces);
      
      // Add filtered places to the map
      filteredPlaces.forEach(place => {
        try {
          if (!place.lat || !place.lng) return;
          
          const marker = new window.google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map: mapInstanceRef.current,
            title: place.name,
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
          
          // Create info window with place details including photo if available
          const photoHtml = place.photo_url 
            ? `<img src="${place.photo_url}" style="width: 100%; height: 100px; object-fit: cover; margin-top: 8px; border-radius: 4px;">`
            : '';
            
          const infoContent = `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0; font-weight: bold; color: #555555;">${place.name}</h3>
              ${place.description ? `<p style="margin-top: 4px; color: #555555;">${place.description}</p>` : ''}
              ${place.category ? `<p style="margin-top: 4px; font-style: italic; color: #555555;">${place.category}</p>` : ''}
              ${place.tags && place.tags.length > 0 ? `<p style="margin-top: 4px; font-size: 12px; color: #777777;">${place.tags.join(', ')}</p>` : ''}
              ${photoHtml}
            </div>
          `;
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent
          });
          
          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        } catch (error) {
          console.error("Error creating place marker:", error);
        }
      });

      // Also add community recommendations if showing community filter
      if (!activeFilters || activeFilters.people === 'community') {
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
                  <h3 style="margin: 0; font-weight: bold; color: #555555;">${location.title}</h3>
                  <p style="margin-top: 4px; color: #555555;">${location.description}</p>
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
      }
    } catch (error) {
      console.error("Error adding markers to map:", error);
    }
  }, [filterPlaces, activeFilters]);
  
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
  }, [addUserMarker]);

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
