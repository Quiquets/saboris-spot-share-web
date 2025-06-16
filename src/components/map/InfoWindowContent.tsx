
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
    <div className="w-64 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 box-border">
      {/* Compact header with photo and actions */}
      <div className="relative">
        {firstPhoto ? (
          <div className="h-16 relative overflow-hidden">
            <img
              src={firstPhoto}
              className="w-full h-full object-cover"
              alt={place.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="h-8 bg-gradient-to-r from-saboris-primary/20 to-saboris-light/20" />
        )}
        
        {/* Action button */}
        <div className="absolute top-1 right-1">
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

      <div className="p-2">
        {/* Restaurant name and rating */}
        <div className="mb-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 leading-tight truncate flex-1 pr-1">{place.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-saboris-primary bg-saboris-primary/10 px-1.5 py-0.5 rounded-full">
                {place.avgOverall.toFixed(1)}⭐
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-0.5">
            {place.category && (
              <span className="text-gray-600 truncate flex-1 min-w-0 capitalize">{place.category}</span>
            )}
            <span className="text-xs font-bold text-saboris-primary ml-2 flex-shrink-0">{priceIndicator}</span>
          </div>
        </div>

        {/* Compact stats */}
        <div className="bg-gray-50 rounded-md p-1.5 mb-2">
          <div className="flex justify-between text-xs">
            {place.avgValue && (
              <div className="flex flex-col items-center flex-1">
                <span className="text-gray-500 text-xs leading-none">Value</span>
                <span className="font-bold text-saboris-primary text-xs">{place.avgValue.toFixed(1)}</span>
              </div>
            )}
            {place.avgAtmosphere && (
              <div className="flex flex-col items-center flex-1">
                <span className="text-gray-500 text-xs leading-none">Vibe</span>
                <span className="font-bold text-saboris-primary text-xs">{place.avgAtmosphere.toFixed(1)}</span>
              </div>
            )}
            <div className="flex flex-col items-center flex-1">
              <span className="text-gray-500 text-xs leading-none">Reviews</span>
              <span className="font-bold text-saboris-primary text-xs">{place.reviewers.length}</span>
            </div>
          </div>
        </div>

        {/* Reviewers - more compact layout */}
        <div className="mb-2">
          <div className="text-xs text-gray-600 mb-1 leading-none">
            From your network:
          </div>
          <div className="flex items-center gap-0.5 flex-wrap">
            {place.reviewers.slice(0, 6).map((reviewer) => (
              <Avatar key={reviewer.userId} className="w-4 h-4 border border-gray-200">
                <AvatarImage 
                  src={reviewer.avatarUrl || `https://avatar.vercel.sh/${reviewer.userId}.png`} 
                  alt={reviewer.userName}
                />
                <AvatarFallback className="text-xs bg-gray-100 text-xs">
                  {reviewer.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {place.reviewers.length > 6 && (
              <span className="text-xs text-gray-600 font-medium ml-1">
                +{place.reviewers.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* View button - more compact */}
        {onViewRestaurant && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewRestaurant(place.placeId);
            }}
            className="w-full bg-saboris-primary hover:bg-saboris-primary/90 text-white text-xs py-1 h-auto rounded-md transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Restaurant
          </Button>
        )}
      </div>
    </div>
  );
}
