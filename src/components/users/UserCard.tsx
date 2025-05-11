
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabaseService } from '@/services/supabaseService';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  is_following?: boolean;
  followers_count?: number;
  posts_count?: number;
}

interface UserCardProps {
  user: UserProfile;
  currentUserId?: string | null;
  onFollowStatusChange?: (userId: string, isFollowing: boolean) => void;
  onShowGateModal?: () => void;
}

const UserCard = ({ user, currentUserId, onFollowStatusChange, onShowGateModal }: UserCardProps) => {
  const [followLoading, setFollowLoading] = useState(false);
  
  const handleFollowUser = async () => {
    if (!currentUserId) {
      onShowGateModal?.();
      return;
    }
    
    setFollowLoading(true);
    try {
      await supabaseService.followUser(user.id);
      onFollowStatusChange?.(user.id, true);
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setFollowLoading(false);
    }
  };
  
  const handleUnfollowUser = async () => {
    if (!currentUserId) {
      onShowGateModal?.();
      return;
    }
    
    setFollowLoading(true);
    try {
      await supabaseService.unfollowUser(user.id);
      onFollowStatusChange?.(user.id, false);
      toast.success("User unfollowed successfully!");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link to={`/profile/${user.id}`} className="flex items-center flex-1 min-w-0">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="truncate">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            </div>
          </Link>
          
          {user.id !== currentUserId && (
            user.is_following ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUnfollowUser}
                disabled={followLoading}
                className="ml-2"
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Following
                  </>
                )}
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={handleFollowUser}
                disabled={followLoading}
                className="ml-2 bg-saboris-primary hover:bg-saboris-primary/90"
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )
          )}
        </div>
        
        <div className="mt-3 flex text-xs text-gray-500 space-x-4">
          <span>{user.posts_count || 0} posts</span>
          <span>{user.followers_count || 0} followers</span>
        </div>
        
        {user.bio && (
          <p className="text-sm mt-3 line-clamp-2">
            {user.bio}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
