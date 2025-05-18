
import React from 'react';

interface ProfileBioProps {
  bio?: string | null;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => {
  if (!bio) return null;

  return (
    <p className="text-saboris-gray my-2 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
      {bio}
    </p>
  );
};

export default ProfileBio;
