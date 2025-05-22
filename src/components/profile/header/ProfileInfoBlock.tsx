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
    <div>
      {isCommunityMember && (
        <Badge className="mb-1 bg-[#F88379] text-white border-[#F88379] hover:bg-[#F88379]/90 text-xs px-2 py-0.5">
          <AwardIcon className="h-3 w-3 mr-1" />
          Saboris Community Member
        </Badge>
      )}
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
  );
};

export default ProfileInfoBlock;
