
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MapPin, 
  PlusCircle, 
  UserIcon, 
  Loader2, 
  UsersRound, 
  UserCheck, 
  UserPlus, 
  Filter, 
  Globe,
  Lock,
  Trash2,
  Camera,
  Save,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileStats, UserSettings, supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface SharedPlace {
  id: string;
  place_id: string;
  created_at: Date;
  place: {
    name: string;
    description?: string;
    tags?: string[];
    category?: string;
    address?: string;
  };
  rating?: number;
  review_text?: string;
}

const ProfilePage = () => {
  const { user, loading: authLoading, refreshUserData } = useAuth();
  const [sharedPlaces, setSharedPlaces] = useState<SharedPlace[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('shared');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState<SharedPlace | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    document.title = 'Saboris - Profile';
    
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
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchSharedPlaces = async (userId: string): Promise<SharedPlace[]> => {
    try {
      // Get places created by this user
      const { data: placesData, error: placesError } = await supabase
        .from('places')
        .select('id, name, description, category, address, tags')
        .eq('created_by', userId);
      
      if (placesError) throw placesError;
      
      // Get reviews created by this user
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, place_id, created_at, rating_food, rating_service, rating_atmosphere, text, places:place_id(name, description, category, address, tags)')
        .eq('user_id', userId);
      
      if (reviewsError) throw reviewsError;

      // Combine both types of shared content
      const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
        id: place.id,
        place_id: place.id,
        created_at: new Date(),
        place: {
          name: place.name,
          description: place.description,
          tags: place.tags,
          category: place.category,
          address: place.address
        }
      }));
      
      const reviewedPlaces: SharedPlace[] = (reviewsData || []).map(review => {
        const avgRating = review.rating_food && review.rating_service && review.rating_atmosphere
          ? Math.round((review.rating_food + review.rating_service + review.rating_atmosphere) / 3)
          : undefined;
          
        return {
          id: review.id,
          place_id: review.place_id,
          created_at: new Date(review.created_at),
          place: review.places || { name: 'Unknown Place' },
          rating: avgRating,
          review_text: review.text
        };
      });
      
      // Combine all places and sort by date (newest first)
      const allSharedPlaces = [...createdPlaces, ...reviewedPlaces]
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      return allSharedPlaces;
    } catch (error) {
      console.error("Error fetching shared places:", error);
      toast.error("Failed to load shared places");
      return [];
    }
  };

  const handlePrivacyToggle = async (value: boolean) => {
    if (!user) return;
    
    try {
      await supabaseService.updateUserProfile(user.id, { is_private: value });
      toast.success(`Account is now ${value ? 'private' : 'public'}`);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
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

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // First check if username is already taken (if changed)
      if (username !== user.username && username.trim() !== '') {
        const { data: usernameCheck } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
          
        if (usernameCheck) {
          toast.error("Username is already taken");
          return;
        }
      }
      
      // Upload profile image if new one is selected
      let avatarUrl = user.avatar_url;
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, profileImage);
          
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload profile image");
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
          avatarUrl = urlData.publicUrl;
          setProfileImageUrl(avatarUrl);
        }
      }
      
      // Update user profile
      const updates = {
        bio: bio.trim(),
        username: username.trim() || user.username,
        location: userLocation.trim(),
        avatar_url: avatarUrl,
        is_private: isPrivate
      };
      
      await supabaseService.updateUserProfile(user.id, updates);
      
      // Refresh user data in auth context
      await refreshUserData();
      
      toast.success("Profile updated successfully");
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete the user's account from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }
      
      // Sign out the user after successful deletion
      await supabaseService.signOut();
      toast.success("Your account has been deleted");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        toast.error("Image too large. Please select an image less than 2MB");
        return;
      }
      
      setProfileImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setProfileImageUrl(objectUrl);
    }
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setFilterDialogOpen(false);
    // Apply filtering logic here
  };
  
  const openReviewDialog = (place: SharedPlace) => {
    setSelectedPlace(place);
    setIsReviewDialogOpen(true);
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
            <p className="text-gray-600 mb-8">Please sign in to view your profile and shared places.</p>
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
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-saboris-primary">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="bg-saboris-primary/20 text-saboris-primary">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">@{user.username}</p>
                {user.bio && <p className="mt-2">{user.bio}</p>}
                {user.location && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center justify-center md:justify-start">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    {user.location}
                  </p>
                )}
                
                {/* User Stats */}
                {profileStats && (
                  <div className="flex gap-6 mt-3 justify-center md:justify-start flex-wrap">
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
                  </div>
                )}
                
                {/* Account status indicator (public/private) */}
                <div className="mt-2 flex items-center justify-center md:justify-start">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center">
                    {isPrivate ? (
                      <>
                        <Lock className="h-3 w-3 mr-1" /> 
                        Private Account
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public Account
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  className="border-saboris-primary text-saboris-primary"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Dialog */}
          <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Your Profile</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-5 py-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-saboris-primary">
                      <AvatarImage 
                        src={profileImageUrl || undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-saboris-primary/20 text-saboris-primary">
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <label 
                      htmlFor="profile-photo" 
                      className="absolute bottom-0 right-0 bg-saboris-primary hover:bg-saboris-primary/90 p-1.5 rounded-full cursor-pointer text-white"
                    >
                      <Camera className="h-4 w-4" />
                      <input 
                        id="profile-photo" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={userLocation} 
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="mt-1"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 resize-none"
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="private-mode" 
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="private-mode">
                    Private Account
                  </Label>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {isPrivate ? "Only visible to followers" : "Visible to everyone"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <div className="flex items-center gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      className="bg-saboris-primary hover:bg-saboris-primary/90 text-white flex items-center gap-1"
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
                          <AvatarFallback className="bg-saboris-primary/10">
                            {follower.name?.charAt(0) || '?'}
                          </AvatarFallback>
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
          
          {/* Full Review Dialog */}
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedPlace?.place.name}</DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                {selectedPlace?.rating && (
                  <div className="flex items-center mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < (selectedPlace.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-2 font-medium">{selectedPlace.rating}/5</span>
                  </div>
                )}
                
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedPlace?.review_text || "No detailed review was provided."}
                </p>
                
                {selectedPlace?.place.tags && selectedPlace.place.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedPlace.place.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {selectedPlace?.place.address && (
                  <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedPlace.place.address}
                  </div>
                )}
              </div>
              
              <Button 
                className="mt-2 w-full bg-saboris-primary hover:bg-saboris-primary/90"
                asChild
              >
                <Link to={`/map?place=${selectedPlace?.place_id}`}>
                  <MapPin className="h-4 w-4 mr-1" />
                  View on Map
                </Link>
              </Button>
            </DialogContent>
          </Dialog>
          
          {/* Content Tabs */}
          <Tabs defaultValue="shared" onValueChange={(value) => setActiveTab(value)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger value="shared" className="px-4 py-2 data-[state=active]:bg-white">
                  Shared Places
                </TabsTrigger>
              </TabsList>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setFilterDialogOpen(true)}
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              
              <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Places</DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex flex-col gap-2 py-4">
                    <div className="font-medium">Sort by</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={currentFilter === 'all' ? "default" : "outline"}
                        onClick={() => handleFilterChange('all')}
                        className={currentFilter === 'all' ? "bg-saboris-primary" : ""}
                      >
                        All
                      </Button>
                      <Button 
                        variant={currentFilter === 'ratings' ? "default" : "outline"}
                        onClick={() => handleFilterChange('ratings')}
                        className={currentFilter === 'ratings' ? "bg-saboris-primary" : ""}
                      >
                        Highest Rated
                      </Button>
                      <Button 
                        variant={currentFilter === 'newest' ? "default" : "outline"}
                        onClick={() => handleFilterChange('newest')}
                        className={currentFilter === 'newest' ? "bg-saboris-primary" : ""}
                      >
                        Newest First
                      </Button>
                      <Button 
                        variant={currentFilter === 'oldest' ? "default" : "outline"}
                        onClick={() => handleFilterChange('oldest')}
                        className={currentFilter === 'oldest' ? "bg-saboris-primary" : ""}
                      >
                        Oldest First
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <TabsContent value="shared">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-saboris-primary" />
                  <p className="text-gray-600">Loading your shared places...</p>
                </div>
              ) : sharedPlaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedPlaces.map((place) => (
                    <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openReviewDialog(place)}>
                      <div className="aspect-video w-full overflow-hidden bg-gray-100">
                        <img 
                          src={`https://source.unsplash.com/random/400x300?food&${place.place.name}`}
                          alt={place.place.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{place.place.name}</CardTitle>
                        </div>
                        {place.place.category && (
                          <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full">
                            {place.place.category}
                          </span>
                        )}
                        {place.rating && (
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < place.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className="py-2">
                        {place.review_text ? (
                          <div>
                            <h4 className="text-sm font-medium mb-1">What made this place special?</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{place.review_text}</p>
                          </div>
                        ) : place.place.description ? (
                          <p className="text-sm text-gray-600 line-clamp-2">{place.place.description}</p>
                        ) : null}
                        
                        {place.place.tags && place.place.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {place.place.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index} 
                                className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {place.place.tags.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                +{place.place.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="pt-0 pb-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-saboris-primary border-saboris-primary"
                          asChild
                        >
                          <Link to={`/map?place=${place.place_id}`}>
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>View on Map</span>
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-xl font-medium mb-2">No shared places yet</h3>
                  <p className="text-gray-600 mb-4">Start adding your favorite places to share with others</p>
                  <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
                    <Link to="/add-place">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add a New Place
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Add Place CTA */}
          <div className="mt-10 text-center">
            <Link to="/add-place">
              <Button className="bg-saboris-primary hover:bg-saboris-primary/90 flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Add a New Place
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default ProfilePage;
