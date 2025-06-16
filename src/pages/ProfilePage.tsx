
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ProfilePageContent from "@/components/profile/ProfilePageContent";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileUnauthenticated from "@/components/profile/ProfileUnauthenticated";
import { useProfilePageState } from "@/hooks/profile/useProfilePageState";
import { useProfileDialogs } from "@/hooks/profile/useProfileDialogs";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import { useProfileReviews } from "@/hooks/useProfileReviews";

const ProfilePage = () => {
  const { refreshUserData } = useAuth();
  
  // Profile page state management
  const {
    user,
    targetUserId,
    isOwnProfile,
    viewedUser,
    authLoading,
    userLoading,
    pageReady
  } = useProfilePageState();

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

  console.log('ProfilePage render - state check:', {
    authLoading,
    userLoading,
    pageReady,
    hasUser: !!user,
    hasViewedUser: !!viewedUser,
    targetUserId,
    isOwnProfile
  });

  // Show loading while auth is loading or user profile is loading
  if (authLoading || userLoading || !pageReady) {
    console.log('Showing loading state:', { authLoading, userLoading, pageReady });
    return <ProfileLoading />;
  }

  // Show unauthenticated state if no user and no route userId
  if (!user && !targetUserId) {
    console.log('Showing unauthenticated - no user, no target');
    return <ProfileUnauthenticated />;
  }

  // Show loading if we don't have the viewed user data yet
  if (!viewedUser) {
    console.log('Showing loading - no viewed user data');
    return <ProfileLoading />;
  }

  console.log('Rendering main profile content');

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

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        <ProfilePageContent
          viewedUser={viewedUser}
          isOwnProfile={!!isOwnProfile}
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
}

export default ProfilePage;
