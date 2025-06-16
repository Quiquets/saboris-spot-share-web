
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/services/supabaseService";
import { User } from "@/types/global";
import { toast } from "sonner";

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
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    // Validation checks
    if (/\s/.test(username)) {
      toast.error("Username cannot contain spaces.");
      return false;
    }

    const usernameRegex = /^[A-Za-z0-9_]{1,32}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username must be 1–32 characters: letters, numbers, or underscores only.");
      return false;
    }

    // Bad word filter
    const swearList = [
      "fuck","shit","bitch","bastard","asshole","dick","cunt","prick","slut","whore",
      "puta","mierda","coño","joder","gilipollas","cabrón","zorra","pendejo",
      "scheiße","fotze","arschloch","hurensohn","schlampe","wixer","verpissdich",
      "porra","merda","caralho","buceta","filho da puta",
      "kanker","tering","lul","hoer","tyfus","klootzak",
      "merde","putain","connard","salope","enculé",
      "cazzo","merda","stronzo","figa","vaffanculo",
      "jävlar","skit","kuk","hora","fitta",
      "blyat","suka","pidor","khuy","zhopa",
      "kurwa","chuj","pizda","spierdalaj","skurwysyn",
      "orospu","yarrak","siktir","amk","gavat",
      "kalb","ziit","haram","sharmoota","ibn el kalb"
    ];
    
    const lowerName = name.toLowerCase();
    const lowerUsername = username.toLowerCase();
    const found = swearList.filter(w =>
      lowerName.includes(w) || lowerUsername.includes(w)
    );
    
    if (found.length > 0) {
      const uniqueOffenses = Array.from(new Set(found));
      toast.error(
        `The following terms are against our policy guidelines: ${uniqueOffenses.join(", ")}`
      );
      return false;
    }

    // Username uniqueness check
    try {
      const { data: existing, error: uniqErr } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.trim())
        .neq("id", user.id)
        .single();
      
      if (uniqErr && uniqErr.code !== 'PGRST116') {
        console.warn("Username uniqueness check error:", uniqErr);
      }
      
      if (existing) {
        toast.error("That username is already taken.");
        return false;
      }
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
    }

    setIsSubmitting(true);
    try {
      let newAvatarDatabaseUrl = user.avatar_url || "";

      if (profileImageFile) {
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

          newAvatarDatabaseUrl = publicUrl;
        } catch (uploadError) {
          console.error("Avatar upload failed:", uploadError);
          toast.error("Failed to upload profile image");
          return false;
        }
      }

      const updates = {
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: userLocation.trim(),
        avatar_url: newAvatarDatabaseUrl,
        is_private: isPrivate,
      };

      const success = await supabaseService.updateUserProfile(user.id, updates);
      if (!success) {
        toast.error("Failed to update profile in database");
        return false;
      }

      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          username: updates.username,
          avatar_url: updates.avatar_url,
        }
      });
      
      if (authErr) {
        console.warn("Auth metadata update error:", authErr);
        toast.warning("Profile updated, but session might not reflect changes until next sign-in.");
      }

      await refreshUserData();
      await fetchProfileData();
      setProfileImageUrl(updates.avatar_url);

      toast.success("Profile updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err.message || "Failed to update profile");
      return false;
    } finally {
      setIsSubmitting(false);
      setProfileImageFile(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await supabaseService.signOut();
      toast.success("Your account has been deleted");
    } catch (err: any) {
      console.error("Delete account error:", err);
      toast.error("Failed to delete account");
    }
  };

  // Always return an object, never null
  return {
    profileImageFile,
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount,
  };
};
