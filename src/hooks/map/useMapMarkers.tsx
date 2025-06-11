
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import InfoWindowContent from "@/components/map/InfoWindowContent";
import type { ExplorePlace } from "@/types/explore";

export function useMapMarkers(
  map: google.maps.Map | null,
  places: ExplorePlace[]
) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const rootsRef = useRef<Map<string, ReactDOM.Root>>(new Map());

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
        // Create coral pink marker with rating display using correct color #EE8C80
        const rating = place.avgOverall.toFixed(1);
        const marker = new google.maps.Marker({
          position: place.location,
          map,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="28" height="35" viewBox="0 0 28 35" xmlns="http://www.w3.org/2000/svg">
                <!-- Coral pink pin shape with correct color -->
                <path d="M14 0C21.5 0 28 6.27 28 14C28 21.73 14 35 14 35S0 21.73 0 14C0 6.27 6.5 0 14 0Z" fill="#EE8C80"/>
                <path d="M14 0C21.5 0 28 6.27 28 14C28 21.73 14 35 14 35S0 21.73 0 14C0 6.27 6.5 0 14 0Z" stroke="#ffffff" stroke-width="2"/>
                <!-- White circle for rating -->
                <circle cx="14" cy="13" r="8.5" fill="#ffffff"/>
                <!-- Rating text in coral -->
                <text x="14" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#EE8C80">${rating}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(28, 35),
            anchor: new google.maps.Point(14, 35),
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
            onToggleSave={(id) => {
              console.log('Toggle save for place:', id);
              /* TODO: your save/unsave logic here */
            }}
            onInvite={(id) => {
              console.log('Invite for place:', id);
              /* TODO: open invite dialog here */
            }}
            onViewRestaurant={(id) => {
              console.log('View restaurant for place:', id);
              // Fix 404 by using correct routing path
              window.location.href = `/places/${id}`;
            }}
          />
        );

        // Store the root for cleanup
        rootsRef.current.set(place.placeId, root);

        // Attach it to a Google InfoWindow with fixed width
        const infow = new google.maps.InfoWindow({ 
          content: container,
          maxWidth: 280,
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
  }, [map, places]);

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
