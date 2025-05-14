
import { useCallback, useRef } from 'react';
import { communityRecommendations } from '@/utils/mapUtils';

export const useMapMarkers = (
  mapInstance: google.maps.Map | null,
  mapIsReady: boolean
) => {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  // Add user location marker
  const addUserMarker = useCallback((position: {lat: number, lng: number}) => {
    if (!mapInstance || !window.google?.maps) return;
    
    try {
      // Remove previous user marker if exists
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      
      // Create user marker
      const userMarker = new window.google.maps.Marker({
        position: position,
        map: mapInstance,
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
  }, [mapInstance]);

  // Filter places based on active filters
  const filterPlaces = useCallback((
    places: any[], 
    userPlaces: any[], 
    friendsPlaces: any[], 
    activeFilters?: {
      people?: string;
      occasion?: string[];
      foodType?: string[];
      vibe?: string[];
      price?: string[];
      rating?: string;
    }
  ) => {
    // Determine which set of places to show based on people filter
    let filtered: any[] = [];
    
    if (!activeFilters || !activeFilters.people) {
      // Default to community if no filter
      filtered = [...places];
    } else if (activeFilters.people === 'community') {
      filtered = [...places];
    } else if (activeFilters.people === 'my-places') {
      filtered = [...userPlaces];
    } else if (activeFilters.people === 'friends' || activeFilters.people === 'friends-of-friends') {
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
  }, []);

  // Add markers to map
  const addMarkersToMap = useCallback((
    places: any[],
    userPlaces: any[],
    friendsPlaces: any[],
    activeFilters?: {
      people?: string;
      occasion?: string[];
      foodType?: string[];
      vibe?: string[];
      price?: string[];
      rating?: string;
    }
  ) => {
    if (!mapIsReady || !mapInstance || !window.google?.maps) {
      return;
    }
    
    try {
      // Clear any existing markers first
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Filter places based on activeFilters
      const filteredPlaces = filterPlaces(places, userPlaces, friendsPlaces, activeFilters);
      
      // Add filtered places to the map
      filteredPlaces.forEach(place => {
        try {
          if (!place.lat || !place.lng) return;
          
          const marker = new window.google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map: mapInstance,
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
            infoWindow.open(mapInstance, marker);
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
              map: mapInstance,
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
                infoWindow.open(mapInstance, marker);
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
  }, [mapInstance, mapIsReady, filterPlaces]);

  return {
    addUserMarker,
    addMarkersToMap
  };
};
