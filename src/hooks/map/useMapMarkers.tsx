
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client"; // Import createRoot
import InfoWindowContent from "@/components/map/InfoWindowContent";
import type { ExplorePlace } from "@/types/explore";

export function useMapMarkers(
  map: google.maps.Map | null,
  places: ExplorePlace[]
) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRootsRef = useRef<Map<google.maps.Marker, ReturnType<typeof createRoot>>>(new Map());
  const infoRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    console.log("useMapMarkers: map instance:", map);
    console.log("useMapMarkers: received places:", places);

    if (!map) {
      console.log("useMapMarkers: map is null, skipping marker creation.");
      return;
    }

    // 1) clear existing markers & info window
    markersRef.current.forEach((m) => m.setMap(null));
    infoWindowRootsRef.current.forEach(root => root.unmount()); // Unmount React roots
    infoWindowRootsRef.current.clear();
    infoRef.current?.close();
    markersRef.current = [];

    if (!places || places.length === 0) {
      console.log("useMapMarkers: No places to show.");
      return;
    }
    
    console.log(`useMapMarkers: Attempting to create ${places.length} markers.`);

    // 2) add a marker + InfoWindow for each place
    places.forEach((place) => {
      if (!place.location || typeof place.location.lat !== 'number' || typeof place.location.lng !== 'number') {
        console.warn("useMapMarkers: Invalid location for place:", place.name, place.location);
        return; // Skip this place if location is invalid
      }

      const marker = new google.maps.Marker({
        position: place.location,
        map,
        icon: {
          url: "/icons/coral-pin.png", // Ensure this icon exists in public/icons/
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const container = document.createElement("div");
      const root = createRoot(container); // Create a root
      root.render(
        <InfoWindowContent
          place={place}
          onToggleSave={(id) => {
            console.log("Save toggled for place ID:", id);
            /* TODO: your save/unsave logic here */
          }}
          onInvite={(id) => {
            console.log("Invite for place ID:", id);
            /* TODO: open invite dialog here */
          }}
        />
      );
      infoWindowRootsRef.current.set(marker, root); // Store root for unmounting

      const infow = new google.maps.InfoWindow({ content: container });
      marker.addListener("click", () => {
        infoRef.current?.close();
        infow.open({ map, anchor: marker });
        infoRef.current = infow;
      });

      markersRef.current.push(marker);
    });
    console.log("useMapMarkers: Finished creating markers. Total markers:", markersRef.current.length);
  }, [map, places]);
}

