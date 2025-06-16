
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/global";

export const useProfileValidation = () => {
  const validateUsername = (username: string): boolean => {
    if (/\s/.test(username)) {
      toast.error("Username cannot contain spaces.");
      return false;
    }

    const usernameRegex = /^[A-Za-z0-9_]{1,32}$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username must be 1–32 characters: letters, numbers, or underscores only.");
      return false;
    }

    return true;
  };

  const validateContent = (name: string, username: string): boolean => {
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

    return true;
  };

  const checkUsernameUniqueness = async (username: string, userId: string): Promise<boolean> => {
    try {
      const { data: existing, error: uniqErr } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.trim())
        .neq("id", userId)
        .single();
      
      if (uniqErr && uniqErr.code !== 'PGRST116') {
        console.warn("Username uniqueness check error:", uniqErr);
      }
      
      if (existing) {
        toast.error("That username is already taken.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
      return true; // Allow on error to not block user
    }
  };

  const validateProfile = async (
    user: User | null,
    username: string,
    name: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    if (!validateUsername(username)) {
      return false;
    }

    if (!validateContent(name, username)) {
      return false;
    }

    const isUsernameUnique = await checkUsernameUniqueness(username, user.id);
    if (!isUsernameUnique) {
      return false;
    }

    return true;
  };

  return {
    validateProfile
  };
};
