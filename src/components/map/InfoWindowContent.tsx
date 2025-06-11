
import React from "react";
import { Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  // Get first photo for header
  const firstPhoto = place.reviewers.flatMap((r) => r.photoUrls)[0];
  
  // Get price info (placeholder logic)
  const priceIndicator = place.avgValue ? "€".repeat(Math.round(place.avgValue)) : "€€";

  return (
    <div className="w-72 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 box-border">
      {/* Header with photo and actions */}
      <div className="relative">
        {firstPhoto ? (
          <div className="h-20 relative overflow-hidden">
            <img
              src={firstPhoto}
              className="w-full h-full object-cover"
              alt={place.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-12 bg-gradient-to-r from-saboris-primary/20 to-saboris-light/20" />
        )}
        
        {/* Action buttons */}
        <div className="absolute top-1.5 right-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(place.placeId);
            }}
            className="p-1 bg-white/95 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-105"
            title="Save place"
          >
            <Heart className="h-3 w-3 text-saboris-primary hover:fill-current transition-colors" />
          </button>
        </div>
      </div>

      <div className="p-3">
        {/* Restaurant name and basic info */}
        <div className="mb-2">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight pr-2 flex-1 min-w-0 truncate">{place.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-saboris-primary">
                {place.avgOverall.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            {place.category && (
              <span className="text-gray-600 truncate flex-1 min-w-0">{place.category}</span>
            )}
            <span className="text-xs font-medium text-saboris-primary ml-2 flex-shrink-0">{priceIndicator}</span>
          </div>
        </div>

        {/* Quick stats in a compact layout */}
        {(place.avgValue || place.avgAtmosphere) && (
          <div className="bg-gray-50 rounded-md p-2 mb-2">
            <div className="flex justify-between text-xs">
              {place.avgValue && (
                <div className="flex flex-col items-center flex-1">
                  <span className="text-gray-500 text-xs">Value</span>
                  <span className="font-bold text-saboris-primary text-xs">{place.avgValue.toFixed(1)}</span>
                </div>
              )}
              {place.avgAtmosphere && (
                <div className="flex flex-col items-center flex-1">
                  <span className="text-gray-500 text-xs">Vibe</span>
                  <span className="font-bold text-saboris-primary text-xs">{place.avgAtmosphere.toFixed(1)}</span>
                </div>
              )}
              <div className="flex flex-col items-center flex-1">
                <span className="text-gray-500 text-xs">Reviews</span>
                <span className="font-bold text-saboris-primary text-xs">{place.reviewers.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviewers with small profile pictures */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1">
            From your network:
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {place.reviewers.slice(0, 4).map((reviewer) => (
              <Avatar key={reviewer.userId} className="w-5 h-5 border border-gray-200">
                <AvatarImage 
                  src={reviewer.avatarUrl || `https://avatar.vercel.sh/${reviewer.userId}.png`} 
                  alt={reviewer.userName}
                />
                <AvatarFallback className="text-xs bg-gray-100">
                  {reviewer.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {place.reviewers.length > 4 && (
              <span className="text-xs text-gray-600 font-medium ml-1">
                +{place.reviewers.length - 4}
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
            className="w-full bg-saboris-primary hover:bg-saboris-primary/90 text-white text-xs py-1.5 h-auto rounded-md transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Restaurant
          </Button>
        )}
      </div>
    </div>
  );
}
