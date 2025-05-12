
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService, ProfileStats } from '@/services/supabaseService';
import { User } from '@/types/global';
import { toast } from 'sonner';
import { SharedPlace } from '@/types/profile';

export const useProfileData = (user: User | null) => {
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
  
  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get places shared by this user
      const sharedPlacesData = await fetchSharedPlaces(user.id);
      const stats = await supabaseService.getProfileStats(user.id);
      
      // Get user profile to check if account is private
      const userProfile = await supabaseService.getUserProfile(user.id);
      
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
      
      // Combine all places and sort by date (newest first)
      // Use the type property to avoid duplicates
      const allSharedPlaces = [...createdPlaces, ...reviewedPlaces]
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      return allSharedPlaces;
    } catch (error) {
      console.error("Error fetching shared places:", error);
      toast.error("Failed to load shared places");
      return [];
    }
  };

  const fetchFollowers = async () => {
    if (!user) return [];
    
    try {
      // Get followers with additional data about whether current user follows each follower
      const followersData = await supabaseService.getFollowers(user.id);
      
      // For each follower, check if the current user is following them
      const followersWithFollowingStatus = await Promise.all(
        followersData.map(async (follower) => {
          const isFollowing = await supabaseService.isFollowing(user.id, follower.id);
          // Check if the follower is the current user
          const isSelf = follower.id === user.id;
          
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
    if (!user) return [];
    
    try {
      // Get users that the current user is following
      const followingData = await supabaseService.getFollowing(user.id);
      
      // Mark all as being followed by current user
      const processedFollowing = followingData.map(followed => ({
        ...followed,
        is_following: true,
        // Check if the followed user is the current user
        is_self: followed.id === user.id
      }));
      
      setFollowing(processedFollowing);
      return processedFollowing;
    } catch (error) {
      console.error("Error fetching following:", error);
      toast.error("Failed to load following");
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

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
