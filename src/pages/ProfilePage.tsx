
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
  console.log('ProfilePage: Component starting to render');
  
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

  console.log('ProfilePage: State after useProfilePageState', {
    hasUser: !!user,
    targetUserId,
    isOwnProfile,
    hasViewedUser: !!viewedUser,
    authLoading,
    userLoading,
    pageReady
  });

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

  // Show loading while still initializing
  if (authLoading || userLoading || !pageReady) {
    console.log('ProfilePage: Showing loading state:', { authLoading, userLoading, pageReady });
    return <ProfileLoading />;
  }

  // Show unauthenticated state if no user and no route userId
  if (!user && !targetUserId) {
    console.log('ProfilePage: Showing unauthenticated - no user, no target');
    return <ProfileUnauthenticated />;
  }

  // If we have a target user ID but no viewed user data, something went wrong
  if (targetUserId && !viewedUser) {
    console.log('ProfilePage: Error - Have target user ID but no viewed user data');
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-gray-600">The requested profile could not be loaded.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Must have viewedUser at this point
  if (!viewedUser) {
    console.log('ProfilePage: Unexpected - No viewed user data available');
    return <ProfileLoading />;
  }

  console.log('ProfilePage: About to render main content for user:', viewedUser.id);

  // Use profile data hooks - Add error boundary here
  let profileDataHookResult;
  try {
    profileDataHookResult = useProfileData(user, targetUserId);
    console.log('ProfilePage: useProfileData result:', {
      loading: profileDataHookResult.loading,
      hasSharedPlaces: !!profileDataHookResult.sharedPlaces,
      hasProfileStats: !!profileDataHookResult.profileStats
    });
  } catch (error) {
    console.error('ProfilePage: Error in useProfileData:', error);
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
            <p className="text-gray-600">There was an error loading the profile data.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

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
  } = profileDataHookResult;

  // Edit profile hooks - Add error boundary here
  let profileEditHookResult;
  try {
    profileEditHookResult = useProfileEdit(
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
    console.log('ProfilePage: useProfileEdit result:', {
      isSubmitting: profileEditHookResult.isSubmitting
    });
  } catch (error) {
    console.error('ProfilePage: Error in useProfileEdit:', error);
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
            <p className="text-gray-600">There was an error loading the profile edit functionality.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const {
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount,
  } = profileEditHookResult;

  // Reviews dialog - Add error boundary here
  let profileReviewsHookResult;
  try {
    profileReviewsHookResult = useProfileReviews();
    console.log('ProfilePage: useProfileReviews result:', {
      hasSelectedPlace: !!profileReviewsHookResult.selectedPlace,
      isReviewDialogOpen: profileReviewsHookResult.isReviewDialogOpen
    });
  } catch (error) {
    console.error('ProfilePage: Error in useProfileReviews:', error);
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
            <p className="text-gray-600">There was an error loading the profile reviews functionality.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const {
    selectedPlace,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    openReviewDialog,
  } = profileReviewsHookResult;

  console.log('ProfilePage: About to render ProfilePageContent');

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
