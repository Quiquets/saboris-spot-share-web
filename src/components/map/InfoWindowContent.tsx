
import React from "react";
import { Heart, MapPin, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExplorePlace } from "@/types/explore";

export default function InfoWindowContent({
  place,
  onToggleSave,
  onInvite,
  onViewRestaurant,
}: {
  place: ExplorePlace;
  onToggleSave: (placeId: string) => void;
  onInvite: (placeId: string) => void;
  onViewRestaurant?: (placeId: string) => void;
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
    
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Get first photo for header
  const firstPhoto = place.reviewers.flatMap((r) => r.photoUrls)[0];
  
  // Get price info (placeholder logic)
  const priceIndicator = place.avgValue ? "€".repeat(Math.round(place.avgValue)) : "€€";

  return (
    <div className="w-72 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header with photo and actions */}
      <div className="relative">
        {firstPhoto ? (
          <div className="h-24 relative">
            <img
              src={firstPhoto}
              className="w-full h-full object-cover"
              alt={place.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-16 bg-gradient-to-r from-[#FF6B6B]/20 to-[#EE8C80]/20" />
        )}
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(place.placeId);
            }}
            className="p-1.5 bg-white/95 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-105"
            title="Save place"
          >
            <Heart className="h-3.5 w-3.5 text-[#FF6B6B] hover:fill-current transition-colors" />
          </button>
        </div>
      </div>

      <div className="p-3">
        {/* Restaurant name and basic info */}
        <div className="mb-2">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 leading-tight pr-2">{place.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {renderStars(place.avgOverall)}
              <span className="text-sm font-medium text-gray-700 ml-1">
                {place.avgOverall.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            {place.category && (
              <span className="text-gray-600">{place.category}</span>
            )}
            <span className="text-sm font-medium text-[#FF6B6B]">{priceIndicator}</span>
          </div>
        </div>

        {/* Quick stats in a compact layout */}
        {(place.avgValue || place.avgAtmosphere) && (
          <div className="bg-gray-50 rounded-lg p-2 mb-2">
            <div className="flex justify-between text-xs">
              {place.avgValue && (
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Value</span>
                  <span className="font-medium text-gray-800">{place.avgValue.toFixed(1)}</span>
                </div>
              )}
              {place.avgAtmosphere && (
                <div className="flex flex-col items-center">
                  <span className="text-gray-500">Vibe</span>
                  <span className="font-medium text-gray-800">{place.avgAtmosphere.toFixed(1)}</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-gray-500">Reviews</span>
                <span className="font-medium text-gray-800">{place.reviewers.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviewers summary */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1">
            From your network:
          </div>
          <div className="flex flex-wrap gap-1">
            {place.reviewers.slice(0, 3).map((reviewer) => (
              <span key={reviewer.userId} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#FF6B6B]/10 text-[#FF6B6B] font-medium">
                {reviewer.userName}
              </span>
            ))}
            {place.reviewers.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 font-medium">
                +{place.reviewers.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* View full page button */}
        {onViewRestaurant && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewRestaurant(place.placeId);
            }}
            className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white text-sm py-2 h-8 rounded-lg transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            View Restaurant
          </Button>
        )}
      </div>
    </div>
  );
}
