
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileStats, supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EditProfileDialog from '@/components/profile/EditProfileDialog';
import FollowersList from '@/components/profile/FollowersList';
import ReviewDialog from '@/components/profile/ReviewDialog';
import SharedPlaces from '@/components/profile/SharedPlaces';
import { SharedPlace } from '@/types/profile';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SharedPlace | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    document.title = 'Saboris - Profile';
    
    fetchProfileData();
  }, [user]);

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
        .select('id, name, description, category, address, tags, created_by')
        .eq('created_by', userId);
      
      if (placesError) throw placesError;
      
      // Get reviews created by this user
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, place_id, created_at, rating_food, rating_service, rating_atmosphere, rating_value, text, photo_url, photo_urls, places:place_id(id, name, description, category, address, tags, created_by)')
        .eq('user_id', userId);
      
      if (reviewsError) throw reviewsError;

      // Combine both types of shared content
      const createdPlaces: SharedPlace[] = (placesData || []).map(place => ({
        id: place.id,
        place_id: place.id,
        created_at: new Date(),
        created_by: place.created_by,
        place: {
          name: place.name,
          description: place.description,
          tags: place.tags,
          category: place.category,
          address: place.address
        }
      }));
      
      const reviewedPlaces: SharedPlace[] = (reviewsData || []).map(review => {
        // Use rating_value if available, otherwise calculate the average
        const avgRating = review.rating_value !== null ? 
          review.rating_value : 
          (review.rating_food && review.rating_service && review.rating_atmosphere) ?
            Math.round((review.rating_food + review.rating_service + review.rating_atmosphere) / 3) :
            undefined;
            
        return {
          id: review.id,
          place_id: review.place_id,
          created_at: new Date(review.created_at),
          created_by: userId,
          place: review.places || { name: 'Unknown Place' },
          rating: avgRating,
          review_text: review.text,
          photo_urls: review.photo_urls || (review.photo_url ? [review.photo_url] : [])
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
        
        // Check if avatars bucket exists, create it if not
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarBucketExists = buckets?.some(b => b.name === 'avatars');
        
        if (!avatarBucketExists) {
          await supabase.storage.createBucket('avatars', { public: true });
        }
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, profileImage, {
            cacheControl: '3600',
            upsert: true
          });
          
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
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
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
    } catch (error: any) {
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
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Sign In Required</h1>
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
          <ProfileHeader 
            user={user}
            profileStats={profileStats}
            isPrivate={isPrivate}
            setIsEditProfileOpen={setIsEditProfileOpen}
            fetchFollowers={fetchFollowers}
          />
          
          {/* Edit Profile Dialog */}
          <EditProfileDialog 
            isOpen={isEditProfileOpen}
            onOpenChange={setIsEditProfileOpen}
            user={user}
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            bio={bio}
            setBio={setBio}
            username={username}
            setUsername={setUsername}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            profileImageUrl={profileImageUrl}
            handleFileChange={handleFileChange}
            handleSaveProfile={handleSaveProfile}
            handleDeleteAccount={handleDeleteAccount}
            isSubmitting={isSubmitting}
          />
          
          {/* Followers Modal */}
          {showFollowers && <FollowersList followers={followers} setShowFollowers={setShowFollowers} />}
          
          {/* Full Review Dialog */}
          <ReviewDialog 
            isOpen={isReviewDialogOpen}
            onOpenChange={setIsReviewDialogOpen}
            selectedPlace={selectedPlace}
            onPlaceDeleted={fetchProfileData}
          />
          
          {/* Shared Places */}
          <SharedPlaces 
            loading={loading}
            sharedPlaces={sharedPlaces}
            openReviewDialog={openReviewDialog}
            refreshPlaces={fetchProfileData}
          />
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default ProfilePage;
