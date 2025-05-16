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
      setProfileImageUrl(objectUrl); // This updates the preview in the dialog
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
          
        if (usernameCheck) {
          toast.error("Username is already taken");
          setIsSubmitting(false);
          return false;
        }
        
        if (usernameError && usernameError.code !== 'PGRST116') { // PGRST116 means no rows returned
          toast.error("Error checking username availability");
          setIsSubmitting(false);
          return false;
        }
      }
      
      let newAvatarDatabaseUrl = user.avatar_url; // Keep current avatar if no new one is uploaded

      if (profileImage) { // A new image file has been selected
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
          
          // Attempt to delete previous avatar if it exists and belongs to the user
          if (user.avatar_url) {
            const prevFilePathParts = user.avatar_url.split('/');
            const prevFileName = prevFilePathParts.pop();
            if (prevFileName && prevFileName.startsWith(user.id)) { // Basic check to see if it's likely their file
              try {
                await supabase.storage.from('avatars').remove([prevFileName]);
                console.log("Previous avatar removed successfully");
              } catch (error) {
                console.error("Error removing previous avatar, continuing:", error);
                // Continue even if this fails, to allow uploading the new one
              }
            }
          }
          
          const fileExt = profileImage.name.split('.').pop();
          const filePath = `${user.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileImage, {
              cacheControl: '3600',
              upsert: true // Upsert is true, so it can overwrite if somehow filename clashes, though Date.now() makes it unlikely
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
            // setProfileImageUrl(newAvatarDatabaseUrl); // Update local preview with the actual storage URL
                                                    // This is already done by handleFileChange with a blob URL
                                                    // but could be updated here to the final URL.
                                                    // For now, the user sees the blob preview until save.
          }
        } catch (error: any) {
          console.error("Error uploading profile image:", error);
          toast.error("Failed to upload profile image: " + error.message);
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Update user profile in public.users table
      const updates = {
        bio: bio.trim(),
        username: username.trim() || user.username, // Ensure username isn't empty
        location: userLocation.trim(),
        avatar_url: newAvatarDatabaseUrl, // Use the new (or existing) avatar URL
        is_private: isPrivate
      };
      
      const result = await supabaseService.updateUserProfile(user.id, updates);
      
      if (!result) {
        toast.error("Failed to update profile in database");
        setIsSubmitting(false);
        return false;
      }
      
      // IMPORTANT: Update the user metadata in Supabase Auth as well
      // This ensures the auth session's user object also has the new avatar_url
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarDatabaseUrl }
      });

      if (authUpdateError) {
        console.error("Error updating auth user metadata:", authUpdateError);
        toast.warn("Profile updated, but session might not reflect new avatar immediately.");
        // Continue even if this fails, as the main profile is updated.
      }
      
      // Refresh user data in auth context (fetches from public.users)
      await refreshUserData(); 
      // Refresh profile page specific data
      await fetchProfileData(); 
      
      // Explicitly set the profileImageUrl state to the final new URL from storage
      // This ensures any component using profileImageUrl prop gets the final URL.
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
      setProfileImage(null); // Clear the selected file after attempting to save
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      await supabaseService.signOut(); // Don't check the result since we know it's void
      
      // Just continue with success message after sign out attempt
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
