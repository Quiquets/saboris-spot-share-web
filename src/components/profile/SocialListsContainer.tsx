
import { useState } from 'react';
import FollowersList from './FollowersList';

interface SocialListsContainerProps {
  followers: any[];
  following: any[];
}

const SocialListsContainer = ({ followers, following }: SocialListsContainerProps) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  return (
    <>
      {/* Followers List */}
      {showFollowers && 
        <FollowersList 
          users={followers} 
          setShowList={setShowFollowers} 
          listType="followers" 
        />
      }
      
      {/* Following List */}
      {showFollowing && 
        <FollowersList 
          users={following} 
          setShowList={setShowFollowing} 
          listType="following" 
        />
      }
    </>
  );
};

export default SocialListsContainer;
