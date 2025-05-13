
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileStats } from '@/services/supabaseService';
import { User } from '@/types/global';
import { LockIcon } from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  profileStats: ProfileStats | null;
  isPrivate: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
}

const ProfileHeader = ({ 
  user,
  isOwnProfile = true,
  profileStats,
  isPrivate,
  setIsEditProfileOpen,
  fetchFollowers,
  fetchFollowing
}: ProfileHeaderProps) => {
  const avatarUrl = user?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`;
  const username = user?.username || 'Unknown';
  
  const onPlacesClick = () => {
    // Scroll to places section or navigate to places page
  };
  
  const onFollowersClick = async () => {
    await fetchFollowers();
  };
  
  const onFollowingClick = async () => {
    await fetchFollowing();
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Profile Image - Centered on mobile */}
        <div className="relative flex justify-center w-full sm:w-auto">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-saboris-primary/20 text-xl sm:text-2xl">
              {user?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Information */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">@{username}</p>
            </div>
            
            {/* Only show Edit Profile button for own profile */}
            {isOwnProfile && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditProfileOpen(true)}
                className="mt-2 sm:mt-0 w-full sm:w-auto"
                size="sm"
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          {/* Bio */}
          {user?.bio && (
            <p className="text-gray-700 mb-3 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
              {user.bio}
            </p>
          )}
          
          {/* Private Account Badge */}
          {isPrivate && isOwnProfile && (
            <div className="mt-2 flex justify-center sm:justify-start">
              <Badge variant="outline" className="flex items-center gap-1">
                <LockIcon className="h-3 w-3" /> Private Account
              </Badge>
            </div>
          )}
          
          {/* Stats Row - Improved for mobile */}
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
            <div 
              className="text-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-md" 
              onClick={onPlacesClick}
            >
              <div className="font-semibold">{profileStats?.saved_places_count || 0}</div>
              <div className="text-xs sm:text-sm text-gray-500">Places</div>
            </div>
            <div 
              className="text-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-md" 
              onClick={onFollowersClick}
            >
              <div className="font-semibold">{profileStats?.followers_count || 0}</div>
              <div className="text-xs sm:text-sm text-gray-500">Followers</div>
            </div>
            <div 
              className="text-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-md" 
              onClick={onFollowingClick}
            >
              <div className="font-semibold">{profileStats?.following_count || 0}</div>
              <div className="text-xs sm:text-sm text-gray-500">Following</div>
            </div>
            <div className="text-center px-2 py-1">
              <div className="font-semibold">{profileStats?.reviews_count || 0}</div>
              <div className="text-xs sm:text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
