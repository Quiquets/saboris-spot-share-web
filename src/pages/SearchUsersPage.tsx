
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import AccessGateModal from '@/components/AccessGateModal';

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

const SearchUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const [showGateModal, setShowGateModal] = useState(false);
  
  useEffect(() => {
    if (searchQuery.length > 0) {
      searchUsers();
    }
  }, [searchQuery]);
  
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await supabaseService.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.followUser(userId);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: true, followers_count: (u.followers_count || 0) + 1 } 
          : u
      ));
      
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleUnfollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.unfollowUser(userId);
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: false, followers_count: Math.max(0, (u.followers_count || 1) - 1) } 
          : u
      ));
      
      toast.success("User unfollowed successfully!");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Find Friends</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username"
              className="pl-10 pr-4"
            />
          </div>
          
          {loading && (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
            </div>
          )}
          
          {!loading && users.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {users.map(user => (
                <Card key={user.id} className="overflow-hidden">
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
                      
                      {user.id !== user?.id && (
                        user.is_following ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUnfollowUser(user.id)}
                            disabled={followLoading[user.id]}
                            className="ml-2"
                          >
                            {followLoading[user.id] ? (
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
                            onClick={() => handleFollowUser(user.id)}
                            disabled={followLoading[user.id]}
                            className="ml-2 bg-saboris-primary hover:bg-saboris-primary/90"
                          >
                            {followLoading[user.id] ? (
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
              ))}
            </div>
          )}
          
          {!loading && searchQuery && users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)}
        featureName="follow users"
      />
    </main>
  );
};

export default SearchUsersPage;
