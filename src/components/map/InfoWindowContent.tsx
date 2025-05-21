
import React from "react";
import { Heart, Calendar, Navigation, ImageIcon } from "lucide-react";
import type { ExplorePlace } from "@/types/explore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function InfoWindowContent({
  place,
  onToggleSave,
  onInvite,
}: {
  place: ExplorePlace;
  onToggleSave: (placeId: string) => void;
  onInvite: (placeId: string) => void;
}) {
  const maxScore = Math.max(
    place.avgOverall,
    place.avgValue ?? 0,
    place.avgAtmosphere ?? 0
  );
  const style = (val?: number) =>
    val === maxScore ? "font-bold text-saboris-primary" : "";

  const allPhotos = place.reviewers.flatMap(r => r.photoUrls).filter(url => url); // Filter out any null/empty URLs

  const handleDirectionsClick = () => {
    if (place.location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="p-2 w-72"> {/* Increased width for better layout */}
      <header className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">{place.name}</h3>
          {place.category && (
            <small className="text-xs text-gray-600">{place.category}</small>
          )}
        </div>
        <div className="flex gap-1.5"> {/* Adjusted gap */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleSave(place.placeId)}>
            <Heart className="text-saboris-primary h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onInvite(place.placeId)}>
            <Calendar className="text-gray-600 h-4 w-4" />
            <span className="sr-only">Invite</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDirectionsClick}>
            <Navigation className="text-blue-500 h-4 w-4" />
            <span className="sr-only">Directions</span>
          </Button>
        </div>
      </header>

      {allPhotos.length > 0 ? (
        <Carousel className="w-full mb-2" opts={{ loop: allPhotos.length > 1 }}>
          <CarouselContent>
            {allPhotos.map((url, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <img
                    src={url}
                    alt={`Place image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {allPhotos.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" />
            </>
          )}
        </Carousel>
      ) : (
        <div className="aspect-video w-full mb-2 bg-gray-100 rounded flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}

      <div className="text-sm mb-2 space-y-0.5"> {/* Reduced space-y */}
        <div>
          Overall:{" "}
          <span className={style(place.avgOverall)}>
            {place.avgOverall.toFixed(1)}
          </span>
        </div>
        {place.avgValue != null && (
          <div>
            Value:{" "}
            <span className={style(place.avgValue)}>
              {place.avgValue.toFixed(1)}
            </span>
          </div>
        )}
        {place.avgAtmosphere != null && (
          <div>
            Atmosphere:{" "}
            <span className={style(place.avgAtmosphere)}>
              {place.avgAtmosphere.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <hr className="my-1.5" /> {/* Adjusted margin */}

      <h4 className="text-xs font-medium text-gray-700 mb-1">Reviewed by:</h4>
      <ul className="text-xs space-y-0.5 max-h-24 overflow-y-auto"> {/* Adjusted max-h and space-y */}
        {place.reviewers.map((r) => (
          <li key={r.userId} className="flex justify-between items-center">
            <span className="font-medium truncate pr-1">{r.userName}</span>
            <span className="text-gray-600 whitespace-nowrap">
              {r.ratingOverall.toFixed(1)} ★
            </span>
          </li>
        ))}
        {place.reviewers.length === 0 && (
            <li className="text-gray-500">No reviews yet.</li>
        )}
      </ul>
    </div>
  );
}
