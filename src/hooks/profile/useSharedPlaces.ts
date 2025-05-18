// src/hooks/useSharedPlaces.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SharedPlace } from '@/types/profile';

export function useSharedPlaces(userId: string | null) {
  const [sharedPlaces, setSharedPlaces] = useState<SharedPlace[]>([]);

  const fetchSharedPlaces = async (): Promise<SharedPlace[]> => {
    if (!userId) {
      setSharedPlaces([]);
      return [];
    }

    try {
      // 1) Your own created places (no photos on places table)
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('id,name,description,category,address,tags,created_by,created_at')
        .eq('created_by', userId);
      if (placesError) throw placesError;

      // 2) Your reviews, joining full place record
      const { data: reviewsData, error: reviewsError } = await supabase
  .from('reviews')
  .select(`
    id,
    user_id,
    place_id,
    rating_food,
    rating_service,
    rating_atmosphere,
    rating_value,
    text,
    tagged_friends,
    created_at,
    photo_urls,
    places (
      id,
      name,
      description,
      category,
      address,
      tags,
      created_by,
      created_at
    )
  `)
  .eq('user_id', userId);
if (reviewsError) throw reviewsError;

      // 3) Map “place” items
      const created: SharedPlace[] = (placesData || []).map(p => ({
        id: p.id,
        place_id: p.id,
        created_at: new Date(p.created_at),
        created_by: p.created_by!,
        place: {
          name: p.name,
          description: p.description || undefined,
          tags: p.tags || [],
          category: p.category || undefined,
          address: p.address || undefined,
        },
        photo_urls: [],         // places table has no photos
        type: 'place'
      }));

      // 4) Map “review” items
      const reviewed: SharedPlace[] = (reviewsData || []).map(r => {
        const ratings = [
          r.rating_food,
          r.rating_service,
          r.rating_atmosphere,
          r.rating_value
        ].filter((x): x is number => typeof x === 'number');
        const avgRating = ratings.length
          ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
          : undefined;

        return {
          id: r.id,
          place_id: r.place_id,
          created_at: new Date(r.created_at),
          created_by: r.user_id,
          place: {
            name: r.places.name,
            description: r.places.description || undefined,
            tags: r.places.tags || [],
            category: r.places.category || undefined,
            address: r.places.address || undefined,
          },
          rating: avgRating,
          review_text: r.text || undefined,
          photo_urls: r.photo_urls || [],  // review’s uploaded photos
          type: 'review'
        };
      });

      // 5) Merge and de-duplicate by place_id (newest first)
      const map = new Map<string, SharedPlace>();
      [...created, ...reviewed]
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .forEach(item => {
          if (!map.has(item.place_id)) {
            map.set(item.place_id, item);
          }
        });

      const all = Array.from(map.values());
      setSharedPlaces(all);
      return all;
    } catch (err: any) {
      console.error('❌ useSharedPlaces error:', {
        message: err.message,
        code:    err.code,
        details: err.details,
        hint:    err.hint
      });
      toast.error('Failed to load shared places: ' + err.message);
      setSharedPlaces([]);
      return [];
    }
  };

  useEffect(() => {
    fetchSharedPlaces();
  }, [userId]);

  return { sharedPlaces, fetchSharedPlaces };
}
