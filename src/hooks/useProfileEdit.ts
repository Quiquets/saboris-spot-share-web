// src/hooks/useProfileEdit.ts
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

  // **New**: display name
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
    /* …your existing file‐size checks/upload preview… */
  };

  const handleSaveProfile = async () => {
    if (!user) return false;

    // 0) No spaces allowed in username
    if (/\s/.test(username)) {
      toast.error("Username cannot contain spaces.");
      return false;
    }

    // 1) Username pattern (letters, numbers, underscore; 1–32 chars)
    const usernameRegex = /^[A-Za-z0-9_]{1,32}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username must be 1–32 characters: letters, numbers, or underscores only.");
      return false;
    }

    // 2) Multilingual bad‐word filter
    const swearList = [
      /* English */ "fuck","shit","bitch","bastard","asshole","dick","cunt","prick","slut","whore",
      /* Spanish */ "puta","mierda","coño","joder","gilipollas","cabrón","zorra","pendejo",
      /* German  */ "scheiße","fotze","arschloch","hurensohn","schlampe","wixer","verpissdich",
      /* Portuguese */ "porra","merda","caralho","buceta","filho da puta",
      /* Dutch */ "kanker","tering","lul","hoer","tyfus","klootzak",
      /* French */ "merde","putain","connard","salope","enculé",
      /* Italian */ "cazzo","merda","stronzo","figa","vaffanculo",
      /* Swedish */ "jävlar","skit","kuk","hora","fitta",
      /* Russian */ "blyat","suka","pidor","khuy","zhopa",
      /* Polish */ "kurwa","chuj","pizda","spierdalaj","skurwysyn",
      /* Turkish */ "orospu","yarrak","siktir","amk","gavat",
      /* Arabic */ "kalb","ziit","haram","sharmoota","ibn el kalb"
    ];
    const lowerName = name.toLowerCase();
    const lowerUsername = username.toLowerCase();
    const found = swearList.filter(w =>
      lowerName.includes(w) || lowerUsername.includes(w)
    );
    if (found.length > 0) {
      // Only list each bad word once
      const uniqueOffenses = Array.from(new Set(found));
      toast.error(
        `The following terms are against our policy guidelines: ${uniqueOffenses.join(", ")}`
      );
      return false;
    }

    // 3) Username uniqueness
    const { data: existing, error: uniqErr } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.trim())
      .neq("id", user.id)
      .single();
    if (uniqErr) console.warn("Username uniqueness check error:", uniqErr);
    if (existing) {
      toast.error("That username is already taken.");
      return false;
    }

    setIsSubmitting(true);
    try {
      // === Handle avatar upload if needed ===
      let newAvatarDatabaseUrl = user.avatar_url || "";

      if (profileImageFile) {
        /* …your existing upload logic… */
      }

      // 4) Prepare updates
      const updates = {
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: userLocation.trim(),
        avatar_url: newAvatarDatabaseUrl,
        is_private: isPrivate,
      };

      // 5) Update custom users table
      const success = await supabaseService.updateUserProfile(user.id, updates);
      if (!success) {
        toast.error("Failed to update profile in database");
        return false;
      }

      // 6) Update Auth metadata
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

      // 7) Refresh data & UI
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

  return {
    profileImageFile,
    isSubmitting,
    handleFileChange,
    handleSaveProfile,
    handleDeleteAccount,
  };
};
