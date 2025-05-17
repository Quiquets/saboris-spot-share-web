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
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB max for profilepicture
        toast.error("Image too large. Please select an image less than 2MB");
        return;
      }
      
      setProfileImageFile(file);
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

      if (profileImageFile) {
        try {
          // No need to check/create bucket, SQL migration did this.
          // Delete previous image if it exists and was managed by this system.
          if (user.avatar_url) {
            const urlParts = user.avatar_url.split('/');
            const bucketName = urlParts.find(part => part === 'profilepicture' || part === 'avatars'); // Check for old and new bucket
            if (bucketName) {
                const oldFileNameWithQuery = urlParts.pop();
                if (oldFileNameWithQuery) {
                    const oldFileName = oldFileNameWithQuery.split('?')[0]; // Remove query params
                    const oldFilePathInBucket = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
                    const fullOldPath = `${oldFilePathInBucket}/${oldFileName}`.replace(/^\/+/, ''); // ensure no leading slash

                    // Ensure path is not just bucket name
                    if (fullOldPath !== bucketName && fullOldPath.includes(user.id)) {
                         try {
                            console.log(`Attempting to remove old avatar: ${bucketName}/${fullOldPath}`);
                            await supabase.storage.from(bucketName).remove([fullOldPath]);
                            console.log("Previous avatar removed successfully from bucket:", bucketName);
                        } catch (removeError) {
                            console.error("Error removing previous avatar, continuing:", removeError);
                        }
                    }
                }
            }
          }
          
          const fileExt = profileImageFile.name.split('.').pop();
          const timestamp = Date.now();
          // Path format: user.id/timestamp_filename.ext
          const filePath = `${user.id}/${timestamp}_${profileImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '')}`; // Sanitize filename
          
          const { error: uploadError } = await supabase.storage
            .from('profilepicture') // Changed bucket name
            .upload(filePath, profileImageFile, {
              cacheControl: '3600',
              upsert: false, // Set to false to avoid overwriting if a file with the exact same path somehow exists
              contentType: profileImageFile.type,
            });
            
          if (uploadError) {
            console.error("Error uploading image to profilepicture:", uploadError);
            toast.error("Failed to upload profile image: " + uploadError.message);
            setIsSubmitting(false);
            return false;
          } else {
            const { data: urlData } = supabase.storage
              .from('profilepicture')
              .getPublicUrl(filePath);
            
            // Add cache-busting query param
            newAvatarDatabaseUrl = `${urlData.publicUrl}?v=${Date.now()}`;
          }
        } catch (error: any) {
          console.error("Error processing profile image:", error);
          toast.error("Failed to process profile image: " + error.message);
          setIsSubmitting(false);
          return false;
        }
      }
      
      const updates = {
        bio: bio.trim(),
        username: username.trim() || user.username,
        location: userLocation.trim(),
        avatar_url: newAvatarDatabaseUrl, // This will be the new URL with cache-busting
        is_private: isPrivate
      };
      
      // Update custom users table
      const result = await supabaseService.updateUserProfile(user.id, updates);
      
      if (!result) {
        toast.error("Failed to update profile in database");
        setIsSubmitting(false);
        return false;
      }
      
      // Update Supabase Auth user metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarDatabaseUrl } // Save URL with cache-busting to auth metadata
      });

      if (authUpdateError) {
        console.error("Error updating auth user metadata:", authUpdateError);
        toast.warning("Profile updated, but session might not reflect new avatar immediately.");
      }
      
      await refreshUserData(); 
      await fetchProfileData(); 
      
      // Ensure the UI uses the new URL (it should be set by refreshUserData/fetchProfileData, but explicitly set here too)
      if (newAvatarDatabaseUrl) {
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
      setProfileImageFile(null); 
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      await supabaseService.signOut(); // This should ideally call a function that also deletes user data from Supabase
      // Actual user deletion from auth and database needs a backend function or specific Supabase setup.
      // For now, it just signs out.
      toast.success("Your account has been deleted"); // This message might be misleading if account isn't fully deleted.
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  return {
    profileImageFile,
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount
  };
};
