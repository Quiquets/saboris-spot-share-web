import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AccessGateModal from '@/components/AccessGateModal';
import SearchInput from '@/components/search/SearchInput';
import SearchResults from '@/components/search/SearchResults';
import RestaurantSearchResults from '@/components/search/RestaurantSearchResults';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  is_following?: boolean;
  followers_count?: number;
  posts_count?: number;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  place_id: string;
  cuisine?: string;
  avg_rating?: number;
  reviewers?: {
    id: string;
    name: string;
    avatar_url: string | null;
  }[];
  is_saved?: boolean;
}

const SearchUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [saveLoading, setSaveLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const [showGateModal, setShowGateModal] = useState(false);
  
  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setUsers([]);
      setRestaurants([]);
    }
  }, [searchQuery]);
  
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setRestaurants([]);
      return;
    }
    
    setLoading(true);
    try {
      // Search for both users and restaurants in parallel
      const [userResults, restaurantResults] = await Promise.all([
        supabaseService.searchUsers(searchQuery),
        searchRestaurants(searchQuery)
      ]);
      
      setUsers(userResults);
      setRestaurants(restaurantResults);
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Failed to perform search");
    } finally {
      setLoading(false);
    }
  };
  
  const searchRestaurants = async (query: string) => {
    try {
      // Search restaurants in Supabase that match the query
      const { data, error } = await supabase
        .from('places')
        .select('id, name, address, lat, lng, category')
        .ilike('name', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      
      // If the user is logged in, check which restaurants are saved
      let restaurantsWithSaveStatus = data || [];
      let reviewerData: Record<string, any[]> = {};
      
      if (user) {
        // Check if restaurants are saved by the current user
        const { data: savedPlaces } = await supabase
          .from('wishlists')
          .select('place_id')
          .eq('user_id', user.id);
        
        const savedPlaceIds = savedPlaces?.map(p => p.place_id) || [];
        
        // Get reviewer data for each restaurant
        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            place_id,
            user_id,
            rating_food,
            rating_service,
            rating_atmosphere,
            rating_value,
            users:user_id (id, name, avatar_url)
          `)
          .in('place_id', data?.map(r => r.id) || []);
        
        // Group reviewers by place_id
        reviews?.forEach(review => {
          if (!reviewerData[review.place_id]) {
            reviewerData[review.place_id] = [];
          }
          reviewerData[review.place_id].push({
            ...review.users,
            rating: Math.round((review.rating_food + review.rating_service + review.rating_atmosphere + review.rating_value) / 4)
          });
        });
        
        // Combine restaurant data with saved status and reviewer info
        restaurantsWithSaveStatus = data?.map(restaurant => ({
          ...restaurant,
          place_id: restaurant.id, // Ensure place_id is set for compatibility
          is_saved: savedPlaceIds.includes(restaurant.id),
          reviewers: reviewerData[restaurant.id] || [],
          avg_rating: calculateAvgRating(reviewerData[restaurant.id] || [])
        })) || [];
      }
      
      return restaurantsWithSaveStatus;
    } catch (error) {
      console.error("Error searching restaurants:", error);
      return [];
    }
  };
  
  const calculateAvgRating = (reviewers: any[]) => {
    if (reviewers.length === 0) return 0;
    const sum = reviewers.reduce((acc, reviewer) => acc + reviewer.rating, 0);
    return Math.round((sum / reviewers.length) * 10) / 10; // Round to 1 decimal place
  };
  
  const handleFollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.followUser(userId);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: true, followers_count: (u.followers_count || 0) + 1 } 
          : u
      ));
      
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleUnfollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.unfollowUser(userId);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: false, followers_count: Math.max(0, (u.followers_count || 1) - 1) } 
          : u
      ));
      
      toast.success("User unfollowed successfully!");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleSaveRestaurant = async (restaurantId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setSaveLoading(prev => ({ ...prev, [restaurantId]: true }));
    try {
      await supabaseService.saveRestaurant(user.id, restaurantId);
      
      setRestaurants(restaurants.map(r => 
        r.id === restaurantId 
          ? { ...r, is_saved: true } 
          : r
      ));
      
      toast.success("Restaurant saved to your wishlist!");
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast.error("Failed to save restaurant");
    } finally {
      setSaveLoading(prev => ({ ...prev, [restaurantId]: false }));
    }
  };
  
  const handleUnsaveRestaurant = async (restaurantId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setSaveLoading(prev => ({ ...prev, [restaurantId]: true }));
    try {
      await supabaseService.unsaveRestaurant(user.id, restaurantId);
      
      setRestaurants(restaurants.map(r => 
        r.id === restaurantId 
          ? { ...r, is_saved: false } 
          : r
      ));
      
      toast.success("Restaurant removed from your wishlist");
    } catch (error) {
      console.error("Error removing restaurant from wishlist:", error);
      toast.error("Failed to remove restaurant from wishlist");
    } finally {
      setSaveLoading(prev => ({ ...prev, [restaurantId]: false }));
    }
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-saboris-primary">
            Search for friends or restaurants
          </h1>
          
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-xl">
              <SearchInput 
                value={searchQuery} 
                onChange={setSearchQuery}
                placeholder="Search for friends or restaurants..." 
              />
            </div>
          </div>
          
          {/* Restaurant Results */}
          <RestaurantSearchResults
            loading={loading}
            searchQuery={searchQuery}
            restaurants={restaurants}
            saveLoading={saveLoading}
            onSave={handleSaveRestaurant}
            onUnsave={handleUnsaveRestaurant}
          />
          
          {/* User Results */}
          <SearchResults
            loading={loading}
            searchQuery={searchQuery}
            users={users}
            currentUserId={user?.id}
            followLoading={followLoading}
            onFollow={handleFollowUser}
            onUnfollow={handleUnfollowUser}
          />
        </div>
      </div>
      
      <Footer />
      
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)}
        featureName="follow users and save restaurants"
      />
    </main>
  );
};

export default SearchUsersPage;
