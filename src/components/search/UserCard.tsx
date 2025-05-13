
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';

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
  followLoading: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  currentUserId, 
  followLoading, 
  onFollow, 
  onUnfollow 
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/profile/${user.id}`);
  };
  
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent card click
    action();
  };
  
  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="truncate">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
          
          {user.id !== currentUserId && (
            user.is_following ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => handleButtonClick(e, onUnfollow)}
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
                onClick={(e) => handleButtonClick(e, onFollow)}
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
