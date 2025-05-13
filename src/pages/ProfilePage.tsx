
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EditProfileDialog from '@/components/profile/EditProfileDialog';
import SocialListsContainer from '@/components/profile/SocialListsContainer';
import ReviewDialog from '@/components/profile/ReviewDialog';
import SharedPlaces from '@/components/profile/SharedPlaces';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileUnauthenticated from '@/components/profile/ProfileUnauthenticated';
import { useProfileData } from '@/hooks/useProfileData';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import { useProfileReviews } from '@/hooks/useProfileReviews';
import { supabaseService } from '@/services/supabaseService';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user, loading: authLoading, refreshUserData } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [viewedUser, setViewedUser] = useState(null);
  
  useEffect(() => {
    // Set document title based on whether viewing own profile or another user's
    if (userId && userId !== user?.id) {
      document.title = 'Saboris - User Profile';
    } else {
      document.title = 'Saboris - My Profile';
    }
  }, [userId, user]);
  
  useEffect(() => {
    // Determine if this is the user's own profile or someone else's
    if (user && userId) {
      const isOwn = user.id === userId;
      setIsOwnProfile(isOwn);
      
      // If not own profile, fetch the viewed user's data
      if (!isOwn) {
        const fetchViewedUserData = async () => {
          try {
            const userData = await supabaseService.getUserProfile(userId);
            setViewedUser(userData);
          } catch (error) {
            console.error("Error fetching viewed user data:", error);
          }
        };
        
        fetchViewedUserData();
      }
    } else {
      setIsOwnProfile(true); // Default to own profile if no userId in URL
    }
  }, [user, userId]);

  // If authentication is still loading, show loading state
  if (authLoading) {
    return <ProfileLoading />;
  }

  // If user is not authenticated, show unauthenticated state
  if (!user) {
    return <ProfileUnauthenticated />;
  }
  
  // Get profile data for either the logged-in user or the profile being viewed
  const targetUserId = userId || user.id;
  
  // Get profile data
  const {
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
  } = useProfileData(user, targetUserId);
  
  // Profile edit functionality - only for own profile
  const {
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount
  } = useProfileEdit(
    user, 
    // Fix: Wrap refreshUserData with a function that ignores the return value
    async () => {
      await refreshUserData();
      return;
    },
    bio,
    setBio,
    username,
    setUsername,
    userLocation,
    setUserLocation,
    isPrivate,
    setIsPrivate,
    profileImageUrl,
    setProfileImageUrl,
    fetchProfileData
  );
  
  // Review dialog functionality
  const {
    selectedPlace,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    openReviewDialog
  } = useProfileReviews();
  
  // Determine which user data to display
  const displayUser = isOwnProfile ? user : viewedUser || {
    ...user,
    id: targetUserId,
    name: username || 'User',
    username: username,
    bio: bio,
    avatar_url: profileImageUrl
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader 
            user={{
              ...displayUser,
              username: username || displayUser.username,
              bio: bio || displayUser.bio,
              avatar_url: profileImageUrl || displayUser.avatar_url
            }}
            isOwnProfile={isOwnProfile}
            profileStats={profileStats}
            isPrivate={isPrivate}
            setIsEditProfileOpen={setIsEditProfileOpen}
            fetchFollowers={async () => {
              await fetchFollowers();
              setShowFollowers(true);
              setShowFollowing(false);
            }}
            fetchFollowing={async () => {
              await fetchFollowing();
              setShowFollowing(true);
              setShowFollowers(false);
            }}
          />
          
          {/* Edit Profile Dialog - only shown for own profile */}
          {isOwnProfile && (
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
          )}
          
          {/* Social Lists */}
          <SocialListsContainer 
            followers={showFollowers ? followers : []} 
            following={showFollowing ? following : []}
            showFollowers={showFollowers}
            showFollowing={showFollowing}
            setShowFollowers={setShowFollowers}
            setShowFollowing={setShowFollowing}
          />
          
          {/* Full Review Dialog */}
          <ReviewDialog 
            isOpen={isReviewDialogOpen}
            onOpenChange={setIsReviewDialogOpen}
            selectedPlace={selectedPlace}
            onPlaceDeleted={fetchProfileData}
          />
          
          {/* Shared Places - Call refreshPlaces to update post counts after changes */}
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
