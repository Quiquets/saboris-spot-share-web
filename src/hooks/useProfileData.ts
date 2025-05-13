
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService, ProfileStats } from '@/services/supabaseService';
import { User } from '@/types/global';
import { toast } from 'sonner';
import { SharedPlace } from '@/types/profile';

export const useProfileData = (user: User | null, targetUserId?: string) => {
  const [sharedPlaces, setSharedPlaces] = useState<SharedPlace[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  // Use the target user id if provided, otherwise use the logged-in user's id
  const activeUserId = targetUserId || (user ? user.id : null);
  
  const fetchProfileData = async () => {
    if (!user || !activeUserId) return;
    
    try {
      setLoading(true);
      
      // Get places shared by this user
      const sharedPlacesData = await fetchSharedPlaces(activeUserId);
      const stats = await supabaseService.getProfileStats(activeUserId);
      
      // Get user profile to check if account is private
      const userProfile = await supabaseService.getUserProfile(activeUserId);
      
      setSharedPlaces(sharedPlacesData);
      setProfileStats(stats);
      setIsPrivate(userProfile?.is_private || false);
      
      // Set the existing profile data
      setBio(userProfile?.bio || '');
      setUsername(userProfile?.username || '');
      setUserLocation(userProfile?.location || '');
      setProfileImageUrl(userProfile?.avatar_url || null);
      
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedPlaces = async (userId: string): Promise<SharedPlace[]> => {
    try {
      // Get places created by this user
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('id, name, description, category, address, tags, created_by, created_at')
        .eq('created_by', userId);
      
      if (placesError) throw placesError;
      
      // Get reviews created by this user
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, place_id, created_at, rating_food, rating_service, rating_atmosphere, text, photo_url, places:place_id(id, name, description, category, address, tags, created_by)')
        .eq('user_id', userId);
      
      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        // Return only places data if reviews query fails
        const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
          id: place.id,
          place_id: place.id,
          created_at: new Date(place.created_at),
          created_by: place.created_by,
          place: {
            name: place.name,
            description: place.description,
            tags: place.tags,
            category: place.category,
            address: place.address
          },
          type: 'place'
        }));
        return createdPlaces;
      }
      
      // Combine both types of shared content
      const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
        id: place.id,
        place_id: place.id,
        created_at: new Date(place.created_at),
        created_by: place.created_by,
        place: {
          name: place.name,
          description: place.description,
          tags: place.tags,
          category: place.category,
          address: place.address
        },
        type: 'place'
      }));
      
      const reviewedPlaces: SharedPlace[] = (reviewsData || []).map(review => {
        // Calculate average rating from available rating fields
        const ratings: number[] = [];
        if (review.rating_food) ratings.push(review.rating_food);
        if (review.rating_service) ratings.push(review.rating_service); 
        if (review.rating_atmosphere) ratings.push(review.rating_atmosphere);
        
        const avgRating = ratings.length > 0 
          ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) 
          : undefined;
            
        return {
          id: review.id,
          place_id: review.place_id,
          created_at: new Date(review.created_at),
          created_by: userId,
          place: review.places || { name: 'Unknown Place' },
          rating: avgRating,
          review_text: review.text,
          photo_urls: review.photo_url ? [review.photo_url] : [],
          type: 'review'
        };
      });
      
      // Combine all places, ensure no duplicates by place_id, and sort by date (newest first)
      const placesMap = new Map<string, SharedPlace>();
      
      // First add created places to the map
      createdPlaces.forEach(place => {
        placesMap.set(place.place_id, place);
      });
      
      // Then add reviews, but make sure not to add duplicates for the same place
      reviewedPlaces.forEach(review => {
        // Check if we already have a place with this place_id
        const existingPlace = placesMap.get(review.place_id);
        
        // If no existing place, or if the review is newer, add/update the map
        if (!existingPlace || review.created_at > existingPlace.created_at) {
          placesMap.set(review.place_id, review);
        }
      });
      
      // Convert the map values back to an array and sort by date
      const allSharedPlaces = Array.from(placesMap.values())
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      return allSharedPlaces;
    } catch (error) {
      console.error("Error fetching shared places:", error);
      toast.error("Failed to load shared places");
      return [];
    }
  };

  const fetchFollowers = async () => {
    if (!activeUserId) return [];
    
    try {
      // Get followers with additional data about whether current user follows each follower
      const followersData = await supabaseService.getFollowers(activeUserId);
      
      // For each follower, check if the current user is following them
      const followersWithFollowingStatus = await Promise.all(
        followersData.map(async (follower) => {
          const isFollowing = await supabaseService.isFollowing(user?.id || '', follower.id);
          // Check if the follower is the current user
          const isSelf = follower.id === user?.id;
          
          return {
            ...follower,
            is_following: isFollowing,
            is_self: isSelf
          };
        })
      );
      
      setFollowers(followersWithFollowingStatus);
      return followersWithFollowingStatus;
    } catch (error) {
      console.error("Error fetching followers:", error);
      toast.error("Failed to load followers");
      return [];
    }
  };

  const fetchFollowing = async () => {
    if (!activeUserId) return [];
    
    try {
      // Get users that the target user is following
      const followingData = await supabaseService.getFollowing(activeUserId);
      
      // For each followed user, check if the current user is following them
      const processedFollowing = await Promise.all(
        followingData.map(async (followed) => {
          // Only check is_following if not viewing own profile
          const isFollowing = user?.id === activeUserId ? 
            true : // If viewing own profile, we're following everyone in our following list
            await supabaseService.isFollowing(user?.id || '', followed.id);
            
          // Check if the followed user is the current user
          const isSelf = followed.id === user?.id;
          
          return {
            ...followed,
            is_following: isFollowing,
            is_self: isSelf
          };
        })
      );
      
      setFollowing(processedFollowing);
      return processedFollowing;
    } catch (error) {
      console.error("Error fetching following:", error);
      toast.error("Failed to load following");
      return [];
    }
  };

  useEffect(() => {
    if (user && activeUserId) {
      fetchProfileData();
    }
  }, [user, activeUserId]);

  return {
    sharedPlaces,
    profileStats,
    loading,
    isPrivate,
    setIsPrivate,
    followers,
    following,
    bio,
    setBio,
    username,
    setUsername,
    userLocation,
    setUserLocation,
    profileImageUrl,
    setProfileImageUrl,
    fetchProfileData,
    fetchFollowers,
    fetchFollowing
  };
};
