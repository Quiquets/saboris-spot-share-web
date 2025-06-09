
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/global';
import { MapPinIcon, AwardIcon } from 'lucide-react';

interface ProfileInfoBlockProps {
  user: User;
  username: string;
  userLocation?: string | null;
  isCommunityMember: boolean;
}

const ProfileInfoBlock: React.FC<ProfileInfoBlockProps> = ({ user, username, userLocation, isCommunityMember }) => {
  return (
    <div className="relative">
      {isCommunityMember && (
        <div className="absolute -top-7 left-0 right-0 flex justify-center sm:justify-start mb-2 z-10">
          <div className="bg-gradient-to-r from-[#FF6B6B] to-[#EE8C80] text-white text-xs px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 shadow-lg border-2 border-white">
            <AwardIcon className="h-3.5 w-3.5" />
            <span>Saboris Community Member</span>
          </div>
        </div>
      )}
      <div className={isCommunityMember ? 'mt-3' : ''}>
        <h1 className="text-xl sm:text-2xl font-bold text-saboris-gray">{user.name}</h1>
        <p className="text-base">
          <span className="text-[#EE8C80]">@</span>
          <span className="text-saboris-gray">{username}</span>
        </p>
        {userLocation && (
          <div className="flex items-center justify-center sm:justify-start text-sm text-saboris-gray mt-1">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0 text-saboris-primary" />
            <span>{userLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoBlock;
