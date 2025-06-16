
import React from 'react';
import { User } from '@/types/global';
import { ProfileStats } from '@/services/supabaseService';
import { SharedPlace } from '@/types/profile';
import ProfileHeader from './ProfileHeader';
import EditProfileDialog from './EditProfileDialog';
import SocialListsContainer from './SocialListsContainer';
import ReviewDialog from './ReviewDialog';
import SharedPlaces from './SharedPlaces';

interface ProfilePageContentProps {
  viewedUser: User;
  isOwnProfile: boolean;
  // Profile data
  sharedPlaces: SharedPlace[];
  profileStats: ProfileStats | null;
  profileDataLoading: boolean;
  // Profile settings
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
  bio: string;
  setBio: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  userLocation: string;
  setUserLocation: (value: string) => void;
  profileImageUrl: string | null;
  setProfileImageUrl: (value: string | null) => void;
  // Followers/Following
  followers: any[];
  following: any[];
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
  // Dialog states
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  showFollowers: boolean;
  showFollowing: boolean;
  setShowFollowers: (value: boolean) => void;
  setShowFollowing: (value: boolean) => void;
  openFollowersDialog: () => void;
  openFollowingDialog: () => void;
  // Edit profile
  isSubmitting: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: () => Promise<boolean>;
  handleDeleteAccount: () => void;
  // Reviews
  selectedPlace: SharedPlace | null;
  isReviewDialogOpen: boolean;
  setIsReviewDialogOpen: (value: boolean) => void;
  openReviewDialog: (place: SharedPlace) => void;
  // Data refresh
  fetchProfileData: () => Promise<void>;
}

const ProfilePageContent: React.FC<ProfilePageContentProps> = ({
  viewedUser,
  isOwnProfile,
  sharedPlaces,
  profileStats,
  profileDataLoading,
  isPrivate,
  setIsPrivate,
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
  followers,
  following,
  fetchFollowers,
  fetchFollowing,
  isEditProfileOpen,
  setIsEditProfileOpen,
  showFollowers,
  showFollowing,
  setShowFollowers,
  setShowFollowing,
  openFollowersDialog,
  openFollowingDialog,
  isSubmitting,
  handleFileChange,
  handleSaveProfile,
  handleDeleteAccount,
  selectedPlace,
  isReviewDialogOpen,
  setIsReviewDialogOpen,
  openReviewDialog,
  fetchProfileData
}) => {
  // Create header user object with proper data hierarchy
  const headerUser: User = {
    id: viewedUser.id,
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
          openFollowersDialog();
        }}
        fetchFollowing={async () => {
          await fetchFollowing();
          openFollowingDialog();
        }}
        userLocation={effectiveUserLocation}
      />

      {/* Edit Profile Dialog (own profile only) */}
      {isOwnProfile && (
        <EditProfileDialog
          isOpen={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          user={viewedUser}
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
              // toast.info(`Viewing details for ${place.place.name}`);
            }
          }}
          refreshPlaces={fetchProfileData}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
};

export default ProfilePageContent;
