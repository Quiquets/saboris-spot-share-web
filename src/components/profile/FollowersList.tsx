
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { User } from '@/types/global';
import { Loader2 } from 'lucide-react';

interface FollowersListProps {
  followers: any[];
  setShowFollowers: (show: boolean) => void;
}

const FollowersList = ({ followers, setShowFollowers }: FollowersListProps) => {
  const [followingStates, setFollowingStates] = useState<Record<string, { isFollowing: boolean, isLoading: boolean }>>(() => {
    const states: Record<string, { isFollowing: boolean, isLoading: boolean }> = {};
    followers.forEach(follower => {
      states[follower.id] = { 
        isFollowing: follower.is_following || false,
        isLoading: false 
      };
    });
    return states;
  });

  const toggleFollow = async (userId: string) => {
    setFollowingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], isLoading: true }
    }));

    try {
      const isCurrentlyFollowing = followingStates[userId]?.isFollowing;
      
      if (isCurrentlyFollowing) {
        await supabaseService.unfollowUser(userId);
      } else {
        await supabaseService.followUser(userId);
      }
      
      setFollowingStates(prev => ({
        ...prev,
        [userId]: { 
          isFollowing: !isCurrentlyFollowing, 
          isLoading: false 
        }
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
      setFollowingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isLoading: false }
      }));
    }
  };
  
  if (followers.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Followers</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFollowers(false)}
        >
          Close
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followers.map((follower) => (
          <Card key={follower.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={follower.avatar_url || undefined} />
                    <AvatarFallback className="bg-saboris-primary/10">
                      {follower.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-800">{follower.name}</p>
                    <p className="text-sm text-gray-500">@{follower.username}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={followingStates[follower.id]?.isFollowing ? "outline" : "default"}
                  onClick={() => toggleFollow(follower.id)}
                  disabled={followingStates[follower.id]?.isLoading}
                  className={followingStates[follower.id]?.isFollowing ? "border-gray-300" : "bg-saboris-primary"}
                >
                  {followingStates[follower.id]?.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : followingStates[follower.id]?.isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;
