
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Lock, MapPin, Users } from "lucide-react";
import { User } from "@/types/global";
import { ProfileStats } from "@/services/supabaseService";

interface ProfileHeaderProps {
  user: User;
  profileStats: ProfileStats | null;
  isPrivate: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
}

const ProfileHeader = ({ 
  user, 
  profileStats, 
  isPrivate, 
  setIsEditProfileOpen,
  fetchFollowers,
  fetchFollowing
}: ProfileHeaderProps) => {  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between mb-6">
        <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-md">
            <AvatarImage 
              src={user.avatar_url || undefined} 
              alt={user.name} 
              className="object-cover"
            />
            <AvatarFallback className="bg-saboris-primary/20 text-saboris-primary text-2xl">
              {user.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="md:ml-6 text-center md:text-left mt-4 md:mt-0">
            <div className="flex items-center justify-center md:justify-start">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{user.name}</h1>
              {isPrivate && (
                <Lock className="ml-2 h-4 w-4 text-gray-500" />
              )}
            </div>
            <p className="text-gray-600">@{user.username}</p>
            
            {user.location && (
              <div className="flex items-center justify-center md:justify-start mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{user.location}</span>
              </div>
            )}
            
            {user.bio && (
              <p className="mt-3 text-gray-700">{user.bio}</p>
            )}
          </div>
        </div>
        
        <div>
          <Button 
            size="sm"
            variant="outline"
            className="flex items-center"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Edit Profile
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center md:justify-start space-x-8 md:space-x-12 pt-4 border-t border-gray-200">
        <div className="text-center cursor-pointer" onClick={fetchFollowers}>
          <p className="text-xl font-bold text-gray-800">{profileStats?.followers_count || 0}</p>
          <p className="text-sm text-gray-600">Followers</p>
        </div>
        
        <div className="text-center cursor-pointer" onClick={fetchFollowing}>
          <p className="text-xl font-bold text-gray-800">{profileStats?.following_count || 0}</p>
          <p className="text-sm text-gray-600">Following</p>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{profileStats?.reviews_count || 0}</p>
          <p className="text-sm text-gray-600">Reviews</p>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{profileStats?.saved_places_count || 0}</p>
          <p className="text-sm text-gray-600">Saved</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
