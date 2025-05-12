
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Globe, Lock, MapPin } from 'lucide-react';
import { ProfileStats } from '@/services/supabaseService';
import { User } from '@/types/global';

interface ProfileHeaderProps {
  user: User;
  profileStats: ProfileStats | null;
  isPrivate: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  fetchFollowers: () => void;
}

const ProfileHeader = ({ 
  user, 
  profileStats, 
  isPrivate, 
  setIsEditProfileOpen, 
  fetchFollowers 
}: ProfileHeaderProps) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-saboris-primary">
          <AvatarImage 
            src={user.avatar_url || undefined} 
            alt={user.name} 
            className="object-cover h-full w-full"
          />
          <AvatarFallback className="bg-saboris-primary/20 text-saboris-primary">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500">@{user.username}</p>
          {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
          {user.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center md:justify-start">
              <MapPin className="inline h-4 w-4 mr-1" />
              {user.location}
            </p>
          )}
          
          {/* User Stats */}
          {profileStats && (
            <div className="flex gap-6 mt-3 justify-center md:justify-start flex-wrap">
              <div className="text-center">
                <p className="font-semibold text-gray-800">{profileStats.posts_count || 0}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <button 
                className="text-center"
                onClick={fetchFollowers}
              >
                <p className="font-semibold text-gray-800">{profileStats.followers_count || 0}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </button>
              <div className="text-center">
                <p className="font-semibold text-gray-800">{profileStats.following_count || 0}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
            </div>
          )}
          
          {/* Account status indicator (public/private) */}
          <div className="mt-2 flex items-center justify-center md:justify-start">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center">
              {isPrivate ? (
                <>
                  <Lock className="h-3 w-3 mr-1" /> 
                  Private Account
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  Public Account
                </>
              )}
            </span>
          </div>
        </div>
        
        <div>
          <Button 
            variant="outline" 
            className="border-saboris-primary text-saboris-primary"
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
