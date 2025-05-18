
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileAvatarProps {
  avatarUrl: string;
  userName: string | undefined | null;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ avatarUrl, userName }) => {
  return (
    <div className="relative flex justify-center w-full sm:w-auto">
      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow">
        <AvatarImage src={avatarUrl} className="object-cover" />
        <AvatarFallback className="bg-saboris-primary/20 text-xl sm:text-2xl">
          {userName?.charAt(0)?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default ProfileAvatar;
