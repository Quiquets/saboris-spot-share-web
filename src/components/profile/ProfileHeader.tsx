import React, { useState, useEffect } from 'react';
import { ProfileStats } from '@/services/supabaseService';
import { User } from '@/types/global';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import ProfileAvatar from './header/ProfileAvatar';
import ProfileInfoBlock from './header/ProfileInfoBlock';
import ProfileActions from './header/ProfileActions';
import ProfileBio from './header/ProfileBio';
import ProfilePrivacyBadge from './header/ProfilePrivacyBadge';
import ProfileStatsBar from './header/ProfileStatsBar';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  profileStats: ProfileStats | null;
  isPrivate: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  fetchFollowers: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
  userLocation?: string | null;
}

const ProfileHeader = ({
  user,
  isOwnProfile = true,
  profileStats,
  isPrivate,
  setIsEditProfileOpen,
  fetchFollowers,
  fetchFollowing,
  userLocation,
}: ProfileHeaderProps) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  const avatarUrl = user?.avatar_url ? `${user.avatar_url}?t=${new Date().getTime()}` : `https://avatar.vercel.sh/${user?.email || user?.id}.png`;
  const username = user?.username || 'Unknown';

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUser || !user || isOwnProfile || !user.id) return;

      try {
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .match({
            follower_id: currentUser.id,
            following_id: user.id,
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

    if (user?.id) {
      checkFollowingStatus();
    }
  }, [currentUser, user, isOwnProfile, user?.id]); // Added user.id to dependency array for safety

  const onPlacesClick = () => {
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

  const handleFollowStatusChange = () => {
    setIsFollowing(prevIsFollowing => !prevIsFollowing);
    // Consider if fetchProfileStats or similar needs to be called here or in parent
    // to update follower counts displayed in ProfileStatsBar immediately.
    // For now, assuming FollowButton or parent component handles stat refresh.
  };
  
  // Type guard for user object to check for is_CommunityMember
  const hasCommunityMemberProperty = (u: any): u is User & { is_CommunityMember?: boolean } => {
    return u && typeof u.is_CommunityMember !== 'undefined';
  };
  const isCommunityMember = hasCommunityMemberProperty(user) && user.is_CommunityMember === true;


  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <ProfileAvatar avatarUrl={avatarUrl} userName={user?.name} />
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
            <ProfileInfoBlock 
              user={user} 
              username={username} 
              userLocation={userLocation}
              isCommunityMember={isCommunityMember}
            />
            <ProfileActions
              isOwnProfile={isOwnProfile}
              currentUser={currentUser}
              profileUser={user}
              isFollowing={isFollowing} // Fix: passing isFollowing prop
              setIsEditProfileOpen={setIsEditProfileOpen}
              onFollowStatusChange={handleFollowStatusChange}
            />
          </div>
          
          <ProfileBio bio={user?.bio} />
          <ProfilePrivacyBadge isPrivate={isPrivate} />
          <ProfileStatsBar
            profileStats={profileStats}
            onPlacesClick={onPlacesClick}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
