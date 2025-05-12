
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { User } from '@/types/global';
import { Loader2 } from 'lucide-react';

interface FollowersListProps {
  users: any[];
  setShowList: (show: boolean) => void;
  listType: 'followers' | 'following';
}

const FollowersList = ({ users, setShowList, listType }: FollowersListProps) => {
  const [followingStates, setFollowingStates] = useState<Record<string, { isFollowing: boolean, isLoading: boolean }>>(() => {
    const states: Record<string, { isFollowing: boolean, isLoading: boolean }> = {};
    users.forEach(user => {
      states[user.id] = { 
        isFollowing: user.is_following || false,
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
  
  if (users.length === 0) return null;
  
  const title = listType === 'followers' ? 'Followers' : 'Following';
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowList(false)}
        >
          Close
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-saboris-primary/10">
                      {user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                {/* Don't show follow button for user's own profile */}
                {user.is_self !== true && (
                  <Button
                    size="sm"
                    variant={followingStates[user.id]?.isFollowing ? "outline" : "default"}
                    onClick={() => toggleFollow(user.id)}
                    disabled={followingStates[user.id]?.isLoading}
                    className={followingStates[user.id]?.isFollowing ? "border-gray-300" : "bg-saboris-primary"}
                  >
                    {followingStates[user.id]?.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : followingStates[user.id]?.isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;
