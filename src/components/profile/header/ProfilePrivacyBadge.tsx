
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LockIcon } from 'lucide-react';

interface ProfilePrivacyBadgeProps {
  isPrivate: boolean;
}

const ProfilePrivacyBadge: React.FC<ProfilePrivacyBadgeProps> = ({ isPrivate }) => {
  if (!isPrivate) return null;

  return (
    <div className="mt-2 flex justify-center sm:justify-start">
      <Badge variant="outline" className="flex items-center gap-1">
        <LockIcon className="h-3 w-3" /> Private Account
      </Badge>
    </div>
  );
};

export default ProfilePrivacyBadge;
