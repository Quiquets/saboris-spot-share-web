
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
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // First check if username is already taken (if changed)
      if (username !== user.username && username.trim() !== '') {
        const { data: usernameCheck } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
          
        if (usernameCheck) {
          toast.error("Username is already taken");
          return;
        }
      }
      
      // Upload profile image if new one is selected
      let avatarUrl = user.avatar_url;
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;
        
        // Check if avatars bucket exists, create it if not
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarBucketExists = buckets?.some(b => b.name === 'avatars');
        
        if (!avatarBucketExists) {
          await supabase.storage.createBucket('avatars', { public: true });
        }
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(filePath, profileImage, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload profile image");
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
          avatarUrl = urlData.publicUrl;
          setProfileImageUrl(avatarUrl);
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
      
      await supabaseService.updateUserProfile(user.id, updates);
      
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
      // Delete the user's account from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }
      
      // Sign out the user after successful deletion
      await supabaseService.signOut();
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
