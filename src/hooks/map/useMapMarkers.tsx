import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import InfoWindowContent from "@/components/map/InfoWindowContent";
import type { ExplorePlace } from "@/types/explore";

export function useMapMarkers(
  map: google.maps.Map | null,
  places: ExplorePlace[]
) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    // 1) clear existing markers & info window
    markersRef.current.forEach((m) => m.setMap(null));
    infoRef.current?.close();
    markersRef.current = [];

    // 2) add a marker + InfoWindow for each place
    places.forEach((place) => {
      const marker = new google.maps.Marker({
        position: place.location,
        map,
        icon: {
          url: "/icons/coral-pin.png", // Coral pink pin for community
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      // render React into a detached div
      const container = document.createElement("div");
      ReactDOM.render(
        <InfoWindowContent
          place={place}
          onToggleSave={(id) => {
            /* TODO: your save/unsave logic here */
          }}
          onInvite={(id) => {
            /* TODO: open invite dialog here */
          }}
        />,
        container
      );

      // attach it to a Google InfoWindow
      const infow = new google.maps.InfoWindow({ content: container });
      marker.addListener("click", () => {
        infoRef.current?.close();
        infow.open({ map, anchor: marker });
        infoRef.current = infow;
      });

      markersRef.current.push(marker);
    });
  }, [map, places]);
}
