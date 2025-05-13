
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { User } from '@/types/global';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

interface FollowersListProps {
  users: any[];
  listType: 'followers' | 'following';
  className?: string;
}

const FollowersList = ({ users, listType, className = '' }: FollowersListProps) => {
  const [displayedUsers, setDisplayedUsers] = useState<any[]>(users);
  const [followingStates, setFollowingStates] = useState<Record<string, { isFollowing: boolean, isLoading: boolean }>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize following states from users data
    const initialStates: Record<string, { isFollowing: boolean, isLoading: boolean }> = {};
    users.forEach(user => {
      initialStates[user.id] = { 
        isFollowing: user.is_following || false,
        isLoading: false 
      };
    });
    setFollowingStates(initialStates);
    setDisplayedUsers(users);
  }, [users]);

  const toggleFollow = async (e: React.MouseEvent, userId: string) => {
    // Prevent navigation when clicking follow/unfollow button
    e.stopPropagation();
    
    setFollowingStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], isLoading: true }
    }));

    try {
      const isCurrentlyFollowing = followingStates[userId]?.isFollowing;
      
      if (isCurrentlyFollowing) {
        await supabaseService.unfollowUser(userId);
        
        // If this is in the following list, remove the user from displayed users
        if (listType === 'following') {
          setDisplayedUsers(current => current.filter(user => user.id !== userId));
          toast.success("User unfollowed");
          return;
        }
      } else {
        await supabaseService.followUser(userId);
      }
      
      // Update the following state for user who stays in the list
      setFollowingStates(prev => ({
        ...prev,
        [userId]: { 
          isFollowing: !isCurrentlyFollowing, 
          isLoading: false 
        }
      }));
      
      toast.success(isCurrentlyFollowing ? "Unfollowed user" : "Now following user");
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
      setFollowingStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isLoading: false }
      }));
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  if (displayedUsers.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-gray-500">
          {listType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
        </p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="space-y-3">
        {displayedUsers.map((user) => (
          <Card 
            key={user.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigateToProfile(user.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-saboris-primary/10">
                      {user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
                {/* Don't show follow button for user's own profile */}
                {user.is_self !== true && (
                  <Button
                    size="sm"
                    variant={followingStates[user.id]?.isFollowing ? "outline" : "default"}
                    onClick={(e) => toggleFollow(e, user.id)}
                    disabled={followingStates[user.id]?.isLoading}
                    className={`ml-2 ${followingStates[user.id]?.isFollowing ? "border-gray-300" : "bg-saboris-primary"}`}
                  >
                    {followingStates[user.id]?.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : followingStates[user.id]?.isFollowing ? (
                      "Unfollow"
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
