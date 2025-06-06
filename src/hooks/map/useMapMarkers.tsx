
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
    if (!map) return;

    console.log('Setting up markers for places:', places);

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
    places.forEach((place) => {
      console.log('Creating marker for place:', place.name, 'at location:', place.location);
      
      const marker = new google.maps.Marker({
        position: place.location,
        map,
        icon: {
          url: "/icons/coral-pin.png", // Coral pink pin for community
          scaledSize: new google.maps.Size(32, 32),
        },
        title: place.name, // Add title for better accessibility
      });

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
    });

    console.log(`Created ${markersRef.current.length} markers`);
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
