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
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Profile Image */}
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-saboris-primary/20 text-2xl">
              {user?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Information */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">@{username}</p>
            </div>
            
            {/* Only show Edit Profile button for own profile */}
            {isOwnProfile && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditProfileOpen(true)}
                className="mt-2 md:mt-0"
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          {/* Bio */}
          {user?.bio && (
            <p className="text-gray-700 mb-3">
              {user.bio}
            </p>
          )}
          
          {/* Private Account Badge */}
          {isPrivate && isOwnProfile && (
            <div className="mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <LockIcon className="h-3 w-3" /> Private Account
              </Badge>
            </div>
          )}
          
          {/* Stats Row */}
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="text-center cursor-pointer" onClick={onPlacesClick}>
              <div className="font-semibold">{profileStats?.places || 0}</div>
              <div className="text-sm text-gray-500">Places</div>
            </div>
            <div className="text-center cursor-pointer" onClick={onFollowersClick}>
              <div className="font-semibold">{profileStats?.followers || 0}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center cursor-pointer" onClick={onFollowingClick}>
              <div className="font-semibold">{profileStats?.following || 0}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{profileStats?.reviews || 0}</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
