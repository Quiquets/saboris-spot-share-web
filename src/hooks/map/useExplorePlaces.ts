import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ExplorePlace, ReviewerInfo } from '@/types/explore';

export function useExplorePlaces(
  filter: 'my' | 'friends' | 'fof' | 'community'
) {
  const { user } = useAuth();
  const [places, setPlaces] = useState<ExplorePlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      let ids: string[] = [user.id];
      const isCommunity = filter === 'community';

      if (!isCommunity && filter !== 'my') {
        const { data: friends = [] } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        const friendIds = friends.map((f) => f.following_id);

        if (filter === 'friends') {
          ids = friendIds;
        } else {
          const { data: fof = [] } = await supabase
            .from('follows')
            .select('following_id')
            .in('follower_id', friendIds);
          ids = Array.from(
            new Set([...friendIds, ...fof.map((f) => f.following_id)])
          );
        }
      }

      let q = supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          place_id,
          rating_atmosphere,
          rating_food,
          rating_service,
          rating_value,
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
            isCommunitymember
          )
        `);

      if (isCommunity) {
        q = q.eq('users.isCommunitymember', true);
      } else {
        q = q.in('user_id', ids);
      }

      const { data: reviews, error } = await q;
      if (error || !Array.isArray(reviews)) {
        console.error('fetchExplorePlaces error:', error);
        setPlaces([]);
        setLoading(false);
        return;
      }

      // Group by place_id
      const groups: Record<string, typeof reviews> = {};
      reviews.forEach((r) => {
        if (r.places?.id) {
          (groups[r.place_id] ||= []).push(r);
        }
      });

      // Build ExplorePlace[]
      const result: ExplorePlace[] = Object.values(groups).map((grp) => {
        const first = grp[0];
        const loc = { lat: first.places.lat, lng: first.places.lng };
        const reviewers: ReviewerInfo[] = grp.map((r) => ({
          userId: r.user_id,
          userName: r.users?.name || 'Unknown',
          photoUrls: r.photo_urls || [],
          ratingOverall: 0,
          ratingValue: r.rating_value ?? undefined,
          ratingAtmosphere: r.rating_atmosphere ?? undefined,
          reviewText: r.text || '',
        }));
        const avg = (arr: number[]) =>
          arr.reduce((sum, x) => sum + x, 0) / (arr.length || 1);

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