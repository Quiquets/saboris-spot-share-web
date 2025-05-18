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

const ProfilePage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading, refreshUserData } = useAuth();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [viewedUser, setViewedUser] = useState<any>(null);

  // Determine if we're viewing our own profile or someone else's
  useEffect(() => {
    if (user && userId) {
      const own = user.id === userId;
      setIsOwnProfile(own);
      if (!own) {
        supabaseService.getUserProfile(userId!)
          .then((u) => setViewedUser(u))
          .catch(console.error);
      }
    }
  }, [user, userId]);

  if (authLoading) return <ProfileLoading />;
  if (!user) return <ProfileUnauthenticated />;

  const targetUserId = userId || user.id;

  // 1) Fetch all profile data (including name & username)
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
    name,           // ← display name
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
    // on successful save, also refresh auth and close dialog
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

  // Who to show in header
  const displayUser = isOwnProfile
    ? user
    : viewedUser || {
        ...user,
        id: targetUserId,
        name,
        username,
        bio,
        avatar_url: profileImageUrl,
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
              name: displayUser.name,
              username,
              bio,
              avatar_url: profileImageUrl,
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

          {/* Edit Profile Dialog (own profile only) */}
          {isOwnProfile && (
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
          <ReviewDialog
            isOpen={isReviewDialogOpen}
            onOpenChange={setIsReviewDialogOpen}
            selectedPlace={selectedPlace}
            onPlaceDeleted={fetchProfileData}
          />

          {/* Shared Places grid */}
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
}

export default ProfilePage;
