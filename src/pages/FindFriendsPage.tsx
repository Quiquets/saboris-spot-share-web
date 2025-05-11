
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Search, UserPlus, UserCheck, Star, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import AccessGateModal from '@/components/AccessGateModal';
import MapFilters from '@/components/map/MapFilters';
import { ActiveFilters } from '@/components/map/FilterOptions';

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

interface FriendReview {
  id: string;
  text: string;
  place_id: string;
  place_name: string;
  rating_food?: number;
  rating_service?: number;
  rating_atmosphere?: number;
  photo_url?: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  tags?: string[];
  cuisine?: string;
  occasion?: string[];
}

const FindFriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [friendReviews, setFriendReviews] = useState<FriendReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const [showGateModal, setShowGateModal] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    people: 'friends', // Default to Friends
    occasion: [],
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "desc",
    serviceSortDirection: "desc",
    atmosphereSortDirection: "desc",
    valueSortDirection: "desc",
  });
  
  useEffect(() => {
    document.title = 'Saboris - Find Friends';
    
    if (searchQuery.length > 0) {
      searchUsers();
    } else if (user) {
      // Load friend reviews when the page loads if user is logged in
      loadFriendReviews();
    }
  }, [searchQuery, user]);
  
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await supabaseService.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };
  
  const loadFriendReviews = async () => {
    if (!user) return;
    
    setReviewsLoading(true);
    try {
      // For now, we'll just mock this function
      // In a real implementation, we'd call an API to get friend reviews
      // const reviews = await supabaseService.getFriendReviews(user.id, activeFilters);
      
      // Mock data for demonstration
      const mockReviews: FriendReview[] = [
        {
          id: '1',
          text: "Great atmosphere and delicious food. Highly recommend the pasta!",
          place_id: '101',
          place_name: 'Bella Italia',
          rating_food: 4,
          rating_service: 5,
          rating_atmosphere: 4,
          photo_url: 'https://source.unsplash.com/random/800x600/?italian,restaurant',
          created_at: new Date().toISOString(),
          user_id: 'user1',
          user_name: 'John Smith',
          user_avatar: 'https://i.pravatar.cc/150?img=1',
          tags: ['romantic', 'cozy'],
          cuisine: 'italian',
          occasion: ['dinner']
        },
        {
          id: '2',
          text: "Best sushi in town! Fresh ingredients and great presentation.",
          place_id: '102',
          place_name: 'Tokyo Sushi',
          rating_food: 5,
          rating_service: 4,
          rating_atmosphere: 5,
          photo_url: 'https://source.unsplash.com/random/800x600/?sushi,restaurant',
          created_at: new Date().toISOString(),
          user_id: 'user2',
          user_name: 'Emily Johnson',
          user_avatar: 'https://i.pravatar.cc/150?img=2',
          tags: ['trendy', 'instagrammable'],
          cuisine: 'sushi',
          occasion: ['lunch', 'dinner']
        },
      ];
      
      setFriendReviews(mockReviews);
    } catch (error) {
      console.error("Error loading friend reviews:", error);
      toast.error("Failed to load reviews from friends");
    } finally {
      setReviewsLoading(false);
    }
  };
  
  const handleFilterChange = (type: string, value: string | string[] | { direction: "asc" | "desc", category: string }) => {
    if (typeof value === 'object' && 'direction' in value) {
      // Handle sort direction change for rating categories
      const { direction, category } = value;
      setActiveFilters(prev => ({
        ...prev,
        [`${category}SortDirection`]: direction
      }));
    } else {
      // Handle other filter changes
      setActiveFilters(prev => ({
        ...prev,
        [type]: value
      }));
    }
    
    // In a real app, we would refresh the reviews based on filters here
    loadFriendReviews();
  };
  
  // Define the mapping between option.id and state property keys
  const directionKeyMap: Record<string, keyof ActiveFilters> = {
    'value': 'valueSortDirection',
    'food-quality': 'foodSortDirection',
    'service': 'serviceSortDirection',
    'atmosphere': 'atmosphereSortDirection'
  };
  
  const toggleSortDirection = (category: string) => {
    // Use the mapping to get the correct state property key
    const directionKey = directionKeyMap[category];
    if (!directionKey) return;
    
    const currentDirection = activeFilters[directionKey] as "asc" | "desc";
    const newDirection = currentDirection === "desc" ? "asc" : "desc";
    
    handleFilterChange(category, { direction: newDirection, category });
  };
  
  const handlePeopleFilterChange = (value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      people: value
    }));
    
    // Refresh reviews after filter change
    loadFriendReviews();
  };
  
  const handleFollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.followUser(userId);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: true, followers_count: (u.followers_count || 0) + 1 } 
          : u
      ));
      
      toast.success("User followed successfully!");
      
      // Refresh friend reviews after following a new user
      loadFriendReviews();
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
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: false, followers_count: Math.max(0, (u.followers_count || 1) - 1) } 
          : u
      ));
      
      toast.success("User unfollowed successfully!");
      
      // Refresh friend reviews after unfollowing a user
      loadFriendReviews();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Helper function to render stars
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Find Friends</h1>
          
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username"
              className="pl-10 pr-4"
            />
          </div>
          
          {loading && (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
            </div>
          )}
          
          {!loading && searchQuery && users.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-12">
              {users.map(user => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${user.id}`} className="flex items-center flex-1 min-w-0">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="truncate">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                        </div>
                      </Link>
                      
                      {user.id !== user?.id && (
                        user.is_following ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUnfollowUser(user.id)}
                            disabled={followLoading[user.id]}
                            className="ml-2"
                          >
                            {followLoading[user.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Following
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleFollowUser(user.id)}
                            disabled={followLoading[user.id]}
                            className="ml-2 bg-saboris-primary hover:bg-saboris-primary/90"
                          >
                            {followLoading[user.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        )
                      )}
                    </div>
                    
                    <div className="mt-3 flex text-xs text-gray-500 space-x-4">
                      <span>{user.posts_count || 0} posts</span>
                      <span>{user.followers_count || 0} followers</span>
                    </div>
                    
                    {user.bio && (
                      <p className="text-sm mt-3 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && searchQuery && users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
        
        {/* Friend Reviews Section */}
        {user && !searchQuery && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Friend Reviews</h2>
            
            {/* Filters for friend reviews */}
            <div className="mb-6">
              <MapFilters 
                activeFilters={activeFilters}
                handleFilterChange={handleFilterChange}
                handlePeopleFilterChange={handlePeopleFilterChange}
                toggleSortDirection={toggleSortDirection}
              />
            </div>
            
            {reviewsLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
              </div>
            ) : friendReviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {friendReviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {review.photo_url && (
                        <div className="w-full md:w-1/3 bg-gray-100">
                          <img 
                            src={review.photo_url} 
                            alt={review.place_name}
                            className="w-full h-full object-cover aspect-video md:aspect-square"
                          />
                        </div>
                      )}
                      
                      <div className={`w-full ${review.photo_url ? 'md:w-2/3' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{review.place_name}</h3>
                            {review.rating_food && renderRating(review.rating_food)}
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <Avatar className="h-7 w-7 mr-2">
                              <AvatarImage src={review.user_avatar} />
                              <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {review.user_name}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {review.cuisine && (
                              <span className="px-2 py-0.5 bg-saboris-primary text-white text-xs rounded-full">
                                {review.cuisine}
                              </span>
                            )}
                            {review.tags?.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                            {review.occasion?.map(occ => (
                              <span key={occ} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                                {occ}
                              </span>
                            ))}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {review.text}
                          </p>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 text-saboris-primary border-saboris-primary"
                            asChild
                          >
                            <Link to={`/place/${review.place_id}`}>
                              <MapPin className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No reviews from friends yet.</p>
                <Button
                  className="bg-saboris-primary hover:bg-saboris-primary/90" 
                  onClick={() => setSearchQuery('a')}
                >
                  Find Friends to Follow
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Prompt to log in if not authenticated */}
        {!user && !searchQuery && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">Please sign in to see reviews from friends.</p>
            <Button 
              className="bg-saboris-primary hover:bg-saboris-primary/90"
              onClick={() => setShowGateModal(true)}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
      
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)}
        featureName="see friend reviews"
      />
    </main>
  );
};

export default FindFriendsPage;
