
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/global";

export const useProfileImageUpload = (
  profileImageUrl: string | null,
  setProfileImageUrl: (value: string | null) => void
) => {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setProfileImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImageUrl(previewUrl);
    }
  };

  const uploadProfileImage = async (user: User): Promise<string> => {
    if (!profileImageFile) {
      return user.avatar_url || "";
    }

    try {
      const fileExt = profileImageFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, profileImageFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (uploadError) {
      console.error("Avatar upload failed:", uploadError);
      toast.error("Failed to upload profile image");
      throw uploadError;
    }
  };

  const resetImageFile = () => {
    setProfileImageFile(null);
  };

  return {
    profileImageFile,
    handleFileChange,
    uploadProfileImage,
    resetImageFile
  };
};
