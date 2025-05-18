
import React from 'react';
import { ProfileStats } from '@/services/supabaseService';

interface ProfileStatsBarProps {
  profileStats: ProfileStats | null;
  onPlacesClick: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const ProfileStatsBar: React.FC<ProfileStatsBarProps> = ({
  profileStats,
  onPlacesClick,
  onFollowersClick,
  onFollowingClick,
}) => {
  return (
    <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
      <div
        className="text-center cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-md"
        onClick={onPlacesClick}
        id="profile-places-stat"
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
  );
};

export default ProfileStatsBar;
