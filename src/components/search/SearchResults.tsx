
import React from 'react';
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

interface SearchResultsProps {
  loading: boolean;
  searchQuery: string;
  users: UserProfile[];
  currentUserId?: string | null;
  followLoading: Record<string, boolean>;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  loading,
  searchQuery,
  users,
  currentUserId,
  followLoading,
  onFollow,
  onUnfollow
}) => {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
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
            followLoading={followLoading[user.id] || false}
            onFollow={() => onFollow(user.id)}
            onUnfollow={() => onUnfollow(user.id)}
          />
        ))}
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

  return null;
};

export default SearchResults;
