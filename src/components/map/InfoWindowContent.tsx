
import React from "react";
import { Heart, Calendar, MapPin } from "lucide-react";
import type { ExplorePlace } from "@/types/explore";

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

  // Collect all review texts and all photos
  const allPhotos = place.reviewers.flatMap((r) => r.photoUrls);
  const allTips = place.reviewers
    .map((r) => r.reviewText)
    .filter(Boolean) as string[];

  return (
    <div className="p-3 w-72 max-w-sm">
      <header className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{place.name}</h3>
          {place.category && (
            <small className="text-xs text-gray-600 mt-1 block">{place.category}</small>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          <button 
            onClick={() => onToggleSave(place.placeId)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Save place"
          >
            <Heart className="h-4 w-4 text-saboris-primary" />
          </button>
          <button 
            onClick={() => onInvite(place.placeId)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Invite friends"
          >
            <Calendar className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="text-sm mb-3 space-y-1 bg-gray-50 p-2 rounded">
        <div className="flex justify-between">
          <span>Overall:</span>
          <span className={`font-medium ${style(place.avgOverall)}`}>
            {place.avgOverall > 0 ? place.avgOverall.toFixed(1) : 'N/A'}
          </span>
        </div>
        {place.avgValue != null && (
          <div className="flex justify-between">
            <span>Value:</span>
            <span className={`font-medium ${style(place.avgValue)}`}>
              {place.avgValue.toFixed(1)}
            </span>
          </div>
        )}
        {place.avgAtmosphere != null && (
          <div className="flex justify-between">
            <span>Atmosphere:</span>
            <span className={`font-medium ${style(place.avgAtmosphere)}`}>
              {place.avgAtmosphere.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Photo Carousel */}
      {allPhotos.length > 0 && (
        <div className="mb-3">
          <div className="flex overflow-x-auto gap-1 pb-1">
            {allPhotos.slice(0, 4).map((url, idx) => (
              <img
                key={idx}
                src={url}
                className="h-16 w-16 object-cover rounded flex-shrink-0"
                alt="Review photo"
              />
            ))}
            {allPhotos.length > 4 && (
              <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-600">+{allPhotos.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Summary */}
      {allTips.length > 0 && (
        <div className="mb-3">
          <div className="font-medium text-sm mb-2 text-gray-800">Recent Reviews:</div>
          <div className="text-xs space-y-2 max-h-20 overflow-y-auto">
            {allTips.slice(0, 2).map((tip, i) => (
              <div key={i} className="italic text-gray-700 bg-white p-2 rounded border-l-2 border-saboris-primary">
                "{tip.length > 80 ? tip.substring(0, 80) + '...' : tip}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewers */}
      <div className="border-t pt-2">
        <div className="font-medium text-sm mb-1 text-gray-800">
          {place.reviewers.length} Review{place.reviewers.length !== 1 ? 's' : ''}:
        </div>
        <div className="text-xs space-y-1 max-h-16 overflow-y-auto">
          {place.reviewers.map((r) => (
            <div key={r.userId} className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{r.userName}</span>
              <span className="text-saboris-primary font-medium">
                {r.ratingOverall > 0 ? r.ratingOverall.toFixed(1) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
