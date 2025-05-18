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

const ProfilePage = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading, refreshUserData } = useAuth();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);

  // Determine if we're viewing our own profile or someone else's
  useEffect(() => {
    if (authLoading) return;

    const currentViewingUserId = routeUserId || user?.id;

    if (user && currentViewingUserId) {
      const own = user.id === currentViewingUserId;
      setIsOwnProfile(own);
      if (!own) {
        supabaseService.getUserProfile(currentViewingUserId)
          .then((profile) => setViewedUser(profile))
          .catch(console.error);
      } else {
        setViewedUser(user as User);
      }
    } else if (!user && routeUserId) {
      setIsOwnProfile(false);
      supabaseService.getUserProfile(routeUserId)
          .then((profile) => setViewedUser(profile))
          .catch(console.error);
    }
  }, [user, routeUserId, authLoading]);

  if (authLoading) return <ProfileLoading />;
  if (!user) return <ProfileUnauthenticated />;

  const targetUserId = routeUserId || user?.id;

  if (!targetUserId) {
    return <ProfileUnauthenticated />;
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

  // Determine who to show in header
  const displayUserForHeader = isOwnProfile ? user : viewedUser;

  if (profileDataLoading && !displayUserForHeader) return <ProfileLoading />;

  const headerUser = displayUserForHeader || {
    id: targetUserId,
    name: name || "User",
    username: username || "username",
    bio: bio || "",
    avatar_url: profileImageUrl || undefined,
    email: "",
  } as User;

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
          <SharedPlaces
            loading={profileDataLoading}
            sharedPlaces={sharedPlaces}
            openReviewDialog={isOwnProfile ? openReviewDialog : () => {
              if (selectedPlace) toast.info(`Viewing details for ${selectedPlace.place.name}`);
            }}
            refreshPlaces={fetchProfileData}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default ProfilePage;
