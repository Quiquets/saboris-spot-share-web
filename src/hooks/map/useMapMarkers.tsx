
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import InfoWindowContent from "@/components/map/InfoWindowContent";
import type { ExplorePlace } from "@/types/explore";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";

export function useMapMarkers(
  map: google.maps.Map | null,
  places: ExplorePlace[],
  user?: { id: string } | null,
  setShowAuthModal?: (show: boolean) => void
) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const rootsRef = useRef<Map<string, ReactDOM.Root>>(new Map());

  const handleToggleSave = async (placeId: string) => {
    if (!user) {
      toast.info("Please sign in to save places");
      setShowAuthModal?.(true);
      return;
    }

    try {
      // For now, we'll always save (not toggle) since we don't have saved state tracking
      // In a full implementation, you'd check if already saved and toggle accordingly
      await supabaseService.saveRestaurant(user.id, placeId);
    } catch (error) {
      console.error('Error saving place:', error);
      toast.error("Failed to save place");
    }
  };

  const handleInvite = (placeId: string) => {
    if (!user) {
      toast.info("Please sign in to invite friends");
      setShowAuthModal?.(true);
      return;
    }
    
    console.log('Invite for place:', placeId);
    toast.info("Invite feature coming soon!");
  };

  const handleViewRestaurant = (placeId: string) => {
    console.log('View restaurant for place:', placeId);
    // Fix 404 by using correct routing path
    window.location.href = `/places/${placeId}`;
  };

  useEffect(() => {
    if (!map) {
      console.log('useMapMarkers: No map instance available');
      return;
    }

    console.log('useMapMarkers: Setting up markers for places:', {
      count: places.length,
      places: places.map(p => ({ 
        name: p.name, 
        location: p.location,
        hasValidCoords: !isNaN(p.location.lat) && !isNaN(p.location.lng),
        avgRating: p.avgOverall
      }))
    });

    // Clear existing markers & info window
    markersRef.current.forEach((m) => m.setMap(null));
    infoRef.current?.close();
    
    // Clean up existing React roots
    rootsRef.current.forEach((root) => {
      root.unmount();
    });
    rootsRef.current.clear();
    
    markersRef.current = [];

    // Add a marker + InfoWindow for each place
    places.forEach((place, index) => {
      // Validate coordinates
      if (!place.location || isNaN(place.location.lat) || isNaN(place.location.lng)) {
        console.warn(`Invalid coordinates for place ${place.name}:`, place.location);
        return;
      }

      console.log(`Creating marker ${index + 1}/${places.length} for:`, {
        name: place.name,
        location: place.location,
        reviewers: place.reviewers.length,
        avgRating: place.avgOverall
      });
      
      try {
        // Create aesthetic coral pink marker with bold rating text
        const rating = place.avgOverall.toFixed(1);
        const marker = new google.maps.Marker({
          position: place.location,
          map,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
                <!-- Drop shadow -->
                <ellipse cx="22" cy="45" rx="6" ry="3" fill="rgba(0,0,0,0.15)"/>
                
                <!-- Main coral pink pin with gradient -->
                <defs>
                  <linearGradient id="coralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#F5A299;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#EE8C80;stop-opacity:1" />
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
                  </filter>
                </defs>
                
                <!-- Pin shape with aesthetic rounded design -->
                <path d="M20 2C29.941 2 38 9.373 38 18.5C38 28.5 20 44 20 44S2 28.5 2 18.5C2 9.373 10.059 2 20 2Z" 
                      fill="url(#coralGradient)" 
                      stroke="#ffffff" 
                      stroke-width="2.5"
                      filter="url(#shadow)"/>
                
                <!-- White circle for rating with subtle shadow -->
                <circle cx="20" cy="18.5" r="11" fill="#ffffff" stroke="rgba(238,140,128,0.2)" stroke-width="1"/>
                
                <!-- Bold rating text in coral -->
                <text x="20" y="23.5" text-anchor="middle" 
                      font-family="system-ui, -apple-system, sans-serif" 
                      font-size="10" 
                      font-weight="900" 
                      fill="#EE8C80">${rating}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 48),
            anchor: new google.maps.Point(20, 48),
          },
          title: `${place.name} - ${rating}⭐`,
          optimized: false,
          zIndex: 1000,
        });

        console.log(`Marker created successfully for ${place.name} at`, place.location);

        // Render React into a detached div using createRoot
        const container = document.createElement("div");
        const root = ReactDOM.createRoot(container);
        
        root.render(
          <InfoWindowContent
            place={place}
            onToggleSave={handleToggleSave}
            onInvite={handleInvite}
            onViewRestaurant={handleViewRestaurant}
          />
        );

        // Store the root for cleanup
        rootsRef.current.set(place.placeId, root);

        // Attach it to a Google InfoWindow with compact, fixed dimensions
        const infow = new google.maps.InfoWindow({ 
          content: container,
          maxWidth: 264, // Fixed width to match our component (256px + padding)
          disableAutoPan: false
        });
        
        marker.addListener("click", () => {
          console.log('Marker clicked for place:', place.name);
          infoRef.current?.close();
          infow.open({ map, anchor: marker });
          infoRef.current = infow;
        });

        markersRef.current.push(marker);
        
      } catch (error) {
        console.error(`Error creating marker for ${place.name}:`, error);
      }
    });

    console.log(`useMapMarkers: Successfully created ${markersRef.current.length} markers out of ${places.length} places`);

    // Force map refresh if markers were added
    if (markersRef.current.length > 0 && places.length > 0) {
      // Fit map to show all markers
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      
      // Only fit bounds if we have valid bounds
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        // Ensure zoom doesn't get too close
        const listener = google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, places, user, setShowAuthModal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      rootsRef.current.forEach((root) => {
        root.unmount();
      });
      rootsRef.current.clear();
    };
  }, []);
}
