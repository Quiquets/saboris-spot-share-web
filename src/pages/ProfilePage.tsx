
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import SocialListsContainer from "@/components/profile/SocialListsContainer";
import ReviewDialog from "@/components/profile/ReviewDialog";
import SharedPlaces from "@/components/profile/SharedPlaces";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileUnauthenticated from "@/components/profile/ProfileUnauthenticated";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import { useProfileReviews } from "@/hooks/useProfileReviews";
import { supabaseService } from "@/services/supabaseService";
import { User } from "@/types/global";
import { toast } from "sonner";

const ProfilePage = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading, refreshUserData } = useAuth();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // Determine the target user ID and whether this is own profile
  const targetUserId = routeUserId || user?.id;
  const isOwnProfile = user && targetUserId === user.id;

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authLoading) return;
      
      if (!targetUserId) {
        setViewedUser(null);
        return;
      }

      if (isOwnProfile && user) {
        // Use authenticated user data for own profile
        setViewedUser(user);
        return;
      }

      if (routeUserId && routeUserId !== user?.id) {
        // Load external user profile
        try {
          setUserLoading(true);
          const profile = await supabaseService.getUserProfile(routeUserId);
          if (profile) {
            setViewedUser(profile);
          } else {
            toast.error("User profile not found");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load user profile");
        } finally {
          setUserLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [user, routeUserId, authLoading, isOwnProfile, targetUserId]);

  // Show loading while auth is loading or user profile is loading
  if (authLoading || userLoading) {
    return <ProfileLoading />;
  }

  // Show unauthenticated state if no user and no route userId
  if (!user && !routeUserId) {
    return <ProfileUnauthenticated />;
  }

  // Show unauthenticated if no target user ID determined
  if (!targetUserId) {
    return <ProfileUnauthenticated />;
  }

  // Show loading if we don't have the viewed user data yet
  if (!viewedUser) {
    return <ProfileLoading />;
  }

  // Use profile data hooks
  const {
    sharedPlaces,
    profileStats,
    loading: profileDataLoading,
    isPrivate,
    setIsPrivate,
    followers,
    following,
    bio,
    setBio,
    name,
    setName,
    username,
    setUsername,
    userLocation, 
    setUserLocation,
    profileImageUrl,
    setProfileImageUrl,
    fetchProfileData,
    fetchFollowers,
    fetchFollowing,
  } = useProfileData(user, targetUserId);

  // Edit profile hooks
  const {
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount,
  } = useProfileEdit(
    user, 
    async () => {
      await refreshUserData(); 
      await fetchProfileData(); 
      setIsEditProfileOpen(false);
    },
    bio,
    setBio,
    name,
    setName,
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

  // Reviews dialog
  const {
    selectedPlace,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    openReviewDialog,
  } = useProfileReviews();

  // Create header user object with proper data hierarchy
  const headerUser: User = {
    id: targetUserId,
    name: name || viewedUser.name || "User",
    username: username || viewedUser.username || "username",
    bio: bio || viewedUser.bio || "",
    avatar_url: profileImageUrl || viewedUser.avatar_url || undefined,
    email: viewedUser.email || "",
    location: userLocation || viewedUser.location || "",
    is_private: isPrivate,
    isCommunityMember: viewedUser.isCommunityMember || false
  };
  
  const effectiveUserLocation = userLocation || viewedUser.location;

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader
            user={headerUser}
            isOwnProfile={!!isOwnProfile}
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
            userLocation={effectiveUserLocation}
          />

          {/* Edit Profile Dialog (own profile only) */}
          {isOwnProfile && user && (
            <EditProfileDialog
              isOpen={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
              user={user}
              name={name}
              setName={setName}
              username={username}
              setUsername={setUsername}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              bio={bio}
              setBio={setBio}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
              profileImageUrl={profileImageUrl}
              handleFileChange={handleFileChange}
              handleSaveProfile={handleSaveProfile}
              handleDeleteAccount={handleDeleteAccount}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Followers / Following overlay */}
          <SocialListsContainer
            followers={showFollowers ? followers : []}
            following={showFollowing ? following : []}
            showFollowers={showFollowers}
            showFollowing={showFollowing}
            setShowFollowers={setShowFollowers}
            setShowFollowing={setShowFollowing}
          />

          {/* Review Dialog */}
          {selectedPlace && (
            <ReviewDialog
              isOpen={isReviewDialogOpen}
              onOpenChange={setIsReviewDialogOpen}
              selectedPlace={selectedPlace}
              onPlaceDeleted={fetchProfileData}
            />
          )}

          {/* Shared Places grid */}
          <div id="shared-places-section">
            <SharedPlaces
              loading={profileDataLoading}
              sharedPlaces={sharedPlaces}
              openReviewDialog={isOwnProfile ? openReviewDialog : (place) => { 
                if (place && place.place) { 
                  toast.info(`Viewing details for ${place.place.name}`);
                } else if (selectedPlace && selectedPlace.place) { 
                   toast.info(`Viewing details for ${selectedPlace.place.name}`);
                }
              }}
              refreshPlaces={fetchProfileData}
              isOwnProfile={!!isOwnProfile}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default ProfilePage;
