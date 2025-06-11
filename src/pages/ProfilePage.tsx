
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
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // Determine if we're viewing our own profile or someone else's
  useEffect(() => {
    const loadUserData = async () => {
      if (authLoading) return;

      const targetUserId = routeUserId || user?.id;
      if (!targetUserId) return;

      const isOwn = user && user.id === targetUserId;
      setIsOwnProfile(!!isOwn);

      if (isOwn) {
        // Viewing own profile - use authenticated user data
        setViewedUser(user as User);
      } else {
        // Viewing someone else's profile - fetch their data
        try {
          setUserLoading(true);
          const profile = await supabaseService.getUserProfile(targetUserId);
          if (profile) {
            setViewedUser(profile);
          } else {
            console.warn(`No profile found for user ID: ${targetUserId}`);
            toast.error("User profile not found");
          }
        } catch (error) {
          console.error("Error fetching viewed user profile:", error);
          toast.error("Failed to load user profile");
        } finally {
          setUserLoading(false);
        }
      }
    };

    loadUserData();
  }, [user, routeUserId, authLoading]);

  if (authLoading || userLoading) return <ProfileLoading />;
  
  if (!user && !routeUserId) return <ProfileUnauthenticated />;
  
  const targetUserId = routeUserId || user?.id;

  if (!targetUserId) {
    return <ProfileUnauthenticated />;
  }

  // Get the effective user for display
  const effectiveUser = viewedUser || user;
  if (!effectiveUser) {
    return <ProfileLoading />;
  }

  // 1) Fetch all profile data (including name & username)
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

  // 2) Edit hook with onClose callback to auto‐dismiss dialog
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

  // 3) Reviews dialog
  const {
    selectedPlace,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    openReviewDialog,
  } = useProfileReviews();

  // Create header user object with proper data hierarchy
  const headerUser: User = {
    id: targetUserId,
    name: name || effectiveUser.name || "User",
    username: username || effectiveUser.username || "username",
    bio: bio || effectiveUser.bio || "",
    avatar_url: profileImageUrl || effectiveUser.avatar_url || undefined,
    email: effectiveUser.email || "",
    location: userLocation || effectiveUser.location || "",
    is_private: isPrivate,
    isCommunityMember: effectiveUser.isCommunityMember || false
  };
  
  const effectiveUserLocation = userLocation || effectiveUser.location;

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader
            user={headerUser}
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
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default ProfilePage;
