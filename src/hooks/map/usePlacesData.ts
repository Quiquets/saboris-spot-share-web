
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePlacesData = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [userPlaces, setUserPlaces] = useState<any[]>([]);
  const [friendsPlaces, setFriendsPlaces] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        // Fetch community places
        const { data: communityData, error: communityError } = await supabase
          .from('places')
          .select('id, name, lat, lng, description, category, tags, created_by, reviews(photo_url)');
        
        if (communityError) {
          console.error("Error fetching community places:", communityError);
          return;
        }
        
        // Process community places
        const processedCommunityPlaces = communityData?.map(place => ({
          id: place.id,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          description: place.description,
          category: place.category,
          tags: place.tags,
          created_by: place.created_by,
          photo_url: place.reviews?.length > 0 ? place.reviews[0].photo_url : undefined,
          type: 'community'
        })) || [];
        
        setPlaces(processedCommunityPlaces);
        
        // If user is logged in, fetch friends' places
        if (user) {
          // Fetch user's places
          const { data: userPlacesData } = await supabase
            .from('places')
            .select('id, name, lat, lng, description, category, tags, reviews(photo_url)')
            .eq('created_by', user.id);
            
          if (userPlacesData) {
            const processedUserPlaces = userPlacesData.map(place => ({
              ...place,
              photo_url: place.reviews?.length > 0 ? place.reviews[0].photo_url : undefined,
              type: 'user'
            }));
            setUserPlaces(processedUserPlaces);
          }
          
          // Fetch friends list
          const { data: friendsData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
            
          if (friendsData && friendsData.length > 0) {
            const friendIds = friendsData.map(f => f.following_id);
            
            // Fetch friends' places
            const { data: friendsPlacesData } = await supabase
              .from('places')
              .select('id, name, lat, lng, description, category, tags, created_by, reviews(photo_url)')
              .in('created_by', friendIds);
              
            if (friendsPlacesData) {
              const processedFriendsPlaces = friendsPlacesData.map(place => ({
                ...place,
                photo_url: place.reviews?.length > 0 ? place.reviews[0].photo_url : undefined,
                type: 'friend'
              }));
              setFriendsPlaces(processedFriendsPlaces);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching places:", err);
      }
    };
    
    fetchPlaces();
  }, [user]);

  return {
    places,
    userPlaces,
    friendsPlaces
  };
};
