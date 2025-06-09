
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
        // Create smaller coral pink marker with rating display
        const rating = place.avgOverall.toFixed(1);
        const marker = new google.maps.Marker({
          position: place.location,
          map,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                <!-- Pin shape with coral pink color -->
                <path d="M16 0C24.8 0 32 7.2 32 16C32 24.8 16 40 16 40S0 24.8 0 16C0 7.2 7.2 0 16 0Z" fill="#FF6B6B"/>
                <path d="M16 0C24.8 0 32 7.2 32 16C32 24.8 16 40 16 40S0 24.8 0 16C0 7.2 7.2 0 16 0Z" stroke="#fff" stroke-width="1.5"/>
                <!-- White circle for rating -->
                <circle cx="16" cy="15" r="10" fill="#fff"/>
                <!-- Rating text -->
                <text x="16" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#FF6B6B">${rating}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40),
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
              // Navigate to restaurant page
              window.location.href = `/restaurant/${id}`;
            }}
          />
        );

        // Store the root for cleanup
        rootsRef.current.set(place.placeId, root);

        // Attach it to a Google InfoWindow
        const infow = new google.maps.InfoWindow({ 
          content: container,
          maxWidth: 280
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
