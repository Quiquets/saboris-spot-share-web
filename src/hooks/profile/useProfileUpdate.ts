
import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/services/supabaseService";
import { User } from "@/types/global";
import { toast } from "sonner";

export const useProfileUpdate = () => {
  const updateProfile = async (
    user: User,
    updates: {
      name: string;
      username: string;
      bio: string;
      location: string;
      avatar_url: string;
      is_private: boolean;
    }
  ): Promise<boolean> => {
    try {
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

      toast.success("Profile updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err.message || "Failed to update profile");
      return false;
    }
  };

  const deleteAccount = async (user: User | null): Promise<void> => {
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
    updateProfile,
    deleteAccount
  };
};
