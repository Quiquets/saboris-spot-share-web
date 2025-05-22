// src/hooks/map/useExplorePlaces.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ExplorePlace, ReviewerInfo } from "@/types/explore";

export function useExplorePlaces(filter: "my" | "friends" | "fof" | "community") {
  const { user } = useAuth();
  const [places, setPlaces] = useState<ExplorePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      let ids: string[] = [user.id];
      let filterCommunity = false;
      if (filter === "community") {
        filterCommunity = true;
      } else if (filter !== "my") {
        const { data: friends = [] } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const friendIds = friends.map((f) => f.following_id);
        if (filter === "friends") {
          ids = friendIds;
        } else {
          // friends-of-friends
          const { data: fofRows = [] } = await supabase
            .from("follows")
            .select("following_id")
            .in("follower_id", friendIds);
          const fofIds = fofRows.map((f) => f.following_id);
          ids = Array.from(new Set([...friendIds, ...fofIds]));
        }
        // Debug log
        console.log("useExplorePlaces: filter:", filter, "ids:", ids);
      }

      // --- NEW: Fetch reviews directly and map to ExplorePlace[] ---
      let reviewsQuery = supabase
        .from("reviews")
        .select(`
          id,
          user_id,
          place_id,
          rating_atmosphere,
          rating_food,
          rating_service,
          rating_value,
          rating_overall,
          text,
          photo_urls,
          places (
            id,
            name,
            category,
            lat,
            lng
          ),
          users:user_id (
            id,
            name,
            isCommunitymemeber
          )
        `);

      if (filterCommunity) {
        reviewsQuery = reviewsQuery.eq("users.isCommunitymemeber", true);
      } else {
        reviewsQuery = reviewsQuery.in("user_id", ids);
      }

      const { data: reviewsData, error } = await reviewsQuery;
      if (error) {
        console.error("fetchExplorePlaces error:", error);
        setPlaces([]);
        setLoading(false);
        return;
      }

      // Group reviews by place_id
      const groups: Record<string, any[]> = {};
      (reviewsData ?? []).forEach((r) => {
        if (r.places && r.places.id) {
          (groups[r.place_id] ||= []).push(r);
        }
      });

      // Map to ExplorePlace[]
      const result: ExplorePlace[] = Object.values(groups).map((grp) => {
        const first = grp[0];
        const loc = { lat: first.places.lat, lng: first.places.lng };
        const reviewers: ReviewerInfo[] = grp.map((r) => ({
          userId: r.user_id,
          userName: r.users?.name || "Unknown",
          photoUrls: r.photo_urls || [],
          ratingOverall: r.rating_overall ?? 0,
          ratingValue: r.rating_value ?? undefined,
          ratingAtmosphere: r.rating_atmosphere ?? undefined,
          reviewText: r.text || "",
        }));
        const avg = (arr: number[]) =>
          arr.length ? arr.reduce((sum, x) => sum + x, 0) / arr.length : 0;
        return {
          placeId: first.place_id,
          name: first.places.name,
          category: first.places.category,
          location: loc,
          reviewers,
          avgOverall: avg(reviewers.map((r) => r.ratingOverall)),
          avgValue:
            reviewers[0].ratingValue != null
              ? avg(reviewers.map((r) => r.ratingValue!))
              : undefined,
          avgAtmosphere:
            reviewers[0].ratingAtmosphere != null
              ? avg(reviewers.map((r) => r.ratingAtmosphere!))
              : undefined,
        };
      });

      setPlaces(result);
      setLoading(false);
    })();
  }, [user, filter]);

  return { places, loading };
}
