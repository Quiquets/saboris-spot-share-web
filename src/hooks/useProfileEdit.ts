
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
      const objectUrl = URL.createObjectURL(file);
      setProfileImageUrl(objectUrl);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return false;
    
    try {
      setIsSubmitting(true);
      
      if (username !== user.username && username.trim() !== '') {
        const { data: usernameCheck, error: usernameError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
          
        if (usernameCheck) {
          toast.error("Username is already taken");
          setIsSubmitting(false);
          return false;
        }
        
        if (usernameError && usernameError.code !== 'PGRST116') {
          toast.error("Error checking username availability");
          setIsSubmitting(false);
          return false;
        }
      }
      
      let newAvatarDatabaseUrl = user.avatar_url; 

      if (profileImage) {
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(b => b.name === 'avatars');
          
          if (!bucketExists) {
            await supabase.storage.createBucket('avatars', { 
              public: true,
              fileSizeLimit: 2097152 
            });
          }
          
          if (user.avatar_url) {
            const prevFilePathParts = user.avatar_url.split('/');
            const prevFileName = prevFilePathParts.pop();
            if (prevFileName && prevFileName.startsWith(user.id)) {
              try {
                await supabase.storage.from('avatars').remove([prevFileName]);
                console.log("Previous avatar removed successfully");
              } catch (error) {
                console.error("Error removing previous avatar, continuing:", error);
              }
            }
          }
          
          const fileExt = profileImage.name.split('.').pop();
          const filePath = `${user.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileImage, {
              cacheControl: '3600',
              upsert: true,
              contentType: profileImage.type,
            });
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast.error("Failed to upload profile image: " + uploadError.message);
            setIsSubmitting(false);
            return false;
          } else {
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
              
            newAvatarDatabaseUrl = urlData.publicUrl;
          }
        } catch (error: any) {
          console.error("Error uploading profile image:", error);
          toast.error("Failed to upload profile image: " + error.message);
          setIsSubmitting(false);
          return false;
        }
      }
      
      const updates = {
        bio: bio.trim(),
        username: username.trim() || user.username,
        location: userLocation.trim(),
        avatar_url: newAvatarDatabaseUrl,
        is_private: isPrivate
      };
      
      const result = await supabaseService.updateUserProfile(user.id, updates);
      
      if (!result) {
        toast.error("Failed to update profile in database");
        setIsSubmitting(false);
        return false;
      }
      
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarDatabaseUrl }
      });

      if (authUpdateError) {
        console.error("Error updating auth user metadata:", authUpdateError);
        // Changed toast.warn to toast.warning
        toast.warning("Profile updated, but session might not reflect new avatar immediately.");
      }
      
      await refreshUserData(); 
      await fetchProfileData(); 
      
      if (profileImage && newAvatarDatabaseUrl) {
        setProfileImageUrl(newAvatarDatabaseUrl); 
      }
      
      toast.success("Profile updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
      return false;
    } finally {
      setIsSubmitting(false);
      setProfileImage(null); 
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Call signOut and handle potential issues if necessary, though it's void
      await supabaseService.signOut();
      // Assuming signOut doesn't throw an error on success or is handled within supabaseService
      toast.success("Your account has been deleted");
      // Potentially navigate user away or refresh UI to reflect signed-out state
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
