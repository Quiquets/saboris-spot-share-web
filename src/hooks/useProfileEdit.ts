
import { useState } from "react";
import { User } from "@/types/global";
import { useProfileValidation } from "./profile/useProfileValidation";
import { useProfileImageUpload } from "./profile/useProfileImageUpload";
import { useProfileUpdate } from "./profile/useProfileUpdate";

export const useProfileEdit = (
  user: User | null,
  refreshUserData: () => Promise<void>,
  bio: string,
  setBio: (value: string) => void,
  name: string,
  setName: (value: string) => void,
  username: string,
  setUsername: (value: string) => void,
  userLocation: string,
  setUserLocation: (value: string) => void,
  isPrivate: boolean,
  setIsPrivate: (value: boolean) => void,
  profileImageUrl: string | null,
  setProfileImageUrl: (value: string | null) => void,
  fetchProfileData: () => Promise<void>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validateProfile } = useProfileValidation();
  const { 
    profileImageFile, 
    handleFileChange, 
    uploadProfileImage, 
    resetImageFile 
  } = useProfileImageUpload(profileImageUrl, setProfileImageUrl);
  const { updateProfile, deleteAccount } = useProfileUpdate();

  const handleSaveProfile = async () => {
    if (!user) {
      return false;
    }

    // Validate profile data
    const isValid = await validateProfile(user, username, name);
    if (!isValid) {
      return false;
    }

    setIsSubmitting(true);
    try {
      // Upload image if needed
      const newAvatarDatabaseUrl = await uploadProfileImage(user);

      const updates = {
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: userLocation.trim(),
        avatar_url: newAvatarDatabaseUrl,
        is_private: isPrivate,
      };

      const success = await updateProfile(user, updates);
      if (!success) {
        return false;
      }

      await refreshUserData();
      await fetchProfileData();
      setProfileImageUrl(updates.avatar_url);

      return true;
    } catch (err: any) {
      console.error("Error saving profile:", err);
      return false;
    } finally {
      setIsSubmitting(false);
      resetImageFile();
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount(user);
  };

  return {
    profileImageFile,
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount,
  };
};
