
import React from "react";
import { Heart, Calendar, MapPin, Star } from "lucide-react";
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
  // Render stars for ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-60" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }
    
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  // Collect all review texts and photos
  const allPhotos = place.reviewers.flatMap((r) => r.photoUrls);
  const allTips = place.reviewers
    .map((r) => r.reviewText)
    .filter(Boolean) as string[];

  // Get price info from reviews (this would need to be added to the data structure)
  const priceIndicator = place.avgValue ? "€".repeat(Math.round(place.avgValue)) : "€€";

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with main photo if available */}
      {allPhotos.length > 0 && (
        <div className="h-32 relative">
          <img
            src={allPhotos[0]}
            className="w-full h-full object-cover"
            alt={place.name}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button 
              onClick={() => onToggleSave(place.placeId)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
              title="Save place"
            >
              <Heart className="h-4 w-4 text-[#FF6B6B]" />
            </button>
            <button 
              onClick={() => onInvite(place.placeId)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
              title="Invite friends"
            >
              <Calendar className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Restaurant name and category */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{place.name}</h3>
          <div className="flex items-center justify-between">
            {place.category && (
              <span className="text-sm text-gray-600">{place.category}</span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#FF6B6B]">{priceIndicator}</span>
              <div className="flex items-center gap-1">
                {renderStars(place.avgOverall)}
                <span className="text-sm font-medium text-gray-700 ml-1">
                  {place.avgOverall.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo carousel if multiple photos */}
        {allPhotos.length > 1 && (
          <div className="mb-3">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {allPhotos.slice(1, 4).map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  className="h-16 w-16 object-cover rounded flex-shrink-0"
                  alt="Review photo"
                />
              ))}
              {allPhotos.length > 4 && (
                <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-600 font-medium">+{allPhotos.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {place.avgValue && (
              <div className="flex justify-between">
                <span className="text-gray-600">Value:</span>
                <span className="font-medium">{place.avgValue.toFixed(1)}/5</span>
              </div>
            )}
            {place.avgAtmosphere && (
              <div className="flex justify-between">
                <span className="text-gray-600">Vibe:</span>
                <span className="font-medium">{place.avgAtmosphere.toFixed(1)}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews summary */}
        {allTips.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-800 mb-2">
              What {place.reviewers.length === 1 ? 'your friend' : 'your friends'} said:
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {allTips.slice(0, 2).map((tip, i) => (
                <div key={i} className="text-xs italic text-gray-700 bg-white p-2 rounded border-l-2 border-[#FF6B6B]">
                  "{tip.length > 60 ? tip.substring(0, 60) + '...' : tip}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewers list */}
        <div className="border-t pt-3">
          <div className="text-sm font-medium text-gray-800 mb-2">
            {place.reviewers.length} Review{place.reviewers.length !== 1 ? 's' : ''} from your network
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {place.reviewers.map((reviewer) => (
              <div key={reviewer.userId} className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-700">{reviewer.userName}</span>
                <div className="flex items-center gap-1">
                  {renderStars(reviewer.ratingOverall)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
