// src/components/profile/SharedPlaces.tsx
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  Loader2,
  MapPin,
  PlusCircle,
  Image as ImageIcon,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SharedPlaceStar } from "./profile-components/SharedPlaceStar";
import type { SharedPlace } from "@/types/profile";
import { supabaseService } from "@/services/supabaseService";

type FilterType = "all" | "ratings" | "newest" | "oldest";

interface SharedPlacesProps {
  loading: boolean;
  sharedPlaces: SharedPlace[];
  openReviewDialog: (place: SharedPlace) => void;
  refreshPlaces: () => Promise<void>;
  isOwnProfile: boolean;
}

export default function SharedPlaces({
  loading,
  sharedPlaces,
  openReviewDialog,
  refreshPlaces,
  isOwnProfile,
}: SharedPlacesProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");

  const handleDelete = async (
    placeId: string,
    photoUrls: string[]
  ) => {
    if (!isOwnProfile || !user) {
      toast.error("You can only delete places from your own profile.");
      return;
    }
    try {
      setDeletingId(placeId);
      await supabase.from("reviews").delete().eq("place_id", placeId).eq("user_id", user.id);
      await supabase.from("places").delete().eq("id", placeId).eq("created_by", user.id);
      await supabaseService.unsaveRestaurant(user.id, placeId);
      toast.success("Place removed from your profile");
      await refreshPlaces();
    } catch (err: any) {
      console.error("Error deleting place/review:", err);
      toast.error(err.message || "Failed to remove place/review");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-saboris-primary" />
        <p>Loading shared places.</p>
      </div>
    );
  }

  if (sharedPlaces.length === 0 && isOwnProfile) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-3" />
        <h3 className="text-xl font-medium mb-2 text-gray-700">
          No shared places yet
        </h3>
        <p className="text-gray-600 mb-4">
          Start adding your favorite places to share
        </p>
        <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
          <Link to="/add">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add a New Place
          </Link>
        </Button>
      </div>
    );
  }

  if (sharedPlaces.length === 0 && !isOwnProfile) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-3" />
        <h3 className="text-xl font-medium mb-2 text-gray-700">
          This user hasn't shared any places yet.
        </h3>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-700">{isOwnProfile ? "Your Shared Places" : "Shared Places"}</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setFilterOpen(true)}
        >
          <Filter className="h-4 w-4" /> Filter
        </Button>
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sort Places</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <div className="font-medium">Order by</div>
              <div className="grid grid-cols-2 gap-2">
                {(["all","ratings","newest","oldest"] as FilterType[]).map(f => (
                  <Button
                    key={f}
                    variant={currentFilter === f ? "default" : "outline"}
                    onClick={() => {
                      setCurrentFilter(f);
                      setFilterOpen(false);
                    }}
                  >
                    {f === "all" ? "All"
                      : f === "ratings" ? "Highest Rated"
                      : f === "newest" ? "Newest First"
                      : "Oldest First"}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedPlaces.map(place => (
          <SharedPlaceCard
            key={place.id}
            place={place}
            isMobile={isMobile}
            deletingId={deletingId}
            openReviewDialog={openReviewDialog}
            handleDelete={handleDelete}
            isOwnProfile={isOwnProfile}
            currentUser={user}
          />
        ))}
      </div>
    </>
  );
}

interface CardProps {
  place: SharedPlace;
  isMobile: boolean;
  deletingId: string | null;
  openReviewDialog: (p: SharedPlace) => void;
  handleDelete: (placeId: string, photoUrls: string[]) => void;
  isOwnProfile: boolean;
  currentUser: any;
}

function SharedPlaceCard({
  place,
  isMobile,
  deletingId,
  openReviewDialog,
  handleDelete,
  isOwnProfile,
  currentUser,
}: CardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePlace = async () => {
    if (!currentUser) {
      toast.error("You need to be logged in to save places.");
      return;
    }
    try {
      await supabaseService.saveRestaurant(currentUser.id, place.place_id);
      setIsSaved(true);
      toast.success(`${place.place.name} saved!`);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    }
  };

  const images = place.photo_urls.length
    ? place.photo_urls
    : [`https://source.unsplash.com/random/400x300?food&${encodeURIComponent(place.place.name)}`];

  const cardActionTarget = isOwnProfile ? () => openReviewDialog(place) : () => { /* View details? Or no action */ };

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {isOwnProfile && (
        <div className="absolute top-2 right-2 z-10">
          <button onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}>
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg" onClick={e => e.stopPropagation()}>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false);
                  openReviewDialog(place);
                }}
              >
                Edit
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                disabled={deletingId === place.place_id}
                onClick={() => {
                  setMenuOpen(false);
                  handleDelete(place.place_id, place.photo_urls);
                }}
              >
                {deletingId === place.place_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}
      {!isOwnProfile && currentUser && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleSavePlace();
            }}
            className="text-saboris-primary hover:text-saboris-primary/80"
            aria-label="Save place"
          >
            <Heart className={isSaved ? "fill-saboris-primary" : ""} />
          </Button>
        </div>
      )}

      <div onClick={cardActionTarget} className="flex-grow flex flex-col cursor-pointer">
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          {images.length > 1 ? (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {images.map((src, i) => (
                  <CarouselItem key={i}>
                    <img src={src} alt={`Image of ${place.place.name} ${i+1}`} className="w-full h-full object-cover" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
            </Carousel>
          ) : images[0] ? (
            <img src={images[0]} alt={`Image of ${place.place.name}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        <CardHeader className="py-3">
          <CardTitle className="text-lg text-gray-700">{place.place.name}</CardTitle>
          {place.place.category && (
            <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full mt-1">
              {place.place.category}
            </span>
          )}
          {place.rating !== undefined && (
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <SharedPlaceStar key={i} filled={i < place.rating!} />
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="py-2 flex-grow">
          {place.review_text ? (
            <p className="text-sm text-gray-800 line-clamp-3">
              {place.review_text}
            </p>
          ) : (
            place.place.description && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {place.place.description}
              </p>
            )
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center mt-auto">
          <small className="text-xs text-gray-500">
            {new Date(place.created_at).toLocaleDateString()}
          </small>
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                openReviewDialog(place);
              }}
            >
              {place.type === "review" ? "Edit Review" : "Add Review"}
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
