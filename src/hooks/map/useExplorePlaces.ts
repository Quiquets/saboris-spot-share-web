// src/hooks/map/useExplorePlaces.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ExplorePlace, ReviewerInfo } from "@/types/explore";

export function useExplorePlaces(filter: "my" | "friends" | "fof") {
  const { user } = useAuth();
  const [places, setPlaces] = useState<ExplorePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      // 1) Build the list of user-IDs to include
      let ids = [user.id];
      if (filter !== "my") {
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
      }

      // 2) One joined query on `wishlists` (the table that holds saved places)
      const { data: rawData, error } = await supabase
        .from("wishlists")
        .select(`
          place_id,
          places!inner(name, category, lat, lng),
          reviews!inner(
            user_id,
            photo_urls,
            rating_overall,
            rating_value,
            rating_atmosphere
          ),
          users!reviews_user_fkey(name)
        `)
        .in("user_id", ids);

      if (error) {
        console.error("fetchExplorePlaces error:", error);
        setPlaces([]);
        setLoading(false);
        return;
      }

      // 3) Cast to any[] so we can pick off the joined fields
      const rows = (rawData ?? []) as any[];

      // 4) Group by place_id
      const groups: Record<string, any[]> = {};
      rows.forEach((r) => {
        (groups[r.place_id] ||= []).push(r);
      });

      // 5) Map into our ExplorePlace[]
      const result: ExplorePlace[] = Object.values(groups).map((grp) => {
        const first = grp[0];
        const loc = { lat: first.places.lat, lng: first.places.lng };

        // build the list of reviewers
        const reviewers: ReviewerInfo[] = grp.map((r) => ({
          userId: r.reviews.user_id,
          userName: r.users.name,
          photoUrls: r.reviews.photo_urls,
          ratingOverall: r.reviews.rating_overall,
          ratingValue: r.reviews.rating_value,
          ratingAtmosphere: r.reviews.rating_atmosphere,
        }));

        // helper for averages
        const avg = (arr: number[]) =>
          arr.reduce((sum, x) => sum + x, 0) / arr.length;

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
