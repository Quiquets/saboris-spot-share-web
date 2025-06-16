
import React from "react";
import { useProfilePageState } from "@/hooks/profile/useProfilePageState";
import ProfilePageLayout from "@/components/profile/ProfilePageLayout";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileUnauthenticated from "@/components/profile/ProfileUnauthenticated";
import ProfileNotFound from "@/components/profile/ProfileNotFound";

const ProfilePage = () => {
  console.log('ProfilePage: Component starting to render');
  
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
    return <ProfileNotFound />;
  }

  // Must have viewedUser at this point
  if (!viewedUser) {
    console.log('ProfilePage: Unexpected - No viewed user data available');
    return <ProfileLoading />;
  }

  console.log('ProfilePage: About to render main content for user:', viewedUser.id);

  return (
    <ProfilePageLayout 
      user={user}
      viewedUser={viewedUser}
      isOwnProfile={!!isOwnProfile}
      targetUserId={targetUserId}
    />
  );
}

export default ProfilePage;
