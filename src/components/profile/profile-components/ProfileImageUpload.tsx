
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { User } from "@/types/global";

interface ProfileImageUploadProps {
  profileImageUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string; // username is used for UI display if needed, not directly for fallback
  user: User; // user object contains name for fallback
}

export const ProfileImageUpload = ({
  profileImageUrl,
  handleFileChange,
  username, // Keep if used elsewhere, otherwise can be removed if only user.name is for fallback
  user 
}: ProfileImageUploadProps) => {
  const imageSrc = profileImageUrl ? `${profileImageUrl}?v=${Date.now()}` : undefined;

  return (
    <div className="flex justify-center">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-saboris-primary">
          <AvatarImage 
            src={imageSrc} 
            alt={user.name || username || "User Avatar"}
            className="object-cover h-full w-full"
          />
          <AvatarFallback className="bg-saboris-primary/20 text-saboris-primary">
            {user.name?.charAt(0).toUpperCase() || username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <label 
          htmlFor="profile-photo" 
          className="absolute bottom-0 right-0 bg-saboris-primary hover:bg-saboris-primary/90 p-1.5 rounded-full cursor-pointer text-white"
        >
          <Camera className="h-4 w-4" />
          <input 
            id="profile-photo" 
            type="file" 
            accept="image/*" 
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
};
