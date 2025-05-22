// src/components/map/InfoWindowContent.tsx
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
  // Determine highest score for styling
  const maxScore = Math.max(
    place.avgOverall,
    place.avgValue ?? 0,
    place.avgAtmosphere ?? 0
  );
  const style = (val?: number) =>
    val === maxScore ? "font-bold text-saboris-primary" : "";

  // Collect all review photos and tips
  const allPhotos = place.reviewers.flatMap(r => r.photoUrls).filter(Boolean);
  const allTips = place.reviewers
    .map(r => (r as any).reviewText)
    .filter((t): t is string => Boolean(t));

  // Directions handler
  const handleDirectionsClick = () => {
    const { lat, lng } = place.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-2 w-72">
      <header className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold truncate">{place.name}</h3>
          {place.category && (
            <small className="text-xs text-gray-600">{place.category}</small>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleSave(place.placeId)}
          >
            <Heart className="text-saboris-primary h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onInvite(place.placeId)}
          >
            <Calendar className="text-gray-600 h-4 w-4" />
            <span className="sr-only">Invite</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDirectionsClick}
          >
            <Navigation className="text-blue-500 h-4 w-4" />
            <span className="sr-only">Directions</span>
          </Button>
        </div>
      </header>

      {/* Photo carousel */}
      {allPhotos.length > 0 ? (
        <Carousel className="w-full mb-2" opts={{ loop: allPhotos.length > 1 }}>
          <CarouselContent>
            {allPhotos.map((url, i) => (
              <CarouselItem key={i}>
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <img
                    src={url}
                    alt={`Place image ${i + 1}`}
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

      {/* Average scores */}
      <div className="text-sm mb-2 space-y-1">
        <div>
          Overall: <span className={style(place.avgOverall)}>{place.avgOverall.toFixed(1)}</span>
        </div>
        {place.avgValue != null && (
          <div>
            Value: <span className={style(place.avgValue)}>{place.avgValue.toFixed(1)}</span>
          </div>
        )}
        {place.avgAtmosphere != null && (
          <div>
            Atmosphere: <span className={style(place.avgAtmosphere)}>{place.avgAtmosphere.toFixed(1)}</span>
          </div>
        )}
      </div>

      <hr className="my-1.5" />

      {/* Tips & Reviews if any */}
      {allTips.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Tips & Reviews:</div>
          <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
            {allTips.map((tip, i) => (
              <li key={i} className="italic text-gray-700 truncate">
                “{tip}”
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reviewer list */}
      <div>
        <div className="text-xs font-medium text-gray-700 mb-1">Reviewed by:</div>
        <ul className="text-xs space-y-0.5 max-h-24 overflow-y-auto">
          {place.reviewers.length > 0 ? (
            place.reviewers.map(r => (
              <li key={r.userId} className="flex justify-between items-center">
                <span className="font-medium truncate pr-1">{r.userName}</span>
                <span className="text-gray-600 whitespace-nowrap">{r.ratingOverall.toFixed(1)} ★</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No reviews yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
