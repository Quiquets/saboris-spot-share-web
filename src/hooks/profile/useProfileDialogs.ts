
import { useState } from 'react';

export const useProfileDialogs = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const openFollowersDialog = () => {
    setShowFollowers(true);
    setShowFollowing(false);
  };

  const openFollowingDialog = () => {
    setShowFollowing(true);
    setShowFollowers(false);
  };

  const closeAllDialogs = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  return {
    isEditProfileOpen,
    setIsEditProfileOpen,
    showFollowers,
    showFollowing,
    setShowFollowers,
    setShowFollowing,
    openFollowersDialog,
    openFollowingDialog,
    closeAllDialogs
  };
};
