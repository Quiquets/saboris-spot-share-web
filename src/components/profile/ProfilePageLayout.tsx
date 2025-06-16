
import React from "react";
import { User } from "@/types/global";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileDialogs } from "@/hooks/profile/useProfileDialogs";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import { useProfileReviews } from "@/hooks/useProfileReviews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfilePageContent from "./ProfilePageContent";

interface ProfilePageLayoutProps {
  user: User | null;
  viewedUser: User;
  isOwnProfile: boolean;
  targetUserId?: string;
}

const ProfilePageLayout: React.FC<ProfilePageLayoutProps> = ({
  user,
  viewedUser,
  isOwnProfile,
  targetUserId
}) => {
  const { refreshUserData } = useAuth();

  // Dialog management
  const {
    isEditProfileOpen,
    setIsEditProfileOpen,
    showFollowers,
    showFollowing,
    setShowFollowers,
    setShowFollowing,
    openFollowersDialog,
    openFollowingDialog
  } = useProfileDialogs();

  // Use profile data hooks with fallbacks instead of null checks
  const {
    sharedPlaces = [],
    profileStats = null,
    loading: profileDataLoading = false,
    isPrivate = false,
    setIsPrivate = () => {},
    followers = [],
    following = [],
    bio = '',
    setBio = () => {},
    name = '',
    setName = () => {},
    username = '',
    setUsername = () => {},
    userLocation = '', 
    setUserLocation = () => {},
    profileImageUrl = null,
    setProfileImageUrl = () => {},
    fetchProfileData = async () => {},
    fetchFollowers = async () => {},
    fetchFollowing = async () => {},
  } = useProfileData(user, targetUserId) || {};

  // Edit profile hooks with fallbacks
  const {
    isSubmitting = false,
    handleFileChange = () => {},
    handleSaveProfile = async () => false,
    handleDeleteAccount = () => {},
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
  ) || {};

  // Reviews dialog with fallbacks
  const {
    selectedPlace = null,
    isReviewDialogOpen = false,
    setIsReviewDialogOpen = () => {},
    openReviewDialog = () => {},
  } = useProfileReviews() || {};

  console.log('ProfilePageLayout: About to render ProfilePageContent');

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8">
        <ProfilePageContent
          viewedUser={viewedUser}
          isOwnProfile={isOwnProfile}
          sharedPlaces={sharedPlaces}
          profileStats={profileStats}
          profileDataLoading={profileDataLoading}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          bio={bio}
          setBio={setBio}
          name={name}
          setName={setName}
          username={username}
          setUsername={setUsername}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          profileImageUrl={profileImageUrl}
          setProfileImageUrl={setProfileImageUrl}
          followers={followers}
          following={following}
          fetchFollowers={fetchFollowers}
          fetchFollowing={fetchFollowing}
          isEditProfileOpen={isEditProfileOpen}
          setIsEditProfileOpen={setIsEditProfileOpen}
          showFollowers={showFollowers}
          showFollowing={showFollowing}
          setShowFollowers={setShowFollowers}
          setShowFollowing={setShowFollowing}
          openFollowersDialog={openFollowersDialog}
          openFollowingDialog={openFollowingDialog}
          isSubmitting={isSubmitting}
          handleFileChange={handleFileChange}
          handleSaveProfile={handleSaveProfile}
          handleDeleteAccount={handleDeleteAccount}
          selectedPlace={selectedPlace}
          isReviewDialogOpen={isReviewDialogOpen}
          setIsReviewDialogOpen={setIsReviewDialogOpen}
          openReviewDialog={openReviewDialog}
          fetchProfileData={fetchProfileData}
        />
      </div>
      <Footer />
    </main>
  );
};

export default ProfilePageLayout;
