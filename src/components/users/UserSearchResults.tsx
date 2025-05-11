
import { Loader2 } from 'lucide-react';
import UserCard from './UserCard';

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

interface UserSearchResultsProps {
  users: UserProfile[];
  loading: boolean;
  searchQuery: string;
  currentUserId?: string | null;
  onFollowStatusChange: (userId: string, isFollowing: boolean) => void;
  onShowGateModal: () => void;
}

const UserSearchResults = ({ 
  users, 
  loading, 
  searchQuery,
  currentUserId,
  onFollowStatusChange,
  onShowGateModal
}: UserSearchResultsProps) => {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
      </div>
    );
  }
  
  if (searchQuery && users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No users found matching "{searchQuery}"</p>
      </div>
    );
  }
  
  if (users.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {users.map(user => (
          <UserCard 
            key={user.id} 
            user={user}
            currentUserId={currentUserId}
            onFollowStatusChange={onFollowStatusChange}
            onShowGateModal={onShowGateModal}
          />
        ))}
      </div>
    );
  }
  
  return null;
};

export default UserSearchResults;
