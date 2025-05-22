import { useState, useEffect } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
}

interface FriendSelectorProps {
  selectedFriends: string[];
  onChange: (friendIds: string[]) => void;
}

export function FriendSelector({ selectedFriends, onChange }: FriendSelectorProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadFriends();
  }, []);
  
  const loadFriends = async () => {
    setLoading(true);
    
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        setLoading(false);
        return;
      }
      
      // Fetch user's followers (people they can share with)
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          users!follows_following_id_fkey(
            id, name, username, avatar_url
          )
        `)
        .eq('follower_id', currentUser.user.id);
      
      if (error) throw error;
      
      const followingList = data
        .map(item => ({
          id: item.users.id,
          name: item.users.name,
          username: item.users.username,
          avatar_url: item.users.avatar_url
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setFriends(followingList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      onChange(selectedFriends.filter(id => id !== friendId));
    } else {
      onChange([...selectedFriends, friendId]);
    }
  };
  
  const filteredFriends = friends.filter(friend => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      friend.name.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query)
    );
  });
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      <label className="block font-medium">Share with Friends</label>
      
      <div className="flex items-center relative">
        <Search className="h-4 w-4 absolute left-3 text-gray-400" />
        <Input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          You need to follow people to share with friends
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto border rounded-md">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No matching friends found</div>
          ) : (
            filteredFriends.map(friend => (
              <div
                key={friend.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleFriend(friend.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar_url} />
                    <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-500">
                      <span className="text-[#EE8C80]">@</span>
                      <span>{friend.username}</span>
                    </p>
                  </div>
                </div>
                <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                  {selectedFriends.includes(friend.id) && (
                    <Check className="h-4 w-4 text-saboris-primary" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {selectedFriends.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium">Selected ({selectedFriends.length}):</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedFriends.map(friendId => {
              const friend = friends.find(f => f.id === friendId);
              if (!friend) return null;
              
              return (
                <div 
                  key={friendId}
                  className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                >
                  {friend.name}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFriend(friendId);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
