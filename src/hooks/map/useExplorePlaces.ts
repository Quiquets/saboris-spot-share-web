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
    console.log('useExplorePlaces effect triggered with:', { 
      user: user?.id, 
      filter,
      hasUser: !!user 
    });
    
    setLoading(true);

    const fetchPlaces = async () => {
      try {
        let userIds: string[] = [];
        
        // Determine which user IDs to query based on filter
        if (filter === 'community') {
          // For community, get all users marked as community members
          const { data: communityUsers } = await supabase
            .from('users')
            .select('id')
            .eq('isCommunityMember', true);
          
          userIds = communityUsers?.map(u => u.id) || [];
          console.log('Community user IDs found:', userIds.length);
        } else if (!user) {
          // If no user and not community, show empty results
          console.log('No user authenticated for filter:', filter);
          setPlaces([]);
          setLoading(false);
          return;
        } else {
          // Handle authenticated user filters
          if (filter === 'my') {
            userIds = [user.id];
          } else {
            // Get friends first
            const { data: friends = [] } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', user.id);
            
            const friendIds = friends.map((f) => f.following_id);
            console.log('Friend IDs found:', friendIds.length);

            if (filter === 'friends') {
              userIds = friendIds;
            } else if (filter === 'fof') {
              // Get friends of friends
              const { data: fof = [] } = await supabase
                .from('follows')
                .select('following_id')
                .in('follower_id', friendIds);
              
              const fofIds = fof.map((f) => f.following_id);
              // Combine friends and friends-of-friends, remove duplicates
              userIds = Array.from(new Set([...friendIds, ...fofIds]));
              console.log('Friends + FoF IDs found:', userIds.length);
            }
          }
        }

        console.log('Final user IDs to query:', userIds);

        // If no user IDs found, return empty results
        if (userIds.length === 0) {
          console.log('No user IDs found for filter:', filter);
          setPlaces([]);
          setLoading(false);
          return;
        }

        // Fetch reviews for these users with explicit avatar_url field
        const { data: reviews, error } = await supabase
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
              avatar_url,
              isCommunityMember
            )
          `)
          .in('user_id', userIds);

        if (error) {
          console.error('Error fetching reviews:', error);
          setPlaces([]);
          setLoading(false);
          return;
        }

        if (!Array.isArray(reviews)) {
          console.log('No reviews found');
          setPlaces([]);
          setLoading(false);
          return;
        }

        console.log('Reviews fetched:', reviews.length);
        console.log('Sample review with avatar:', reviews[0]?.users);

        // Group reviews by place_id and ensure we have valid place data
        const placeGroups: Record<string, typeof reviews> = {};
        reviews.forEach((review) => {
          // Only include reviews that have valid place data with coordinates
          if (review.places?.id && 
              typeof review.places.lat === 'number' && 
              typeof review.places.lng === 'number' &&
              !isNaN(review.places.lat) && 
              !isNaN(review.places.lng)) {
            if (!placeGroups[review.place_id]) {
              placeGroups[review.place_id] = [];
            }
            placeGroups[review.place_id].push(review);
          } else {
            console.warn('Skipping review with invalid place data:', {
              reviewId: review.id,
              placeId: review.place_id,
              place: review.places
            });
          }
        });

        console.log('Valid place groups created:', Object.keys(placeGroups).length);

        // Build ExplorePlace array
        const exploreePlaces: ExplorePlace[] = Object.values(placeGroups).map((reviewGroup) => {
          const firstReview = reviewGroup[0];
          const place = firstReview.places!;
          
          // Calculate average ratings
          const validRatings = reviewGroup
            .map(r => [r.rating_food, r.rating_service, r.rating_atmosphere, r.rating_value])
            .flat()
            .filter(rating => rating != null) as number[];
          
          const avgOverall = validRatings.length > 0 
            ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length 
            : 0;

          const valueRatings = reviewGroup
            .map(r => r.rating_value)
            .filter(rating => rating != null) as number[];
          
          const avgValue = valueRatings.length > 0
            ? valueRatings.reduce((sum, rating) => sum + rating, 0) / valueRatings.length
            : undefined;

          const atmosphereRatings = reviewGroup
            .map(r => r.rating_atmosphere)
            .filter(rating => rating != null) as number[];
          
          const avgAtmosphere = atmosphereRatings.length > 0
            ? atmosphereRatings.reduce((sum, rating) => sum + rating, 0) / atmosphereRatings.length
            : undefined;

          // Build reviewer info with avatarUrl included and debug logging
          const reviewers: ReviewerInfo[] = reviewGroup.map((review) => {
            console.log('Processing reviewer:', {
              userId: review.user_id,
              userName: review.users?.name,
              avatarUrl: review.users?.avatar_url
            });
            
            return {
              userId: review.user_id,
              userName: review.users?.name || 'Unknown',
              avatarUrl: review.users?.avatar_url || undefined,
              photoUrls: review.photo_urls || [],
              ratingOverall: avgOverall, // Use calculated average
              ratingValue: review.rating_value ?? undefined,
              ratingAtmosphere: review.rating_atmosphere ?? undefined,
              reviewText: review.text || '',
            };
          });

          return {
            placeId: place.id,
            name: place.name,
            category: place.category,
            location: { lat: place.lat, lng: place.lng },
            reviewers,
            avgOverall,
            avgValue,
            avgAtmosphere,
          };
        });

        console.log('Final explore places created:', {
          count: exploreePlaces.length,
          places: exploreePlaces.map(p => ({
            name: p.name,
            location: p.location,
            reviewersCount: p.reviewers.length,
            firstReviewerAvatar: p.reviewers[0]?.avatarUrl
          }))
        });
        
        setPlaces(exploreePlaces);
        
      } catch (error) {
        console.error('Error in fetchPlaces:', error);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [user, filter]);

  return { places, loading };
}
