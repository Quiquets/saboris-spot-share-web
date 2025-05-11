
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, PlusCircle, User as UserIcon, Loader2, UsersRound, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SavedRestaurant, ProfileStats, supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<SavedRestaurant[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);

  useEffect(() => {
    document.title = 'Saboris - Profile';
    
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [places, stats, accountSettings] = await Promise.all([
          supabaseService.getSavedRestaurants(user.id),
          supabaseService.getProfileStats(user.id),
          supabaseService.getUserSettings(user.id)
        ]);
        
        setSavedPlaces(places);
        setProfileStats(stats);
        setIsPrivate(accountSettings?.is_private || false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleRemoveFromWishlist = async (placeId: string) => {
    if (!user) return;
    
    try {
      await supabaseService.unsaveRestaurant(user.id, placeId);
      setSavedPlaces(currentPlaces => 
        currentPlaces.filter(place => place.place_id !== placeId)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handlePrivacyToggle = async (value: boolean) => {
    if (!user) return;
    
    try {
      setIsPrivate(value);
      await supabaseService.updateUserSettings(user.id, { is_private: value });
      toast.success(`Account is now ${value ? 'private' : 'public'}`);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
      setIsPrivate(!value); // Revert UI state on error
    }
  };

  const fetchFollowers = async () => {
    if (!user) return;
    
    try {
      const followers = await supabaseService.getFollowers(user.id);
      setFollowers(followers);
      setShowFollowers(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
      toast.error("Failed to load followers");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-saboris-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <UserIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your profile and saved places.</p>
            <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-saboris-primary">
                <AvatarImage src={user.avatar_url || "https://i.pravatar.cc/150?img=23"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">@{user.username}</p>
                {user.bio && <p className="mt-2">{user.bio}</p>}
                {user.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    {user.location}
                  </p>
                )}
                
                {/* User Stats */}
                {profileStats && (
                  <div className="flex gap-4 mt-3 justify-center md:justify-start">
                    <div className="text-center">
                      <p className="font-semibold">{profileStats.posts_count || 0}</p>
                      <p className="text-xs text-gray-500">Posts</p>
                    </div>
                    <button 
                      className="text-center"
                      onClick={fetchFollowers}
                    >
                      <p className="font-semibold">{profileStats.followers_count || 0}</p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </button>
                    <div className="text-center">
                      <p className="font-semibold">{profileStats.following_count || 0}</p>
                      <p className="text-xs text-gray-500">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{profileStats.saved_places_count || 0}</p>
                      <p className="text-xs text-gray-500">Saved</p>
                    </div>
                  </div>
                )}
                
                {/* Privacy Toggle */}
                <div className="mt-4 flex items-center justify-center md:justify-start">
                  <Switch 
                    id="private-mode" 
                    checked={isPrivate}
                    onCheckedChange={handlePrivacyToggle}
                  />
                  <Label htmlFor="private-mode" className="ml-2">
                    Private Account
                  </Label>
                  {isPrivate && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      Only visible to followers
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <Button variant="outline" className="border-saboris-primary text-saboris-primary">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
          
          {/* Followers Modal (Simplified for now) */}
          {showFollowers && followers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Followers</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFollowers(false)}
                >
                  Close
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <Card key={follower.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={follower.avatar_url || undefined} />
                          <AvatarFallback>{follower.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{follower.name}</p>
                          <p className="text-sm text-gray-500">@{follower.username}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Saved Places Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="text-saboris-primary" />
                <span>My Saved Places</span>
              </h2>
              
              <Link to="/map">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>View on Map</span>
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-saboris-primary" />
                <p className="text-gray-600">Loading your saved places...</p>
              </div>
            ) : savedPlaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlaces.map((place) => (
                  <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      {/* Placeholder image for now - would use actual restaurant images */}
                      <img 
                        src={`https://source.unsplash.com/random/400x300?food&${place.restaurant.name}`}
                        alt={place.restaurant.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{place.restaurant.name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-saboris-primary"
                          onClick={() => handleRemoveFromWishlist(place.place_id)}
                        >
                          <Heart className="h-5 w-5 fill-saboris-primary" />
                        </Button>
                      </div>
                      {place.restaurant.category && (
                        <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full">
                          {place.restaurant.category}
                        </span>
                      )}
                    </CardHeader>
                    
                    <CardContent className="py-2">
                      {place.restaurant.description && (
                        <p className="text-sm text-gray-600">{place.restaurant.description}</p>
                      )}
                      {place.note && (
                        <div className="mt-2 text-sm italic text-gray-500">"{place.note}"</div>
                      )}
                      {place.restaurant.tags && place.restaurant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {place.restaurant.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-0 pb-3">
                      <Button variant="outline" size="sm" className="w-full text-saboris-primary border-saboris-primary">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>View Details</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-xl font-medium mb-2">No saved places yet</h3>
                <p className="text-gray-600 mb-4">Start exploring and save your favorite restaurants</p>
                <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
                  <Link to="/map">
                    <MapPin className="h-4 w-4 mr-1" />
                    Explore Map
                  </Link>
                </Button>
              </div>
            )}
            
            {/* Add Place CTA */}
            <div className="mt-10 text-center">
              <Link to="/add">
                <Button className="bg-saboris-primary hover:bg-saboris-primary/90 flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add a New Place
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default ProfilePage;
