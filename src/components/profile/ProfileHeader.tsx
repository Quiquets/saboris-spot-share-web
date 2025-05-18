import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileStats } from '@/services/supabaseService';
import { User } from '@/types/global'; // Assuming User type includes isCommunitymemeber and location
import { LockIcon, MapPinIcon, AwardIcon } from 'lucide-react'; // Added MapPinIcon and AwardIcon
import { useAuth } from '@/contexts/AuthContext';
import FollowButton from './FollowButton';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// import { colors } from '@/lib/colors'; // colors not used

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  profileStats: ProfileStats | null;
  isPrivate: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
  userLocation?: string | null; // Added userLocation
}

const ProfileHeader = ({ 
  user,
  isOwnProfile = true,
  profileStats,
  isPrivate,
  setIsEditProfileOpen,
  fetchFollowers,
  fetchFollowing,
  userLocation
}: ProfileHeaderProps) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Use user.avatar_url if available, otherwise a fallback.
  // The user object passed to ProfileHeader should ideally have the most up-to-date avatar_url.
  const avatarUrl = user?.avatar_url ? `${user.avatar_url}?t=${new Date().getTime()}` : `https://avatar.vercel.sh/${user?.email || user?.id}.png`;
  const username = user?.username || 'Unknown';
  
  // Check if current user is following the profile user
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUser || !user || isOwnProfile || !user.id) return;
      
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .match({
            follower_id: currentUser.id,
            following_id: user.id
          });
          
        if (!error) {
          setIsFollowing(data && data.length > 0);
        } else {
          console.error('Error checking follow status:', error.message);
        }
      } catch (error: any) {
        console.error('Error checking follow status:', error.message);
      }
    };
    
    if (user?.id) { // Ensure user.id is available
        checkFollowingStatus();
    }
  }, [currentUser, user, isOwnProfile]);
  
  const onPlacesClick = () => {
    // Scroll to places section or navigate to places page
    // This could be implemented by scrolling to an element with a specific ID.
    const placesSection = document.getElementById('shared-places-section');
    if (placesSection) {
      placesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const onFollowersClick = async () => {
    await fetchFollowers();
  };
  
  const onFollowingClick = async () => {
    await fetchFollowing();
  };

  // Changed signature to () => void to match FollowButton's expected prop type
  const handleFollowStatusChange = () => {
    // Optimistically toggle the local state.
    // The FollowButton component is assumed to handle the actual API call and database update.
    // This function is called after the action, to update the UI of this component.
    setIsFollowing(prevIsFollowing => !prevIsFollowing);
    // Potentially, the parent component (ProfilePage) should be notified to refresh profileStats
    // if follower counts need to be updated immediately here.
    // However, FollowButton might already trigger broader data refreshes or the parent handles this.
  };
  
  // Type guard for user object
  const hasCommunityMemberProperty = (u: any): u is User & { isCommunitymemeber?: boolean } => {
    return u && typeof u.isCommunitymemeber !== 'undefined';
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Profile Image - Centered on mobile */}
        <div className="relative flex justify-center w-full sm:w-auto">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow">
            {/* Added object-cover for better image display */}
            <AvatarImage src={avatarUrl} className="object-cover" /> 
            <AvatarFallback className="bg-saboris-primary/20 text-xl sm:text-2xl">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Information */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
            <div>
              {/* Community Member Ribbon */}
              {hasCommunityMemberProperty(user) && user.isCommunitymemeber && (
                <Badge className="mb-1 bg-saboris-primary text-white border-saboris-primary hover:bg-saboris-primary/90 text-xs px-2 py-0.5">
                  <AwardIcon className="h-3 w-3 mr-1" />
                  Saboris Community Member
                </Badge>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-saboris-gray">{user.name}</h1>
              <p className="text-saboris-gray">@{username}</p>
              {userLocation && (
                <div className="flex items-center justify-center sm:justify-start text-sm text-saboris-gray mt-1">
                  <MapPinIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span>{userLocation}</span>
                </div>
              )}
            </div>
            
            {/* Action Button: Edit Profile for own profile, Follow/Unfollow for others */}
            <div className="mt-2 sm:mt-0">
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  Edit Profile
                </Button>
              ) : currentUser && user?.id ? // Ensure user.id exists for FollowButton
                <FollowButton 
                  currentUser={currentUser}
                  profileUser={user} // Pass the full user object
                  onFollowStatusChange={handleFollowStatusChange}
                />
              ) : null}
            </div>
          </div>
          
          {/* Bio */}
          {user?.bio && (
            <p className="text-saboris-gray my-2 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
              {user.bio}
            </p>
          )}
          
          {/* Private Account Badge */}
          {isPrivate && (
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
              id="profile-places-stat" // Added ID for potential scrolling
            >
              <div className="font-semibold text-saboris-gray">{profileStats?.saved_places_count || 0}</div>
              <div className="text-xs sm:text-sm text-saboris-gray">Places</div>
            </div>
            <div 
              className="text-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-md" 
              onClick={onFollowersClick}
            >
              <div className="font-semibold text-saboris-gray">{profileStats?.followers_count || 0}</div>
              <div className="text-xs sm:text-sm text-saboris-gray">Followers</div>
            </div>
            <div 
              className="text-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-md" 
              onClick={onFollowingClick}
            >
              <div className="font-semibold text-saboris-gray">{profileStats?.following_count || 0}</div>
              <div className="text-xs sm:text-sm text-saboris-gray">Following</div>
            </div>
            <div className="text-center px-2 py-1">
              <div className="font-semibold text-saboris-gray">{profileStats?.reviews_count || 0}</div>
              <div className="text-xs sm:text-sm text-saboris-gray">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
