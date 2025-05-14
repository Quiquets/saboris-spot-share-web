
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { User } from '@/types/global';
import { toast } from 'sonner';

export const useProfileEdit = (
  user: User | null,
  refreshUserData: () => Promise<void>,
  bio: string, 
  setBio: (value: string) => void,
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        toast.error("Image too large. Please select an image less than 2MB");
        return;
      }
      
      setProfileImage(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setProfileImageUrl(objectUrl);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return false;
    
    try {
      setIsSubmitting(true);
      
      // First check if username is already taken (if changed)
      if (username !== user.username && username.trim() !== '') {
        const { data: usernameCheck, error: usernameError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
          
        if (usernameCheck || usernameError) {
          if (usernameCheck) {
            toast.error("Username is already taken");
            return false;
          }
        }
      }
      
      // Upload profile image if new one is selected
      let avatarUrl = user.avatar_url;
      if (profileImage) {
        try {
          // Check if avatars bucket exists, if not, create it
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(b => b.name === 'avatars');
          
          if (!bucketExists) {
            await supabase.storage.createBucket('avatars', { 
              public: true,
              fileSizeLimit: 2097152 // 2MB in bytes
            });
          }
          
          // First try to delete previous avatar if exists
          if (user.avatar_url) {
            try {
              const prevFilePath = user.avatar_url.split('/').pop();
              if (prevFilePath && prevFilePath.startsWith(user.id)) {
                await supabase.storage.from('avatars').remove([prevFilePath]);
                console.log("Previous avatar removed successfully");
              }
            } catch (error) {
              console.error("Error removing previous avatar:", error);
              // Continue even if this fails
            }
          }
          
          const fileExt = profileImage.name.split('.').pop();
          const filePath = `${user.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileImage, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast.error("Failed to upload profile image: " + uploadError.message);
            return false;
          } else {
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
              
            avatarUrl = urlData.publicUrl;
            setProfileImageUrl(avatarUrl);
          }
        } catch (error: any) {
          console.error("Error uploading profile image:", error);
          toast.error("Failed to upload profile image: " + error.message);
          return false;
        }
      }
      
      // Update user profile
      const updates = {
        bio: bio.trim(),
        username: username.trim() || user.username,
        location: userLocation.trim(),
        avatar_url: avatarUrl,
        is_private: isPrivate
      };
      
      const { error: updateError } = await supabaseService.updateUserProfile(user.id, updates);
      
      if (updateError) {
        toast.error("Failed to update profile: " + updateError.message);
        return false;
      }
      
      // Refresh user data in auth context
      await refreshUserData();
      await fetchProfileData();
      
      toast.success("Profile updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Use supabaseService to handle auth user deletion properly
      const { error } = await supabaseService.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Your account has been deleted");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  return {
    profileImage,
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount
  };
};
