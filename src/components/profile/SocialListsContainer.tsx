
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FollowersList from './FollowersList';

interface SocialListsContainerProps {
  followers: any[];
  following: any[];
  showFollowers: boolean;
  showFollowing: boolean;
  setShowFollowers: (value: boolean) => void;
  setShowFollowing: (value: boolean) => void;
}

const SocialListsContainer = ({ 
  followers, 
  following, 
  showFollowers,
  showFollowing,
  setShowFollowers,
  setShowFollowing
}: SocialListsContainerProps) => {
  
  // Don't render anything if no list is shown
  if (!showFollowers && !showFollowing) return null;
  
  const handleClose = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <CardTitle>
              {showFollowers ? 'Followers' : 'Following'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto max-h-[calc(80vh-64px)]">
          {showFollowers && (
            <FollowersList 
              users={followers} 
              listType="followers"
              className="p-4"
            />
          )}
          
          {showFollowing && (
            <FollowersList 
              users={following} 
              listType="following"
              className="p-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialListsContainer;
