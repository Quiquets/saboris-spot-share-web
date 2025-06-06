
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
    console.log('useExplorePlaces effect triggered with:', { user: user?.id, filter });
    
    if (!user) {
      console.log('No user found, setting empty places');
      setPlaces([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    (async () => {
      try {
        let ids: string[] = [user.id];
        const isCommunity = filter === 'community';

        console.log('Filter type:', filter, 'isCommunity:', isCommunity);

        if (!isCommunity && filter !== 'my') {
          const { data: friends = [] } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
          const friendIds = friends.map((f) => f.following_id);
          console.log('Friend IDs:', friendIds);

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

        console.log('User IDs to query:', ids);

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
              isCommunityMember
            )
          `);

        if (isCommunity) {
          q = q.eq('users.isCommunityMember', true);
        } else {
          q = q.in('user_id', ids);
        }

        const { data: reviews, error } = await q;
        
        console.log('Reviews query result:', { reviews: reviews?.length, error });
        
        if (error) {
          console.error('Reviews query error:', error);
          setPlaces([]);
          setLoading(false);
          return;
        }

        if (!Array.isArray(reviews) || reviews.length === 0) {
          console.log('No reviews found');
          setPlaces([]);
          setLoading(false);
          return;
        }

        console.log('Raw reviews data:', reviews);

        // Group by place_id and filter out reviews without valid places
        const groups: Record<string, typeof reviews> = {};
        reviews.forEach((r) => {
          if (r.places?.id && r.places?.lat && r.places?.lng) {
            (groups[r.place_id] ||= []).push(r);
          }
        });

        console.log('Grouped reviews:', Object.keys(groups).length, 'places');

        // Build ExplorePlace[]
        const result: ExplorePlace[] = Object.values(groups).map((grp) => {
          const first = grp[0];
          const loc = { lat: Number(first.places.lat), lng: Number(first.places.lng) };
          
          // Calculate overall rating for each reviewer
          const reviewers: ReviewerInfo[] = grp.map((r) => {
            const ratings = [
              r.rating_food,
              r.rating_service,
              r.rating_atmosphere,
              r.rating_value
            ].filter((rating) => rating !== null && rating !== undefined);
            
            const overallRating = ratings.length > 0 
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
              : 0;

            return {
              userId: r.user_id,
              userName: r.users?.name || 'Unknown',
              photoUrls: r.photo_urls || [],
              ratingOverall: overallRating,
              ratingValue: r.rating_value ?? undefined,
              ratingAtmosphere: r.rating_atmosphere ?? undefined,
              reviewText: r.text || '',
            };
          });

          // Calculate averages
          const avg = (arr: number[]) =>
            arr.length > 0 ? arr.reduce((sum, x) => sum + x, 0) / arr.length : 0;

          const overallRatings = reviewers.map(r => r.ratingOverall).filter(r => r > 0);
          const valueRatings = reviewers.map(r => r.ratingValue).filter(r => r !== undefined) as number[];
          const atmosphereRatings = reviewers.map(r => r.ratingAtmosphere).filter(r => r !== undefined) as number[];

          const place: ExplorePlace = {
            placeId: first.place_id,
            name: first.places.name,
            category: first.places.category,
            location: loc,
            reviewers,
            avgOverall: avg(overallRatings),
            avgValue: valueRatings.length > 0 ? avg(valueRatings) : undefined,
            avgAtmosphere: atmosphereRatings.length > 0 ? avg(atmosphereRatings) : undefined,
          };

          console.log('Built place:', place.name, 'at', place.location, 'with', place.reviewers.length, 'reviewers');
          return place;
        });

        console.log('Final result:', result.length, 'places');
        setPlaces(result);
      } catch (error) {
        console.error('Error in useExplorePlaces:', error);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, filter]);

  return { places, loading };
}
