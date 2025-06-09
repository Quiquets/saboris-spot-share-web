
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
        hasValidCoords: !isNaN(p.location.lat) && !isNaN(p.location.lng)
      }))
    });

    // 1) clear existing markers & info window
    markersRef.current.forEach((m) => m.setMap(null));
    infoRef.current?.close();
    
    // Clean up existing React roots
    rootsRef.current.forEach((root) => {
      root.unmount();
    });
    rootsRef.current.clear();
    
    markersRef.current = [];

    // 2) add a marker + InfoWindow for each place
    places.forEach((place, index) => {
      // Validate coordinates
      if (!place.location || isNaN(place.location.lat) || isNaN(place.location.lng)) {
        console.warn(`Invalid coordinates for place ${place.name}:`, place.location);
        return;
      }

      console.log(`Creating marker ${index + 1}/${places.length} for:`, {
        name: place.name,
        location: place.location,
        reviewers: place.reviewers.length
      });
      
      try {
        const marker = new google.maps.Marker({
          position: place.location,
          map,
          icon: {
            url: "/icons/coral-pin.png", // Coral pink pin for community
            scaledSize: new google.maps.Size(32, 32),
          },
          title: place.name, // Add title for better accessibility
          optimized: false, // Force rendering for debugging
        });

        console.log(`Marker created successfully for ${place.name} at`, place.location);

        // render React into a detached div using createRoot
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
          />
        );

        // Store the root for cleanup
        rootsRef.current.set(place.placeId, root);

        // attach it to a Google InfoWindow
        const infow = new google.maps.InfoWindow({ content: container });
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
