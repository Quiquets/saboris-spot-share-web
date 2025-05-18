
import React from 'react';
import { Button } from '@/components/ui/button';
import FollowButton from '../FollowButton'; // Adjusted path
import { User } from '@/types/global';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  currentUser: User | null;
  profileUser: User;
  isFollowing: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  onFollowStatusChange: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwnProfile,
  currentUser,
  profileUser,
  isFollowing,
  setIsEditProfileOpen,
  onFollowStatusChange,
}) => {
  return (
    <div className="mt-2 sm:mt-0">
      {isOwnProfile ? (
        <Button
          variant="outline"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full sm:w-auto"
          size="sm"
        >
          Edit Profile
        </Button>
      ) : currentUser && profileUser?.id ? (
        <FollowButton
          currentUser={currentUser}
          profileUser={profileUser}
          isFollowing={isFollowing}
          onFollowStatusChange={onFollowStatusChange}
        />
      ) : null}
    </div>
  );
};

export default ProfileActions;
